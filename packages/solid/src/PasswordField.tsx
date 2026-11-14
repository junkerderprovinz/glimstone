import { createSignal, createUniqueId, mergeProps, Show, splitProps, type JSX } from "solid-js";
import { fieldErrorView, fieldWidthClass, type FieldWidth } from "@glimstone/core";
import { FieldError } from "./FieldError.tsx";
import { useFieldName } from "./fieldName.ts";
import { IconEye, IconEyeOff } from "./glyphs.tsx";
import { IconTipButton } from "./IconTipButton.tsx";

// A field for a secret with the reveal eye inside it ("The reveal eye" in the
// design language). The props are a native <input>'s, so a call site swaps
// `<input type="password"` for `<PasswordField` and keeps its own listeners.
// Inside a FieldRow the row names it.

export interface PasswordFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "width" | "class"> {
  width?: FieldWidth;
  /** Attributes for the eye, such as a data hook. */
  eyeAttrs?: Record<string, string>;
  /** The eye's name and bubble while the secret is hidden, and once it shows. */
  text?: { show: string; hide: string };
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  /** Classes for the wrapper, which carries the field's width. */
  class?: string;
}

export function PasswordField(props: PasswordFieldProps) {
  const merged = mergeProps({ text: { show: "Show", hide: "Hide" } }, props);
  const [own, rest] = splitProps(merged, ["width", "eyeAttrs", "text", "error", "class", "ref", "disabled", "aria-label", "aria-describedby"]);
  const [shown, setShown] = createSignal(false);
  const name = useFieldName(() => own["aria-label"]);
  const fallback = createUniqueId();
  const err = () => fieldErrorView(own.error, rest.id ?? fallback, own["aria-describedby"]);
  return (
    <>
      <span data-glim="PasswordField" class={["glim-secret", fieldWidthClass(own.width), own.class].filter(Boolean).join(" ")}>
        <input
          autocomplete="current-password"
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
        <IconTipButton {...own.eyeAttrs} tip={shown() ? own.text.hide : own.text.show} class="glim-secret-eye" disabled={own.disabled} onClick={() => setShown(!shown())}>
          <Show when={shown()} fallback={<IconEye />}>
            <IconEyeOff />
          </Show>
        </IconTipButton>
      </span>
      <Show when={err().errorId}>{(id) => <FieldError id={id()}>{own.error}</FieldError>}</Show>
    </>
  );
}
