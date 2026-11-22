// The sign-in card's flow without a framework (docs/design-language.md, "The
// sign-in card"). The app answers each step through a callback, the flow keeps
// what was typed and which form shows, and the React and Vue cards draw it.

import { fill } from "./fortressText.ts";
import { PASSWORD_FIELD_TEXT } from "./passwordField.ts";
import type { TileMark } from "./picker.ts";
import { shake } from "./selectModel.ts";
import type { SignInApi, SignInRemoved, SignInVisitor } from "./signInApi.ts";
import { signInErrorText, type SignInErrorText } from "./signInTile.ts";

/** The card's words, translated by the app. The reset form's second field, its
 *  mismatch and the eye say what a PasswordField says, which
 *  `componentText(lang).passwordField` has in every language. */
export interface SignInText {
  password: string;
  signIn: string;
  /** The bubble on Sign in while it works. */
  signingIn: string;
  passkey: string;
  /** "Forgot password?", with the question mark. */
  forgot: string;
  /** The label of the second step's code field. */
  code: string;
  /** The line under the code field, such as where the code comes from. */
  codeHint: string;
  /** Said when the app refuses a code without a reason of its own. */
  codeInvalid: string;
  back: string;
  /** The label of the reset form's code field. */
  resetCode: string;
  /** The label of the reset form's name field, in an app with several accounts. */
  name: string;
  /** The (i) beside it: where the log is, how long the code lasts, what a reset removes. */
  resetCodeTip: string;
  newPassword: string;
  confirmPassword: string;
  setPassword: string;
  /** The bubble on Set password while it works. */
  saving: string;
  mismatch: string;
  /** @deprecated Unread: a short password is taken, and `shortHint` says so. */
  tooShort: string;
  /** The quiet line under a new password shorter than the app suggests, `{min}`. */
  shortHint: string;
  /** Said when the app refuses the code from the log. */
  resetRejected: string;
  /** Said when a callback throws or answers without a reason. */
  failed: string;
  /** The reveal eye's name while the secret is hidden, and once it shows. */
  show: string;
  hide: string;
}

/** English words, for an app in English and for the demos. */
export const signInTextEn: SignInText = {
  password: "Password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  passkey: "Sign in with a passkey",
  forgot: "Forgot password?",
  code: "Code",
  codeHint: "Six digits from your authenticator app, or one of your recovery codes.",
  codeInvalid: "That code is not valid.",
  back: "Back",
  resetCode: "Code from the container log",
  name: "Name",
  resetCodeTip: "The app has written a code to its container log. On Unraid: Docker tab, the app's icon, Logs. A code is valid for 10 minutes.",
  newPassword: "New password",
  confirmPassword: PASSWORD_FIELD_TEXT.confirm,
  setPassword: "Set password",
  saving: "Saving…",
  mismatch: PASSWORD_FIELD_TEXT.mismatch,
  tooShort: "The new password needs at least 12 characters.",
  shortHint: "Under {min} characters. That works, though a longer password is harder to guess.",
  resetRejected: "That code is wrong or has expired. If it expired, the log now shows a new one.",
  failed: "That did not work. Please try again.",
  show: PASSWORD_FIELD_TEXT.show,
  hide: PASSWORD_FIELD_TEXT.hide,
};

/**
 * What the app answers to a sign-in or a passkey. `ok` means the card's part is
 * done: the app signs in or shows a step of its own. `needCode` asks for the
 * second step, and `error` is said above Sign in. `restart` ends a second step
 * that ran out, so the card asks for the password again.
 */
export interface SignInAnswer {
  ok?: boolean;
  needCode?: boolean;
  error?: string;
  restart?: boolean;
}

/** What the app answers to asking for a reset code or to setting the password. `rejected` means the code from the log was refused. */
export interface ResetAnswer {
  ok?: boolean;
  rejected?: boolean;
  error?: string;
}

export interface SignInHandlers {
  /** `code` is set once the app asked for one, and `passkey` when a passkey started the sign-in. */
  onSignIn: (input: { password: string; code?: string; passkey: boolean }) => Promise<SignInAnswer>;
  /** An empty answer leaves the card as it was, for a prompt the person closed. */
  onPasskey?: () => Promise<SignInAnswer>;
  /**
   * Lets the browser offer the passkeys it holds in the password field, with
   * conditional mediation, until `signal` ends the offer. The card starts it
   * whenever the password form is at rest. An empty answer leaves the card as it was.
   */
  onPasskeyOffer?: (signal: AbortSignal) => Promise<SignInAnswer>;
  /** Writes a code to the log. The reset form shows only once this answers ok. */
  onAskCode?: () => Promise<ResetAnswer>;
  /** `name` is set where the reset form asks for it (`resetName`). */
  onSetPassword?: (input: { code: string; password: string; name?: string }) => Promise<ResetAnswer>;
}

export type SignInField = "password" | "code" | "resetCode" | "resetName" | "newPassword" | "confirm";

/** The card's buttons, by their `data-signin` hook. */
export type SignInButton = "submit" | "set-password" | "passkey" | "forgot";

/**
 * The last refused step: the button that shakes and the field that takes the
 * focus with its content selected. `count` grows with every refusal, so the
 * same refusal twice still shakes twice.
 */
export interface SignInRefusal {
  button: SignInButton;
  field: SignInField | null;
  count: number;
}

export interface SignInState {
  view: "signIn" | "reset";
  password: string;
  code: string;
  needCode: boolean;
  /** A passkey started this sign-in, so the code goes without the password. */
  viaPasskey: boolean;
  resetCode: string;
  resetName: string;
  newPassword: string;
  confirm: string;
  error: string | null;
  refusal: SignInRefusal | null;
  busy: "signIn" | "passkey" | "askCode" | "setPassword" | null;
  /** The card has sent a try of its own, so an error from outside it no longer stands. */
  tried: boolean;
}

export interface SignInOptions extends SignInHandlers {
  text: SignInText;
  /** The length from which the reset form stops suggesting a longer password. */
  minPassword: number;
  /** The reset form asks for the account's name. */
  resetName?: boolean;
}

export interface SignInFlow {
  state(): SignInState;
  subscribe(listener: () => void): () => void;
  set(field: SignInField, value: string): void;
  submit(): Promise<void>;
  passkey(): Promise<void>;
  /** Runs the browser's passkey offer until `signal` ends it. */
  offer(signal: AbortSignal): Promise<void>;
  forgot(): Promise<void>;
  back(): void;
}

const START: SignInState = {
  view: "signIn",
  password: "",
  code: "",
  needCode: false,
  viaPasskey: false,
  resetCode: "",
  resetName: "",
  newPassword: "",
  confirm: "",
  error: null,
  refusal: null,
  busy: null,
  tried: false,
};

const BUTTON_OF: Record<NonNullable<SignInState["busy"]>, SignInButton> = {
  signIn: "submit",
  setPassword: "set-password",
  passkey: "passkey",
  askCode: "forgot",
};

/**
 * The flow behind one card. `options` is read at every step, so a framework
 * hands in its current props rather than the ones the card was made with.
 */
export function createSignInFlow(options: () => SignInOptions): SignInFlow {
  let state = START;
  const listeners = new Set<() => void>();
  const update = (change: Partial<SignInState>) => {
    state = { ...state, ...change };
    listeners.forEach((fn) => fn());
  };
  // A refusal during a step waits for the step to end: the busy button wears a
  // bubble that wraps it, and the shake has to land on the button that stays.
  let pending: Partial<SignInState> = {};
  const refuse = (error: string, button: SignInButton, field: SignInField | null = null) => {
    const change = { error, refusal: { button, field, count: (state.refusal?.count ?? 0) + 1 } };
    if (state.busy) pending = change;
    else update(change);
  };

  async function run(busy: NonNullable<SignInState["busy"]>, work: () => Promise<void>) {
    if (state.busy) return;
    update({ busy, error: null, tried: true });
    pending = {};
    try {
      await work();
    } catch {
      refuse(options().text.failed, BUTTON_OF[busy]);
    } finally {
      update({ busy: null, ...pending });
    }
  }

  async function signIn() {
    if (signInBlocked(state)) return;
    const { text, onSignIn } = options();
    return run("signIn", async () => {
      const tried = state.needCode;
      const res = await onSignIn({
        password: state.viaPasskey ? "" : state.password,
        code: tried ? state.code.trim() : undefined,
        passkey: state.viaPasskey,
      });
      if (res.ok) return;
      if (res.needCode) {
        // The first request for a code only opens the field.
        update({ needCode: true, code: "" });
        if (tried) refuse(res.error ?? text.codeInvalid, "submit", "code");
        return;
      }
      // A passkey's sign-in that ended starts over with the password, as does a step that ran out.
      if (state.viaPasskey || res.restart) update({ viaPasskey: false, needCode: false, code: "" });
      refuse(res.error ?? text.failed, "submit", state.needCode ? "code" : "password");
    });
  }

  async function setPassword() {
    const { text, onSetPassword, onAskCode, resetName } = options();
    if (resetBlocked(state, resetName) || !onSetPassword) return;
    if (state.newPassword !== state.confirm) return refuse(text.mismatch, "set-password", "confirm");
    return run("setPassword", async () => {
      const res = await onSetPassword({ code: state.resetCode.trim(), password: state.newPassword, ...(resetName ? { name: state.resetName.trim() } : {}) });
      if (res.ok) return;
      if (res.rejected) {
        // The answer does not say whether the code expired, and the sentence
        // promises a new one in that case. Asking writes one only when none is live.
        await onAskCode?.().catch(() => undefined);
        refuse(text.resetRejected, "set-password", "resetCode");
        return;
      }
      refuse(res.error ?? text.failed, "set-password", "resetCode");
    });
  }

  return {
    state: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(field, value) {
      update({ [field]: value });
    },
    submit: () => (state.view === "reset" ? setPassword() : signIn()),
    async passkey() {
      const { onPasskey } = options();
      if (!onPasskey) return;
      return run("passkey", async () => {
        const res = await onPasskey();
        if (res.ok) return;
        if (res.needCode) update({ viaPasskey: true, needCode: true, code: "" });
        else if (res.error !== undefined) refuse(res.error, "passkey");
      });
    },
    async offer(signal) {
      const { onPasskeyOffer } = options();
      if (!onPasskeyOffer) return;
      let res: SignInAnswer;
      try {
        res = await onPasskeyOffer(signal);
      } catch {
        return;
      }
      if (signal.aborted || res.ok || state.busy) return;
      if (res.needCode) update({ viaPasskey: true, needCode: true, code: "", tried: true });
      else if (res.error !== undefined) {
        update({ tried: true });
        refuse(res.error, "submit", "password");
      }
    },
    async forgot() {
      const { text, onAskCode } = options();
      if (!onAskCode) return;
      return run("askCode", async () => {
        const res = await onAskCode();
        if (res.ok) update({ view: "reset", resetCode: "", resetName: "", newPassword: "", confirm: "" });
        else refuse(res.error ?? text.failed, "forgot");
      });
    },
    back() {
      if (state.busy) return;
      update({ view: "signIn", needCode: false, viaPasskey: false, code: "", error: null });
    },
  };
}

/** Sign in waits for the password, and in the second step for the code. */
export function signInBlocked(s: SignInState): boolean {
  if (s.busy) return true;
  if (s.needCode) return s.code.trim() === "";
  return s.password === "";
}

/**
 * The quiet line under a new password shorter than `min`, or `undefined`. A
 * short password is still taken: the app stays usable however it is guarded.
 */
export function signInShortHint(hint: string, password: string, min: number): string | undefined {
  return password !== "" && [...password].length < min ? fill(hint, { min }) : undefined;
}

/** Set password waits for the code from the log, the name where the form asks for one, and a new password. */
export function resetBlocked(s: SignInState, asksName = false): boolean {
  return !!s.busy || s.resetCode.trim() === "" || (asksName && s.resetName.trim() === "") || s.newPassword === "";
}

/**
 * Which form shows, as a key that changes whenever the focus should move to
 * the first empty field of the new form.
 */
export function signInStage(s: SignInState): string {
  return `${s.view}:${s.needCode}:${s.viaPasskey}`;
}

// Walks up rather than reading the layout, which a page without one, such as a test's, does not have.
function shown(el: Element): boolean {
  for (let e: Element | null = el; e; e = e.parentElement) if (getComputedStyle(e).display === "none") return false;
  return true;
}

const FIELDS = 'input:not([type="hidden"], [type="checkbox"], [type="radio"], :disabled), textarea:not(:disabled)';

/**
 * Writes a sign-in field's label into the field as its placeholder and says
 * whether it did, so the card hides the label above it. A field with a
 * placeholder of its own or with a hint keeps its label above. `was` is the
 * label written before, which a new language replaces.
 */
export function labelInside(field: { placeholder: string } | null, label: string, hint?: string, was?: string): boolean {
  if (!field || hint || (field.placeholder && field.placeholder !== was)) return false;
  field.placeholder = label;
  return true;
}

/**
 * Puts the focus in the first empty field inside `root`, or in its first field
 * when all hold something, such as a name the app filled in.
 */
export function focusFirstField(root: HTMLElement | null): void {
  if (!root) return;
  const fields = [...root.querySelectorAll<HTMLInputElement>(FIELDS)].filter(shown);
  (fields.find((f) => f.value === "") ?? fields[0])?.focus({ preventScroll: true });
}

/**
 * Answers a refusal on screen: the button shakes once (`glim-shake`, which the
 * motion engine stills) and the field takes the focus with its content
 * selected, so the next try starts by typing. Returns the shake's cleanup.
 */
export function showRefusal(root: HTMLElement | null, refusal: SignInRefusal): () => void {
  const field = refusal.field && root?.querySelector<HTMLInputElement>(`[data-signin-field="${refusal.field}"]`);
  if (field) {
    field.focus({ preventScroll: true });
    field.select();
  }
  const button = root?.querySelector<HTMLElement>(`[data-signin="${refusal.button}"]`);
  return button ? shake(button) : () => {};
}

/**
 * Whether the browser's passkey offer can run: the password form at rest,
 * neither in the code step nor busy. The key changes whenever a new offer
 * has to start, since an offer that answered is spent.
 */
export function passkeyOfferKey(s: SignInState): string | null {
  if (s.view !== "signIn" || s.needCode || s.busy) return null;
  return `offer:${s.refusal?.count ?? 0}`;
}

/** The label keys behind the card's buttons, which pick their glyphs (see Button). */
export interface SignInLabelKeys {
  signIn: string;
  passkey: string;
  forgot: string;
  back: string;
  setPassword: string;
  /** The glyph on a sign-in service's button where its catalog entry has no mark. */
  service: string;
}

/** The sign-in service whose button stands under Sign in: its name and the mark its catalog entry carries. */
export interface SignInCardService {
  name: string;
  mark?: TileMark;
}

export interface SignInCardHandlerOptions {
  /** The words for the kit's codes. A tile's `SignInTileText` carries them too. */
  words: { errors: SignInErrorText; failed: string };
  /** The person is in. */
  onSignedIn: (visitor: SignInVisitor | undefined) => void;
  /** A reset went through and signed the person in, with what it took away. */
  onReset?: (removed: SignInRemoved) => void;
  /** The account's name from the sign-in form, in an app with several local accounts. The reset form asks for its own (`resetName`). */
  name?: () => string | undefined;
}

/**
 * The card's handlers for an app on the kit's sign-in: the password and its
 * code, the browser's passkey offer and the reset through the container log,
 * each answering with the app's words for the kit's code.
 */
export function signInCardHandlers(
  api: SignInApi,
  o: SignInCardHandlerOptions,
): Required<Pick<SignInHandlers, "onSignIn" | "onPasskeyOffer" | "onAskCode" | "onSetPassword">> {
  const say = (e: Parameters<typeof signInErrorText>[1]) => signInErrorText(o.words, e);
  return {
    async onSignIn({ password, code }) {
      if (code !== undefined) {
        const r = await api.loginCode(code);
        if (r.ok) {
          o.onSignedIn(r.value.visitor);
          return { ok: true };
        }
        if (r.error === "stepExpired") return { error: say(r), restart: true };
        return { needCode: r.error === "wrongCode", error: say(r) };
      }
      const r = await api.login(password, o.name?.());
      if (!r.ok) return { error: say(r) };
      if (r.value.step === "code") return { needCode: true };
      o.onSignedIn(r.value.visitor);
      return { ok: true };
    },
    async onPasskeyOffer(signal) {
      const r = await api.offerPasskey(signal);
      if (!r) return {};
      if (!r.ok) return { error: say(r) };
      o.onSignedIn(r.value.visitor);
      return { ok: true };
    },
    async onAskCode() {
      const r = await api.resetCode();
      return r.ok ? { ok: true } : { error: say(r) };
    },
    async onSetPassword({ code, password, name }) {
      const r = await api.reset(code, password, name);
      if (r.ok) {
        o.onReset?.(r.value.removed);
        return { ok: true };
      }
      if (r.status === 401) return { rejected: true };
      return { error: say(r) };
    },
  };
}
