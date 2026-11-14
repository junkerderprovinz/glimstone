<script lang="ts">
  import { PinInput } from "@glimstone/svelte/PinInput";

  let code = $state("");
  let done = $state("");
</script>

<div style="display: grid; gap: 12px; justify-items: start">
  <PinInput label="Code from the app" bind:value={code} onComplete={(v) => (done = v)} />
  <span class="glim-num">{done ? `Checking ${done}` : "Waiting for six digits"}</span>
</div>
