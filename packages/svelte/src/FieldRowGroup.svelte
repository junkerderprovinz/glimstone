<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export interface FieldRowGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "class" | "style" | "children"> {
    /** The FieldRows. */
    children: Snippet;
    /** Rows side by side, each column lining up its own names. A `wide` row spans them all. */
    columns?: 1 | 2;
    class?: string;
    style?: string;
  }
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { FIELD_ROW_GROUP } from "./fieldName.js";

  // Rows that share one column for their names, as wide as the longest, so fields
  // that grow start at one edge. The rows stand directly inside it.
  let { children, columns, class: className, style, ...rest }: FieldRowGroupProps = $props();

  setContext(FIELD_ROW_GROUP, true);
</script>

<div
  data-glim="FieldRowGroup"
  {...rest}
  style={columns ? [style, `--field-columns: ${columns}`].filter(Boolean).join("; ") : style}
  class={className ? `glim-field-row-group ${className}` : "glim-field-row-group"}
>
  {@render children()}
</div>
