import { createEffect, createUniqueId, mergeProps, on, onCleanup, onMount, Show, splitProps, type JSX } from "solid-js";
import { attachNumberSteppers, fieldErrorView, syncNumberSteppers } from "@glimstone/core";
import { FieldError } from "./FieldError.tsx";
import { useFieldName } from "./fieldName.ts";

// A number input with its two steppers inside the field; the steppers, the
// wheel and the greying at the ends come from numberField.ts in the core. The
// props are a native <input>'s, so a call site swaps `<input type="number"`
// for `<NumberField`. Inside a FieldRow the row names it.

export interface NumberFieldProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "class" | "ref"> {
  /** The bounds and the step. The steppers, the arrow keys and the wheel all
   *  go through the input's own stepUp(), so the range lives here alone. */
  min?: number | string;
  max?: number | string;
  step?: number | string;
  /** Called alike for typing, the arrow keys, the steppers and the wheel,
   *  which steps the value only while the field has focus. */
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
  /** Classes for the input. A width set here has to be definite, since the
   *  arrows sit against the input's end. */
  class?: string;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

export function NumberField(props: NumberFieldProps) {
  const merged = mergeProps({ class: "" }, props);
  const [own, rest] = splitProps(merged, ["class", "ref", "error", "onChange", "aria-label", "aria-describedby"]);
  const name = useFieldName(() => own["aria-label"]);
  const fallback = createUniqueId();
  const err = () => fieldErrorView(own.error, rest.id ?? fallback, own["aria-describedby"]);
  let input!: HTMLInputElement;

  onMount(() => onCleanup(attachNumberSteppers(input)));

  // A value the app sets fires no input event, so the arrows look again.
  createEffect(
    on(
      () => [rest.value, rest.min, rest.max, rest.step, rest.disabled, rest.readonly],
      () => syncNumberSteppers(input),
    ),
  );

  return (
    <>
      <span data-glim="NumberField" class="glim-num-wrap">
        <input
          {...rest}
          aria-label={name()}
          aria-invalid={err().invalid}
          aria-describedby={err().describedBy}
          ref={(el) => {
            input = el;
            if (typeof own.ref === "function") own.ref(el);
          }}
          onInput={(e) => own.onChange?.(e)}
          type="number"
          class={`glim-num-input glim-num-field glim-num ${own.class}`.trim()}
        />
      </span>
      <Show when={err().errorId}>{(id) => <FieldError id={id()}>{own.error}</FieldError>}</Show>
    </>
  );
}
