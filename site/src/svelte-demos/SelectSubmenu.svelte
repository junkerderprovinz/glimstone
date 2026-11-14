<script lang="ts">
  import { Select, type SelectGroup } from "@glimstone/svelte/Select";

  const zone = (z: string) => ({ value: z, label: z.split("/").pop()!.replace("_", " ") });
  let value = $state<string | null>("Europe/Vienna");
  const GROUPS: SelectGroup[] = [
    { entries: [{ value: "UTC", label: "UTC" }] },
    {
      heading: "By region",
      entries: [
        { label: "Europe", options: ["Europe/Berlin", "Europe/Lisbon", "Europe/Vienna"].map(zone) },
        { label: "America", options: ["America/Chicago", "America/Los_Angeles", "America/New_York"].map(zone) },
        { label: "Asia", options: ["Asia/Kolkata", "Asia/Tokyo"].map(zone) },
      ],
    },
  ];
</script>

<div style="width: 260px">
  <Select label="Server time zone" bind:value groups={GROUPS} />
</div>
