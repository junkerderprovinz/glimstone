<script lang="ts">
  import { Chart, Sparkline } from "@glimstone/svelte";

  const DAYS = [
    { day: "Mon", photos: 42, documents: 18 },
    { day: "Tue", photos: 38, documents: 22 },
    { day: "Wed", photos: 51, documents: 19 },
    { day: "Thu", photos: 47, documents: 25 },
    { day: "Fri", photos: 56, documents: 21 },
  ];
  const SERIES = [
    { key: "photos", label: "Photos" },
    { key: "documents", label: "Documents" },
  ];
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 480px">
  <Chart label="Gigabytes backed up per day" data={DAYS} x="day" series={SERIES} format={(n) => `${n} GB`} />
  <div style="display: flex; align-items: center; gap: 12px">
    <span>Last seven runs</span>
    <Sparkline label="Minutes per run" values={[4, 6, 5, 8, 7, 6, 9]} />
  </div>
</div>
