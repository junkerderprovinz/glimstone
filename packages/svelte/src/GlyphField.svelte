<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { FieldWidth } from "@glimstone/core";

  export interface GlyphFieldProps extends Omit<HTMLInputAttributes, "width" | "class"> {
    glyph: Snippet;
    /** The accessible name. Inside a FieldRow the row gives it. */
    label?: string;
    /** Controls inside the box, after the field, such as a clear button. */
    after?: Snippet;
    /** Sets a path or a token in monospace. */
    mono?: boolean;
    width?: FieldWidth;
    /** Classes for the box, which carries the width. */
    class?: string;
    /** The input, bound with `bind:ref`. */
    ref?: HTMLInputElement | null;
  }
</script>

<script lang="ts">
  import { fieldWidthClass } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";

  // A field with a glyph inside it, such as a filter or a search, bound with
  // `bind:value`. The box is the field: it steps up the ramp while the input has
  // focus (rule 14), and being a <label> it hands a click on the glyph to the
  // input. The other props of an <input> go to the input.
  let {
    glyph,
    label,
    after,
    mono,
    width,
    class: className,
    style,
    type = "text",
    value = $bindable(),
    ref = $bindable(null),
    ...rest
  }: GlyphFieldProps = $props();

  const name = useFieldName(() => label);
  const classes = $derived(["glim-input", "glim-glyph-field", fieldWidthClass(width), mono && "glim-input--mono", className].filter(Boolean).join(" "));
</script>

<label data-glim="GlyphField" class={classes} {style}>
  <span class="glim-glyph-field-glyph" aria-hidden="true">{@render glyph()}</span>
  <input aria-label={name()} {...rest} bind:value bind:this={ref} {type} class="glim-glyph-field-input" />
  {@render after?.()}
</label>
