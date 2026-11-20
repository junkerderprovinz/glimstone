// A new password is typed twice ("The reveal eye" in the design language). The
// second field stands once the first holds something, and the app sets the
// password only while both agree, so a slip of the finger never becomes the
// password nobody can sign in with.

import { en } from "./componentLocales/en.ts";

export interface PasswordFieldText {
  /** The eye's name and bubble while the secret is hidden, and once it shows. */
  show: string;
  hide: string;
  /** The label of the second field, which asks for the new password again. */
  confirm: string;
  /** The line under the second field while the two differ. */
  mismatch: string;
}

export const PASSWORD_FIELD_TEXT: PasswordFieldText = en.passwordField;

export interface PasswordConfirmView {
  /** The second field stands. */
  shown: boolean;
  /** The second field holds something other than the first, so its line says so. */
  mismatch: boolean;
  /** Both hold the same password, and the app may set it. */
  confirmed: boolean;
}

/** What a field that asks twice shows for the password and its repetition. */
export function passwordConfirmView(password: string, repeat: string): PasswordConfirmView {
  const shown = password !== "";
  return { shown, mismatch: shown && repeat !== "" && repeat !== password, confirmed: shown && repeat === password };
}
