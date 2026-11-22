import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import {
  createSignInFlow,
  focusFirstField,
  labelInside,
  passkeyOfferKey,
  resetBlocked,
  signInShortHint,
  showRefusal,
  signInBlocked,
  signInStage,
  type SignInCardService,
  type SignInHandlers,
  type SignInLabelKeys,
  type SignInText,
} from "@glimstone/core";
import { Button } from "./Button.tsx";
import { glyphFor } from "./glyphs.tsx";
import { InfoBubble } from "./InfoBubble.tsx";
import { PasswordField } from "./PasswordField.tsx";
import { BrandMark } from "./ReadmeButton.tsx";
import { TextField } from "./TextField.tsx";

export type { SignInCardService, SignInLabelKeys } from "@glimstone/core";

export type { ResetAnswer, SignInAnswer, SignInText } from "@glimstone/core";

// The way into an app with a login ("The sign-in card" in the design
// language). The flow lives in the core; the app answers each step through a
// callback and brings its own words.

const LABEL_KEYS: SignInLabelKeys = {
  signIn: "signIn",
  passkey: "signInWithPasskey",
  forgot: "forgotPassword",
  back: "back",
  setPassword: "setPassword",
  service: "signIn",
};

export interface SignInCardProps extends SignInHandlers {
  /** The app's logo, as an address or as an inline `<svg>` with a viewBox. It stands 7.5rem tall above the name, as wide as its shape asks. */
  logo?: string | ReactNode;
  /** The page's heading. */
  appName: string;
  text: SignInText;
  /** Draws a passkey button, for a server without the browser's offer in the password field. `onPasskeyOffer` needs none. */
  passkey?: boolean;
  /** Offers Forgot password? and the reset form. */
  reset?: boolean;
  /** Asks for the account's name in the reset form, in an app with several accounts (the kit's options say `owner: false`). */
  resetName?: boolean;
  /** The length, as the server says, under which the reset form suggests a longer password. It never refuses a shorter one. */
  minPassword?: number;
  /** One line at the top of the sign-in form, such as "You are signed out". */
  note?: string;
  /** A refusal from outside the card, such as a sign-in service that sent the person back, said above Sign in until the card's next try. */
  error?: string;
  /** The sign-in service whose button stands under Sign in, the one second way in the page offers. */
  service?: SignInCardService;
  /** Leaves for the sign-in service. */
  onService?: () => void;
  /** The app's own fields, above the password. */
  fields?: ReactNode;
  /** The app's own buttons, under Sign in and the passkey. */
  actions?: ReactNode;
  /** A step the app runs itself, in place of the card's forms. */
  step?: ReactNode;
  labelKeys?: Partial<SignInLabelKeys>;
  /** The start of the fields' ids: `-password`, `-code`, `-reset-code`, `-reset-name`, `-new` and `-confirm` follow it. */
  idPrefix?: string;
  /** Puts the focus in the first empty field when the card opens. */
  autoFocus?: boolean;
  /** Classes for the page around the card. */
  className?: string;
}

// A field on the sign-in card. Its label stands inside the field until the
// first key, and above it when the field brings a placeholder or a hint.
export function SignInField({ label, htmlFor, hint, hidden, children }: { label: string; htmlFor: string; hint?: string; hidden?: boolean; children: ReactNode }) {
  const [inside, setInside] = useState(false);
  const was = useRef<string | undefined>(undefined);
  useEffect(() => {
    setInside(labelInside(document.getElementById(htmlFor) as HTMLInputElement | null, label, hint, was.current));
    was.current = label;
  }, [htmlFor, label, hint]);
  return (
    <div data-glim="SignInField" className="glim-signin-field" hidden={hidden}>
      <label htmlFor={htmlFor} className={inside ? "glim-sr-only" : "glim-signin-label"}>
        {label}
        {hint && <InfoBubble tip={hint} />}
      </label>
      {children}
    </div>
  );
}

export function SignInCard({
  logo,
  appName,
  text,
  passkey = false,
  reset = false,
  resetName = false,
  minPassword = 12,
  note,
  error: outside,
  service,
  onService,
  fields,
  actions,
  step,
  labelKeys,
  idPrefix,
  autoFocus = true,
  className,
  ...handlers
}: SignInCardProps) {
  const latest = useRef({ ...handlers, text, minPassword, resetName });
  latest.current = { ...handlers, text, minPassword, resetName };
  const [flow] = useState(() => createSignInFlow(() => latest.current));
  const s = useSyncExternalStore(flow.subscribe, flow.state, flow.state);
  const ownId = useId();
  const id = (name: string) => `${idPrefix ?? ownId}-${name}`;
  const keys = { ...LABEL_KEYS, ...labelKeys };
  const eye = { show: text.show, hide: text.hide };
  const card = useRef<HTMLDivElement>(null);

  const stage = step ? "step" : signInStage(s);
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || autoFocus) focusFirstField(card.current);
    opened.current = true;
  }, [stage]);

  const refusal = s.refusal;
  useEffect(() => (refusal ? showRefusal(card.current, refusal) : undefined), [refusal?.count]);

  const offers = !!handlers.onPasskeyOffer && !step;
  const offer = offers ? passkeyOfferKey(s) : null;
  useEffect(() => {
    if (!offer) return;
    const stop = new AbortController();
    void flow.offer(stop.signal);
    return () => stop.abort();
  }, [offer]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void flow.submit();
  };
  const said = (line: string | null | undefined) =>
    line && (
      <p className="glim-signin-error" role="alert">
        {line}
      </p>
    );
  const back = <Button label={text.back} labelKey={keys.back} tone="subtle" data-signin="back" disabled={!!s.busy} onClick={flow.back} />;

  return (
    <div data-glim="SignInCard" className={["glim-signin", className].filter(Boolean).join(" ")}>
      <div ref={card} className="glim-card glim-signin-card">
        <div className="glim-signin-head">
          {logo && (
            <span className="glim-signin-logo" aria-hidden="true">
              {typeof logo === "string" ? <img src={logo} alt="" draggable={false} /> : logo}
            </span>
          )}
          <h1 className="glim-signin-name">{appName}</h1>
        </div>

        {step ??
          (s.view === "reset" ? (
            <form className="glim-signin-form" noValidate onSubmit={submit}>
              <SignInField label={text.resetCode} htmlFor={id("reset-code")} hint={text.resetCodeTip}>
                <TextField
                  id={id("reset-code")}
                  data-signin-field="resetCode"
                  className="glim-signin-log-code"
                  value={s.resetCode}
                  onChange={(e) => flow.set("resetCode", e.target.value)}
                  autoComplete="one-time-code"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="XXXX-XXXX-XXXX"
                />
              </SignInField>
              {resetName && (
                <SignInField label={text.name} htmlFor={id("reset-name")}>
                  <TextField
                    id={id("reset-name")}
                    data-signin-field="resetName"
                    value={s.resetName}
                    onChange={(e) => flow.set("resetName", e.target.value)}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </SignInField>
              )}
              <SignInField label={text.newPassword} htmlFor={id("new")}>
                <PasswordField
                  id={id("new")}
                  data-signin-field="newPassword"
                  value={s.newPassword}
                  onChange={(e) => flow.set("newPassword", e.target.value)}
                  autoComplete="new-password"
                  text={eye}
                  note={signInShortHint(text.shortHint, s.newPassword, minPassword)}
                />
              </SignInField>
              <SignInField label={text.confirmPassword} htmlFor={id("confirm")}>
                <PasswordField id={id("confirm")} data-signin-field="confirm" value={s.confirm} onChange={(e) => flow.set("confirm", e.target.value)} autoComplete="new-password" text={eye} />
              </SignInField>
              {said(s.error)}
              {/* Stacked, since the longer translations of the two labels do not fit side by side. */}
              <Button
                label={text.setPassword}
                labelKey={keys.setPassword}
                tone="accent"
                type="submit"
                data-signin="set-password"
                disabled={resetBlocked(s, resetName)}
                busy={s.busy === "setPassword"}
                title={s.busy === "setPassword" ? text.saving : undefined}
              />
              {back}
            </form>
          ) : (
            <form className="glim-signin-form" noValidate onSubmit={submit}>
              {note && (
                <p className="glim-signin-note" role="status">
                  {note}
                </p>
              )}
              {!s.viaPasskey && fields}
              {/* Kept while a passkey asks for the code, so the password survives a step back. */}
              <SignInField label={text.password} htmlFor={id("password")} hidden={s.viaPasskey}>
                <PasswordField
                  id={id("password")}
                  data-signin-field="password"
                  value={s.password}
                  onChange={(e) => flow.set("password", e.target.value)}
                  autoComplete={offers ? "current-password webauthn" : "current-password"}
                  text={eye}
                />
              </SignInField>
              {s.needCode && (
                <div className="glim-signin-field">
                  <label htmlFor={id("code")} className="glim-signin-label">
                    {text.code}
                  </label>
                  <TextField
                    id={id("code")}
                    data-signin-field="code"
                    className="glim-signin-code"
                    value={s.code}
                    onChange={(e) => flow.set("code", e.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    spellCheck={false}
                    placeholder="000000"
                  />
                  <p className="glim-signin-hint">{text.codeHint}</p>
                </div>
              )}
              {said(s.error ?? (s.tried ? null : outside))}
              <Button
                label={text.signIn}
                labelKey={keys.signIn}
                tone="accent"
                type="submit"
                data-signin="submit"
                disabled={signInBlocked(s)}
                busy={s.busy === "signIn"}
                title={s.busy === "signIn" ? text.signingIn : undefined}
              />
              {/* Left out rather than disabled where it cannot work: a disabled
                  control on a sign-in page reads as being locked out. */}
              {!s.needCode && passkey && (
                <Button
                  label={text.passkey}
                  labelKey={keys.passkey}
                  data-signin="passkey"
                  disabled={!!s.busy}
                  busy={s.busy === "passkey"}
                  onClick={() => void flow.passkey()}
                />
              )}
              {!s.needCode && service && (
                <Button
                  label={service.name}
                  labelKey={null}
                  glyph={service.mark ? <BrandMark svg={service.mark.svg} /> : glyphFor(keys.service)}
                  data-signin="service"
                  disabled={!!s.busy}
                  onClick={onService}
                />
              )}
              {!s.needCode && actions}
              {/* A plain link, the last line of the card: nobody plans to forget a password. */}
              {s.needCode
                ? back
                : reset && (
                    <button
                      type="button"
                      className="glim-signin-forgot"
                      data-signin="forgot"
                      disabled={!!s.busy}
                      aria-busy={s.busy === "askCode" || undefined}
                      onClick={() => void flow.forgot()}
                    >
                      {text.forgot}
                    </button>
                  )}
            </form>
          ))}
      </div>
    </div>
  );
}
