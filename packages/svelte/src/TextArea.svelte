<script lang="ts" module>
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import type { FieldWidth } from "@glimstone/core";

  export interface TextAreaProps extends Omit<HTMLTextareaAttributes, "class"> {
    /** The accessible name. Inside a FieldRow the row gives it. */
    label?: string;
    /** Sets the text in monospace. */
    mono?: boolean;
    width?: FieldWidth;
    /** Why the value cannot stand, as a line under the field until it is fixed. */
    error?: string;
    class?: string;
    /** The <textarea>, bound with `bind:ref`. */
    ref?: HTMLTextAreaElement | null;
  }
</script>

<script lang="ts">
  import { fieldErrorView, textFieldClass } from "@glimstone/core";
  import FieldError from "./FieldError.svelte";
  import { useFieldName } from "./fieldName.js";

  // A few lines of text in the look of a TextField, bound with `bind:value`.
  // The other props of a <textarea> go to the element.
  let {
    label,
    mono,
    width,
    error,
    class: className,
    id,
    "aria-describedby": describedBy,
    value = $bindable(),
    ref = $bindable(null),
    ...rest
  }: TextAreaProps = $props();

  const name = useFieldName(() => label);
  const own = $props.id();
  const err = $derived(fieldErrorView(error, id ?? own, describedBy ?? undefined));
</script>

<textarea
  data-glim="TextArea"
  aria-label={name()}
  {...rest}
  bind:this={ref}
  bind:value
  {id}
  aria-invalid={err.invalid}
  aria-describedby={err.describedBy}
  class={`${textFieldClass({ width, mono, area: true })} ${className ?? ""}`.trim()}
></textarea>
{#if err.errorId}<FieldError id={err.errorId}>{error}</FieldError>{/if}
