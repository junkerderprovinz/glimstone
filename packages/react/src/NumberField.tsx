import { useEffect, useId, useRef, type ChangeEventHandler, type InputHTMLAttributes, type Ref } from "react";
import { attachNumberSteppers, fieldErrorView, syncNumberSteppers } from "@glimstone/core";
import { FieldError } from "./FieldError.tsx";
import { useFieldName } from "./fieldName.ts";

// A number input with its two steppers inside the field; the steppers, the
// wheel and the greying at the ends come from numberField.ts in the core.
//
// The props are a native <input>'s, so a call site swaps `<input type="number"`
// for `<NumberField` and keeps its own onChange. It draws the wrap itself:
// React removes a node from the parent it put it in, so an input the helper
// moved into a span of its own would take the page down the first time the
// field is hidden while its row stays. Inside a FieldRow the row names it.

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** The bounds and the step. The steppers, the arrow keys and the wheel all
   *  go through the input's own stepUp(), so the range lives here alone. */
  min?: number | string;
  max?: number | string;
  step?: number | string;
  /** Called alike for typing, the arrow keys, the steppers and the wheel,
   *  which steps the value only while the field has focus. */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /** Classes for the input. A width set here has to be definite, since the
   *  arrows sit against the input's end. */
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function NumberField({ className = "", ref, error, "aria-label": ariaLabel, "aria-describedby": describedBy, ...rest }: NumberFieldProps) {
  const name = useFieldName(ariaLabel);
  const id = useId();
  const err = fieldErrorView(error, rest.id ?? id, describedBy);
  const own = useRef<HTMLInputElement | null>(null);

  useEffect(() => attachNumberSteppers(own.current!), []);

  // A value the app sets fires no input event, so the arrows look again.
  useEffect(() => {
    syncNumberSteppers(own.current!);
  }, [rest.value, rest.min, rest.max, rest.step, rest.disabled, rest.readOnly]);

  return (
    <>
      <span data-glim="NumberField" className="glim-num-wrap">
        <input
          {...rest}
          aria-label={name}
          aria-invalid={err.invalid}
          aria-describedby={err.describedBy}
          ref={(el) => {
            own.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          type="number"
          className={`glim-num-input glim-num-field glim-num ${className}`.trim()}
        />
      </span>
      {err.errorId && <FieldError id={err.errorId}>{error}</FieldError>}
    </>
  );
}
