<script lang="ts">
  import { IconButton, ListRow, Pill } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const folder = glyph("IconFolder");
  let opened = $state(0);
</script>

{#snippet buttons()}
  <IconButton tip="Edit" glyph={glyph("IconPencil")} />
  <IconButton tip="Delete" glyph={glyph("IconTrash")} />
{/snippet}
{#snippet nightly()}
  <Pill class="glim-num">2.4 GB</Pill>
  <Pill tone="ok">Settled</Pill>
{/snippet}
{#snippet archive()}<Pill class="glim-num">880 MB</Pill>{/snippet}
{#snippet season()}<Pill class="glim-num">12 GB</Pill>{/snippet}

<div style="display: grid; gap: 2px; width: 100%; max-width: 560px">
  <ListRow name="nightly-backup" tip="Runs at three in the morning." onclick={() => opened++} tile={folder} badges={nightly} actions={buttons} />
  <ListRow name="archive-copy" tile={glyph("IconCloud")} badges={archive} actions={buttons} />
  <ListRow
    name="/mnt/user/media/series/a-very-long-name-that-does-not-fit-beside-its-badges-and-its-buttons-in-one-row/season-01"
    mono
    tile={folder}
    badges={season}
    actions={buttons}
  />
  <output>Opened {opened}</output>
</div>
