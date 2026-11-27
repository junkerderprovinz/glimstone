<script lang="ts">
  import { FieldRow, TimePicker, TimeRangePicker } from "@glimstone/svelte";

  let start = $state<string | null>("02:30");
  let quiet = $state<[string | null, string | null]>(["22:00", "07:00"]);
</script>

<div style="display: grid; gap: 8px; width: 100%; max-width: 420px">
  <FieldRow label="Backup starts at">
    <TimePicker bind:value={start} minuteStep={15} />
  </FieldRow>
  <FieldRow label="Quiet hours">
    <TimeRangePicker bind:value={quiet} />
  </FieldRow>
  <span class="glim-num" data-hook="start">{start ? `Runs daily at ${start}` : "No start time"}</span>
  <span class="glim-num" data-hook="quiet">{quiet[0] && quiet[1] ? `Quiet from ${quiet[0]} to ${quiet[1]}` : "No quiet hours"}</span>
</div>
