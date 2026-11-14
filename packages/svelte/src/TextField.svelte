<script lang="ts" module>
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { FieldWidth } from "@glimstone/core";

  export type { FieldWidth } from "@glimstone/core";

  export interface TextFieldProps extends Omit<HTMLInputAttributes, "width" | "class"> {
    /** The accessible name. Inside a FieldRow the row gives it. */
    label?: string;
    /** Sets a path or a token in monospace. */
    mono?: boolean;
    width?: FieldWidth;
    /** Why the value cannot stand, as a line under the field until it is fixed. */
    error?: string;
    class?: string;
    /** The <input>, bound with `bind:ref`. */
    ref?: HTMLInputElement | null;
  }
</script>

<script lang="ts">
  import { fieldErrorView, textFieldClass } from "@glimstone/core";
  import FieldError from "./FieldError.svelte";
  import { useFieldName } from "./fieldName.js";

  // A line of text: borderless and filled, focus a step up the ramp (rule 14).
  // The props are a native element's, so a call site swaps
  // `<input class="glim-input"` for `<TextField` and keeps its own listeners;
  // the text is bound with `bind:value`.
  let {
    label,
    mono,
    width,
    error,
    class: className,
    type = "text",
    id,
    "aria-describedby": describedBy,
    value = $bindable(),
    ref = $bindable(null),
    ...rest
  }: TextFieldProps = $props();

  const name = useFieldName(() => label);
  const own = $props.id();
  const err = $derived(fieldErrorView(error, id ?? own, describedBy ?? undefined));
</script>

<input
  data-glim="TextField"
  aria-label={name()}
  {...rest}
  bind:this={ref}
  bind:value
  {id}
  aria-invalid={err.invalid}
  aria-describedby={err.describedBy}
  {type}
  class={`${textFieldClass({ width, mono })} ${className ?? ""}`.trim()}
/>
{#if err.errorId}<FieldError id={err.errorId}>{error}</FieldError>{/if}
