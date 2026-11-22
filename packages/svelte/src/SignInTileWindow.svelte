<script lang="ts">
  import {
    fill,
    passwordGoes,
    qrCode,
    SIGN_IN_TOKEN_LIVES,
    signInRedirectAddress,
    signInScopeItems,
    signInRoleItems,
    signInServiceLabel,
    signInServiceName,
    signInServicePicker,
    signInServiceQuiet,
    signInTestLabel,
    type Catalog,
    type SignInApi,
    type SignInTileField,
    type SignInTileFlow,
    type SignInTileLabelKeys,
    type SignInTileState,
    type SignInTileText,
  } from "@glimstone/core";
  import Accordion from "./Accordion.svelte";
  import CopyField from "./CopyField.svelte";
  import FieldRow from "./FieldRow.svelte";
  import FieldRowGroup from "./FieldRowGroup.svelte";
  import PasswordField from "./PasswordField.svelte";
  import PickerWindow from "./PickerWindow.svelte";
  import Selector from "./Selector.svelte";
  import TextField from "./TextField.svelte";
  import Window, { type WindowAction } from "./Window.svelte";
  import { glyphFor, IconCancel, IconCheck, IconClose } from "./glyphs.js";

  // The window the sign-in tile has open: the password's removal, two-factor's
  // setup, codes and turning off, a passkey's name, a new token and the picker
  // with the form of a sign-in service.
  let {
    flow,
    flowState: s,
    api,
    text,
    lang,
    scopes,
    providers,
    keys,
  }: {
    flow: SignInTileFlow;
    flowState: SignInTileState;
    api: SignInApi;
    text: SignInTileText;
    lang: string;
    scopes: string[];
    providers: Catalog;
    keys: SignInTileLabelKeys;
  } = $props();

  const w = $derived(s.window!);
  const words = $derived({ cancel: text.cancel, close: text.close });
  const eye = $derived({ show: text.show, hide: text.hide, confirm: text.confirmPassword, mismatch: text.mismatch });
  const copyWords = $derived({ copy: text.copy, copied: text.copied });
  const err = (field: SignInTileField) => (s.invalid?.field === field ? s.invalid.message : undefined);
  const cancel = $derived<WindowAction>({ label: text.cancel, labelKey: "common.cancel", glyph: IconCancel, wayOut: true });

  function act(label: string, labelKey: string, hook: string, run: () => Promise<void> | void, more: Partial<WindowAction> = {}): WindowAction {
    return {
      label,
      labelKey,
      busy: s.busy === hook,
      attrs: { "data-signin-tile": hook },
      onClick: () => {
        void run();
        return false;
      },
      ...more,
    };
  }
  const enter = (run: () => Promise<void> | void) => (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void run();
    }
  };

  const picker = $derived(signInServicePicker(providers, text, lang, s.services, () => glyphFor(keys.service)!));
  const pickerText = $derived({
    search: text.services.search,
    none: text.services.searchNone,
    clear: text.services.clear,
    close: text.close,
    cancel: text.cancel,
    back: text.back,
  });
</script>

{#snippet said()}
  {#if s.said}
    <p class={s.said.ok ? "glim-signin-tile-said" : "glim-signin-tile-said glim-signin-tile-said--fail"} role={s.said.ok ? "status" : "alert"}>{s.said.message}</p>
  {/if}
{/snippet}

{#if w.kind === "removePassword"}
  {@const t = text.password}
  {@const goes = passwordGoes(text, lang, s)}
  <Window title={t.removeTitle} text={words} closeOnBackdrop={false} onClose={flow.close} actions={[cancel, act(t.remove, keys.removePassword, "remove-password", flow.removePassword)]}>
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{t.removeText}</p>
      {#if goes.length > 0}
        <ul class="glim-signin-tile-goes">
          {#each goes as g (g)}<li>{g}</li>{/each}
        </ul>
      {/if}
      <FieldRow label={t.current}>
        <PasswordField
          autocomplete="current-password"
          value={s.draft.current}
          oninput={(e) => flow.set("current", e.currentTarget.value)}
          onkeydown={enter(flow.removePassword)}
          text={eye}
          error={err("current")}
        />
      </FieldRow>
    </div>
  </Window>
{:else if w.kind === "twoFactorSetup" || w.kind === "twoFactorOff"}
  {@const t = text.twoFactor}
  {@const setup = w.kind === "twoFactorSetup"}
  {@const run = setup ? flow.confirmTwoFactor : flow.turnTwoFactorOff}
  {@const empty = s.draft.code.trim() === ""}
  {@const qr = w.kind === "twoFactorSetup" ? qrCode(w.uri) : null}
  <Window
    title={setup ? t.setupTitle : t.offTitle}
    text={words}
    closeOnBackdrop={false}
    onClose={flow.close}
    actions={setup
      ? [act(t.confirm, keys.confirm, "two-factor-confirm", run, { primary: true, disabled: empty })]
      : [cancel, act(t.offConfirm, keys.turnOff, "two-factor-off", run, { disabled: empty })]}
  >
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{setup ? t.scan : t.offText}</p>
      {#if qr}
        <svg class="glim-signin-tile-qr" viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`} role="img" aria-label={t.qr}>
          <path d={qr.path} />
        </svg>
      {/if}
      {#if w.kind === "twoFactorSetup"}
        <FieldRow label={t.key}>
          <CopyField value={w.secret.replace(/(.{4})(?=.)/g, "$1 ")} text={copyWords} />
        </FieldRow>
      {/if}
      <FieldRow label={t.code}>
        <TextField
          inputmode={setup ? "numeric" : "text"}
          autocomplete="one-time-code"
          spellcheck={false}
          width="short"
          value={s.draft.code}
          oninput={(e) => flow.set("code", e.currentTarget.value)}
          onkeydown={enter(run)}
          error={err("code")}
        />
      </FieldRow>
    </div>
  </Window>
{:else if w.kind === "recoveryCodes"}
  {@const t = text.twoFactor}
  <Window
    title={t.codesTitle}
    text={words}
    closeOnBackdrop={false}
    onClose={flow.close}
    actions={[
      act(t.copyCodes, keys.copy, "two-factor-copy", flow.copyCodes),
      { label: t.codesSaved, labelKey: keys.confirm, primary: true, wayOut: true, attrs: { "data-signin-tile": "two-factor-saved" } },
    ]}
  >
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{t.codesText}</p>
      <ul class="glim-signin-tile-codes">
        {#each w.codes as c (c)}<li>{c}</li>{/each}
      </ul>
    </div>
  </Window>
{:else if w.kind === "addPasskey" || w.kind === "renamePasskey"}
  {@const t = text.passkeys}
  {@const add = w.kind === "addPasskey"}
  {@const run = add ? flow.addPasskey : flow.renamePasskey}
  <Window
    title={add ? t.addTitle : t.renameTitle}
    text={words}
    closeOnBackdrop={false}
    onClose={flow.close}
    actions={[add ? act(t.continue, keys.passkey, "passkey-add", run, { primary: true }) : act(text.save, keys.save, "passkey-rename", run, { primary: true })]}
  >
    <div class="glim-signin-tile-body">
      <FieldRow label={t.name} hint={t.nameHint}>
        <TextField value={s.draft.name} oninput={(e) => flow.set("name", e.currentTarget.value)} onkeydown={enter(run)} error={err("name")} />
      </FieldRow>
      {@render said()}
    </div>
  </Window>
{:else if w.kind === "newToken"}
  {@const t = text.tokens}
  <Window title={t.newTitle} text={words} closeOnBackdrop={false} onClose={flow.close} actions={[act(t.make, keys.createToken, "token-make", flow.makeToken, { primary: true })]}>
    <div class="glim-signin-tile-body">
      <FieldRowGroup>
        <FieldRow label={t.name} hint={t.nameHint}>
          <TextField value={s.draft.name} oninput={(e) => flow.set("name", e.currentTarget.value)} onkeydown={enter(flow.makeToken)} error={err("name")} />
        </FieldRow>
        <FieldRow label={t.scope}>
          <Selector inline activation="manual" value={s.draft.scope} onChange={(v) => flow.set("scope", v)} items={signInScopeItems(scopes, t.scopes)} />
        </FieldRow>
        <FieldRow label={t.lifetime}>
          <Selector
            inline
            activation="manual"
            value={s.draft.life}
            onChange={(v) => flow.set("life", v)}
            items={SIGN_IN_TOKEN_LIVES.map((id) => ({ id, label: t.lifetimes[id] }))}
          />
        </FieldRow>
      </FieldRowGroup>
    </div>
  </Window>
{:else if w.kind === "tokenShown"}
  {@const t = text.tokens}
  <Window title={t.shownTitle} text={words} closeOnBackdrop={false} onClose={flow.close} actions={[{ label: t.shownDone, labelKey: keys.confirm, primary: true, wayOut: true }]}>
    <div class="glim-signin-tile-body">
      <p class="glim-signin-tile-text">{t.shownText}</p>
      <FieldRow label={w.name}>
        <CopyField value={w.value} text={copyWords} />
      </FieldRow>
    </div>
  </Window>
{:else if w.kind === "pickService"}
  <PickerWindow
    title={text.services.pick}
    hint={text.services.pickHint}
    items={picker.items}
    groups={picker.groups}
    text={pickerText}
    onPick={flow.chooseService}
    onClose={flow.close}
  />
{:else}
  {@const t = text.services}
  {@const name = signInServiceName(text, w.provider, s.draft.label, providers.entries.find((e) => e.id === w.provider)?.name)}
  {@const editing = s.services?.find((x) => x.id === w.edit)}
  {@const test = s.formTest}
  {#snippet field(key: SignInTileField, label: string, hint?: string, placeholder?: string)}
    <FieldRow {label} {hint}>
      <TextField
        mono={key !== "label"}
        value={s.draft[key]}
        {placeholder}
        oninput={(e) => flow.set(key, e.currentTarget.value)}
        onpaste={key === "clientId" ? (e) => flow.pasteClient(e.clipboardData?.getData("text") ?? "") && e.preventDefault() : undefined}
        error={err(key)}
        data-signin-field={key}
      />
    </FieldRow>
  {/snippet}
  {#snippet more()}
    <FieldRowGroup>
      {@render field("scopes", t.scopes)}
      {@render field("nameClaim", t.nameClaim)}
      {@render field("groupsClaim", t.groupsClaim)}
    </FieldRowGroup>
  {/snippet}
  <PickerWindow
    title={name}
    items={picker.items}
    groups={picker.groups}
    text={pickerText}
    selected={w.provider}
    onPick={flow.chooseService}
    onBack={w.edit ? flow.close : flow.pickService}
    onClose={flow.close}
    actions={[
      act(signInTestLabel(text, test), "test", "service-test", flow.testDraft, {
        glyph: test?.tone === "ok" ? IconCheck : test?.tone === "danger" ? IconClose : undefined,
        tone: test?.busy ? undefined : test?.tone,
        busy: !!test?.busy,
        title: test?.title,
      }),
      w.edit
        ? act(text.save, keys.save, "service-save", flow.saveService, { primary: true })
        : { label: t.turnOn, labelKey: keys.turnOn, primary: true, disabled: true, title: t.mustTest, attrs: { "data-signin-tile": "service-turn-on" } },
    ]}
  >
    <div class="glim-signin-tile-form" data-signin-form={w.provider}>
      <p class="glim-signin-tile-text">{fill(t.formHint, { name })}</p>
      <FieldRowGroup>
        {@render field("issuer", t.issuer, t.issuerHint)}
        {@render field("clientId", t.clientId)}
        <FieldRow label={t.secret} hint={w.edit ? t.secretKept : undefined}>
          <PasswordField
            autocomplete="off"
            value={s.draft.secret}
            oninput={(e) => flow.set("secret", e.currentTarget.value)}
            text={eye}
            error={err("secret")}
            data-signin-field="secret"
          />
        </FieldRow>
        <FieldRow label={t.redirect} hint={t.redirectHint}>
          <CopyField value={signInRedirectAddress(api, editing)} text={copyWords} />
        </FieldRow>
        {@render field("label", t.label, undefined, signInServiceLabel({ provider: w.provider }, providers, text).name)}
        {@const roleItems = signInRoleItems(text, s.roles)}
        {#if roleItems}
          <FieldRow label={t.role} data-signin-field="role">
            <Selector inline activation="manual" value={s.draft.role} onChange={(v) => flow.set("role", v)} items={roleItems} />
          </FieldRow>
        {/if}
      </FieldRowGroup>
      <Accordion items={[{ value: "more", title: t.more }]} content={more} />
      <p class="glim-signin-tile-quiet">{signInServiceQuiet(text, s, name)}</p>
      {@render said()}
    </div>
  </PickerWindow>
{/if}
