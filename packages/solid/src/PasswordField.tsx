import { createEffect, createSignal, createUniqueId, on, Show, splitProps, type JSX } from "solid-js";
import { fieldErrorView, fieldWidthClass, PASSWORD_FIELD_TEXT, passwordConfirmView, type FieldWidth, type PasswordFieldText } from "@glimstone/core";
import { FieldError } from "./FieldError.tsx";
import { useFieldName } from "./fieldName.ts";
import { IconEye, IconEyeOff } from "./glyphs.tsx";
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
  const err = () => fieldErrorView(own.error, id(), own["aria-describedby"]);
  const view = () => passwordConfirmView(rest.value === undefined ? typed() : String(rest.value), repeat());
  const mismatch = () => fieldErrorView(view().mismatch ? words().mismatch : undefined, `${id()}-confirm`);
  createEffect(() => {
    if (!view().shown) setRepeat("");
  });
  createEffect(on(() => !!own.confirm && view().confirmed, (confirmed) => own.onConfirmedChange?.(confirmed)));
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
          <Show when={shown()} fallback={<IconEye />}>
            <IconEyeOff />
          </Show>
        </IconTipButton>
      </span>
      <Show when={err().errorId}>{(id) => <FieldError id={id()}>{own.error}</FieldError>}</Show>
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
                onInput={(e) => setRepeat(e.currentTarget.value)}
                aria-invalid={mismatch().invalid}
                aria-describedby={mismatch().describedBy}
                disabled={own.disabled}
                type={repeatShown() ? "text" : "password"}
                class="glim-input"
              />
              <IconTipButton tip={repeatShown() ? words().hide : words().show} class="glim-secret-eye" disabled={own.disabled} onClick={() => setRepeatShown(!repeatShown())}>
                <Show when={repeatShown()} fallback={<IconEye />}>
                  <IconEyeOff />
                </Show>
              </IconTipButton>
            </span>
            <span aria-live="polite" class="glim-secret-confirm-live">
              <Show when={mismatch().errorId}>{(errorId) => <FieldError id={errorId()}>{words().mismatch}</FieldError>}</Show>
            </span>
          </span>
        </span>
      </Show>
    </>
  );
}
