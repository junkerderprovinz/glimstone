import { createEffect, createMemo, createSignal, For, Match, mergeProps, on, onCleanup, onMount, Show, Switch, type Accessor, type Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  accountFacts,
  createSignInTileFlow,
  fill,
  OWN_SIGN_IN_SERVICE,
  passkeyFacts,
  passwordGoes,
  plural,
  qrCode,
  removalQuestion,
  sessionFacts,
  showTileRefusal,
  SIGN_IN_TILE_CARDS,
  SIGN_IN_TILE_KEYS,
  SIGN_IN_TOKEN_LIVES,
  signInDevice,
  signInRedirectAddress,
  signInScopeItems,
  signInServiceActions,
  signInServiceBadge,
  signInServiceMark,
  signInServiceName,
  signInServicePicker,
  signInServiceStatus,
  signInTestLabel,
  signInTileCards,
  signInWhen,
  signInCardNotice,
  signInPasswordElsewhere,
  tokenFacts,
  type Catalog,
  type SignInApi,
  type SignInTileCard,
  type SignInTileField,
  type SignInTileFlow,
  type SignInTileLabelKeys,
  type SignInTileRemoval,
  type SignInTileState,
  type SignInTileText,
  type SignInTileWindow,
  type ToastSeverity,
} from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { Card } from "./Card.tsx";
import { ConnectionRow } from "./ConnectionRow.tsx";
import { CopyField } from "./CopyField.tsx";
import { EmptyState } from "./EmptyState.tsx";
import { FieldRow } from "./FieldRow.tsx";
import { FieldRowGroup } from "./FieldRowGroup.tsx";
import { GlyphTile } from "./GlyphTile.tsx";
import { glyphFor, IconCancel, IconCheck, IconClose } from "./glyphs.tsx";
import { ListRow } from "./ListRow.tsx";
import { PasswordField } from "./PasswordField.tsx";
import { PickerWindow } from "./PickerWindow.tsx";
import { Selector } from "./Selector.tsx";
import { TextField } from "./TextField.tsx";
import { Toggle } from "./Toggle.tsx";
import { UnavailableNotice } from "./UnavailableNotice.tsx";
import { useConfirm } from "./useConfirm.tsx";
import { Window, type WindowAction } from "./Window.tsx";

export type { SignInTileCard, SignInTileLabelKeys, SignInTileText } from "@glimstone/core";

// The settings tile "Sign-in" ("The sign-in tile" in the design language):
// the password, the question before sensitive changes, two-factor, passkeys,
// sessions, API tokens, sign-in services and accounts, each a card of its own.
// The flow lives in the core and talks to the kit through the client, so the
// tile reads what it shows itself; the app hands in the client and its words.

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

type Own = SignInTileProps & { cards: readonly SignInTileCard[]; scopes: string[]; hueStart: number };

interface Ctx {
  s: Accessor<SignInTileState>;
  flow: SignInTileFlow;
  own: Own;
  keys: Accessor<SignInTileLabelKeys>;
  when: (iso: string) => string;
  eye: Accessor<{ show: string; hide: string; confirm: string; mismatch: string }>;
  err: (field: SignInTileField) => string | undefined;
  ask: (what: SignInTileRemoval, id: string, name: string) => void;
}

const enter = (run: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    e.preventDefault();
    run();
  }
};

export function SignInTile(props: SignInTileProps) {
  const own: Own = mergeProps({ cards: SIGN_IN_TILE_CARDS, scopes: ["read", "all"], hueStart: 0 } as { cards: readonly SignInTileCard[]; scopes: string[]; hueStart: number }, props);
  const flow = createSignInTileFlow(() => own);
  const [s, setS] = createSignal(flow.state());
  onCleanup(flow.subscribe(() => setS(flow.state())));
  onMount(() => onCleanup(flow.start()));
  createEffect(
    on(
      () => own.arrived,
      (code) => {
        if (code) flow.arrive(code);
      },
    ),
  );
  createEffect(on(() => s().refusal?.count, () => onCleanup(showTileRefusal(s().refusal))));
  const { confirm, confirmDialog } = useConfirm({ title: own.text.confirm, cancel: own.text.cancel, confirm: own.text.confirm });

  const keys = createMemo(() => ({ ...SIGN_IN_TILE_KEYS, ...own.labelKeys }));
  const when = createMemo(() => own.time ?? signInWhen(own.lang));
  const ctx: Ctx = {
    s,
    flow,
    own,
    keys,
    when: (iso) => when()(iso),
    eye: () => ({ show: own.text.show, hide: own.text.hide, confirm: own.text.confirmPassword, mismatch: own.text.mismatch }),
    err: (field) => {
      const invalid = s().invalid;
      return invalid?.field === field ? invalid.message : undefined;
    },
    ask: (what, id, name) => {
      const q = removalQuestion(own.text, what, name);
      void confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: keys().remove }).then((yes) => {
        if (yes) void flow.remove(what, id);
      });
    },
  };

  return (
    <div data-glim="SignInTile" class="glim-signin-tile">
      <For each={signInTileCards(s(), own.cards)}>{(c, i) => <Dynamic component={CARDS[c]} ctx={ctx} hue={own.hueStart + i()} />}</For>
      <TileWindow ctx={ctx} />
      {confirmDialog}
    </div>
  );
}

type CardProps = { ctx: Ctx; hue: number };

function Notice(props: { notice: { title: string; reason: string } }) {
  return <UnavailableNotice title={props.notice.title} reason={props.notice.reason} />;
}

function PasswordCard(props: CardProps) {
  const { s, flow, own, keys, eye, err } = props.ctx;
  const t = () => own.text.password;
  const had = () => !!s().me?.password;
  const open = () => s().me?.via === "open";
  const elsewhere = () => signInPasswordElsewhere(own.text, s());
  return (
    <Card title={t().title} hint={open() ? t().openHint : fill(t().hint, { min: s().offer?.minPassword ?? 12 })} hueIndex={props.hue} data-signin-card="password">
      <Show when={!elsewhere()} fallback={<p class="glim-signin-tile-text">{elsewhere()}</p>}>
        <div class="glim-signin-tile-body">
          <FieldRow label={t().state} value={had() ? t().set : t().none} tone={had() ? undefined : "warn"} />
          <Show when={s().editing}>
            <FieldRowGroup>
              <Show when={had()}>
                <FieldRow label={t().current}>
                  <PasswordField autocomplete="current-password" value={s().draft.current} onInput={(e) => flow.set("current", e.currentTarget.value)} text={eye()} error={err("current")} />
                </FieldRow>
              </Show>
              <FieldRow label={t().next}>
                <PasswordField
                  confirm
                  value={s().draft.next}
                  onInput={(e) => flow.set("next", e.currentTarget.value)}
                  onConfirmedChange={flow.setConfirmed}
                  text={eye()}
                  error={err("next")}
                />
              </FieldRow>
            </FieldRowGroup>
          </Show>
          <div class="glim-signin-tile-foot">
            <Show
              when={s().editing}
              fallback={
                <>
                  <Show when={had()}>
                    <Button label={t().remove} labelKey={keys().removePassword} data-signin-tile="ask-remove-password" onClick={flow.askRemovePassword} />
                  </Show>
                  <Button label={had() ? t().change : t().add} labelKey={had() ? keys().change : keys().setPassword} data-signin-tile="edit-password" onClick={flow.editPassword} />
                </>
              }
            >
              <Button label={own.text.cancel} labelKey="common.cancel" glyph={<IconCancel />} onClick={flow.cancelPassword} />
              <Button
                label={t().save}
                labelKey={keys().savePassword}
                tone="accent"
                busy={s().busy === "save-password"}
                disabled={!s().confirmed || (had() && s().draft.current === "")}
                data-signin-tile="save-password"
                onClick={() => void flow.savePassword()}
              />
            </Show>
          </div>
        </div>
      </Show>
    </Card>
  );
}

function AskPasswordCard(props: CardProps) {
  const { s, flow, own } = props.ctx;
  const t = () => own.text.askPassword;
  return (
    <Card title={t().title} hint={t().hint} hueIndex={props.hue} data-signin-card="askPassword">
      <FieldRow label={t().label}>
        <Toggle checked={!!s().settings?.askPassword} onChange={(on) => void flow.setAskPassword(on)} data-signin-tile="ask-password" />
      </FieldRow>
    </Card>
  );
}

function TwoFactorCard(props: CardProps) {
  const { s, flow, own, keys } = props.ctx;
  const t = () => own.text.twoFactor;
  const on = () => !!s().me?.twoFactor;
  return (
    <Card title={t().title} hint={t().hint} hueIndex={props.hue} data-signin-card="twoFactor">
      <Show when={!signInCardNotice(own.text, s(), "twoFactor")} fallback={<Notice notice={signInCardNotice(own.text, s(), "twoFactor")!} />}>
        <div class="glim-signin-tile-body">
          <FieldRowGroup>
            <FieldRow label={t().state} value={on() ? t().on : t().off} tone={on() ? "ok" : undefined} />
            <Show when={on()}>
              <FieldRow label={t().codesLeft} value={plural(own.lang, t().codesLeftValue, s().me?.recoveryLeft ?? 0)} />
            </Show>
          </FieldRowGroup>
          <div class="glim-signin-tile-foot">
            <Show
              when={on()}
              fallback={
                <Button label={t().setUp} labelKey={keys().setUp} busy={s().busy === "two-factor-set-up"} data-signin-tile="two-factor-set-up" onClick={() => void flow.setUpTwoFactor()} />
              }
            >
              <Button label={t().newCodes} labelKey={keys().newCodes} busy={s().busy === "two-factor-codes"} data-signin-tile="two-factor-codes" onClick={() => void flow.newCodes()} />
              <Button label={t().turnOff} labelKey={keys().turnOff} data-signin-tile="ask-two-factor-off" onClick={flow.askTwoFactorOff} />
            </Show>
          </div>
        </div>
      </Show>
    </Card>
  );
}

function PasskeysCard(props: CardProps) {
  const { s, flow, own, keys, when, ask } = props.ctx;
  const t = () => own.text.passkeys;
  const here = () => s().passkeysHere;
  return (
    <Card title={t().title} hint={t().hint} hueIndex={props.hue} data-signin-card="passkeys">
      <Show when={!signInCardNotice(own.text, s(), "passkeys")} fallback={<Notice notice={signInCardNotice(own.text, s(), "passkeys")!} />}>
        <div class="glim-signin-tile-body">
          <Show when={!here()}>
            <UnavailableNotice title={t().unavailableTitle} reason={t().unavailable} />
          </Show>
          <Show
            when={s().passkeys.length > 0}
            fallback={
              <Show when={here()}>
                <EmptyState nested glyph={glyphFor(keys().passkey)} title={t().none} hint={t().noneHint} />
              </Show>
            }
          >
            <div class="glim-list glim-signin-tile-rows">
              <For each={s().passkeys}>
                {(p) => (
                  <ListRow
                    name={p.name}
                    tile={<GlyphTile glyph={glyphFor(keys().passkey)} />}
                    badges={<span class="glim-signin-tile-facts">{passkeyFacts(own.text, p, when).join(" · ")}</span>}
                    actions={
                      <>
                        <Button label={t().rename} labelKey={keys().rename} onClick={() => flow.askRenamePasskey(p.id)} />
                        <Button label={own.text.remove} labelKey={keys().remove} data-signin-tile={`remove-passkey-${p.id}`} onClick={() => ask("passkey", p.id, p.name)} />
                      </>
                    }
                  />
                )}
              </For>
            </div>
          </Show>
          <Show when={here()}>
            <div class="glim-signin-tile-foot">
              <Button label={t().add} labelKey={keys().add} data-signin-tile="passkey-ask-add" onClick={() => flow.askAddPasskey()} />
            </div>
          </Show>
        </div>
      </Show>
    </Card>
  );
}

function SessionsCard(props: CardProps) {
  const { s, flow, own, keys, when } = props.ctx;
  const t = () => own.text.sessions;
  const others = () => s().sessions.some((x) => !x.current);
  return (
    <Card title={t().title} hint={t().hint} hueIndex={props.hue} data-signin-card="sessions">
      <div class="glim-signin-tile-body">
        <div class="glim-list glim-signin-tile-rows">
          <For each={s().sessions}>
            {(x) => {
              const device = () => signInDevice(x.agent, t());
              return (
                <ListRow
                  name={device().name}
                  tile={<GlyphTile glyph={glyphFor(device().phone ? keys().phone : keys().laptop)} />}
                  badges={
                    <>
                      <span class="glim-signin-tile-facts">{sessionFacts(own.text, x, s().services, when).join(" · ")}</span>
                      <Show when={x.current}>
                        <Badge tone="active">{t().current}</Badge>
                      </Show>
                    </>
                  }
                  actions={
                    <Show when={!x.current}>
                      <Button label={t().end} labelKey={keys().end} busy={s().busy === `session-end-${x.id}`} data-signin-tile={`session-end-${x.id}`} onClick={() => void flow.endSession(x.id)} />
                    </Show>
                  }
                />
              );
            }}
          </For>
        </div>
        <Show when={others()}>
          <div class="glim-signin-tile-foot">
            <Button label={t().endOthers} labelKey={keys().endOthers} busy={s().busy === "sessions-end-others"} data-signin-tile="sessions-end-others" onClick={() => void flow.endOtherSessions()} />
          </div>
        </Show>
      </div>
    </Card>
  );
}

function TokensCard(props: CardProps) {
  const { s, flow, own, keys, when, ask } = props.ctx;
  const t = () => own.text.tokens;
  return (
    <Card title={t().title} hint={t().hint} hueIndex={props.hue} data-signin-card="tokens">
      <Show when={!signInCardNotice(own.text, s(), "tokens")} fallback={<Notice notice={signInCardNotice(own.text, s(), "tokens")!} />}>
        <div class="glim-signin-tile-body">
          <Show when={s().tokens.length > 0} fallback={<EmptyState nested glyph={glyphFor(keys().token)} title={t().none} hint={t().noneHint} />}>
            <div class="glim-list glim-signin-tile-rows">
              <For each={s().tokens}>
                {(k) => (
                  <ListRow
                    name={k.name}
                    tile={<GlyphTile glyph={glyphFor(keys().token)} />}
                    badges={
                      <>
                        <span class="glim-signin-tile-facts">{tokenFacts(own.text, k, when).join(" · ")}</span>
                        <For each={k.scopes}>{(scope) => <Badge>{t().scopes[scope] ?? scope}</Badge>}</For>
                      </>
                    }
                    actions={<Button label={t().revoke} labelKey={keys().revoke} data-signin-tile={`remove-token-${k.id}`} onClick={() => ask("token", k.id, k.name)} />}
                  />
                )}
              </For>
            </div>
          </Show>
          <div class="glim-signin-tile-foot">
            <Button label={t().create} labelKey={keys().createToken} data-signin-tile="token-ask" onClick={flow.askToken} />
          </div>
        </div>
      </Show>
    </Card>
  );
}

function ServicesCard(props: CardProps) {
  const { s, flow, own, keys, when, ask } = props.ctx;
  const t = () => own.text.services;
  return (
    <Card title={t().title} hint={t().hint} hueIndex={props.hue} data-signin-card="services">
      <Show when={!signInCardNotice(own.text, s(), "services")} fallback={<Notice notice={signInCardNotice(own.text, s(), "services")!} />}>
        <div class="glim-signin-tile-body">
          <For each={s().services ?? []}>
            {(x) => {
              const badge = () => signInServiceBadge(own.text, x);
              return (
                <ConnectionRow
                  name={x.name}
                  mark={signInServiceMark(own.providers, x.provider) ?? glyphFor(keys().service)}
                  status={signInServiceStatus(own.text, x, when)}
                  badges={<Badge tone={badge().tone}>{badge().label}</Badge>}
                  test={s().rowTests[x.id]}
                  actions={signInServiceActions(own.text, x, s(), keys().turnOn, (id) => void flow.confirmService(id))}
                  text={{ test: t().test, edit: t().edit, remove: own.text.remove }}
                  onTest={x.fromConfig ? undefined : () => void flow.testService(x.id)}
                  onEdit={x.fromConfig ? undefined : () => flow.editService(x.id)}
                  onRemove={x.fromConfig ? undefined : () => ask("service", x.id, x.name)}
                  data-signin-service={x.provider}
                >
                  <Show when={!x.fromConfig}>
                    <Toggle
                      checked={x.on}
                      label={t().show}
                      refused={!x.tested || x.paused ? t().mustTest : undefined}
                      onChange={(on) => void flow.setServiceOn(x.id, on)}
                      data-signin-tile={`service-on-${x.id}`}
                    />
                  </Show>
                </ConnectionRow>
              );
            }}
          </For>
          <div class="glim-signin-tile-foot">
            <Button label={t().add} labelKey={keys().addService} data-signin-tile="service-pick" onClick={flow.pickService} />
          </div>
        </div>
      </Show>
    </Card>
  );
}

function AccountsCard(props: CardProps) {
  const { s, flow, own, keys, when, ask } = props.ctx;
  const t = () => own.text.accounts;
  return (
    <Card title={t().title} hint={t().hint} hueIndex={props.hue} data-signin-card="accounts">
      <div class="glim-list glim-signin-tile-rows">
        <For each={s().accounts ?? []}>
          {(a) => (
            <ListRow
              name={a.name}
              tile={<GlyphTile glyph={glyphFor(keys().account)} />}
              badges={
                <>
                  <span class="glim-signin-tile-facts">{accountFacts(own.text, a, s().services, when).join(" · ")}</span>
                  <Show when={a.owner}>
                    <Badge>{t().owner}</Badge>
                  </Show>
                  <Show when={a.blocked}>
                    <Badge tone="warn">{t().blocked}</Badge>
                  </Show>
                </>
              }
              actions={
                <Show when={!a.owner && a.id !== s().me?.account}>
                  <Button
                    label={a.blocked ? t().unblock : t().block}
                    labelKey={a.blocked ? keys().unblock : keys().block}
                    busy={s().busy === `account-block-${a.id}`}
                    data-signin-tile={`account-block-${a.id}`}
                    onClick={() => void flow.block(a.id, !a.blocked)}
                  />
                  <Button label={own.text.remove} labelKey={keys().remove} data-signin-tile={`remove-account-${a.id}`} onClick={() => ask("account", a.id, a.name)} />
                </Show>
              }
            />
          )}
        </For>
      </div>
    </Card>
  );
}

const CARDS: Record<SignInTileCard, Component<CardProps>> = {
  password: PasswordCard,
  askPassword: AskPasswordCard,
  twoFactor: TwoFactorCard,
  passkeys: PasskeysCard,
  sessions: SessionsCard,
  tokens: TokensCard,
  services: ServicesCard,
  accounts: AccountsCard,
};

type Kind = SignInTileWindow["kind"];

function TileWindow(props: { ctx: Ctx }) {
  const { s, flow, own, keys, eye, err } = props.ctx;
  const text = () => own.text;
  const open = <K extends Kind>(...kinds: K[]) => {
    const w = s().window;
    return w && (kinds as Kind[]).includes(w.kind) ? (w as Extract<SignInTileWindow, { kind: K }>) : undefined;
  };
  const words = () => ({ cancel: text().cancel, close: text().close });
  const cancel = (): WindowAction => ({ label: text().cancel, labelKey: "common.cancel", glyph: <IconCancel />, wayOut: true });
  const act = (label: string, labelKey: string, hook: string, run: () => Promise<void> | void, more: Partial<WindowAction> = {}): WindowAction => ({
    label,
    labelKey,
    busy: s().busy === hook,
    attrs: { "data-signin-tile": hook },
    onClick: () => {
      void run();
      return false;
    },
    ...more,
  });
  const copyText = () => ({ copy: text().copy, copied: text().copied });
  const goes = () => passwordGoes(text(), own.lang, s());

  // The picker's tiles change with the services alone, not with every key typed into the form.
  const services = createMemo(() => s().services);
  const picker = createMemo(() => signInServicePicker(own.providers, text(), own.lang, services(), () => glyphFor(keys().service)));
  const pickerText = () => {
    const t = text().services;
    return { search: t.search, none: t.searchNone, clear: t.clear, close: text().close, cancel: text().cancel, back: text().back };
  };

  return (
    <Switch>
      <Match when={open("removePassword")}>
        <Window
          title={text().password.removeTitle}
          text={words()}
          closeOnBackdrop={false}
          onClose={flow.close}
          actions={[cancel(), act(text().password.remove, keys().removePassword, "remove-password", flow.removePassword)]}
        >
          <div class="glim-signin-tile-body">
            <p class="glim-signin-tile-text">{text().password.removeText}</p>
            <Show when={goes().length > 0}>
              <ul class="glim-signin-tile-goes">
                <For each={goes()}>{(g) => <li>{g}</li>}</For>
              </ul>
            </Show>
            <FieldRow label={text().password.current}>
              <PasswordField
                autocomplete="current-password"
                value={s().draft.current}
                onInput={(e) => flow.set("current", e.currentTarget.value)}
                onKeyDown={enter(() => void flow.removePassword())}
                text={eye()}
                error={err("current")}
              />
            </FieldRow>
          </div>
        </Window>
      </Match>

      <Match when={open("twoFactorSetup", "twoFactorOff")}>
        {(w) => {
          const t = () => text().twoFactor;
          const setup = () => w().kind === "twoFactorSetup";
          const run = () => (setup() ? flow.confirmTwoFactor() : flow.turnTwoFactorOff());
          const setupWindow = () => {
            const v = w();
            return v.kind === "twoFactorSetup" ? v : undefined;
          };
          const qr = createMemo(() => {
            const v = setupWindow();
            return v ? qrCode(v.uri) : null;
          });
          const actions = () => {
            const empty = s().draft.code.trim() === "";
            return setup()
              ? [act(t().confirm, keys().confirm, "two-factor-confirm", run, { primary: true, disabled: empty })]
              : [cancel(), act(t().offConfirm, keys().turnOff, "two-factor-off", run, { disabled: empty })];
          };
          return (
            <Window title={setup() ? t().setupTitle : t().offTitle} text={words()} closeOnBackdrop={false} onClose={flow.close} actions={actions()}>
              <div class="glim-signin-tile-body">
                <p class="glim-signin-tile-text">{setup() ? t().scan : t().offText}</p>
                <Show when={qr()}>
                  {(code) => (
                    <svg class="glim-signin-tile-qr" viewBox={`-2 -2 ${code().size + 4} ${code().size + 4}`} role="img" aria-label={t().qr}>
                      <path d={code().path} />
                    </svg>
                  )}
                </Show>
                <Show when={setupWindow()}>
                  {(v) => (
                    <FieldRow label={t().key}>
                      <CopyField value={v().secret.replace(/(.{4})(?=.)/g, "$1 ")} text={copyText()} />
                    </FieldRow>
                  )}
                </Show>
                <FieldRow label={t().code}>
                  <TextField
                    inputmode={setup() ? "numeric" : "text"}
                    autocomplete="one-time-code"
                    spellcheck={false}
                    width="short"
                    value={s().draft.code}
                    onInput={(e) => flow.set("code", e.currentTarget.value)}
                    onKeyDown={enter(() => void run())}
                    error={err("code")}
                  />
                </FieldRow>
              </div>
            </Window>
          );
        }}
      </Match>

      <Match when={open("recoveryCodes")}>
        {(w) => {
          const t = () => text().twoFactor;
          return (
            <Window
              title={t().codesTitle}
              text={words()}
              closeOnBackdrop={false}
              onClose={flow.close}
              actions={[
                act(t().copyCodes, keys().copy, "two-factor-copy", flow.copyCodes),
                { label: t().codesSaved, labelKey: keys().confirm, primary: true, wayOut: true, attrs: { "data-signin-tile": "two-factor-saved" } },
              ]}
            >
              <div class="glim-signin-tile-body">
                <p class="glim-signin-tile-text">{t().codesText}</p>
                <ul class="glim-signin-tile-codes">
                  <For each={w().codes}>{(c) => <li>{c}</li>}</For>
                </ul>
              </div>
            </Window>
          );
        }}
      </Match>

      <Match when={open("addPasskey", "renamePasskey")}>
        {(w) => {
          const t = () => text().passkeys;
          const add = () => w().kind === "addPasskey";
          const run = () => (add() ? flow.addPasskey() : flow.renamePasskey());
          return (
            <Window
              title={add() ? t().addTitle : t().renameTitle}
              text={words()}
              closeOnBackdrop={false}
              onClose={flow.close}
              actions={[add() ? act(t().continue, keys().passkey, "passkey-add", run, { primary: true }) : act(text().save, keys().save, "passkey-rename", run, { primary: true })]}
            >
              <div class="glim-signin-tile-body">
                <FieldRow label={t().name} hint={t().nameHint}>
                  <TextField value={s().draft.name} onInput={(e) => flow.set("name", e.currentTarget.value)} onKeyDown={enter(() => void run())} error={err("name")} />
                </FieldRow>
                <Said said={s().said} />
              </div>
            </Window>
          );
        }}
      </Match>

      <Match when={open("newToken")}>
        <Window title={text().tokens.newTitle} text={words()} closeOnBackdrop={false} onClose={flow.close} actions={[act(text().tokens.make, keys().createToken, "token-make", flow.makeToken, { primary: true })]}>
          <div class="glim-signin-tile-body">
            <FieldRowGroup>
              <FieldRow label={text().tokens.name} hint={text().tokens.nameHint}>
                <TextField value={s().draft.name} onInput={(e) => flow.set("name", e.currentTarget.value)} onKeyDown={enter(() => void flow.makeToken())} error={err("name")} />
              </FieldRow>
              <FieldRow label={text().tokens.scope}>
                <Selector inline activation="manual" value={s().draft.scope} onChange={(v) => flow.set("scope", v)} items={signInScopeItems(own.scopes, text().tokens.scopes)} />
              </FieldRow>
              <FieldRow label={text().tokens.lifetime}>
                <Selector
                  inline
                  activation="manual"
                  value={s().draft.life}
                  onChange={(v) => flow.set("life", v)}
                  items={SIGN_IN_TOKEN_LIVES.map((id) => ({ id, label: text().tokens.lifetimes[id] }))}
                />
              </FieldRow>
            </FieldRowGroup>
          </div>
        </Window>
      </Match>

      <Match when={open("tokenShown")}>
        {(w) => {
          const t = () => text().tokens;
          return (
            <Window title={t().shownTitle} text={words()} closeOnBackdrop={false} onClose={flow.close} actions={[{ label: t().shownDone, labelKey: keys().confirm, primary: true, wayOut: true }]}>
              <div class="glim-signin-tile-body">
                <p class="glim-signin-tile-text">{t().shownText}</p>
                <FieldRow label={w().name}>
                  <CopyField value={w().value} text={copyText()} />
                </FieldRow>
              </div>
            </Window>
          );
        }}
      </Match>

      <Match when={open("pickService")}>
        <PickerWindow
          title={text().services.pick}
          hint={text().services.pickHint}
          items={picker().items}
          groups={picker().groups}
          text={pickerText()}
          onPick={flow.chooseService}
          onClose={flow.close}
        />
      </Match>

      <Match when={open("serviceForm")}>
        {(w) => {
          const t = () => text().services;
          const isOwn = () => w().provider === OWN_SIGN_IN_SERVICE;
          const name = () => signInServiceName(text(), w().provider, s().draft.label, own.providers.entries.find((e) => e.id === w().provider)?.name);
          const editing = () => s().services?.find((x) => x.id === w().edit);
          const test = () => s().formTest;
          const field = (key: SignInTileField, label: string, hint?: string) => (
            <FieldRow label={label} hint={hint}>
              <TextField mono={key !== "label"} value={s().draft[key]} onInput={(e) => flow.set(key, e.currentTarget.value)} error={err(key)} data-signin-field={key} />
            </FieldRow>
          );
          return (
            <PickerWindow
              title={name()}
              items={picker().items}
              groups={picker().groups}
              text={pickerText()}
              selected={w().provider}
              onPick={flow.chooseService}
              onBack={w().edit ? flow.close : flow.pickService}
              onClose={flow.close}
              actions={[
                act(signInTestLabel(text(), test()), "test", "service-test", flow.testDraft, {
                  glyph: test()?.tone === "ok" ? <IconCheck /> : test()?.tone === "danger" ? <IconClose /> : undefined,
                  tone: test()?.busy ? undefined : test()?.tone,
                  busy: !!test()?.busy,
                  title: test()?.title,
                }),
                w().edit
                  ? act(text().save, keys().save, "service-save", flow.saveService, { primary: true })
                  : { label: t().turnOn, labelKey: keys().turnOn, primary: true, disabled: true, title: t().mustTest, attrs: { "data-signin-tile": "service-turn-on" } },
              ]}
            >
              <div class="glim-signin-tile-form" data-signin-form={w().provider}>
                <p class="glim-signin-tile-text">{fill(t().formHint, { name: name() })}</p>
                <FieldRowGroup>
                  <Show when={isOwn()}>{field("label", t().label)}</Show>
                  {field("issuer", t().issuer, t().issuerHint)}
                  {field("clientId", t().clientId)}
                  <FieldRow label={t().secret} hint={w().edit ? t().secretKept : undefined}>
                    <PasswordField
                      autocomplete="off"
                      value={s().draft.secret}
                      onInput={(e) => flow.set("secret", e.currentTarget.value)}
                      text={eye()}
                      error={err("secret")}
                      data-signin-field="secret"
                    />
                  </FieldRow>
                  <FieldRow label={t().redirect} hint={t().redirectHint}>
                    <CopyField value={signInRedirectAddress(own.api, editing())} text={copyText()} />
                  </FieldRow>
                  <Show when={isOwn()}>
                    {field("scopes", t().scopes)}
                    {field("nameClaim", t().nameClaim)}
                    {field("groupsClaim", t().groupsClaim)}
                  </Show>
                </FieldRowGroup>
                <p class="glim-signin-tile-quiet">{fill(t().whoGetsIn, { name: name() })}</p>
                <Said said={s().said} />
              </div>
            </PickerWindow>
          );
        }}
      </Match>
    </Switch>
  );
}

// What the last try in a window came to, under its form rather than in its foot.
function Said(props: { said: SignInTileState["said"] }) {
  return (
    <Show when={props.said}>
      {(said) => (
        <p class={said().ok ? "glim-signin-tile-said" : "glim-signin-tile-said glim-signin-tile-said--fail"} role={said().ok ? "status" : "alert"}>
          {said().message}
        </p>
      )}
    </Show>
  );
}
