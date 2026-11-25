<script lang="ts">
  import { MultiSelect } from "@glimstone/svelte/MultiSelect";

  const KINDS = [
    "Photos", "Videos", "Music", "Documents", "Spreadsheets", "Presentations", "Archives", "Disk images",
    "E-books", "Fonts", "Subtitles", "Source code",
  ].map((k) => ({ value: k.toLowerCase().replace(/ /g, "-"), label: k }));
  let kinds = $state(["photos"]);
</script>

<div style="width: 320px">
  <MultiSelect label="File kinds" options={KINDS} bind:value={kinds} placeholder="Pick file kinds" />
</div>
