<script lang="ts">
  import type { Snippet } from "svelte";

  // Boxes a disabled trigger with a tip in a span that still sees the pointer,
  // since a disabled <button> emits no mouse events. Otherwise the trigger
  // renders as it is.
  let { on, show, hide, children }: { on: boolean; show: () => void; hide: () => void; children: Snippet } = $props();
</script>

{#if on}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <span class="glim-tip-wrap" onmouseenter={show} onmouseleave={hide}>{@render children()}</span>
{:else}
  {@render children()}
{/if}
