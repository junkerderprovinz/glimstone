<script lang="ts">
  import { Select, type SelectWidth } from "@glimstone/svelte/Select";

  const KEEP = [
    { value: "d", label: "Days" },
    { value: "m", label: "Months" },
    { value: "x", label: "Until somebody removes them" },
  ];
  // Each row is a settings row: the name at the start, the select at the end.
  const ROWS: { width: SelectWidth; room: number }[] = [
    { width: "fill", room: 360 },
    { width: "steady", room: 360 },
    { width: "squeeze", room: 200 },
    { width: "hug", room: 360 },
  ];
  const values = $state<Record<string, string | null>>({ fill: "d", steady: "d", squeeze: "d", hug: "d" });
</script>

<div style="display: grid; gap: 12px">
  {#each ROWS as r (r.width)}
    <div data-width={r.width} style="display: flex; align-items: center; gap: 12px; width: {r.room}px">
      <span style="flex: none; width: 64px; color: var(--carbon-text-sub)">{r.width}</span>
      <Select label={`Keep backups, ${r.width}`} hideLabel width={r.width} options={KEEP} bind:value={values[r.width]} />
    </div>
  {/each}
</div>
