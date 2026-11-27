import { createEffect, createMemo, createSignal, createUniqueId, on, Show, splitProps, type JSX } from "solid-js";
import { fieldErrorView, fieldNoteView, fieldWidthClass, MARKS, PASSWORD_FIELD_TEXT, passwordConfirmView, type FieldWidth, type PasswordFieldText } from "@glimstone/core";
import { FieldErrorLine } from "./fieldErrorLine.tsx";
import { useFieldName } from "./fieldName.ts";
import { IconTipButton } from "./IconTipButton.tsx";

// A field for a secret with the reveal eye inside it ("The reveal eye" in the
// design language). The props are a native <input>'s, so a call site swaps
// `<input type="password"` for `<PasswordField` and keeps its own listeners.
// Inside a FieldRow the row names it. With `confirm` it takes a new password,
// typed twice.

export interface PasswordFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "width" | "class"> {
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
  class?: string;
}

export function PasswordField(props: PasswordFieldProps) {
  const [own, rest] = splitProps(props, [
    "width",
    "eyeAttrs",
    "text",
    "error",
    "note",
    "confirm",
    "onConfirmedChange",
    "class",
    "ref",
    "disabled",
    "aria-label",
    "aria-describedby",
  ]);
  const words = () => ({ ...PASSWORD_FIELD_TEXT, ...own.text });
  const [shown, setShown] = createSignal(false);
  const [repeatShown, setRepeatShown] = createSignal(false);
  const [typed, setTyped] = createSignal("");
  const [repeat, setRepeat] = createSignal("");
  const name = useFieldName(() => own["aria-label"]);
  const fallback = createUniqueId();
  const id = () => rest.id ?? fallback;
  const quiet = () => fieldNoteView(own.note, own.error, id(), own["aria-describedby"]);
  const err = () => fieldErrorView(own.error, id(), quiet().describedBy);
  const view = () => passwordConfirmView(rest.value === undefined ? typed() : String(rest.value), repeat());
  const mismatch = () => fieldErrorView(view().mismatch ? words().mismatch : undefined, `${id()}-confirm`);
  createEffect(() => {
    if (!view().shown) setRepeat("");
  });
  // Through a memo the callback runs only when the answer changes. A parent that
  // keeps the answer in the same state as a controlled value would loop otherwise.
  const confirmed = createMemo(() => !!own.confirm && view().confirmed);
  createEffect(on(confirmed, (yes) => own.onConfirmedChange?.(yes)));
  return (
    <>
      <span
        data-glim="PasswordField"
        class={["glim-secret", fieldWidthClass(own.width), own.class].filter(Boolean).join(" ")}
        onInput={(e) => setTyped((e.target as HTMLInputElement).value)}
      >
        <input
          autocomplete={own.confirm ? "new-password" : "current-password"}
          spellcheck={false}
          {...rest}
          aria-label={name()}
          aria-invalid={err().invalid}
          aria-describedby={err().describedBy}
          ref={own.ref}
          disabled={own.disabled}
          type={shown() ? "text" : "password"}
          class="glim-input"
        />
        <IconTipButton {...own.eyeAttrs} tip={shown() ? words().hide : words().show} class="glim-secret-eye" disabled={own.disabled} onClick={() => setShown(!shown())}>
          <RevealEye struck={shown()} />
        </IconTipButton>
      </span>
      <FieldErrorLine id={err().errorId} error={own.error} />
      <Show when={quiet().noteId}>
        {(noteId) => (
          <span id={noteId()} class="glim-field-note">
            {own.note}
          </span>
        )}
      </Show>
      <Show when={own.confirm && view().shown}>
        <span class="glim-secret-confirm">
          <label for={`${id()}-confirm`} class="glim-secret-confirm-label">
            {words().confirm}
          </label>
          <span class={["glim-secret-confirm-box", fieldWidthClass(own.width)].filter(Boolean).join(" ")}>
            <span class="glim-secret">
              <input
                id={`${id()}-confirm`}
                autocomplete="new-password"
                spellcheck={false}
                value={repeat()}
                placeholder={words().again}
                onInput={(e) => setRepeat(e.currentTarget.value)}
                aria-invalid={mismatch().invalid}
                aria-describedby={mismatch().describedBy}
                disabled={own.disabled}
                type={repeatShown() ? "text" : "password"}
                class="glim-input"
              />
              <IconTipButton tip={repeatShown() ? words().hide : words().show} class="glim-secret-eye" disabled={own.disabled} onClick={() => setRepeatShown(!repeatShown())}>
                <RevealEye struck={repeatShown()} />
              </IconTipButton>
            </span>
            <span aria-live="polite" class="glim-secret-confirm-live">
              <FieldErrorLine id={mismatch().errorId} error={view().mismatch ? words().mismatch : undefined} />
            </span>
          </span>
        </span>
      </Show>
    </>
  );
}

/** The eye, with a stroke that draws itself through it once the secret shows.
 *  The stroke cuts a gap into the eye behind it, so it reads on the filled glyph. */
function RevealEye(props: { struck: boolean }) {
  const cut = createUniqueId();
  const offset = () => (props.struck ? 0 : 1);
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" data-struck={props.struck ? "" : undefined} class="glim-mark">
      <mask id={cut} maskUnits="userSpaceOnUse" x="0" y="0" width="14" height="14">
        <rect width="14" height="14" fill="white" />
        <path d="M1.6 1.6 12.4 12.4" stroke="black" stroke-width="3.4" pathLength="1" stroke-dasharray="1" stroke-dashoffset={offset()} stroke-linecap="round" fill="none" class="glim-secret-slash" />
      </mask>
      <g mask={`url(#${cut})`} innerHTML={MARKS.eye.body} />
      <path d="M1.6 1.6 12.4 12.4" stroke="currentColor" stroke-width="1.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset={offset()} stroke-linecap="round" fill="none" class="glim-secret-slash" />
    </svg>
  );
}
