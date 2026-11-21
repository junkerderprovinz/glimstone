import { children, createEffect, createMemo, createSignal, createUniqueId, mergeProps, on, onCleanup, Show, type JSX } from "solid-js";
import {
  createSignInFlow,
  focusFirstField,
  labelInside,
  passkeyOfferKey,
  resetBlocked,
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
  logo?: string | JSX.Element;
  /** The page's heading. */
  appName: string;
  text: SignInText;
  /** Draws a passkey button, for a server without the browser's offer in the password field. `onPasskeyOffer` needs none. */
  passkey?: boolean;
  /** Offers Forgot password? and the reset form. */
  reset?: boolean;
  /** Asks for the account's name in the reset form, in an app with several accounts (the kit's options say `owner: false`). */
  resetName?: boolean;
  /** The shortest new password the reset form takes, as the server says. */
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
  fields?: JSX.Element;
  /** The app's own buttons, under Sign in and the passkey. */
  actions?: JSX.Element;
  /** A step the app runs itself, in place of the card's forms. */
  step?: JSX.Element;
  labelKeys?: Partial<SignInLabelKeys>;
  /** The start of the fields' ids: `-password`, `-code`, `-reset-code`, `-reset-name`, `-new` and `-confirm` follow it. */
  idPrefix?: string;
  /** Puts the focus in the first empty field when the card opens. */
  autoFocus?: boolean;
  /** Classes for the page around the card. */
  class?: string;
}

// A field on the sign-in card. Its label stands inside the field until the
// first key, and above it when the field brings a placeholder or a hint.
export function SignInField(props: { label: string; htmlFor: string; hint?: string; hidden?: boolean; children: JSX.Element }) {
  const [inside, setInside] = createSignal(false);
  let was: string | undefined;
  createEffect(() => {
    setInside(labelInside(document.getElementById(props.htmlFor) as HTMLInputElement | null, props.label, props.hint, was));
    was = props.label;
  });
  return (
    <div data-glim="SignInField" class="glim-signin-field" hidden={props.hidden}>
      <label for={props.htmlFor} class={inside() ? "glim-sr-only" : "glim-signin-label"}>
        {props.label}
        <Show when={props.hint}>{(hint) => <InfoBubble tip={hint()} />}</Show>
      </label>
      {props.children}
    </div>
  );
}

export function SignInCard(props: SignInCardProps) {
  const own = mergeProps({ passkey: false, reset: false, resetName: false, minPassword: 12, autoFocus: true }, props);
  const flow = createSignInFlow(() => own);
  const [s, setS] = createSignal(flow.state());
  onCleanup(flow.subscribe(() => setS(flow.state())));
  const ownId = createUniqueId();
  const id = (name: string) => `${own.idPrefix ?? ownId}-${name}`;
  const keys = () => ({ ...LABEL_KEYS, ...own.labelKeys });
  const eye = () => ({ show: own.text.show, hide: own.text.hide });
  let card!: HTMLDivElement;

  const step = children(() => own.step);
  const stage = createMemo(() => (step() ? "step" : signInStage(s())));
  let opened = false;
  createEffect(
    on(stage, () => {
      if (opened || own.autoFocus) focusFirstField(card);
      opened = true;
    }),
  );

  const refusals = createMemo(() => s().refusal?.count);
  createEffect(
    on(refusals, () => {
      const refusal = s().refusal;
      if (refusal) onCleanup(showRefusal(card, refusal));
    }),
  );

  const offers = () => !!own.onPasskeyOffer && !step();
  const offer = createMemo(() => (offers() ? passkeyOfferKey(s()) : null));
  createEffect(
    on(offer, (key) => {
      if (!key) return;
      const stop = new AbortController();
      void flow.offer(stop.signal);
      onCleanup(() => stop.abort());
    }),
  );

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    void flow.submit();
  };
  const said = (line: () => string | null | undefined) => (
    <Show when={line()}>
      {(text) => (
        <p class="glim-signin-error" role="alert">
          {text()}
        </p>
      )}
    </Show>
  );
  const back = () => <Button label={own.text.back} labelKey={keys().back} tone="subtle" data-signin="back" disabled={!!s().busy} onClick={flow.back} />;

  return (
    <div data-glim="SignInCard" class={["glim-signin", own.class].filter(Boolean).join(" ")}>
      <div ref={card} class="glim-card glim-signin-card">
        <div class="glim-signin-head">
          <Show when={own.logo}>
            <span class="glim-signin-logo" aria-hidden="true">
              {typeof own.logo === "string" ? <img src={own.logo} alt="" draggable="false" /> : own.logo}
            </span>
          </Show>
          <h1 class="glim-signin-name">{own.appName}</h1>
        </div>

        <Show
          when={step()}
          fallback={
            <Show
              when={s().view === "reset"}
              fallback={
                <form class="glim-signin-form" novalidate onSubmit={submit}>
                  <Show when={own.note}>
                    <p class="glim-signin-note" role="status">
                      {own.note}
                    </p>
                  </Show>
                  <Show when={!s().viaPasskey}>{own.fields}</Show>
                  {/* Kept while a passkey asks for the code, so the password survives a step back. */}
                  <SignInField label={own.text.password} htmlFor={id("password")} hidden={s().viaPasskey}>
                    <PasswordField
                      id={id("password")}
                      data-signin-field="password"
                      value={s().password}
                      onInput={(e) => flow.set("password", e.currentTarget.value)}
                      autocomplete={offers() ? "current-password webauthn" : "current-password"}
                      text={eye()}
                    />
                  </SignInField>
                  <Show when={s().needCode}>
                    <div class="glim-signin-field">
                      <label for={id("code")} class="glim-signin-label">
                        {own.text.code}
                      </label>
                      <TextField
                        id={id("code")}
                        data-signin-field="code"
                        class="glim-signin-code"
                        value={s().code}
                        onInput={(e) => flow.set("code", e.currentTarget.value)}
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        spellcheck={false}
                        placeholder="000000"
                      />
                      <p class="glim-signin-hint">{own.text.codeHint}</p>
                    </div>
                  </Show>
                  {said(() => s().error ?? (s().tried ? null : own.error))}
                  <Button
                    label={own.text.signIn}
                    labelKey={keys().signIn}
                    tone="accent"
                    type="submit"
                    data-signin="submit"
                    disabled={signInBlocked(s())}
                    busy={s().busy === "signIn"}
                    title={s().busy === "signIn" ? own.text.signingIn : undefined}
                  />
                  {/* Left out rather than disabled where it cannot work: a disabled
                      control on a sign-in page reads as being locked out. */}
                  <Show when={!s().needCode && own.passkey}>
                    <Button
                      label={own.text.passkey}
                      labelKey={keys().passkey}
                      data-signin="passkey"
                      disabled={!!s().busy}
                      busy={s().busy === "passkey"}
                      onClick={() => void flow.passkey()}
                    />
                  </Show>
                  <Show when={!s().needCode && own.service}>
                    {(service) => (
                      <Button
                        label={service().name}
                        labelKey={null}
                        glyph={service().mark ? <BrandMark svg={service().mark!.svg} /> : glyphFor(keys().service)}
                        data-signin="service"
                        disabled={!!s().busy}
                        onClick={() => own.onService?.()}
                      />
                    )}
                  </Show>
                  <Show when={!s().needCode}>{own.actions}</Show>
                  {/* A plain link, the last line of the card: nobody plans to forget a password. */}
                  <Show
                    when={s().needCode}
                    fallback={
                      <Show when={own.reset}>
                        <button
                          type="button"
                          class="glim-signin-forgot"
                          data-signin="forgot"
                          disabled={!!s().busy}
                          aria-busy={s().busy === "askCode" || undefined}
                          onClick={() => void flow.forgot()}
                        >
                          {own.text.forgot}
                        </button>
                      </Show>
                    }
                  >
                    {back()}
                  </Show>
                </form>
              }
            >
              <form class="glim-signin-form" novalidate onSubmit={submit}>
                <SignInField label={own.text.resetCode} htmlFor={id("reset-code")} hint={own.text.resetCodeTip}>
                  <TextField
                    id={id("reset-code")}
                    data-signin-field="resetCode"
                    class="glim-signin-log-code"
                    value={s().resetCode}
                    onInput={(e) => flow.set("resetCode", e.currentTarget.value)}
                    autocomplete="one-time-code"
                    autocapitalize="characters"
                    spellcheck={false}
                    placeholder="XXXX-XXXX-XXXX"
                  />
                </SignInField>
                <Show when={own.resetName}>
                  <SignInField label={own.text.name} htmlFor={id("reset-name")}>
                    <TextField
                      id={id("reset-name")}
                      data-signin-field="resetName"
                      value={s().resetName}
                      onInput={(e) => flow.set("resetName", e.currentTarget.value)}
                      autocomplete="username"
                      autocapitalize="none"
                      spellcheck={false}
                    />
                  </SignInField>
                </Show>
                <SignInField label={own.text.newPassword} htmlFor={id("new")}>
                  <PasswordField
                    id={id("new")}
                    data-signin-field="newPassword"
                    value={s().newPassword}
                    onInput={(e) => flow.set("newPassword", e.currentTarget.value)}
                    autocomplete="new-password"
                    text={eye()}
                  />
                </SignInField>
                <SignInField label={own.text.confirmPassword} htmlFor={id("confirm")}>
                  <PasswordField
                    id={id("confirm")}
                    data-signin-field="confirm"
                    value={s().confirm}
                    onInput={(e) => flow.set("confirm", e.currentTarget.value)}
                    autocomplete="new-password"
                    text={eye()}
                  />
                </SignInField>
                {said(() => s().error)}
                {/* Stacked, since the longer translations of the two labels do not fit side by side. */}
                <Button
                  label={own.text.setPassword}
                  labelKey={keys().setPassword}
                  tone="accent"
                  type="submit"
                  data-signin="set-password"
                  disabled={resetBlocked(s(), own.resetName)}
                  busy={s().busy === "setPassword"}
                  title={s().busy === "setPassword" ? own.text.saving : undefined}
                />
                {back()}
              </form>
            </Show>
          }
        >
          {step()}
        </Show>
      </div>
    </div>
  );
}
