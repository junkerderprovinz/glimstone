<script lang="ts" module>
  import type { Catalog, SignInApi, SignInTileCard, SignInTileLabelKeys, SignInTileText, ToastSeverity } from "@glimstone/core";

  export type { SignInTileCard, SignInTileLabelKeys, SignInTileText } from "@glimstone/core";

  export interface SignInTileProps {
    api: SignInApi;
    text: SignInTileText;
    /** The interface language, for counts, lists and dates. */
    lang: string;
    /** The identity catalog, `IDENTITY_PROVIDERS`, or the part of it the app offers. */
    providers: Catalog;
    /** The cards to draw, in the tile's own order. A card the account may not see stays out. */
    cards?: readonly SignInTileCard[];
    /** The scopes a new token can take, the narrowest first, as the app's kit knows them. */
    scopes?: string[];
    /** Puts what a change did, or why it failed, into the app's toasts. */
    notify?: (message: string, severity: ToastSeverity) => void;
    /** The path a test sign-in comes back to, where the tile stands. */
    returnTo?: string;
    /** The code a sign-in service sent back, from `takeSignInCode()`. */
    arrived?: string | null;
    /** Leaves the page for a test sign-in. Without it the browser goes there. */
    onLeave?: (url: string) => void;
    /** Formats a date the way the app writes them. */
    time?: (iso: string) => string;
    /** The rainbow position the first card takes. */
    hueStart?: number;
    labelKeys?: Partial<SignInTileLabelKeys>;
  }
</script>

<script lang="ts">
  import { onDestroy, onMount, untrack } from "svelte";
  import {
    accountFacts,
    connectionTestFace,
    createSignInTileFlow,
    fill,
    passkeyFacts,
    plural,
    removalQuestion,
    sessionFacts,
    showTileRefusal,
    SIGN_IN_TILE_CARDS,
    SIGN_IN_TILE_KEYS,
    signInDevice,
    signInServiceActions,
    signInServiceBadge,
    signInServiceLabel,
    signInServiceStatus,
    signInTileCards,
    signInWhen,
    signInCardNotice,
    signInPasswordElsewhere,
    tokenFacts,
    type SignInTileField,
    type SignInTileRemoval,
  } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import BrandMark from "./BrandMark.svelte";
  import EmptyState from "./EmptyState.svelte";
  import FieldRow from "./FieldRow.svelte";
  import FieldRowGroup from "./FieldRowGroup.svelte";
  import GlyphTile from "./GlyphTile.svelte";
  import ListRow from "./ListRow.svelte";
  import PasswordField from "./PasswordField.svelte";
  import SignInTileWindow from "./SignInTileWindow.svelte";
  import Toggle from "./Toggle.svelte";
  import UnavailableNotice from "./UnavailableNotice.svelte";
  import { useConfirm } from "./confirm.svelte.js";
  import { glyphFor, IconCancel, IconCheck, IconClose, IconPencil, IconTrash } from "./glyphs.js";

  // The settings tile "Sign-in" ("The sign-in tile" in the design language):
  // the password, the question before sensitive changes, two-factor, passkeys,
  // sessions, API tokens, sign-in services and accounts, each a card of its own.
  // The flow lives in the core and talks to the kit through the client, so the
  // tile reads what it shows itself; the app hands in the client and its words.
  let {
    api,
    text,
    lang,
    providers,
    cards = SIGN_IN_TILE_CARDS,
    scopes = ["read", "all"],
    notify,
    returnTo,
    arrived,
    onLeave,
    time,
    hueStart = 0,
    labelKeys,
  }: SignInTileProps = $props();

  const flow = createSignInTileFlow(() => ({ api, text, lang, cards, scopes, notify, returnTo, onLeave, providers }));
  let s = $state.raw(flow.state());
  onDestroy(flow.subscribe(() => (s = flow.state())));
  onMount(() => flow.start());
  $effect(() => {
    const code = arrived;
    if (code) untrack(() => flow.arrive(code));
  });
  const refusals = $derived(s.refusal?.count);
  $effect(() => {
    void refusals;
    return untrack(() => showTileRefusal(s.refusal));
  });
  const ask = useConfirm({
    get title() {
      return text.confirm;
    },
    get cancel() {
      return text.cancel;
    },
    get confirm() {
      return text.confirm;
    },
  });

  const keys = $derived({ ...SIGN_IN_TILE_KEYS, ...labelKeys });
  const when = $derived(time ?? signInWhen(lang));
  const eye = $derived({ show: text.show, hide: text.hide, confirm: text.confirmPassword, mismatch: text.mismatch });
  const err = (field: SignInTileField) => (s.invalid?.field === field ? s.invalid.message : undefined);
  const shown = $derived(signInTileCards(s, cards));
  const notice = (card: "twoFactor" | "passkeys" | "tokens" | "services") => signInCardNotice(text, s, card);
  const elsewhere = $derived(signInPasswordElsewhere(text, s));
  const had = $derived(!!s.me?.password);
  const glyph = (key: string) => glyphFor(key)!;

  function remove(what: SignInTileRemoval, id: string, name: string) {
    const q = removalQuestion(text, what, name);
    void ask.confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: keys.remove }).then((yes) => {
      if (yes) void flow.remove(what, id);
    });
  }
</script>

{#snippet cardNotice(n: { title: string; reason: string })}
  <UnavailableNotice title={n.title} reason={n.reason} />
{/snippet}

<div data-glim="SignInTile" class="glim-signin-tile">
  {#each shown as c, i (c)}
    {@const hue = hueStart + i}
    {#if c === "password"}
      {@const t = text.password}
      <Card title={t.title} hint={s.me?.via === "open" ? t.openHint : fill(t.hint, { min: s.offer?.minPassword ?? 12 })} hueIndex={hue} data-signin-card="password">
        {#if elsewhere}
          <p class="glim-signin-tile-text">{elsewhere}</p>
        {:else}
          <div class="glim-signin-tile-body">
            <FieldRow label={t.state} value={had ? t.set : t.none} tone={had ? undefined : "warn"} />
            {#if s.editing}
              <FieldRowGroup>
                {#if had}
                  <FieldRow label={t.current}>
                    <PasswordField
                      autocomplete="current-password"
                      value={s.draft.current}
                      oninput={(e) => flow.set("current", e.currentTarget.value)}
                      text={eye}
                      error={err("current")}
                    />
                  </FieldRow>
                {/if}
                <FieldRow label={t.next}>
                  <PasswordField
                    confirm
                    value={s.draft.next}
                    oninput={(e) => flow.set("next", e.currentTarget.value)}
                    onConfirmedChange={flow.setConfirmed}
                    text={eye}
                    error={err("next")}
                  />
                </FieldRow>
              </FieldRowGroup>
            {/if}
            <div class="glim-signin-tile-foot">
              {#if s.editing}
                <Button label={text.cancel} labelKey="common.cancel" glyph={IconCancel} onClick={flow.cancelPassword} />
                <Button
                  label={t.save}
                  labelKey={keys.savePassword}
                  tone="accent"
                  busy={s.busy === "save-password"}
                  disabled={!s.confirmed || (had && s.draft.current === "")}
                  data-signin-tile="save-password"
                  onClick={() => void flow.savePassword()}
                />
              {:else}
                {#if had}<Button label={t.remove} labelKey={keys.removePassword} data-signin-tile="ask-remove-password" onClick={flow.askRemovePassword} />{/if}
                <Button label={had ? t.change : t.add} labelKey={had ? keys.change : keys.setPassword} data-signin-tile="edit-password" onClick={flow.editPassword} />
              {/if}
            </div>
          </div>
        {/if}
      </Card>
    {:else if c === "askPassword"}
      {@const t = text.askPassword}
      <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="askPassword">
        <FieldRow label={t.label} hint={t.when}>
          <Toggle bind:checked={() => !!s.settings?.askPassword, (on) => void flow.setAskPassword(on)} data-signin-tile="ask-password" />
        </FieldRow>
      </Card>
    {:else if c === "twoFactor"}
      {@const t = text.twoFactor}
      {@const on = !!s.me?.twoFactor}
      <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="twoFactor">
        {#if notice("twoFactor")}
          {@render cardNotice(notice("twoFactor")!)}
        {:else}
          <div class="glim-signin-tile-body">
            <FieldRowGroup>
              <FieldRow label={t.state} value={on ? t.on : t.off} tone={on ? "ok" : undefined} />
              {#if on}<FieldRow label={t.codesLeft} value={plural(lang, t.codesLeftValue, s.me?.recoveryLeft ?? 0)} />{/if}
            </FieldRowGroup>
            <div class="glim-signin-tile-foot">
              {#if on}
                <Button label={t.newCodes} labelKey={keys.newCodes} busy={s.busy === "two-factor-codes"} data-signin-tile="two-factor-codes" onClick={() => void flow.newCodes()} />
                <Button label={t.turnOff} labelKey={keys.turnOff} data-signin-tile="ask-two-factor-off" onClick={flow.askTwoFactorOff} />
              {:else}
                <Button label={t.setUp} labelKey={keys.setUp} busy={s.busy === "two-factor-set-up"} data-signin-tile="two-factor-set-up" onClick={() => void flow.setUpTwoFactor()} />
              {/if}
            </div>
          </div>
        {/if}
      </Card>
    {:else if c === "passkeys"}
      {@const t = text.passkeys}
      {@const here = s.passkeysHere}
      <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="passkeys">
        {#if notice("passkeys")}
          {@render cardNotice(notice("passkeys")!)}
        {:else}
          <div class="glim-signin-tile-body">
            {#if !here}<UnavailableNotice title={t.unavailableTitle} reason={t.unavailable} />{/if}
            {#if s.passkeys.length > 0}
              <div class="glim-list glim-signin-tile-rows">
                {#each s.passkeys as p (p.id)}
                  <ListRow steady name={p.name} meta={passkeyFacts(text, p, when).added} tip={passkeyFacts(text, p, when).more}>
                    {#snippet tile()}<GlyphTile glyph={glyph(keys.passkey)} />{/snippet}
                    {#snippet actions()}
                      <Button compact tone="subtle" label={t.rename} labelKey={keys.rename} glyph={IconPencil} data-signin-tile={`passkey-rename-${p.id}`} onClick={() => flow.askRenamePasskey(p.id)} />
                      <Button compact tone="subtle" label={text.remove} labelKey={keys.remove} glyph={IconTrash} data-signin-tile={`remove-passkey-${p.id}`} onClick={() => remove("passkey", p.id, p.name)} />
                    {/snippet}
                  </ListRow>
                {/each}
              </div>
            {:else if here}
              <EmptyState nested glyph={glyph(keys.passkey)} title={t.none} hint={t.noneHint} />
            {/if}
            {#if here}
              <div class="glim-signin-tile-foot">
                <Button label={t.add} labelKey={keys.add} data-signin-tile="passkey-ask-add" onClick={() => flow.askAddPasskey()} />
              </div>
            {/if}
          </div>
        {/if}
      </Card>
    {:else if c === "sessions"}
      {@const t = text.sessions}
      <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="sessions">
        <div class="glim-signin-tile-body">
          <div class="glim-list glim-signin-tile-rows">
            {#each s.sessions as x (x.id)}
              {@const device = signInDevice(x.agent, t)}
              {#snippet tile()}<GlyphTile glyph={glyph(device.phone ? keys.phone : keys.laptop)} />{/snippet}
              {#snippet badges()}<Badge size="small" tone="active">{t.current}</Badge>{/snippet}
              {#snippet end()}
                <Button
                  compact
                  tone="subtle"
                  label={t.end}
                  labelKey={keys.end}
                  busy={s.busy === `session-end-${x.id}`}
                  data-signin-tile={`session-end-${x.id}`}
                  onClick={() => void flow.endSession(x.id)}
                />
              {/snippet}
              <ListRow
                steady
                name={device.name}
                meta={sessionFacts(text, x, s.serviceLabels, when).join(" · ")}
                {tile}
                badges={x.current ? badges : undefined}
                actions={x.current ? undefined : end}
              />
            {/each}
          </div>
          {#if s.sessions.some((x) => !x.current)}
            <div class="glim-signin-tile-foot">
              <Button
                label={t.endOthers}
                labelKey={keys.endOthers}
                busy={s.busy === "sessions-end-others"}
                data-signin-tile="sessions-end-others"
                onClick={() => void flow.endOtherSessions()}
              />
            </div>
          {/if}
        </div>
      </Card>
    {:else if c === "tokens"}
      {@const t = text.tokens}
      <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="tokens">
        {#if notice("tokens")}
          {@render cardNotice(notice("tokens")!)}
        {:else}
          <div class="glim-signin-tile-body">
            {#if s.tokens.length > 0}
              <div class="glim-list glim-signin-tile-rows">
                {#each s.tokens as k (k.id)}
                  {#snippet tile()}<GlyphTile glyph={glyph(keys.token)} />{/snippet}
                  {#snippet scopes()}
                    {#each k.scopes as scope (scope)}<Badge size="small">{t.scopes[scope] ?? scope}</Badge>{/each}
                  {/snippet}
                  {#snippet actions()}
                    <Button compact tone="subtle" label={t.revoke} labelKey={keys.revoke} data-signin-tile={`remove-token-${k.id}`} onClick={() => remove("token", k.id, k.name)} />
                  {/snippet}
                  <ListRow steady name={k.name} meta={tokenFacts(text, k, when).join(" · ")} {tile} badges={k.scopes.length > 0 ? scopes : undefined} {actions} />
                {/each}
              </div>
            {:else}
              <EmptyState nested glyph={glyph(keys.token)} title={t.none} hint={t.noneHint} />
            {/if}
            <div class="glim-signin-tile-foot">
              <Button label={t.create} labelKey={keys.createToken} data-signin-tile="token-ask" onClick={flow.askToken} />
            </div>
          </div>
        {/if}
      </Card>
    {:else if c === "services"}
      {@const t = text.services}
      <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="services">
        {#if notice("services")}
          {@render cardNotice(notice("services")!)}
        {:else}
          <div class="glim-signin-tile-body">
            {#if (s.services?.length ?? 0) > 0}
              <div class="glim-list glim-signin-tile-rows">
                {#each s.services ?? [] as x (x.id)}
                  {@const badge = signInServiceBadge(text, x)}
                  {@const label = signInServiceLabel(x, providers, text)}
                  {@const face = connectionTestFace(s.rowTests[x.id])}
                  {#snippet brand()}<BrandMark svg={label.mark?.svg ?? ""} />{/snippet}
                  <ListRow steady name={label.name} meta={signInServiceStatus(text, x, when)} data-signin-service={x.provider}>
                    {#snippet tile()}<GlyphTile glyph={label.mark ? brand : glyph(keys.service)} />{/snippet}
                    {#snippet badges()}<Badge size="small" tone={badge.tone}>{badge.label}</Badge>{/snippet}
                    {#snippet actions()}
                      {#if !x.fromConfig}
                        <Toggle
                          bind:checked={() => x.on, (on) => void flow.setServiceOn(x.id, on)}
                          label={t.show}
                          hideLabel
                          refused={!x.tested || x.paused ? t.mustTest : undefined}
                          data-signin-tile={`service-on-${x.id}`}
                        />
                      {/if}
                      {#each signInServiceActions(text, x, s, keys.turnOn, (id) => void flow.confirmService(id)) as a (a.id)}
                        <Button compact tone="subtle" label={a.label} labelKey={a.labelKey} busy={a.busy} data-signin-tile={`service-${a.id}-${x.id}`} onClick={a.onClick} />
                      {/each}
                      {#if !x.fromConfig}
                        <Button
                          compact
                          tone={face.tone === "neutral" ? "subtle" : face.tone}
                          label={t.test}
                          labelKey={keys.test}
                          glyph={face.outcome === "cross" ? IconClose : IconCheck}
                          busy={s.rowTests[x.id]?.busy}
                          title={s.rowTests[x.id]?.title}
                          class={face.shake ? "glim-shake" : undefined}
                          data-signin-tile={`service-test-${x.id}`}
                          onClick={() => void flow.testService(x.id)}
                        />
                        <Button compact tone="subtle" label={t.edit} labelKey={keys.edit} glyph={IconPencil} data-signin-tile={`service-edit-${x.id}`} onClick={() => flow.editService(x.id)} />
                        <Button compact tone="subtle" label={text.remove} labelKey={keys.remove} glyph={IconTrash} data-signin-tile={`remove-service-${x.id}`} onClick={() => remove("service", x.id, label.name)} />
                      {/if}
                    {/snippet}
                  </ListRow>
                {/each}
              </div>
            {/if}
            <div class="glim-signin-tile-foot">
              <Button label={t.add} labelKey={keys.addService} data-signin-tile="service-pick" onClick={flow.pickService} />
            </div>
          </div>
        {/if}
      </Card>
    {:else}
      {@const t = text.accounts}
      <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="accounts">
        <div class="glim-list glim-signin-tile-rows">
          {#each s.accounts ?? [] as a (a.id)}
            {#snippet tile()}<GlyphTile glyph={glyph(keys.account)} />{/snippet}
            {#snippet badges()}
              {#if a.owner}<Badge size="small">{t.owner}</Badge>{/if}
              {#if a.blocked}<Badge size="small" tone="warn">{t.blocked}</Badge>{/if}
            {/snippet}
            {#snippet manage()}
              <Button
                compact
                tone="subtle"
                label={a.blocked ? t.unblock : t.block}
                labelKey={a.blocked ? keys.unblock : keys.block}
                busy={s.busy === `account-block-${a.id}`}
                data-signin-tile={`account-block-${a.id}`}
                onClick={() => void flow.block(a.id, !a.blocked)}
              />
              <Button compact tone="subtle" label={text.remove} labelKey={keys.remove} glyph={IconTrash} data-signin-tile={`remove-account-${a.id}`} onClick={() => remove("account", a.id, a.name)} />
            {/snippet}
            <ListRow
              steady
              name={a.name}
              meta={accountFacts(text, a, s.serviceLabels, when).join(" · ")}
              {tile}
              badges={a.owner || a.blocked ? badges : undefined}
              actions={!a.owner && a.id !== s.me?.account ? manage : undefined}
            />
          {/each}
        </div>
      </Card>
    {/if}
  {/each}
  {#if s.window}
    <SignInTileWindow {flow} flowState={s} {api} {text} {lang} {scopes} {providers} {keys} />
  {/if}
  <ask.confirmDialog />
</div>
