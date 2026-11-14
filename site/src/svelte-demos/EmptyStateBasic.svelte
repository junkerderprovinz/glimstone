<script lang="ts">
  import { Button, EmptyState } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";
</script>

{#snippet add()}<Button label="Add a backup" labelKey="add" />{/snippet}
{#snippet clear()}<Button label="Clear the filter" labelKey={null} glyph={glyph("IconClose")} />{/snippet}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 16px; width: 100%">
  <EmptyState glyph={glyph("IconArchive")} title="No backups yet" hint="Choose what to back up, and the first run starts tonight." action={add} />
  <EmptyState glyph={glyph("IconFilter")} title="No backups match the filter" action={clear} />
</div>
