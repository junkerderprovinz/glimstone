<script lang="ts" generics="T extends string">
  import { faceLabels, type SelectWidth } from "@glimstone/core";
  import type { SelectOption } from "./selectParts.svelte.js";

  // The value on the trigger; see faceLabels in the core.
  let { all, value, placeholder, width, glyphs }: { all: SelectOption<T>[]; value: T | null; placeholder?: string; width: SelectWidth; glyphs: boolean } = $props();
  const face = $derived(faceLabels(all, value, placeholder, width));
  const glyph = $derived(all.find((o) => o.value === value)?.glyph);
</script>

{#if glyphs}
  <span class="glim-select-glyph">{@render glyph?.()}</span>
{/if}
<span class="glim-select-value">
  {#each face.labels as l (l)}
    <span aria-hidden={l !== face.text || undefined} class={l === face.text ? undefined : "glim-select-ghost"}>{l}</span>
  {/each}
</span>
