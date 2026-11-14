<script lang="ts">
  import { Meter } from "@glimstone/svelte";

  const row = "display: flex; align-items: center; gap: 10px";
</script>

<div style="display: grid; gap: 14px; width: 320px">
  <span style={row}>disk1 <Meter size="small" value={0.42} label="disk1" valueText="2.3 TB free of 4 TB" /></span>
  <span style={row}>cache <Meter size="small" value={0.95} label="cache" valueText="50 GB free of 1 TB" /></span>
  <span style={row}>disk2 <Meter size="small" label="disk2" /></span>
  <Meter value={0.31} label="media" valueText="5.5 TB free of 8 TB" />
  <Meter value={0.92} label="backups" valueText="320 GB free of 4 TB" />
</div>
