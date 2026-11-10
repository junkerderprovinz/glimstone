import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import {
  COPIED_MS,
  copyText,
  createFortressFlow,
  fill,
  hueVars,
  listOf,
  MARKS,
  othersSummary,
  phraseReady,
  plural,
  shake,
  storedShowOthers,
  storeShowOthers,
  type FortressAnswer,
  type FortressApp,
  type FortressFlow,
  type FortressHandlers,
  type FortressInstance,
  type FortressPermission,
  type FortressState,
  type FortressText,
} from "@glimstone/core";
import { Button } from "./Button.tsx";
import { FortressAppCard } from "./FortressAppCard.tsx";
import { FortressPermissions } from "./FortressPermissions.tsx";
import { InfoBubble } from "./InfoBubble.tsx";
import { PasswordField } from "./PasswordField.tsx";
import { Toggle } from "./Toggle.tsx";
import { Window, type WindowAction } from "./Window.tsx";
import { glyphFor, MarkSvg } from "./glyphs.tsx";

export type { FortressAnswer, FortressHandlers, FortressText } from "@glimstone/core";

/** The label keys behind the fortress's buttons, which pick their glyphs (see Button). */
export interface FortressLabelKeys {
  join: string;
  leave: string;
  showPhrase: string;
  changePhrase: string;
  remove: string;
  unlock: string;
  copy: string;
  done: string;
}

const LABEL_KEYS: FortressLabelKeys = {
  join: "fortressJoin",
  leave: "fortressLeave",
  showPhrase: "fortressShowPhrase",
  changePhrase: "fortressChangePhrase",
  remove: "delete",
  unlock: "unlock",
  copy: "copy",
  done: "confirm",
};

export interface FortressProps extends FortressHandlers {
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
  /** Whether the other apps show. Without it the switch keeps its state on this device. */
  showOthers?: boolean;
  onShowOthers?: (on: boolean) => void;
  /** The devices this app is paired with today, whose pairing moves into the fortress on joining. */
  pairedWith?: string[];
  /** A member of a fortress this app saw on the network while it is in none. */
  found?: { app: string; device: string; logo?: string };
  /** Asks for the app's password before the phrase shows. */
  phrasePassword?: boolean;
  /** A sentence of the app's own for the leave window, such as what stays as it is. */
  leaveNote?: string;
  onOpen?: (app: FortressApp, instance: FortressInstance) => void;
  /** Something of the app's own under a permission's words. */
  permissionExtra?: (permission: FortressPermission) => ReactNode;
  labelKeys?: Partial<FortressLabelKeys>;
  /** The rainbow position the fortress's first card takes, after the app's own cards. */
  hueStart?: number;
  /** This app's own instance cards. As a function it gets `remove`, which asks before an instance goes. */
  children?: ReactNode | ((remove: (id: string, device: string) => void) => ReactNode);
}

/**
 * The fortress in the Instances tab ("The fortress" in the design language):
 * the app's own instances first, the switch for the other apps and, once it is
 * on, their cards and the permissions, with the page's actions in the corner.
 */
export function Fortress(props: FortressProps) {
  const { text, lang, app, joined, apps, permissions, onPermission, found, hueStart = 0, children } = props;
  const latest = useRef(props);
  latest.current = props;
  const flow = useMemo(() => createFortressFlow(() => ({ ...latest.current, failed: latest.current.text.failed })), []);
  const s = useSyncExternalStore(flow.subscribe, flow.state, flow.state);
  const keys = { ...LABEL_KEYS, ...props.labelKeys };

  const [ownShow, setOwnShow] = useState(storedShowOthers);
  const showOthers = props.showOthers ?? ownShow;
  const setShowOthers = (on: boolean) => {
    if (props.onShowOthers) props.onShowOthers(on);
    else {
      storeShowOthers(on);
      setOwnShow(on);
    }
  };
  const summary = othersSummary(apps);
  const othersLine = fill(text.othersLine, {
    apps: plural(lang, text.othersApps, summary.instances),
    devices: plural(lang, text.othersDevices, summary.devices),
  });

  return (
    <div className="glim-fortress">
      <div className="glim-fortress-grid">
        {typeof children === "function" ? children(flow.openRemove) : children}
        {!joined && (
          <div className="glim-card glim-instance glim-instance--out" data-fortress="out">
            <h3 className="glim-instance-title">{text.outTitle}</h3>
            <p className="glim-instance-hint">{fill(text.outHint, { app: app.name })}</p>
            {found && (
              <p className="glim-instance-found">
                {found.logo && <img src={found.logo} alt="" />}
                <span>{fill(text.found, { app: found.app, device: found.device })}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {joined && (
        <div className="glim-card glim-fortress-switch glim-hue" style={hueVars(hueStart) as CSSProperties}>
          <span className="glim-fortress-switch-text">
            <span className="glim-fortress-switch-name">
              {text.showOthers}
              <InfoBubble tip={text.about} />
            </span>
            <span className="glim-fortress-sub">{othersLine}</span>
          </span>
          <Toggle label={text.showOthers} hideLabel checked={showOthers} onChange={setShowOthers} data-fortress="others" />
        </div>
      )}

      {joined && showOthers && (
        <>
          <div className="glim-fortress-grid">
            {apps.map((a, i) => (
              <FortressAppCard key={a.id} app={a} text={text} lang={lang} hueIndex={hueStart + 1 + i} onOpen={props.onOpen} />
            ))}
          </div>
          <FortressPermissions
            text={text}
            app={app}
            apps={[app, ...apps]}
            permissions={permissions}
            onPermission={onPermission}
            hueIndex={hueStart + 1 + apps.length}
            extra={props.permissionExtra}
          />
        </>
      )}

      <div className="glim-fortress-actions">
        {joined ? (
          <>
            <Button label={text.leave} labelKey={keys.leave} size="key" onClick={flow.openLeave} data-fortress="open-leave" />
            {props.onChangePhrase && (
              <Button label={text.changePhrase} labelKey={keys.changePhrase} size="key" onClick={flow.openChange} data-fortress="open-change" />
            )}
            {props.onShowPhrase && (
              <Button
                label={text.showPhrase}
                labelKey={keys.showPhrase}
                tone="accent"
                size="key"
                busy={s.busy === "show"}
                onClick={() => void flow.openPhrase()}
                data-fortress="show"
              />
            )}
          </>
        ) : (
          <Button label={text.enterPhrase} labelKey={keys.join} tone="accent" size="key" onClick={flow.openJoin} data-fortress="open-join" />
        )}
      </div>

      {s.window && <FortressWindow flow={flow} state={s} props={props} keys={keys} />}
    </div>
  );
}

function FortressWindow({ flow, state, props, keys }: { flow: FortressFlow; state: FortressState; props: FortressProps; keys: FortressLabelKeys }) {
  const { text, lang, app } = props;
  const w = state.window!;
  const card = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const paired = props.pairedWith?.length ? listOf(lang, props.pairedWith) : null;
  const way = { cancel: text.cancel, close: text.close };
  const busy = state.busy !== null;

  useEffect(() => {
    const refused = state.refusal && card.current?.querySelector<HTMLElement>(`[data-fortress="${state.refusal.button}"]`);
    return refused ? shake(refused) : undefined;
  }, [state.refusal]);

  const focus = w.kind === "join" ? w.focus : -1;
  useEffect(() => {
    if (focus >= 0) card.current?.querySelector<HTMLInputElement>(`[data-word="${focus}"]`)?.focus();
  }, [focus]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(t);
  }, [copied]);

  const error = state.error && (
    <p className="glim-fortress-error" role="alert">
      {state.error}
    </p>
  );
  const send = (button: string, run: () => Promise<void>, label: string, key: string, disabled = false): WindowAction => ({
    label,
    labelKey: key,
    primary: true,
    disabled: disabled || busy,
    attrs: { "data-fortress": button },
    onClick: () => {
      void run();
      return false;
    },
  });
  const words = (list: string[]) => (
    <ol className="glim-phrase-words" data-fortress="words">
      {list.map((word, i) => (
        <li key={i}>
          <span className="glim-phrase-number glim-num">{i + 1}</span>
          {word}
        </li>
      ))}
    </ol>
  );
  const copy = (list: string[]): WindowAction => ({
    label: text.copy,
    labelKey: keys.copy,
    attrs: { "data-fortress": "copy" },
    onClick: () => {
      void copyText(list.join(" ")).then(setCopied);
      return false;
    },
  });
  const done: WindowAction = { label: text.done, labelKey: keys.done, primary: true, wayOut: true };
  const common = { ref: card, text: way, onClose: flow.close };

  switch (w.kind) {
    case "join":
      return (
        <Window
          {...common}
          title={text.joinTitle}
          size="wide"
          actions={[send("join", flow.join, text.join, keys.join, !phraseReady(w.words))]}
        >
          <form
            className="glim-fortress-text"
            onSubmit={(e) => {
              e.preventDefault();
              void flow.join();
            }}
          >
            <p>{text.about}</p>
            <div className="glim-phrase-fields">
              {w.words.map((word, i) => (
                <label key={i} className="glim-phrase-field">
                  <span className="glim-phrase-number glim-num">{i + 1}</span>
                  <input
                    className="glim-input"
                    data-word={i}
                    value={word}
                    aria-label={fill(text.word, { n: i + 1 })}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    onChange={(e) => flow.enter(i, e.target.value)}
                  />
                </label>
              ))}
            </div>
            <button type="submit" hidden />
            <p className="glim-fortress-sub">{text.phraseWhere}</p>
            {paired && (
              <p className="glim-fortress-note" data-fortress="moves">
                {glyphFor("info")}
                <span>{fill(text.moves, { app: app.name, devices: paired })}</span>
              </p>
            )}
            {error}
          </form>
        </Window>
      );
    case "joined":
      return (
        <Window {...common} title={text.joinTitle} actions={[done]}>
          <div className="glim-fortress-result">
            <span className="glim-fortress-result-mark" aria-hidden="true">
              <MarkSvg mark={MARKS.check} />
            </span>
            <div className="glim-fortress-text">
              <p className="glim-fortress-result-title">{fill(text.joinedTitle, { app: app.name })}</p>
              <p className="glim-fortress-sub">
                {paired ? `${fill(text.joinedMoved, { devices: paired })} ` : ""}
                {text.joinedNext}
              </p>
            </div>
          </div>
        </Window>
      );
    case "leave":
      return (
        <Window {...common} title={text.leaveTitle} actions={[send("leave", flow.leave, text.leaveConfirm, keys.leave)]}>
          <div className="glim-fortress-text">
            <p>
              {fill(text.leaveBody, { app: app.name })}
              {paired && ` ${fill(text.leavePairing, { devices: paired })}`}
              {props.leaveNote && ` ${props.leaveNote}`}
            </p>
            <p className="glim-fortress-sub">{text.leaveBack}</p>
            {error}
          </div>
        </Window>
      );
    case "remove":
      return (
        <Window {...common} title={fill(text.removeTitle, { device: w.device })} actions={[send("remove", flow.remove, text.remove, keys.remove)]}>
          <div className="glim-fortress-text">
            <p>{fill(text.removeBody, { device: w.device })}</p>
            <p className="glim-fortress-sub">{text.removeBack}</p>
            {error}
          </div>
        </Window>
      );
    case "phrase":
      if (w.step === "password") {
        return (
          <Window {...common} title={text.phraseTitle} actions={[send("unlock", flow.unlock, text.unlock, keys.unlock, w.password === "")]}>
            <form
              className="glim-fortress-text"
              onSubmit={(e) => {
                e.preventDefault();
                void flow.unlock();
              }}
            >
              <p>{fill(text.phrasePassword, { app: app.name })}</p>
              <PasswordField
                aria-label={fill(text.password, { app: app.name })}
                placeholder={fill(text.password, { app: app.name })}
                value={w.password}
                onChange={(e) => flow.setPassword(e.target.value)}
                text={{ show: text.showPassword, hide: text.hidePassword }}
              />
              {error}
            </form>
          </Window>
        );
      }
      return (
        <Window {...common} title={text.phraseTitle} start={copied ? text.copied : undefined} actions={[copy(w.words), done]}>
          <div className="glim-fortress-text">
            <p>{text.phraseBody}</p>
            {words(w.words)}
          </div>
        </Window>
      );
    case "change":
      return (
        <Window {...common} title={text.changeTitle} actions={[send("change", flow.change, text.changeConfirm, keys.changePhrase)]}>
          <div className="glim-fortress-text">
            <p>{text.changeBody}</p>
            <p className="glim-fortress-sub">{text.changeAway}</p>
            {error}
          </div>
        </Window>
      );
    case "changed":
      return (
        <Window {...common} title={text.changedTitle} start={copied ? text.copied : undefined} actions={[copy(w.words), done]}>
          <div className="glim-fortress-text">
            <p>{text.phraseBody}</p>
            {words(w.words)}
            {w.left.length > 0 && <p className="glim-fortress-sub">{fill(text.changedLeft, { devices: listOf(lang, w.left) })}</p>}
          </div>
        </Window>
      );
  }
}
