<script lang="ts">
  import { SignaturePad } from "@glimstone/svelte/SignaturePad";

  let strokes = $state<string[]>([]);
</script>

<div style="width: min(26rem, 100%); display: grid; gap: 12px">
  <SignaturePad label="Signed for the handover" bind:value={strokes} />
  <span>{strokes.length === 0 ? "Not signed yet" : `Signed in ${strokes.length} ${strokes.length === 1 ? "stroke" : "strokes"}`}</span>
</div>
