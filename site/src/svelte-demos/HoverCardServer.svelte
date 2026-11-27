<script lang="ts">
  import { HoverCard } from "@glimstone/svelte/HoverCard";
  import { glyph } from "../svelte/glyph";

  const FACTS = [
    { label: "Free", value: "2.1 TB" },
    { label: "Backups", value: "214" },
    { label: "Last run", value: "4 min" },
  ];
</script>

<p style="margin: 0; max-width: 32rem">
  Last night's backup went to
  <HoverCard label="the server in the cellar" href="#/components/hover-card" media={glyph("IconServer", 20)} title="Cellar" meta="Connected, last seen a minute ago" facts={FACTS} />
  and finished in four minutes.
</p>
