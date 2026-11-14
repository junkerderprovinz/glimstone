<script lang="ts">
  import { Select, type SelectGroup, type SelectOption } from "@glimstone/svelte/Select";
  import { glyph } from "../svelte/glyph";

  let sort = $state<string | null>("name");
  let app = $state<string | null>("text");

  const SORTS: SelectOption[] = [
    { value: "name", label: "Name", glyph: glyph("IconFile") },
    { value: "size", label: "Size", glyph: glyph("IconHash") },
    { value: "kind", label: "Kind", glyph: glyph("IconCube") },
    { value: "date", label: "Modified", glyph: glyph("IconCalendar") },
  ];
  const APPS: SelectGroup[] = [
    {
      heading: "Viewers",
      entries: [
        { value: "text", label: "Text" },
        { value: "image", label: "Image" },
      ],
    },
    {
      entries: [
        {
          label: "Other",
          options: [
            { value: "hex", label: "Hex" },
            { value: "raw", label: "Raw" },
          ],
        },
      ],
    },
  ];
</script>

<div style="display: grid; gap: 16px; width: 260px">
  <Select label="Sort by" rows="menu" triggerAttrs={{ "data-val": sort ?? "" }} listId="demo-sort-list" bind:value={sort} options={SORTS} />
  <Select label="Open with" rows="menu" triggerAttrs={{ "data-val": app ?? "" }} listId="demo-open-with" bind:value={app} groups={APPS} />
</div>
