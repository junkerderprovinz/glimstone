<script lang="ts">
  import { DatePicker } from "@glimstone/svelte/DatePicker";

  let day = $state<string | null>("2026-11-20");
</script>

<div style="display: grid; gap: 12px; justify-items: start">
  <DatePicker label="Keep until" bind:value={day} min="2026-11-05" max="2027-03-31" locale="en-GB" />
  <span class="glim-num">{day ? `Kept until ${day}` : "Kept for good"}</span>
</div>
