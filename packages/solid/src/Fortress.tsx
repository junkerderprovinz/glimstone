import { createEffect, createMemo, createSignal, For, Index, Match, mergeProps, on, onCleanup, Show, Switch, untrack, type Accessor, type JSX } from "solid-js";
import {
  COPIED_MS,
  copyText,
  createFortressFlow,
  fill,
  hueVars,
  joinRefusalText,
  listOf,
  MARKS,
  othersLine,
  phraseReady,
  shake,
  storedShowOthers,
  storeShowOthers,
  qrCode,
  type ChangeAnswer,
  type FortressAnswer,
  type FortressApp,
  type FortressFlow,
  type FortressInstance,
  type FortressLabelKeys,
  type FortressPermission,
  type FortressState,
  type FortressText,
  type FortressWindow as FortressStep,
  type PhraseAnswer,
  type ToastSeverity,
  windowFocusTarget,
} from "@glimstone/core";
import { Button } from "./Button.tsx";
import { Card } from "./Card.tsx";
import { FieldRow } from "./FieldRow.tsx";
import { FortressAppCard } from "./FortressAppCard.tsx";
import { FortressPermissions } from "./FortressPermissions.tsx";
import { InfoBubble } from "./InfoBubble.tsx";
import { PasswordField } from "./PasswordField.tsx";
import { Toggle } from "./Toggle.tsx";
import { Window, type WindowAction } from "./Window.tsx";
import { glyphFor, IconClose, MarkSvg } from "./glyphs.tsx";
import { css } from "./style.ts";

export type { ChangeAnswer, FortressAnswer, FortressLabelKeys, FortressText, PhraseAnswer } from "@glimstone/core";

const LABEL_KEYS: FortressLabelKeys = {
  join: "fortressJoin",
  leave: "fortressLeave",
  showPhrase: "fortressShowPhrase",
  changePhrase: "fortressChangePhrase",
  remove: "delete",
  later: "fortressLater",
  unlock: "unlock",
  copy: "copy",
};

function useFlowState(flow: FortressFlow): Accessor<FortressState> {
  const [state, setState] = createSignal(flow.state());
  onCleanup(flow.subscribe(() => setState(flow.state())));
  return state;
}

export interface FortressProps {
  text: FortressText;
  /** The interface language, for counts and lists. */
  lang: string;
  /** The app showing the page. */
  app: { id: string; name: string; logo?: string };
  joined: boolean;
  /** The other apps of the fortress, each with its instances. */
  apps: FortressApp[];
  permissions: FortressPermission[];
  onPermission: (id: string, on: boolean) => Promise<FortressAnswer>;
  /** Puts the small confirmation of a saved permission, or the reason it failed, into the app's toasts. */
  notify?: (message: string, severity: ToastSeverity) => void;
  onJoin: (words: string[]) => Promise<FortressAnswer>;
  /** Removes an instance, of this app or another. Without it no other app offers Remove. */
  onRemove?: (id: string) => Promise<FortressAnswer>;
  /** `password` is set where `phrasePassword` asks for it first. Without it there is no Show phrase. */
  onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
  /** Offered right after a removal and beside `removed`, since until the phrase changes the fortress takes no new app. */
  onChangePhrase?: () => Promise<ChangeAnswer>;
  /** The instances removed since the phrase last changed, by name ("Bravo on Atlas"). While there are any, a line says that no new app can join. */
  removed?: string[];
  /** Another member removed this app, so the empty place says so until it joins again. */
  removedHere?: boolean;
  /** Whether the other apps show. Without it the switch keeps its state on this device. */
  showOthers?: boolean;
  onShowOthers?: (on: boolean) => void;
  /** The app draws the switch for the other apps itself, such as at the top of its pairing card, with `showOthers` and `othersLine`. */
  hideSwitch?: boolean;
  /** The devices this app is paired with today, whose pairing moves into the fortress on joining. */
  pairedWith?: string[];
  /** A member of a fortress this app saw on the network while it is in none. */
  found?: { app: string; device: string; logo?: string };
  /** Asks for the app's password before the phrase shows. */
  phrasePassword?: boolean;
  onOpen?: (app: FortressApp, instance: FortressInstance) => void;
  /** The app's own card for another app, such as the one its Instances tab draws, in place of FortressAppCard. With `onRemove` it gets `remove`, which asks before an instance goes, as the app's own cards do. */
  renderApp?: (app: FortressApp, hueIndex: number, remove?: (id: string, name: string) => void) => JSX.Element;
  /** What the QR code beside the words carries, the words alone without it. */
  phraseQr?: (words: string[]) => string;
  /** Something of the app's own under a permission's words. */
  permissionExtra?: (permission: FortressPermission) => JSX.Element;
  labelKeys?: Partial<FortressLabelKeys>;
  /** The rainbow position the fortress's first card takes, after the app's own cards. */
  hueStart?: number;
  /** This app's own instance cards. As a function it gets `remove`, which asks before an instance goes. */
  children?: JSX.Element | ((remove: (id: string, device: string) => void) => JSX.Element);
}

/**
 * The fortress in the Instances tab ("The fortress" in the design language):
 * the app's own instances first, the switch for the other apps and, once it is
 * on, their cards and the permissions, with Show phrase or Enter phrase in the
 * corner. Changing the phrase and leaving live in the pairing settings
 * (FortressPairing).
 */
export function Fortress(props: FortressProps) {
  const merged = mergeProps({ removed: [], hueStart: 0 } as { removed: string[]; hueStart: number }, props);
  const flow = createFortressFlow(() => ({
    onJoin: props.onJoin,
    onRemove: props.onRemove,
    onShowPhrase: props.onShowPhrase,
    onChangePhrase: props.onChangePhrase,
    phrasePassword: props.phrasePassword,
    failed: props.text.failed,
    joinRefusal: (code) => joinRefusalText(props.text, code),
  }));
  const s = useFlowState(flow);
  const keys = () => ({ ...LABEL_KEYS, ...props.labelKeys });

  const [ownShow, setOwnShow] = createSignal(storedShowOthers());
  const showOthers = () => props.showOthers ?? ownShow();
  const setShowOthers = (on: boolean) => {
    if (props.onShowOthers) props.onShowOthers(on);
    else {
      storeShowOthers(on);
      setOwnShow(on);
    }
  };
  const own = () => {
    const children = props.children;
    return typeof children === "function" ? children(flow.openRemove) : children;
  };
  const remove = () => props.onRemove && flow.openRemove;
  // An app that shows the phrase in its pairing settings leaves the corner out.
  const corner = () => !props.joined || props.onShowPhrase;

  return (
    <div data-glim="Fortress" class="glim-fortress">
      <div class="glim-fortress-grid">
        {own()}
        <Show when={!props.joined}>
          <div class="glim-card glim-instance glim-instance--out" data-fortress="out">
            <h3 class="glim-instance-title">{props.removedHere ? props.text.removedHereTitle : props.text.outTitle}</h3>
            <p class="glim-instance-hint">{fill(props.removedHere ? props.text.removedHereHint : props.text.outHint, { app: props.app.name })}</p>
            <Show when={props.found}>
              {(found) => (
                <p class="glim-instance-found">
                  <Show when={found().logo}>
                    <img src={found().logo} alt="" />
                  </Show>
                  <span>{fill(props.text.found, { app: found().app, device: found().device })}</span>
                </p>
              )}
            </Show>
          </div>
        </Show>
      </div>

      <Show when={props.joined && !props.hideSwitch}>
        <div class="glim-card glim-fortress-switch glim-hue" style={css(hueVars(merged.hueStart))}>
          <span class="glim-fortress-switch-text">
            <span class="glim-fortress-switch-name">
              {props.text.showOthers}
              <InfoBubble tip={props.text.about} />
            </span>
            <span class="glim-fortress-sub">{othersLine(props.text, props.lang, props.apps)}</span>
          </span>
          <Toggle label={props.text.showOthers} hideLabel checked={showOthers()} onChange={setShowOthers} data-fortress="others" />
        </div>
      </Show>

      <Show when={props.joined && merged.removed.length > 0}>
        <div class="glim-fortress-removed" data-fortress="removed" role="status">
          {glyphFor("info")}
          <span>{fill(props.text.removedNote, { devices: listOf(props.lang, merged.removed) })}</span>
          <Show when={props.onChangePhrase}>
            <Button label={props.text.changePhrase} labelKey={keys().changePhrase} tone="subtle" onClick={flow.openChange} data-fortress="open-change" />
          </Show>
        </div>
      </Show>

      <Show when={props.joined && showOthers()}>
        <div class="glim-fortress-grid">
          <For each={props.apps}>
            {(a, i) =>
              props.renderApp ? (
                props.renderApp(a, merged.hueStart + 1 + i(), remove())
              ) : (
                <FortressAppCard
                  app={a}
                  text={props.text}
                  lang={props.lang}
                  hueIndex={merged.hueStart + 1 + i()}
                  onOpen={props.onOpen}
                  onRemove={remove()}
                  removeKey={keys().remove}
                />
              )
            }
          </For>
        </div>
        <FortressPermissions
          text={props.text}
          app={props.app}
          apps={[props.app, ...props.apps]}
          permissions={props.permissions}
          onPermission={props.onPermission}
          notify={props.notify}
          hueIndex={merged.hueStart + 1 + props.apps.length}
          extra={props.permissionExtra}
        />
      </Show>

      <Show when={corner()}>
        <div class="glim-fortress-actions">
          <Show
            when={props.joined}
            fallback={<Button label={props.text.enterPhrase} labelKey={keys().join} tone="accent" size="key" onClick={flow.openJoin} data-fortress="open-join" />}
          >
            <Button
              label={props.text.showPhrase}
              labelKey={keys().showPhrase}
              tone="accent"
              size="key"
              busy={s().busy === "show"}
              onClick={() => void flow.openPhrase()}
              data-fortress="show"
            />
          </Show>
        </div>
      </Show>

      <Show when={s().window}>
        <FortressWindow flow={flow} state={s()} context={props} keys={keys()} />
      </Show>
    </div>
  );
}

interface WindowContext {
  text: FortressText;
  lang: string;
  app: { id: string; name: string };
  pairedWith?: string[];
  leaveNote?: string;
  phraseQr?: (words: string[]) => string;
}

function PhraseQr(props: { content: string; name: string }) {
  const code = createMemo(() => qrCode(props.content));
  const side = () => code().size + 8;
  // A camera reads dark modules on a light ground, so these two colours stay put in every theme.
  return (
    <svg class="glim-phrase-qr" data-fortress="qr" role="img" aria-label={props.name} viewBox={`-4 -4 ${side()} ${side()}`} shape-rendering="crispEdges">
      <rect x={-4} y={-4} width={side()} height={side()} fill="#ffffff" />
      <path d={code().path} fill="#161616" />
    </svg>
  );
}

type Step<K extends FortressStep["kind"]> = Extract<FortressStep, { kind: K }>;

function FortressWindow(props: { flow: FortressFlow; state: FortressState; context: WindowContext; keys: FortressLabelKeys }) {
  const text = () => props.context.text;
  const app = () => props.context.app;
  const w = () => props.state.window!;
  const at = <K extends FortressStep["kind"]>(kind: K) => (w().kind === kind ? (w() as Step<K>) : undefined);
  const kind = createMemo(() => w().kind);
  // The password and the words are two steps of one window.
  const stage = createMemo(() => at("phrase")?.step ?? (kind() as Exclude<FortressStep["kind"], "phrase">));
  const focus = createMemo(() => at("join")?.focus ?? -1);
  const refusal = createMemo(() => props.state.refusal);
  let card: HTMLDivElement | undefined;
  const [copied, setCopied] = createSignal(false);
  const paired = () => (props.context.pairedWith?.length ? listOf(props.context.lang, props.context.pairedWith) : null);
  const busy = () => props.state.busy !== null;

  const error = () => (
    <Show when={props.state.error}>
      <p class="glim-fortress-error" role="alert">
        {props.state.error}
      </p>
    </Show>
  );
  // A button stays the same element while the flow waits, so its focus and its shake hold.
  const send = (button: string, run: () => Promise<void>, label: string, key: string, disabled: () => boolean = () => false): WindowAction => ({
    label,
    labelKey: key,
    primary: true,
    get disabled() {
      return disabled() || busy();
    },
    attrs: { "data-fortress": button },
    onClick: () => {
      void run();
      return false;
    },
  });
  const copy = (): WindowAction => ({
    label: text().copy,
    labelKey: props.keys.copy,
    attrs: { "data-fortress": "copy" },
    onClick: () => {
      const step = w();
      if (step.kind === "phrase" || step.kind === "changed") void copyText(step.words.join(" ")).then(setCopied);
      return false;
    },
  });
  // A space or a paste leaves other words in the field than the ones the flow keeps there.
  const enter = (i: number, field: HTMLInputElement) => {
    props.flow.enter(i, field.value);
    const held = at("join")?.words[i];
    if (held !== undefined && field.value !== held) field.value = held;
  };
  const words = (list: string[]) => (
    <div class="glim-phrase-show">
      <ol class="glim-phrase-words" data-fortress="words">
        <Index each={list}>
          {(word, i) => (
            <li>
              <span class="glim-phrase-number glim-num">{i + 1}</span>
              {word()}
            </li>
          )}
        </Index>
      </ol>
      <PhraseQr content={props.context.phraseQr ? props.context.phraseQr(list) : list.join(" ")} name={text().qrName} />
      <p class="glim-phrase-scan">{text().scanHint}</p>
    </div>
  );

  const frame = createMemo(() => {
    const t = text();
    const k = props.keys;
    const f = props.flow;
    // Window adds Close only to a foot with something in it, so a window that only says something brings its own.
    const close: WindowAction = { label: t.close, labelKey: "common.close", glyph: <IconClose />, wayOut: true };
    switch (stage()) {
      case "join":
        return { title: t.joinTitle, size: "wide" as const, actions: [send("join", f.join, t.join, k.join, () => !phraseReady(at("join")?.words ?? []))] };
      case "joined":
        return { title: t.joinTitle, actions: [close] };
      case "leave":
        return { title: t.leaveTitle, actions: [send("leave", f.leave, t.leaveConfirm, k.leave)] };
      case "remove":
        return { title: fill(t.removeTitle, { device: untrack(() => at("remove")!.device) }), actions: [send("remove", f.remove, t.remove, k.remove)] };
      case "removed":
        return {
          title: t.removedTitle,
          actions: [{ label: t.later, labelKey: k.later, wayOut: true, attrs: { "data-fortress": "later" } }, send("change", f.change, t.changeConfirm, k.changePhrase)],
        };
      case "password":
        return { title: t.phraseTitle, actions: [send("unlock", f.unlock, t.unlock, k.unlock, () => at("phrase")?.password === "")] };
      case "words":
        return { title: t.phraseTitle, size: "wide" as const, actions: [copy()] };
      case "change":
        return { title: t.changeTitle, actions: [send("change", f.change, t.changeConfirm, k.changePhrase)] };
      case "changed":
        return { title: t.changedTitle, size: "wide" as const, actions: [copy()] };
    }
  });

  const view = (
    <Window
      ref={(el) => (card = el)}
      title={frame().title}
      size={frame().size}
      actions={frame().actions}
      start={copied() ? text().copied : undefined}
      text={{ cancel: text().cancel, close: text().close }}
      onClose={props.flow.close}
    >
      <Switch>
        <Match when={at("join")}>
          {(join) => (
            <form
              class="glim-fortress-text"
              onSubmit={(e) => {
                e.preventDefault();
                void props.flow.join();
              }}
            >
              <p>{text().about}</p>
              <div class="glim-phrase-fields">
                <Index each={join().words}>
                  {(word, i) => (
                    <label class="glim-phrase-field">
                      <span class="glim-phrase-number glim-num">{i + 1}</span>
                      <input
                        class="glim-input"
                        data-word={i}
                        value={word()}
                        aria-label={fill(text().word, { n: i + 1 })}
                        autocomplete="off"
                        autocapitalize="none"
                        autocorrect="off"
                        spellcheck={false}
                        onInput={(e) => enter(i, e.currentTarget)}
                      />
                    </label>
                  )}
                </Index>
              </div>
              <button type="submit" hidden />
              <p class="glim-fortress-sub">{text().phraseWhere}</p>
              <Show when={paired()}>
                {(devices) => (
                  <p class="glim-fortress-note" data-fortress="moves">
                    {glyphFor("info")}
                    <span>{fill(text().moves, { app: app().name, devices: devices() })}</span>
                  </p>
                )}
              </Show>
              {error()}
            </form>
          )}
        </Match>
        <Match when={kind() === "joined"}>
          <div class="glim-fortress-result">
            <span class="glim-fortress-result-mark" aria-hidden="true">
              <MarkSvg mark={MARKS.check} />
            </span>
            <div class="glim-fortress-text">
              <p class="glim-fortress-result-title">{fill(text().joinedTitle, { app: app().name })}</p>
              <p class="glim-fortress-sub">
                {paired() ? `${fill(text().joinedMoved, { devices: paired()! })} ` : ""}
                {text().joinedNext}
              </p>
            </div>
          </div>
        </Match>
        <Match when={kind() === "leave"}>
          <div class="glim-fortress-text">
            <p>
              {fill(text().leaveBody, { app: app().name })}
              {paired() && ` ${fill(text().leavePairing, { devices: paired()! })}`}
              {props.context.leaveNote && ` ${props.context.leaveNote}`}
            </p>
            <p class="glim-fortress-sub">{text().leaveBack}</p>
            {error()}
          </div>
        </Match>
        <Match when={at("remove")}>
          {(step) => (
            <div class="glim-fortress-text">
              <p>{fill(text().removeBody, { device: step().device })}</p>
              <p class="glim-fortress-sub">{text().removeBack}</p>
              {error()}
            </div>
          )}
        </Match>
        <Match when={at("removed")}>
          {(step) => (
            <div class="glim-fortress-text">
              <p>{fill(text().removedBody, { device: step().device })}</p>
              {error()}
            </div>
          )}
        </Match>
        <Match when={at("phrase")?.step === "password" && at("phrase")}>
          {(step) => (
            <form
              class="glim-fortress-text"
              onSubmit={(e) => {
                e.preventDefault();
                void props.flow.unlock();
              }}
            >
              <p>{fill(text().phrasePassword, { app: app().name })}</p>
              <PasswordField
                aria-label={fill(text().password, { app: app().name })}
                placeholder={fill(text().password, { app: app().name })}
                value={step().password}
                onInput={(e) => props.flow.setPassword(e.currentTarget.value)}
                text={{ show: text().showPassword, hide: text().hidePassword }}
              />
              {error()}
            </form>
          )}
        </Match>
        <Match when={at("phrase")}>
          {(step) => (
            <div class="glim-fortress-text">
              <p>{text().phraseBody}</p>
              {words(step().words)}
            </div>
          )}
        </Match>
        <Match when={kind() === "change"}>
          <div class="glim-fortress-text">
            <p>{text().changeBody}</p>
            <p class="glim-fortress-sub">{text().changeAway}</p>
            {error()}
          </div>
        </Match>
        <Match when={at("changed")}>
          {(step) => (
            <div class="glim-fortress-text">
              <p>{text().phraseBody}</p>
              {words(step().words)}
              <Show when={step().left.length > 0}>
                <p class="glim-fortress-sub">{fill(text().changedLeft, { devices: listOf(props.context.lang, step().left) })}</p>
              </Show>
            </div>
          )}
        </Match>
      </Switch>
    </Window>
  );

  // Made after the window, so they run after its opening focus and a word field's focus wins.
  createEffect(
    on(refusal, (refused) => {
      const button = refused && card?.querySelector<HTMLElement>(`[data-fortress="${refused.button}"]`);
      if (button) onCleanup(shake(button));
    }),
  );
  createEffect(() => {
    if (focus() >= 0) card?.querySelector<HTMLInputElement>(`[data-word="${focus()}"]`)?.focus();
  });
  // The window stays mounted from one step to the next, so the focus it takes
  // on opening does not come again, and the button that was pressed may be gone.
  createEffect(
    on(
      kind,
      () => {
        if (card) windowFocusTarget(card)?.focus();
      },
      { defer: true },
    ),
  );
  createEffect(() => {
    if (!copied()) return;
    const t = setTimeout(() => setCopied(false), COPIED_MS);
    onCleanup(() => clearTimeout(t));
  });

  return view;
}

export interface FortressPairingProps {
  text: FortressText;
  lang: string;
  app: { id: string; name: string };
  onLeave: () => Promise<FortressAnswer>;
  /** `password` is set where `phrasePassword` asks for it first. Without it there is no Show phrase here. */
  onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
  /** Asks for the app's password before the phrase shows. */
  phrasePassword?: boolean;
  /** What the QR code beside the words carries, the words alone without it. */
  phraseQr?: (words: string[]) => string;
  /** Without it there is no way to change the phrase here, for an app that cannot keep a new one. */
  onChangePhrase?: () => Promise<ChangeAnswer>;
  /** The devices whose pairing ends with leaving. */
  pairedWith?: string[];
  /** A sentence of the app's own for the leave window, such as what stays as it is. */
  leaveNote?: string;
  labelKeys?: Partial<FortressLabelKeys>;
  hueIndex?: number;
  /** Rows of the app's own above the phrase, such as the name the instance goes by. */
  children?: JSX.Element;
  /** Rows of the app's own below leaving, such as the switch for the other apps. */
  after?: JSX.Element;
}

/**
 * The fortress in the app's pairing settings: the one place where the phrase
 * shows and changes and the app leaves, each behind a window that says what
 * it does. An app that shows the phrase here leaves Show phrase out of its
 * Fortress.
 */
export function FortressPairing(props: FortressPairingProps) {
  const flow = createFortressFlow(() => ({
    onLeave: props.onLeave,
    onShowPhrase: props.onShowPhrase,
    onChangePhrase: props.onChangePhrase,
    phrasePassword: props.phrasePassword,
    failed: props.text.failed,
  }));
  const s = useFlowState(flow);
  const keys = () => ({ ...LABEL_KEYS, ...props.labelKeys });
  return (
    <Card data-glim="FortressPairing" title={props.text.pairing} hueIndex={props.hueIndex}>
      {props.children}
      <Show when={props.onShowPhrase || props.onChangePhrase}>
        <FieldRow label={props.text.phraseTitle} hint={props.onChangePhrase && props.text.changePhraseAbout}>
          <Show when={props.onShowPhrase}>
            <Button
              label={props.text.showPhrase}
              labelKey={keys().showPhrase}
              busy={s().busy === "show"}
              onClick={() => void flow.openPhrase()}
              data-fortress="show"
            />
          </Show>
          <Show when={props.onChangePhrase}>
            <Button label={props.text.change} labelKey={keys().changePhrase} onClick={flow.openChange} data-fortress="open-change" />
          </Show>
        </FieldRow>
      </Show>
      <FieldRow label={props.text.leaveRow} hint={fill(props.text.leaveAbout, { app: props.app.name })}>
        <Button label={props.text.leaveConfirm} labelKey={keys().leave} onClick={flow.openLeave} data-fortress="open-leave" />
      </FieldRow>
      {props.after}
      <Show when={s().window}>
        <FortressWindow flow={flow} state={s()} context={props} keys={keys()} />
      </Show>
    </Card>
  );
}
