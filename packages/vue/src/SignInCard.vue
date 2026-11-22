<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, onUpdated, ref, shallowRef, useId, useSlots, watch } from "vue";
import {
  createSignInFlow,
  focusFirstField,
  passkeyOfferKey,
  resetBlocked,
  signInShortHint,
  showRefusal,
  signInBlocked,
  signInStage,
  type ResetAnswer,
  type SignInAnswer,
  type SignInCardService,
  type SignInText,
} from "@glimstone/core";
import BrandMark from "./BrandMark.vue";
import Button from "./Button.vue";
import { glyphFor } from "./glyphs";
import PasswordField from "./PasswordField.vue";
import SignInField from "./SignInField.vue";
import TextField from "./TextField.vue";

// The way into an app with a login ("The sign-in card" in the design
// language). The flow lives in the core; the app answers each step through a
// callback prop, which `@sign-in` and its siblings bind as well, and brings its
// own words. The slot `fields` stands above the password, `actions` under Sign
// in, and `step` takes the forms' place for a step the app runs itself. The
// slot `logo` takes the place of the `logo` address, with an `<svg>` that has a
// viewBox.
const props = withDefaults(
  defineProps<{
    /** The address of the app's logo. It stands 7.5rem tall above the name, as wide as its shape asks. */
    logo?: string;
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
    /** The label keys behind the buttons, which pick their glyphs. */
    labelKeys?: Partial<Record<"signIn" | "passkey" | "forgot" | "back" | "setPassword" | "service", string>>;
    /** The start of the fields' ids: `-password`, `-code`, `-reset-code`, `-reset-name`, `-new` and `-confirm` follow it. */
    idPrefix?: string;
    /** Puts the focus in the first empty field when the card opens. */
    autoFocus?: boolean;
    /** `code` is set once the app asked for one, and `passkey` when a passkey started the sign-in. */
    onSignIn: (input: { password: string; code?: string; passkey: boolean }) => Promise<SignInAnswer>;
    onPasskey?: () => Promise<SignInAnswer>;
    /**
     * Lets the browser offer the passkeys it holds in the password field, with
     * conditional mediation, until `signal` ends the offer. The card starts it
     * whenever the password form is at rest. An empty answer leaves the card as it was.
     */
    onPasskeyOffer?: (signal: AbortSignal) => Promise<SignInAnswer>;
    /** Writes a code to the log. The reset form shows only once this answers ok. */
    onAskCode?: () => Promise<ResetAnswer>;
    onSetPassword?: (input: { code: string; password: string }) => Promise<ResetAnswer>;
  }>(),
  { passkey: false, reset: false, resetName: false, minPassword: 12, autoFocus: true },
);
const slots = useSlots();

const flow = createSignInFlow(() => props);
const s = shallowRef(flow.state());
const stop = flow.subscribe(() => (s.value = flow.state()));
onBeforeUnmount(stop);

const ownId = useId();
const id = (name: string) => `${props.idPrefix ?? ownId}-${name}`;
const keys = computed(() => ({ signIn: "signIn", passkey: "signInWithPasskey", forgot: "forgotPassword", back: "back", setPassword: "setPassword", service: "signIn", ...props.labelKeys }));
const eye = computed(() => ({ show: props.text.show, hide: props.text.hide }));

const serviceGlyph = computed(() => {
  const mark = props.service?.mark;
  return mark ? () => h(BrandMark, { svg: mark.svg }) : glyphFor(keys.value.service);
});
const said = computed(() => s.value.error ?? (s.value.tried ? undefined : props.error));

// The step slot is read after each render, so whether the offer runs is too.
const stepShown = ref(!!slots.step);
const offers = computed(() => !!props.onPasskeyOffer && !stepShown.value);
const offer = computed(() => (offers.value ? passkeyOfferKey(s.value) : null));
watch(
  offer,
  (key, _, onCleanup) => {
    if (!key) return;
    const stop = new AbortController();
    void flow.offer(stop.signal);
    onCleanup(() => stop.abort());
  },
  { immediate: true },
);

// Slots are not reactive, so the form in view is compared after every render.
const card = shallowRef<HTMLElement | null>(null);
let shown = "";
function follow() {
  stepShown.value = !!slots.step;
  const now = slots.step ? "step" : signInStage(s.value);
  if (now === shown) return;
  if (shown || props.autoFocus) focusFirstField(card.value);
  shown = now;
}
onMounted(follow);
onUpdated(follow);

watch(
  () => s.value.refusal?.count,
  (_, __, onCleanup) => {
    const refusal = s.value.refusal;
    if (refusal) onCleanup(showRefusal(card.value, refusal));
  },
  { flush: "post" },
);
</script>

<template>
  <div data-glim="SignInCard" class="glim-signin">
    <div ref="card" class="glim-card glim-signin-card">
      <div class="glim-signin-head">
        <span v-if="logo || $slots.logo" class="glim-signin-logo" aria-hidden="true">
          <slot name="logo"><img :src="logo" alt="" draggable="false" /></slot>
        </span>
        <h1 class="glim-signin-name">{{ appName }}</h1>
      </div>

      <slot v-if="$slots.step" name="step" />

      <form v-else-if="s.view === 'reset'" class="glim-signin-form" novalidate @submit.prevent="flow.submit()">
        <SignInField :label="text.resetCode" :for="id('reset-code')" :hint="text.resetCodeTip">
          <TextField
            :id="id('reset-code')"
            data-signin-field="resetCode"
            class="glim-signin-log-code"
            :model-value="s.resetCode"
            autocomplete="one-time-code"
            autocapitalize="characters"
            spellcheck="false"
            placeholder="XXXX-XXXX-XXXX"
            @update:model-value="flow.set('resetCode', $event)"
          />
        </SignInField>
        <SignInField v-if="resetName" :label="text.name" :for="id('reset-name')">
          <TextField
            :id="id('reset-name')"
            data-signin-field="resetName"
            :model-value="s.resetName"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            @update:model-value="flow.set('resetName', $event)"
          />
        </SignInField>
        <SignInField :label="text.newPassword" :for="id('new')">
          <PasswordField
            :id="id('new')"
            data-signin-field="newPassword"
            :model-value="s.newPassword"
            autocomplete="new-password"
            :text="eye"
            :note="signInShortHint(text.shortHint, s.newPassword, minPassword)"
            @update:model-value="flow.set('newPassword', $event)"
          />
        </SignInField>
        <SignInField :label="text.confirmPassword" :for="id('confirm')">
          <PasswordField :id="id('confirm')" data-signin-field="confirm" :model-value="s.confirm" autocomplete="new-password" :text="eye" @update:model-value="flow.set('confirm', $event)" />
        </SignInField>
        <p v-if="s.error" class="glim-signin-error" role="alert">{{ s.error }}</p>
        <!-- Stacked, since the longer translations of the two labels do not fit side by side. -->
        <Button
          :label="text.setPassword"
          :label-key="keys.setPassword"
          tone="accent"
          type="submit"
          data-signin="set-password"
          :disabled="resetBlocked(s, resetName)"
          :busy="s.busy === 'setPassword'"
          :title="s.busy === 'setPassword' ? text.saving : undefined"
        />
        <Button :label="text.back" :label-key="keys.back" tone="subtle" data-signin="back" :disabled="!!s.busy" @click="flow.back()" />
      </form>

      <form v-else class="glim-signin-form" novalidate @submit.prevent="flow.submit()">
        <p v-if="note" class="glim-signin-note" role="status">{{ note }}</p>
        <slot v-if="!s.viaPasskey" name="fields" />
        <!-- Kept while a passkey asks for the code, so the password survives a step back. -->
        <SignInField v-show="!s.viaPasskey" :label="text.password" :for="id('password')">
          <PasswordField
            :id="id('password')"
            data-signin-field="password"
            :model-value="s.password"
            :autocomplete="offers ? 'current-password webauthn' : 'current-password'"
            :text="eye"
            @update:model-value="flow.set('password', $event)"
          />
        </SignInField>
        <SignInField v-if="s.needCode" :label="text.code" :for="id('code')">
          <TextField
            :id="id('code')"
            data-signin-field="code"
            class="glim-signin-code"
            :model-value="s.code"
            inputmode="numeric"
            autocomplete="one-time-code"
            spellcheck="false"
            placeholder="000000"
            @update:model-value="flow.set('code', $event)"
          />
          <p class="glim-signin-hint">{{ text.codeHint }}</p>
        </SignInField>
        <p v-if="said" class="glim-signin-error" role="alert">{{ said }}</p>
        <Button
          :label="text.signIn"
          :label-key="keys.signIn"
          tone="accent"
          type="submit"
          data-signin="submit"
          :disabled="signInBlocked(s)"
          :busy="s.busy === 'signIn'"
          :title="s.busy === 'signIn' ? text.signingIn : undefined"
        />
        <!-- Left out rather than disabled where it cannot work: a disabled
             control on a sign-in page reads as being locked out. -->
        <Button
          v-if="!s.needCode && passkey"
          :label="text.passkey"
          :label-key="keys.passkey"
          data-signin="passkey"
          :disabled="!!s.busy"
          :busy="s.busy === 'passkey'"
          @click="flow.passkey()"
        />
        <Button
          v-if="!s.needCode && service"
          :label="service.name"
          :label-key="null"
          :glyph="serviceGlyph"
          data-signin="service"
          :disabled="!!s.busy"
          @click="onService?.()"
        />
        <slot v-if="!s.needCode" name="actions" />
        <!-- A plain link, the last line of the card: nobody plans to forget a password. -->
        <Button v-if="s.needCode" :label="text.back" :label-key="keys.back" tone="subtle" data-signin="back" :disabled="!!s.busy" @click="flow.back()" />
        <button
          v-else-if="reset"
          type="button"
          class="glim-signin-forgot"
          data-signin="forgot"
          :disabled="!!s.busy"
          :aria-busy="s.busy === 'askCode' || undefined"
          @click="flow.forgot()"
        >
          {{ text.forgot }}
        </button>
      </form>
    </div>
  </div>
</template>
