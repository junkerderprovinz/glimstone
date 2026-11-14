<script lang="ts">
  import { Button, Kbd } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const apply = glyph("IconApply");
</script>

{#snippet before()}<span data-slot="before">3</span>{/snippet}
{#snippet after()}<span data-slot="after"><Kbd>Ctrl+S</Kbd></span>{/snippet}

<div style="display: grid; gap: 12px; justify-items: start; grid-template-columns: minmax(0, 1fr); width: 460px">
  <div data-tight style="display: flex; align-items: center; gap: 8px; width: 100%">
    <span style="flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
      1,204 files moved to the trash on the server
    </span>
    <Button label="Put all 1,204 of them back where they were" labelKey={null} />
  </div>
  <Button label="Release page" labelKey={null} glyph={apply} href="#/guide/palette" />
  <Button label="Closed page" labelKey={null} glyph={apply} href="#/guide/palette" disabled />
  <Button label="Changes" labelKey={null} {before} {after} />
</div>
