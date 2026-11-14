<script lang="ts">
  import { Selector } from "@glimstone/svelte";

  const LEVELS = [
    { id: 1, label: "Fast", attrs: { "data-level": "1" } },
    { id: 5, label: "Even", attrs: { "data-level": "5" } },
    { id: 9, label: "Small", attrs: { "data-level": "9" } },
  ];

  let level = $state(5);
  let presses = $state(0);
</script>

<div style="display: grid; gap: 8px; justify-items: start; width: 100%">
  <Selector label="Compression" items={LEVELS} bind:value={level} onPress={() => presses++} activation="manual" size="sm" inline />
  <output class="glim-num">Value {JSON.stringify(level)}, pressed {presses}</output>
</div>
