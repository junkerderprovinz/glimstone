<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { PillTone } from "@glimstone/core";

  export type { PillTone } from "@glimstone/core";

  export interface PillProps {
    children: Snippet;
    /** `state` lifts a word that says what the row is doing; the other three
     *  wash the pill in their state colour. */
    tone?: PillTone;
    /** Extra classes, such as `glim-num` for figures that line up in a column. */
    class?: string;
  }
</script>

<script lang="ts">
  import { pillClassName } from "@glimstone/core";

  // One value of a list row, such as a size, a date or a state; pillClassName()
  // in the core says why it is not a Badge.
  let { children, tone = "neutral", class: className }: PillProps = $props();
</script>

<span data-glim="Pill" class={className ? `${pillClassName(tone)} ${className}` : pillClassName(tone)}>{@render children()}</span>
