import { useEffect, useId, useState, type InputHTMLAttributes, type Ref } from "react";
import { fieldErrorView, fieldNoteView, fieldWidthClass, MARKS, PASSWORD_FIELD_TEXT, passwordConfirmView, type FieldWidth, type PasswordFieldText } from "@glimstone/core";
import { FieldErrorLine } from "./fieldErrorLine.tsx";
import { useFieldName } from "./fieldName.ts";
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
          <RevealEye struck={shown} />
        </IconTipButton>
      </span>
      <FieldErrorLine id={err.errorId} error={error} />
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
                placeholder={words.again}
                onChange={(e) => setRepeat(e.target.value)}
                aria-invalid={mismatch.invalid}
                aria-describedby={mismatch.describedBy}
                disabled={disabled}
                type={repeatShown ? "text" : "password"}
                className="glim-input"
              />
              <IconTipButton tip={repeatShown ? words.hide : words.show} className="glim-secret-eye" disabled={disabled} onClick={() => setRepeatShown(!repeatShown)}>
                <RevealEye struck={repeatShown} />
              </IconTipButton>
            </span>
            <span aria-live="polite" className="glim-secret-confirm-live">
              <FieldErrorLine id={mismatch.errorId} error={view.mismatch ? words.mismatch : undefined} />
            </span>
          </span>
        </span>
      )}
    </>
  );
}

/** The eye, with a stroke that draws itself through it once the secret shows.
 *  The stroke cuts a gap into the eye behind it, so it reads on the filled glyph. */
function RevealEye({ struck }: { struck: boolean }) {
  const cut = useId();
  const slash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: struck ? 0 : 1, strokeLinecap: "round" as const, fill: "none", className: "glim-secret-slash" };
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" data-struck={struck ? "" : undefined} className="glim-mark">
      <mask id={cut} maskUnits="userSpaceOnUse" x="0" y="0" width="14" height="14">
        <rect width="14" height="14" fill="white" />
        <path d="M1.6 1.6 12.4 12.4" stroke="black" strokeWidth="3.4" {...slash} />
      </mask>
      <g mask={`url(#${cut})`} dangerouslySetInnerHTML={{ __html: MARKS.eye.body }} />
      <path d="M1.6 1.6 12.4 12.4" stroke="currentColor" strokeWidth="1.5" {...slash} />
    </svg>
  );
}
