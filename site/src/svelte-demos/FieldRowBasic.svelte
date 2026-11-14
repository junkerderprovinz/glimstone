<script lang="ts">
  import { CopyField, FieldRow, NumberField, PasswordField, Selector, TextField, Toggle } from "@glimstone/svelte";
  import { Combobox } from "@glimstone/svelte/Combobox";
  import { Select } from "@glimstone/svelte/Select";
  import { Slider } from "@glimstone/svelte/Slider";

  const LEVELS = [
    { id: "fast", label: "Fast" },
    { id: "even", label: "Even" },
    { id: "small", label: "Small" },
  ];
  const KEEP = [
    { value: "week", label: "One week" },
    { value: "month", label: "One month" },
    { value: "year", label: "One year" },
  ];

  const ZONES = [
    { value: "vienna", label: "Vienna" },
    { value: "berlin", label: "Berlin" },
  ];

  let notify = $state(true);
  let level = $state("even");
  let keep = $state("month");
  let volume = $state(40);
  let zone = $state("vienna");
</script>

{#snippet token()}Token <small>optional</small>{/snippet}

<div style="display: grid; gap: 8px; width: 100%; max-width: 560px">
  <FieldRow label="Name" hint="Shown in the list of jobs.">
    <TextField width="medium" value="backup-weekly" />
  </FieldRow>
  <FieldRow label="Notify">
    <Toggle bind:checked={notify} />
  </FieldRow>
  <FieldRow label="Compression">
    <Selector items={LEVELS} bind:value={level} activation="manual" size="sm" buttonHeight />
  </FieldRow>
  <FieldRow label="Keep">
    <Select options={KEEP} bind:value={keep} />
  </FieldRow>
  <FieldRow label="Password">
    <PasswordField width="medium" />
  </FieldRow>
  <FieldRow label="Copies">
    <NumberField value={3} min={1} max={9} />
  </FieldRow>
  <FieldRow label="Link">
    <CopyField value="smb://bottich/media" width="wide" />
  </FieldRow>
  <FieldRow label="Token" drawn={token}>
    <TextField width="medium" />
  </FieldRow>
  <FieldRow label="Mirror">
    <TextField width="medium" label="Its own name" />
  </FieldRow>
  <FieldRow label="Address">
    <TextField width="wide" mono value="smb://bottich/media" />
  </FieldRow>
  <FieldRow label="Share link">
    <TextField width="grow" mono value="https://bottich/s/3f9a" />
  </FieldRow>
  <FieldRow label="Hours">
    <TextField label="From" width="short" value="08:00" />
    <TextField label="To" width="short" value="17:00" />
  </FieldRow>
  <FieldRow label="Volume">
    <Slider bind:value={volume} min={0} max={100} format={(v) => `${v}%`} />
  </FieldRow>
  <FieldRow label="Zone">
    <Combobox options={ZONES} bind:value={zone} empty="No match" toggleLabel="Show all zones" />
  </FieldRow>
  <FieldRow label="Last run" value="2 hours ago" />
  <FieldRow label="Failed" value="3" tone="fail" />
</div>
