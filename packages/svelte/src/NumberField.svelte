<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";

  export interface NumberFieldProps extends Omit<HTMLInputAttributes, "type" | "class"> {
    /** The bounds and the step. The steppers, the arrow keys and the wheel all
     *  go through the input's own stepUp(), so the range lives here alone. */
    min?: number | string;
    max?: number | string;
    step?: number | string;
    /** Called alike for typing, the arrow keys, the steppers and the wheel,
     *  which steps the value only while the field has focus. */
    onChange?: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
    /** Why the value cannot stand, as a line under the field until it is fixed. */
    error?: string;
    /** Classes for the input. A width set here has to be definite, since the
     *  arrows sit against the input's end. */
    class?: string;
    /** The <input>, bound with `bind:ref`. */
    ref?: HTMLInputElement | null;
  }
</script>

<script lang="ts">
  import { attachNumberSteppers, fieldErrorView, syncNumberSteppers } from "@glimstone/core";
  import FieldError from "./FieldError.svelte";
  import { useFieldName } from "./fieldName.js";

  // A number input with its two steppers inside the field; the steppers, the
  // wheel and the greying at the ends come from numberField.ts in the core. The
  // props are a native <input>'s, so a call site swaps `<input type="number"`
  // for `<NumberField`; the number is bound with `bind:value`, null while the
  // field is empty. Inside a FieldRow the row names it.
  let {
    value = $bindable(),
    class: className = "",
    ref = $bindable(null),
    error,
    onChange,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
    ...rest
  }: NumberFieldProps = $props();

  const name = useFieldName(() => ariaLabel ?? undefined);
  const own = $props.id();
  const err = $derived(fieldErrorView(error, rest.id ?? own, describedBy ?? undefined));

  $effect(() => attachNumberSteppers(ref!));

  // A value the app sets fires no input event, so the arrows look again.
  $effect(() => {
    void [value, rest.min, rest.max, rest.step, rest.disabled, rest.readonly];
    syncNumberSteppers(ref!);
  });
</script>

<span data-glim="NumberField" class="glim-num-wrap">
  <input
    {...rest}
    aria-label={name()}
    aria-invalid={err.invalid}
    aria-describedby={err.describedBy}
    bind:this={ref}
    bind:value
    oninput={(e) => onChange?.(e)}
    type="number"
    class={`glim-num-input glim-num-field glim-num ${className}`.trim()}
  />
</span>
{#if err.errorId}<FieldError id={err.errorId}>{error}</FieldError>{/if}
