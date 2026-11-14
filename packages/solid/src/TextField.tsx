import { createUniqueId, mergeProps, Show, splitProps, type JSX } from "solid-js";
import { fieldErrorView, textFieldClass, type FieldWidth } from "@glimstone/core";
import { FieldError } from "./FieldError.tsx";
import { useFieldName } from "./fieldName.ts";

export type { FieldWidth } from "@glimstone/core";

// A line of text and a few lines of text: borderless and filled, focus a step
// up the ramp (rule 14). The props are a native element's, so a call site swaps
// `<input class="glim-input"` for `<TextField` and keeps its own listeners.

export interface TextFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "width" | "class"> {
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets a path or a token in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  class?: string;
}

export function TextField(props: TextFieldProps) {
  const merged = mergeProps({ type: "text" }, props);
  const [own, rest] = splitProps(merged, ["label", "mono", "width", "error", "class", "type", "id", "aria-describedby"]);
  const name = useFieldName(() => own.label);
  const fallback = createUniqueId();
  const err = () => fieldErrorView(own.error, own.id ?? fallback, own["aria-describedby"]);
  return (
    <>
      <input
        data-glim="TextField"
        aria-label={name()}
        {...rest}
        id={own.id}
        aria-invalid={err().invalid}
        aria-describedby={err().describedBy}
        type={own.type}
        class={`${textFieldClass({ width: own.width, mono: own.mono })} ${own.class ?? ""}`.trim()}
      />
      <Show when={err().errorId}>{(id) => <FieldError id={id()}>{own.error}</FieldError>}</Show>
    </>
  );
}

export interface TextAreaProps extends Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "class"> {
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets the text in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  class?: string;
}

export function TextArea(props: TextAreaProps) {
  const [own, rest] = splitProps(props, ["label", "mono", "width", "error", "class", "id", "aria-describedby"]);
  const name = useFieldName(() => own.label);
  const fallback = createUniqueId();
  const err = () => fieldErrorView(own.error, own.id ?? fallback, own["aria-describedby"]);
  return (
    <>
      <textarea
        data-glim="TextArea"
        aria-label={name()}
        {...rest}
        id={own.id}
        aria-invalid={err().invalid}
        aria-describedby={err().describedBy}
        class={`${textFieldClass({ width: own.width, mono: own.mono, area: true })} ${own.class ?? ""}`.trim()}
      />
      <Show when={err().errorId}>{(id) => <FieldError id={id()}>{own.error}</FieldError>}</Show>
    </>
  );
}
