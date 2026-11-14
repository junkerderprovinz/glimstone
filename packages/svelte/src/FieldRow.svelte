<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PillTone } from "@glimstone/core";

  export interface FieldRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "class"> {
    /** The row's name, and the accessible name of the control in it. */
    label: string;
    /** Draws the words in other markup, such as a quiet "optional". The name stays `label`. */
    drawn?: Snippet;
    /** What the row does, drawn as an "(i)" beside the name. */
    hint?: string;
    /** A row with only a value to show holds it as a pill. */
    value?: string | number;
    /** The pill's tone. */
    tone?: PillTone;
    /** In a FieldRowGroup with columns, spans all of them. */
    wide?: boolean;
    /** The control. */
    children?: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  import { getContext, setContext } from "svelte";
  import { pressRowControl } from "@glimstone/core";
  import { FIELD_ROW, FIELD_ROW_GROUP } from "./fieldName.js";
  import InfoBubble from "./InfoBubble.svelte";
  import Pill from "./Pill.svelte";

  // One labelled row of a card or a window (rule 35): the name at its start and
  // the control at its end, which takes its accessible name from `label`.
  let { label, drawn, hint, value, tone, wide, children, class: className, ...rest }: FieldRowProps = $props();

  setContext(FIELD_ROW, () => label);
  const inGroup = getContext<boolean | undefined>(FIELD_ROW_GROUP) ?? false;
  let row: HTMLDivElement;
</script>

{#snippet control()}
  {#if children}{@render children()}{:else if value !== undefined}<Pill class="glim-num" {tone}>{value}</Pill>{/if}
{/snippet}

<div data-glim="FieldRow" {...rest} bind:this={row} class={["glim-field-row", wide && "glim-field-row--wide", className].filter(Boolean).join(" ")}>
  <span class="glim-field-row-name">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <span class="glim-field-row-label" onclick={() => pressRowControl(row)}>{#if drawn}{@render drawn()}{:else}{label}{/if}</span>
    {#if hint}<InfoBubble tip={hint} />{/if}
  </span>
  {#if inGroup}<span class="glim-field-row-controls">{@render control()}</span>{:else}{@render control()}{/if}
</div>
