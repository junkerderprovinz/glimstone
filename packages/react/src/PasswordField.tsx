import { useEffect, useId, useState, type InputHTMLAttributes, type Ref } from "react";
import { fieldErrorView, fieldNoteView, fieldWidthClass, PASSWORD_FIELD_TEXT, passwordConfirmView, type FieldWidth, type PasswordFieldText } from "@glimstone/core";
import { FieldError } from "./FieldError.tsx";
import { useFieldName } from "./fieldName.ts";
import { IconEye, IconEyeOff } from "./glyphs.tsx";
import { IconTipButton } from "./IconTipButton.tsx";

// A field for a secret with the reveal eye inside it ("The reveal eye" in the
// design language). The props are a native <input>'s, so a call site swaps
// `<input type="password"` for `<PasswordField` and keeps its own onChange.
// Inside a FieldRow the row names it. With `confirm` it takes a new password,
// typed twice.

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "width"> {
  width?: FieldWidth;
  /** Attributes for the eye, such as a data hook. */
  eyeAttrs?: Record<string, string>;
  /** The eye's words, and the second field's with `confirm`. English where left out. */
  text?: Partial<PasswordFieldText>;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  /** A quiet line under the field that only informs, such as a hint about the value. An error takes its place. */
  note?: string;
  /** Asks for the password again in a second field, which stands once the first holds something. */
  confirm?: boolean;
  /** Whether both fields hold the same password, each time that changes. Set password waits for true. */
  onConfirmedChange?: (confirmed: boolean) => void;
  /** Classes for the wrapper, which carries the field's width. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function PasswordField({ width, eyeAttrs, text, error, note, confirm = false, onConfirmedChange, className, ref, disabled, "aria-label": ariaLabel, "aria-describedby": describedBy, ...rest }: PasswordFieldProps) {
  const words = { ...PASSWORD_FIELD_TEXT, ...text };
  const [shown, setShown] = useState(false);
  const [repeatShown, setRepeatShown] = useState(false);
  const [typed, setTyped] = useState(String(rest.defaultValue ?? ""));
  const [repeat, setRepeat] = useState("");
  const name = useFieldName(ariaLabel);
  const own = useId();
  const id = rest.id ?? own;
  const quiet = fieldNoteView(note, error, id, describedBy);
  const err = fieldErrorView(error, id, quiet.describedBy);
  const view = passwordConfirmView(rest.value === undefined ? typed : String(rest.value), repeat);
  if (!view.shown && repeat) setRepeat("");
  const repeatId = `${id}-confirm`;
  const mismatch = fieldErrorView(view.mismatch ? words.mismatch : undefined, repeatId);
  const confirmed = confirm && view.confirmed;
  useEffect(() => onConfirmedChange?.(confirmed), [confirmed]);
  return (
    <>
      <span
        data-glim="PasswordField"
        className={["glim-secret", fieldWidthClass(width), className].filter(Boolean).join(" ")}
        onInput={(e) => setTyped((e.target as HTMLInputElement).value)}
      >
        <input
          autoComplete={confirm ? "new-password" : "current-password"}
          spellCheck={false}
          {...rest}
          aria-label={name}
          aria-invalid={err.invalid}
          aria-describedby={err.describedBy}
          ref={ref}
          disabled={disabled}
          type={shown ? "text" : "password"}
          className="glim-input"
        />
        <IconTipButton {...eyeAttrs} tip={shown ? words.hide : words.show} className="glim-secret-eye" disabled={disabled} onClick={() => setShown(!shown)}>
          {shown ? <IconEyeOff /> : <IconEye />}
        </IconTipButton>
      </span>
      {err.errorId && <FieldError id={err.errorId}>{error}</FieldError>}
      {quiet.noteId && (
        <span id={quiet.noteId} className="glim-field-note">
          {note}
        </span>
      )}
      {confirm && view.shown && (
        <span className="glim-secret-confirm">
          <label htmlFor={repeatId} className="glim-secret-confirm-label">
            {words.confirm}
          </label>
          <span className={["glim-secret-confirm-box", fieldWidthClass(width)].filter(Boolean).join(" ")}>
            <span className="glim-secret">
              <input
                id={repeatId}
                autoComplete="new-password"
                spellCheck={false}
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                aria-invalid={mismatch.invalid}
                aria-describedby={mismatch.describedBy}
                disabled={disabled}
                type={repeatShown ? "text" : "password"}
                className="glim-input"
              />
              <IconTipButton tip={repeatShown ? words.hide : words.show} className="glim-secret-eye" disabled={disabled} onClick={() => setRepeatShown(!repeatShown)}>
                {repeatShown ? <IconEyeOff /> : <IconEye />}
              </IconTipButton>
            </span>
            <span aria-live="polite" className="glim-secret-confirm-live">
              {mismatch.errorId && <FieldError id={mismatch.errorId}>{words.mismatch}</FieldError>}
            </span>
          </span>
        </span>
      )}
    </>
  );
}
