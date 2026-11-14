<script lang="ts">
  import { Timer } from "@glimstone/svelte/Timer";

  let done = $state(false);
</script>

<div style="display: grid; gap: 12px; justify-items: start">
  <Timer countdown startMs={3_000} onComplete={() => (done = true)} />
  <span>{done ? "Time is up" : "Three seconds for the test"}</span>
</div>
