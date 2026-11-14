<script lang="ts">
  import { Select, type SelectGroup, type SelectOption } from "@glimstone/svelte/Select";
  import { glyph } from "../svelte/glyph";

  let format = $state<string | null>("opus");
  let target = $state<string | null>("local");

  const FORMATS: SelectGroup[] = [
    { entries: [{ value: "best", label: "Auto" }] },
    {
      entries: [
        { value: "opus", label: "Opus" },
        { value: "aac", label: "AAC (M4A)" },
        { value: "mp3", label: "MP3" },
      ],
    },
    {
      heading: "Convert to",
      entries: [
        { value: "flac", label: "FLAC" },
        { value: "wav", label: "WAV" },
      ],
    },
  ];
  const TARGETS: SelectOption[] = [
    { value: "local", label: "This server", glyph: glyph("IconFolder") },
    { value: "cloud", label: "Cloud storage", glyph: glyph("IconCloud") },
    { value: "share", label: "Network share", glyph: glyph("IconFolderOpen"), disabled: true },
  ];
</script>

<div style="display: grid; gap: 16px; width: 260px">
  <Select label="Audio format" bind:value={format} groups={FORMATS} />
  <Select label="Save to" bind:value={target} options={TARGETS} />
</div>
