import { useId, useLayoutEffect, useRef, type InputHTMLAttributes, type Ref, type TextareaHTMLAttributes } from "react";
import { fieldErrorView, fitTextArea, textFieldClass, type FieldWidth } from "@glimstone/core";
import { FieldErrorLine } from "./fieldErrorLine.tsx";
import { useFieldName } from "./fieldName.ts";

export type { FieldWidth } from "@glimstone/core";

// A line of text and a few lines of text: borderless and filled, focus a step
// up the ramp (rule 14). The props are a native element's, so a call site swaps
// `<input className="glim-input"` for `<TextField` and keeps its own onChange.

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "width"> {
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets a path or a token in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ label, mono, width, error, className, type = "text", id, "aria-describedby": describedBy, ...rest }: TextFieldProps) {
  const name = useFieldName(label);
  const own = useId();
  const err = fieldErrorView(error, id ?? own, describedBy);
  return (
    <>
      <input
        data-glim="TextField"
        aria-label={name}
        {...rest}
        id={id}
        aria-invalid={err.invalid}
        aria-describedby={err.describedBy}
        type={type}
        className={`${textFieldClass({ width, mono })} ${className ?? ""}`.trim()}
      />
      <FieldErrorLine id={err.errorId} error={error} />
    </>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** The accessible name. Inside a FieldRow the row gives it. */
  label?: string;
  /** Sets the text in monospace. */
  mono?: boolean;
  width?: FieldWidth;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ label, mono, width, error, className, id, ref, onInput, "aria-describedby": describedBy, ...rest }: TextAreaProps) {
  const name = useFieldName(label);
  const own = useId();
  const err = fieldErrorView(error, id ?? own, describedBy);
  const area = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => fitTextArea(area.current), [rest.value]);
  return (
    <>
      <textarea
        data-glim="TextArea"
        aria-label={name}
        {...rest}
        ref={(el) => {
          area.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        onInput={(e) => {
          fitTextArea(e.currentTarget);
          onInput?.(e);
        }}
        id={id}
        aria-invalid={err.invalid}
        aria-describedby={err.describedBy}
        className={`${textFieldClass({ width, mono, area: true })} ${className ?? ""}`.trim()}
      />
      <FieldErrorLine id={err.errorId} error={error} />
    </>
  );
}
