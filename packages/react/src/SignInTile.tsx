import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
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

interface Ctx {
  s: SignInTileState;
  flow: SignInTileFlow;
  text: SignInTileText;
  lang: string;
  scopes: string[];
  keys: SignInTileLabelKeys;
  when: (iso: string) => string;
  eye: { show: string; hide: string; confirm: string; mismatch: string };
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
  const { text, lang, providers, cards = SIGN_IN_TILE_CARDS, scopes = ["read", "all"], arrived, time, hueStart = 0 } = props;
  const latest = useRef(props);
  latest.current = props;
  const [flow] = useState(() =>
    createSignInTileFlow(() => ({ ...latest.current, cards: latest.current.cards ?? SIGN_IN_TILE_CARDS, scopes: latest.current.scopes ?? ["read", "all"] })),
  );
  const s = useSyncExternalStore(flow.subscribe, flow.state, flow.state);
  useEffect(() => flow.start(), [flow]);
  useEffect(() => {
    if (arrived) flow.arrive(arrived);
  }, [arrived]);
  useEffect(() => showTileRefusal(s.refusal), [s.refusal?.count]);
  const { confirm, confirmDialog } = useConfirm({ title: text.confirm, cancel: text.cancel, confirm: text.confirm });

  const ctx: Ctx = {
    s,
    flow,
    text,
    lang,
    scopes,
    keys: { ...SIGN_IN_TILE_KEYS, ...props.labelKeys },
    when: time ?? signInWhen(lang),
    eye: { show: text.show, hide: text.hide, confirm: text.confirmPassword, mismatch: text.mismatch },
    err: (field) => (s.invalid?.field === field ? s.invalid.message : undefined),
    ask: (what, id, name) => {
      const q = removalQuestion(text, what, name);
      void confirm(q.message, { confirmLabel: q.confirm, confirmLabelKey: ctx.keys.remove }).then((yes) => {
        if (yes) void flow.remove(what, id);
      });
    },
  };

  return (
    <div data-glim="SignInTile" className="glim-signin-tile">
      {signInTileCards(s, cards).map((c, i) => {
        const hue = hueStart + i;
        if (c === "password") return <PasswordCard key={c} ctx={ctx} hue={hue} />;
        if (c === "askPassword") return <AskPasswordCard key={c} ctx={ctx} hue={hue} />;
        if (c === "twoFactor") return <TwoFactorCard key={c} ctx={ctx} hue={hue} />;
        if (c === "passkeys") return <PasskeysCard key={c} ctx={ctx} hue={hue} />;
        if (c === "sessions") return <SessionsCard key={c} ctx={ctx} hue={hue} />;
        if (c === "tokens") return <TokensCard key={c} ctx={ctx} hue={hue} />;
        if (c === "services") return <ServicesCard key={c} ctx={ctx} hue={hue} providers={providers} />;
        return <AccountsCard key={c} ctx={ctx} hue={hue} />;
      })}
      <TileWindow ctx={ctx} api={props.api} providers={providers} />
      {confirmDialog}
    </div>
  );
}

function Notice({ notice }: { notice: { title: string; reason: string } }) {
  return <UnavailableNotice title={notice.title} reason={notice.reason} />;
}

function PasswordCard({ ctx, hue }: { ctx: Ctx; hue: number }) {
  const { s, flow, text, keys, eye, err } = ctx;
  const t = text.password;
  const had = !!s.me?.password;
  const open = s.me?.via === "open";
  const elsewhere = signInPasswordElsewhere(text, s);
  return (
    <Card title={t.title} hint={open ? t.openHint : fill(t.hint, { min: s.offer?.minPassword ?? 12 })} hueIndex={hue} data-signin-card="password">
      {elsewhere ? (
        <p className="glim-signin-tile-text">{elsewhere}</p>
      ) : (
        <div className="glim-signin-tile-body">
          <FieldRow label={t.state} value={had ? t.set : t.none} tone={had ? undefined : "warn"} />
          {s.editing && (
            <FieldRowGroup>
              {had && (
                <FieldRow label={t.current}>
                  <PasswordField autoComplete="current-password" value={s.draft.current} onChange={(e) => flow.set("current", e.target.value)} text={eye} error={err("current")} />
                </FieldRow>
              )}
              <FieldRow label={t.next}>
                <PasswordField confirm value={s.draft.next} onChange={(e) => flow.set("next", e.target.value)} onConfirmedChange={flow.setConfirmed} text={eye} error={err("next")} />
              </FieldRow>
            </FieldRowGroup>
          )}
          <div className="glim-signin-tile-foot">
            {s.editing ? (
              <>
                <Button label={text.cancel} labelKey="common.cancel" glyph={<IconCancel />} onClick={flow.cancelPassword} />
                <Button
                  label={t.save}
                  labelKey={keys.savePassword}
                  tone="accent"
                  busy={s.busy === "save-password"}
                  disabled={!s.confirmed || (had && s.draft.current === "")}
                  data-signin-tile="save-password"
                  onClick={() => void flow.savePassword()}
                />
              </>
            ) : (
              <>
                {had && <Button label={t.remove} labelKey={keys.removePassword} data-signin-tile="ask-remove-password" onClick={flow.askRemovePassword} />}
                <Button label={had ? t.change : t.add} labelKey={had ? keys.change : keys.setPassword} data-signin-tile="edit-password" onClick={flow.editPassword} />
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function AskPasswordCard({ ctx, hue }: { ctx: Ctx; hue: number }) {
  const { s, flow, text } = ctx;
  const t = text.askPassword;
  return (
    <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="askPassword">
      <FieldRow label={t.label}>
        <Toggle checked={!!s.settings?.askPassword} onChange={(on) => void flow.setAskPassword(on)} data-signin-tile="ask-password" />
      </FieldRow>
    </Card>
  );
}

function TwoFactorCard({ ctx, hue }: { ctx: Ctx; hue: number }) {
  const { s, flow, text, lang, keys } = ctx;
  const t = text.twoFactor;
  const notice = signInCardNotice(text, s, "twoFactor");
  const on = !!s.me?.twoFactor;
  return (
    <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="twoFactor">
      {notice ? (
        <Notice notice={notice} />
      ) : (
        <div className="glim-signin-tile-body">
          <FieldRowGroup>
            <FieldRow label={t.state} value={on ? t.on : t.off} tone={on ? "ok" : undefined} />
            {on && <FieldRow label={t.codesLeft} value={plural(lang, t.codesLeftValue, s.me?.recoveryLeft ?? 0)} />}
          </FieldRowGroup>
          <div className="glim-signin-tile-foot">
            {on ? (
              <>
                <Button label={t.newCodes} labelKey={keys.newCodes} busy={s.busy === "two-factor-codes"} data-signin-tile="two-factor-codes" onClick={() => void flow.newCodes()} />
                <Button label={t.turnOff} labelKey={keys.turnOff} data-signin-tile="ask-two-factor-off" onClick={flow.askTwoFactorOff} />
              </>
            ) : (
              <Button label={t.setUp} labelKey={keys.setUp} busy={s.busy === "two-factor-set-up"} data-signin-tile="two-factor-set-up" onClick={() => void flow.setUpTwoFactor()} />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function PasskeysCard({ ctx, hue }: { ctx: Ctx; hue: number }) {
  const { s, flow, text, keys, when, ask } = ctx;
  const t = text.passkeys;
  const notice = signInCardNotice(text, s, "passkeys");
  const here = s.passkeysHere;
  return (
    <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="passkeys">
      {notice ? (
        <Notice notice={notice} />
      ) : (
        <div className="glim-signin-tile-body">
          {!here && <UnavailableNotice title={t.unavailableTitle} reason={t.unavailable} />}
          {s.passkeys.length > 0 ? (
            <div className="glim-list glim-signin-tile-rows">
              {s.passkeys.map((p) => (
                <ListRow
                  key={p.id}
                  name={p.name}
                  tile={<GlyphTile glyph={glyphFor(keys.passkey)} />}
                  badges={<span className="glim-signin-tile-facts">{passkeyFacts(text, p, when).join(" · ")}</span>}
                  actions={
                    <>
                      <Button label={t.rename} labelKey={keys.rename} onClick={() => flow.askRenamePasskey(p.id)} />
                      <Button label={text.remove} labelKey={keys.remove} data-signin-tile={`remove-passkey-${p.id}`} onClick={() => ask("passkey", p.id, p.name)} />
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            here && <EmptyState nested glyph={glyphFor(keys.passkey)} title={t.none} hint={t.noneHint} />
          )}
          {here && (
            <div className="glim-signin-tile-foot">
              <Button label={t.add} labelKey={keys.add} data-signin-tile="passkey-ask-add" onClick={() => flow.askAddPasskey()} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function SessionsCard({ ctx, hue }: { ctx: Ctx; hue: number }) {
  const { s, flow, text, keys, when } = ctx;
  const t = text.sessions;
  const others = s.sessions.some((x) => !x.current);
  return (
    <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="sessions">
      <div className="glim-signin-tile-body">
        <div className="glim-list glim-signin-tile-rows">
          {s.sessions.map((x) => {
            const device = signInDevice(x.agent, t);
            return (
              <ListRow
                key={x.id}
                name={device.name}
                tile={<GlyphTile glyph={glyphFor(device.phone ? keys.phone : keys.laptop)} />}
                badges={
                  <>
                    <span className="glim-signin-tile-facts">{sessionFacts(text, x, s.services, when).join(" · ")}</span>
                    {x.current && <Badge tone="active">{t.current}</Badge>}
                  </>
                }
                actions={
                  !x.current && (
                    <Button label={t.end} labelKey={keys.end} busy={s.busy === `session-end-${x.id}`} data-signin-tile={`session-end-${x.id}`} onClick={() => void flow.endSession(x.id)} />
                  )
                }
              />
            );
          })}
        </div>
        {others && (
          <div className="glim-signin-tile-foot">
            <Button label={t.endOthers} labelKey={keys.endOthers} busy={s.busy === "sessions-end-others"} data-signin-tile="sessions-end-others" onClick={() => void flow.endOtherSessions()} />
          </div>
        )}
      </div>
    </Card>
  );
}

function TokensCard({ ctx, hue }: { ctx: Ctx; hue: number }) {
  const { s, flow, text, keys, when, ask } = ctx;
  const t = text.tokens;
  const notice = signInCardNotice(text, s, "tokens");
  return (
    <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="tokens">
      {notice ? (
        <Notice notice={notice} />
      ) : (
        <div className="glim-signin-tile-body">
          {s.tokens.length > 0 ? (
            <div className="glim-list glim-signin-tile-rows">
              {s.tokens.map((k) => (
                <ListRow
                  key={k.id}
                  name={k.name}
                  tile={<GlyphTile glyph={glyphFor(keys.token)} />}
                  badges={
                    <>
                      <span className="glim-signin-tile-facts">{tokenFacts(text, k, when).join(" · ")}</span>
                      {k.scopes.map((scope) => (
                        <Badge key={scope}>{t.scopes[scope] ?? scope}</Badge>
                      ))}
                    </>
                  }
                  actions={<Button label={t.revoke} labelKey={keys.revoke} data-signin-tile={`remove-token-${k.id}`} onClick={() => ask("token", k.id, k.name)} />}
                />
              ))}
            </div>
          ) : (
            <EmptyState nested glyph={glyphFor(keys.token)} title={t.none} hint={t.noneHint} />
          )}
          <div className="glim-signin-tile-foot">
            <Button label={t.create} labelKey={keys.createToken} data-signin-tile="token-ask" onClick={flow.askToken} />
          </div>
        </div>
      )}
    </Card>
  );
}

function ServicesCard({ ctx, hue, providers }: { ctx: Ctx; hue: number; providers: Catalog }) {
  const { s, flow, text, keys, when, ask } = ctx;
  const t = text.services;
  const notice = signInCardNotice(text, s, "services");
  return (
    <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="services">
      {notice ? (
        <Notice notice={notice} />
      ) : (
        <div className="glim-signin-tile-body">
          {(s.services ?? []).map((x) => {
            const badge = signInServiceBadge(text, x);
            return (
              <ConnectionRow
                key={x.id}
                name={x.name}
                mark={signInServiceMark(providers, x.provider) ?? glyphFor(keys.service)}
                status={signInServiceStatus(text, x, when)}
                badges={<Badge tone={badge.tone}>{badge.label}</Badge>}
                test={s.rowTests[x.id]}
                actions={signInServiceActions(text, x, s, keys.turnOn, (id) => void flow.confirmService(id))}
                text={{ test: t.test, edit: t.edit, remove: text.remove }}
                onTest={x.fromConfig ? undefined : () => void flow.testService(x.id)}
                onEdit={x.fromConfig ? undefined : () => flow.editService(x.id)}
                onRemove={x.fromConfig ? undefined : () => ask("service", x.id, x.name)}
                data-signin-service={x.provider}
              >
                {!x.fromConfig && (
                  <Toggle
                    checked={x.on}
                    label={t.show}
                    refused={!x.tested || x.paused ? t.mustTest : undefined}
                    onChange={(on) => void flow.setServiceOn(x.id, on)}
                    data-signin-tile={`service-on-${x.id}`}
                  />
                )}
              </ConnectionRow>
            );
          })}
          <div className="glim-signin-tile-foot">
            <Button label={t.add} labelKey={keys.addService} data-signin-tile="service-pick" onClick={flow.pickService} />
          </div>
        </div>
      )}
    </Card>
  );
}

function AccountsCard({ ctx, hue }: { ctx: Ctx; hue: number }) {
  const { s, flow, text, keys, when, ask } = ctx;
  const t = text.accounts;
  return (
    <Card title={t.title} hint={t.hint} hueIndex={hue} data-signin-card="accounts">
      <div className="glim-list glim-signin-tile-rows">
        {(s.accounts ?? []).map((a) => (
          <ListRow
            key={a.id}
            name={a.name}
            tile={<GlyphTile glyph={glyphFor(keys.account)} />}
            badges={
              <>
                <span className="glim-signin-tile-facts">{accountFacts(text, a, s.services, when).join(" · ")}</span>
                {a.owner && <Badge>{t.owner}</Badge>}
                {a.blocked && <Badge tone="warn">{t.blocked}</Badge>}
              </>
            }
            actions={
              !a.owner &&
              a.id !== s.me?.account && (
                <>
                  <Button
                    label={a.blocked ? t.unblock : t.block}
                    labelKey={a.blocked ? keys.unblock : keys.block}
                    busy={s.busy === `account-block-${a.id}`}
                    data-signin-tile={`account-block-${a.id}`}
                    onClick={() => void flow.block(a.id, !a.blocked)}
                  />
                  <Button label={text.remove} labelKey={keys.remove} data-signin-tile={`remove-account-${a.id}`} onClick={() => ask("account", a.id, a.name)} />
                </>
              )
            }
          />
        ))}
      </div>
    </Card>
  );
}

function TileWindow({ ctx, api, providers }: { ctx: Ctx; api: SignInApi; providers: Catalog }) {
  const { s, flow, text, lang, scopes, keys, eye, err } = ctx;
  const w = s.window;
  if (!w) return null;
  const words = { cancel: text.cancel, close: text.close };
  const cancel: WindowAction = { label: text.cancel, labelKey: "common.cancel", glyph: <IconCancel />, wayOut: true };
  const act = (label: string, labelKey: string, hook: string, run: () => Promise<void> | void, more: Partial<WindowAction> = {}): WindowAction => ({
    label,
    labelKey,
    busy: s.busy === hook,
    attrs: { "data-signin-tile": hook },
    onClick: () => {
      void run();
      return false;
    },
    ...more,
  });

  if (w.kind === "removePassword") {
    const t = text.password;
    const goes = passwordGoes(text, lang, s);
    return (
      <Window title={t.removeTitle} text={words} closeOnBackdrop={false} onClose={flow.close} actions={[cancel, act(t.remove, keys.removePassword, "remove-password", flow.removePassword)]}>
        <div className="glim-signin-tile-body">
          <p className="glim-signin-tile-text">{t.removeText}</p>
          {goes.length > 0 && (
            <ul className="glim-signin-tile-goes">
              {goes.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
          <FieldRow label={t.current}>
            <PasswordField autoComplete="current-password" value={s.draft.current} onChange={(e) => flow.set("current", e.target.value)} onKeyDown={enter(() => void flow.removePassword())} text={eye} error={err("current")} />
          </FieldRow>
        </div>
      </Window>
    );
  }

  if (w.kind === "twoFactorSetup" || w.kind === "twoFactorOff") {
    const t = text.twoFactor;
    const setup = w.kind === "twoFactorSetup";
    const run = setup ? flow.confirmTwoFactor : flow.turnTwoFactorOff;
    const action = setup
      ? act(t.confirm, keys.confirm, "two-factor-confirm", run, { primary: true, disabled: s.draft.code.trim() === "" })
      : act(t.offConfirm, keys.turnOff, "two-factor-off", run, { disabled: s.draft.code.trim() === "" });
    const qr = setup ? qrCode(w.uri) : null;
    return (
      <Window title={setup ? t.setupTitle : t.offTitle} text={words} closeOnBackdrop={false} onClose={flow.close} actions={setup ? [action] : [cancel, action]}>
        <div className="glim-signin-tile-body">
          <p className="glim-signin-tile-text">{setup ? t.scan : t.offText}</p>
          {setup && qr && (
            <svg className="glim-signin-tile-qr" viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`} role="img" aria-label={t.qr}>
              <path d={qr.path} />
            </svg>
          )}
          {setup && (
            <FieldRow label={t.key}>
              <CopyField value={w.secret.replace(/(.{4})(?=.)/g, "$1 ")} text={{ copy: text.copy, copied: text.copied }} />
            </FieldRow>
          )}
          <FieldRow label={t.code}>
            <TextField
              inputMode={setup ? "numeric" : "text"}
              autoComplete="one-time-code"
              spellCheck={false}
              width="short"
              value={s.draft.code}
              onChange={(e) => flow.set("code", e.target.value)}
              onKeyDown={enter(() => void run())}
              error={err("code")}
            />
          </FieldRow>
        </div>
      </Window>
    );
  }

  if (w.kind === "recoveryCodes") {
    const t = text.twoFactor;
    return (
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
        <div className="glim-signin-tile-body">
          <p className="glim-signin-tile-text">{t.codesText}</p>
          <ul className="glim-signin-tile-codes">
            {w.codes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </Window>
    );
  }

  if (w.kind === "addPasskey" || w.kind === "renamePasskey") {
    const t = text.passkeys;
    const add = w.kind === "addPasskey";
    const run = add ? flow.addPasskey : flow.renamePasskey;
    return (
      <Window
        title={add ? t.addTitle : t.renameTitle}
        text={words}
        closeOnBackdrop={false}
        onClose={flow.close}
        actions={[add ? act(t.continue, keys.passkey, "passkey-add", run, { primary: true }) : act(text.save, keys.save, "passkey-rename", run, { primary: true })]}
      >
        <div className="glim-signin-tile-body">
          <FieldRow label={t.name} hint={t.nameHint}>
            <TextField value={s.draft.name} onChange={(e) => flow.set("name", e.target.value)} onKeyDown={enter(() => void run())} error={err("name")} />
          </FieldRow>
          <Said said={s.said} />
        </div>
      </Window>
    );
  }

  if (w.kind === "newToken") {
    const t = text.tokens;
    return (
      <Window title={t.newTitle} text={words} closeOnBackdrop={false} onClose={flow.close} actions={[act(t.make, keys.createToken, "token-make", flow.makeToken, { primary: true })]}>
        <div className="glim-signin-tile-body">
          <FieldRowGroup>
            <FieldRow label={t.name} hint={t.nameHint}>
              <TextField value={s.draft.name} onChange={(e) => flow.set("name", e.target.value)} onKeyDown={enter(() => void flow.makeToken())} error={err("name")} />
            </FieldRow>
            <FieldRow label={t.scope}>
              <Selector inline activation="manual" value={s.draft.scope} onChange={(v) => flow.set("scope", v)} items={signInScopeItems(scopes, t.scopes)} />
            </FieldRow>
            <FieldRow label={t.lifetime}>
              <Selector inline activation="manual" value={s.draft.life} onChange={(v) => flow.set("life", v)} items={SIGN_IN_TOKEN_LIVES.map((id) => ({ id, label: t.lifetimes[id] }))} />
            </FieldRow>
          </FieldRowGroup>
        </div>
      </Window>
    );
  }

  if (w.kind === "tokenShown") {
    const t = text.tokens;
    return (
      <Window title={t.shownTitle} text={words} closeOnBackdrop={false} onClose={flow.close} actions={[{ label: t.shownDone, labelKey: keys.confirm, primary: true, wayOut: true }]}>
        <div className="glim-signin-tile-body">
          <p className="glim-signin-tile-text">{t.shownText}</p>
          <FieldRow label={w.name}>
            <CopyField value={w.value} text={{ copy: text.copy, copied: text.copied }} />
          </FieldRow>
        </div>
      </Window>
    );
  }

  const t = text.services;
  const { items, groups } = signInServicePicker(providers, text, lang, s.services, () => glyphFor(keys.service));
  const pickerText = { search: t.search, none: t.searchNone, clear: t.clear, close: text.close, cancel: text.cancel, back: text.back };
  if (w.kind === "pickService") {
    return <PickerWindow title={t.pick} hint={t.pickHint} items={items} groups={groups} text={pickerText} onPick={flow.chooseService} onClose={flow.close} />;
  }

  const own = w.provider === OWN_SIGN_IN_SERVICE;
  const name = signInServiceName(text, w.provider, s.draft.label, providers.entries.find((e) => e.id === w.provider)?.name);
  const editing = s.services?.find((x) => x.id === w.edit);
  const test = s.formTest;
  const field = (key: SignInTileField, label: string, hint?: string) => (
    <FieldRow label={label} hint={hint}>
      <TextField mono={key !== "label"} value={s.draft[key]} onChange={(e) => flow.set(key, e.target.value)} error={err(key)} data-signin-field={key} />
    </FieldRow>
  );
  return (
    <PickerWindow
      title={name}
      items={items}
      groups={groups}
      text={pickerText}
      selected={w.provider}
      onPick={flow.chooseService}
      onBack={w.edit ? flow.close : flow.pickService}
      onClose={flow.close}
      actions={[
        act(signInTestLabel(text, test), "test", "service-test", flow.testDraft, {
          glyph: test?.tone === "ok" ? <IconCheck /> : test?.tone === "danger" ? <IconClose /> : undefined,
          tone: test?.busy ? undefined : test?.tone,
          busy: !!test?.busy,
          title: test?.title,
        }),
        w.edit
          ? act(text.save, keys.save, "service-save", flow.saveService, { primary: true })
          : { label: t.turnOn, labelKey: keys.turnOn, primary: true, disabled: true, title: t.mustTest, attrs: { "data-signin-tile": "service-turn-on" } },
      ]}
    >
      <div className="glim-signin-tile-form" data-signin-form={w.provider}>
        <p className="glim-signin-tile-text">{fill(t.formHint, { name })}</p>
        <FieldRowGroup>
          {own && field("label", t.label)}
          {field("issuer", t.issuer, t.issuerHint)}
          {field("clientId", t.clientId)}
          <FieldRow label={t.secret} hint={w.edit ? t.secretKept : undefined}>
            <PasswordField autoComplete="off" value={s.draft.secret} onChange={(e) => flow.set("secret", e.target.value)} text={eye} error={err("secret")} data-signin-field="secret" />
          </FieldRow>
          <FieldRow label={t.redirect} hint={t.redirectHint}>
            <CopyField value={signInRedirectAddress(api, editing)} text={{ copy: text.copy, copied: text.copied }} />
          </FieldRow>
          {own && field("scopes", t.scopes)}
          {own && field("nameClaim", t.nameClaim)}
          {own && field("groupsClaim", t.groupsClaim)}
        </FieldRowGroup>
        <p className="glim-signin-tile-quiet">{fill(t.whoGetsIn, { name })}</p>
        <Said said={s.said} />
      </div>
    </PickerWindow>
  );
}

// What the last try in a window came to, under its form rather than in its foot.
function Said({ said }: { said: SignInTileState["said"] }) {
  if (!said) return null;
  return (
    <p className={said.ok ? "glim-signin-tile-said" : "glim-signin-tile-said glim-signin-tile-said--fail"} role={said.ok ? "status" : "alert"}>
      {said.message}
    </p>
  );
}
