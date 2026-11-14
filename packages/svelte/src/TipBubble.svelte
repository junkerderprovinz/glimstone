<script lang="ts">
  import { lift } from "./lift.js";
  import type { TipBubble } from "./bubble.svelte.js";

  // Lifted to the body, or into an open sheet, so no card's `overflow: hidden` clips it.
  let { state }: { state: TipBubble } = $props();
</script>

{#if state.shown}
  <div {@attach lift} bind:this={state.bubble} id={state.id} role="tooltip" class="glim-bubble glim-fade">{state.text}</div>
{/if}
