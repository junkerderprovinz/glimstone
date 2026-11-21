<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { SignInCardService, SignInHandlers, SignInLabelKeys, SignInText } from "@glimstone/core";

  export type { ResetAnswer, SignInAnswer, SignInCardService, SignInLabelKeys, SignInText } from "@glimstone/core";

  export interface SignInCardProps extends SignInHandlers {
    /** The app's logo, as an address or as an inline `<svg>` with a viewBox. It stands 7.5rem tall above the name, as wide as its shape asks. */
    logo?: string | Snippet;
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
    fields?: Snippet;
    /** The app's own buttons, under Sign in and the passkey. */
    actions?: Snippet;
    /** A step the app runs itself, in place of the card's forms. */
    step?: Snippet;
    labelKeys?: Partial<SignInLabelKeys>;
    /** The start of the fields' ids: `-password`, `-code`, `-reset-code`, `-reset-name`, `-new` and `-confirm` follow it. */
    idPrefix?: string;
    /** Puts the focus in the first empty field when the card opens. */
    autoFocus?: boolean;
    /** Classes for the page around the card. */
    class?: string;
  }
</script>

<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import { createSignInFlow, focusFirstField, passkeyOfferKey, resetBlocked, showRefusal, signInBlocked, signInStage } from "@glimstone/core";
  import BrandMark from "./BrandMark.svelte";
  import Button from "./Button.svelte";
  import { glyphFor } from "./glyphs.js";
  import PasswordField from "./PasswordField.svelte";
  import SignInField from "./SignInField.svelte";
  import TextField from "./TextField.svelte";

  // The way into an app with a login ("The sign-in card" in the design
  // language). The flow lives in the core; the app answers each step through a
  // callback and brings its own words.
  let {
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
    class: className,
    onSignIn,
    onPasskey,
    onPasskeyOffer,
    onAskCode,
    onSetPassword,
  }: SignInCardProps = $props();

  const LABEL_KEYS: SignInLabelKeys = {
    signIn: "signIn",
    passkey: "signInWithPasskey",
    forgot: "forgotPassword",
    back: "back",
    setPassword: "setPassword",
    service: "signIn",
  };

  const flow = createSignInFlow(() => ({ onSignIn, onPasskey, onPasskeyOffer, onAskCode, onSetPassword, text, minPassword, resetName }));
  let s = $state.raw(flow.state());
  onDestroy(flow.subscribe(() => (s = flow.state())));
  const ownId = $props.id();
  const id = (name: string) => `${idPrefix ?? ownId}-${name}`;
  const keys = $derived({ ...LABEL_KEYS, ...labelKeys });
  const eye = $derived({ show: text.show, hide: text.hide });
  let card: HTMLDivElement;

  const stage = $derived(step ? "step" : signInStage(s));
  let opened = false;
  $effect(() => {
    void stage;
    untrack(() => {
      if (opened || autoFocus) focusFirstField(card);
      opened = true;
    });
  });

  const refusals = $derived(s.refusal?.count);
  $effect(() => {
    void refusals;
    const refusal = untrack(() => s.refusal);
    if (refusal) return showRefusal(card, refusal);
  });

  const offers = $derived(!!onPasskeyOffer && !step);
  const offer = $derived(offers ? passkeyOfferKey(s) : null);
  $effect(() => {
    if (!offer) return;
    const stop = new AbortController();
    untrack(() => void flow.offer(stop.signal));
    return () => stop.abort();
  });

  function submit(e: SubmitEvent) {
    e.preventDefault();
    void flow.submit();
  }
</script>

{#snippet said(line: string | null | undefined)}
  {#if line}<p class="glim-signin-error" role="alert">{line}</p>{/if}
{/snippet}

{#snippet serviceMark()}
  {#if service?.mark}<BrandMark svg={service.mark.svg} />{/if}
{/snippet}

{#snippet back()}
  <Button label={text.back} labelKey={keys.back} tone="subtle" data-signin="back" disabled={!!s.busy} onClick={flow.back} />
{/snippet}

<div data-glim="SignInCard" class={["glim-signin", className].filter(Boolean).join(" ")}>
  <div bind:this={card} class="glim-card glim-signin-card">
    <div class="glim-signin-head">
      {#if logo}
        <span class="glim-signin-logo" aria-hidden="true">
          {#if typeof logo === "string"}<img src={logo} alt="" draggable="false" />{:else}{@render logo()}{/if}
        </span>
      {/if}
      <h1 class="glim-signin-name">{appName}</h1>
    </div>

    {#if step}
      {@render step()}
    {:else if s.view === "reset"}
      <form class="glim-signin-form" novalidate onsubmit={submit}>
        <SignInField label={text.resetCode} htmlFor={id("reset-code")} hint={text.resetCodeTip}>
          <TextField
            id={id("reset-code")}
            data-signin-field="resetCode"
            class="glim-signin-log-code"
            value={s.resetCode}
            oninput={(e) => flow.set("resetCode", e.currentTarget.value)}
            autocomplete="one-time-code"
            autocapitalize="characters"
            spellcheck={false}
            placeholder="XXXX-XXXX-XXXX"
          />
        </SignInField>
        {#if resetName}
          <SignInField label={text.name} htmlFor={id("reset-name")}>
            <TextField
              id={id("reset-name")}
              data-signin-field="resetName"
              value={s.resetName}
              oninput={(e) => flow.set("resetName", e.currentTarget.value)}
              autocomplete="username"
              autocapitalize="none"
              spellcheck={false}
            />
          </SignInField>
        {/if}
        <SignInField label={text.newPassword} htmlFor={id("new")}>
          <PasswordField
            id={id("new")}
            data-signin-field="newPassword"
            value={s.newPassword}
            oninput={(e) => flow.set("newPassword", e.currentTarget.value)}
            autocomplete="new-password"
            text={eye}
          />
        </SignInField>
        <SignInField label={text.confirmPassword} htmlFor={id("confirm")}>
          <PasswordField
            id={id("confirm")}
            data-signin-field="confirm"
            value={s.confirm}
            oninput={(e) => flow.set("confirm", e.currentTarget.value)}
            autocomplete="new-password"
            text={eye}
          />
        </SignInField>
        {@render said(s.error)}
        <!-- Stacked, since the longer translations of the two labels do not fit side by side. -->
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
        {@render back()}
      </form>
    {:else}
      <form class="glim-signin-form" novalidate onsubmit={submit}>
        {#if note}<p class="glim-signin-note" role="status">{note}</p>{/if}
        {#if !s.viaPasskey}{@render fields?.()}{/if}
        <!-- Kept while a passkey asks for the code, so the password survives a step back. -->
        <SignInField label={text.password} htmlFor={id("password")} hidden={s.viaPasskey}>
          <PasswordField
            id={id("password")}
            data-signin-field="password"
            value={s.password}
            oninput={(e) => flow.set("password", e.currentTarget.value)}
            autocomplete={offers ? "current-password webauthn" : "current-password"}
            text={eye}
          />
        </SignInField>
        {#if s.needCode}
          <div class="glim-signin-field">
            <label for={id("code")} class="glim-signin-label">{text.code}</label>
            <TextField
              id={id("code")}
              data-signin-field="code"
              class="glim-signin-code"
              value={s.code}
              oninput={(e) => flow.set("code", e.currentTarget.value)}
              inputmode="numeric"
              autocomplete="one-time-code"
              spellcheck={false}
              placeholder="000000"
            />
            <p class="glim-signin-hint">{text.codeHint}</p>
          </div>
        {/if}
        {@render said(s.error ?? (s.tried ? null : outside))}
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
        <!-- Left out rather than disabled where it cannot work: a disabled
             control on a sign-in page reads as being locked out. -->
        {#if !s.needCode && passkey}
          <Button
            label={text.passkey}
            labelKey={keys.passkey}
            data-signin="passkey"
            disabled={!!s.busy}
            busy={s.busy === "passkey"}
            onClick={() => void flow.passkey()}
          />
        {/if}
        {#if !s.needCode && service}
          <Button
            label={service.name}
            labelKey={null}
            glyph={service.mark ? serviceMark : glyphFor(keys.service)}
            data-signin="service"
            disabled={!!s.busy}
            onClick={() => onService?.()}
          />
        {/if}
        {#if !s.needCode}{@render actions?.()}{/if}
        <!-- A plain link, the last line of the card: nobody plans to forget a password. -->
        {#if s.needCode}
          {@render back()}
        {:else if reset}
          <button
            type="button"
            class="glim-signin-forgot"
            data-signin="forgot"
            disabled={!!s.busy}
            aria-busy={s.busy === "askCode" || undefined}
            onclick={() => void flow.forgot()}>{text.forgot}</button
          >
        {/if}
      </form>
    {/if}
  </div>
</div>
