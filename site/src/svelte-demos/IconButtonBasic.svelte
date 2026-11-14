<script lang="ts">
  import { IconButton } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  let pressed = $state(0);
  let pinned = $state(false);
</script>

<div style="display: grid; gap: 8px; justify-items: start">
  <div data-row style="display: flex; gap: 2px">
    <IconButton tip="Copy the path" glyph={glyph("IconCopy")} data-hook="copy" onclick={() => pressed++} />
    <IconButton tip="Move up" glyph={glyph("IconMoveUp")} absent />
    <IconButton tip="Delete" glyph={glyph("IconTrash")} disabled onclick={() => pressed++} />
    <IconButton tip="Pin" glyph={glyph("IconPencil")} pressed={pinned} onclick={() => (pinned = !pinned)} />
    <IconButton tip="Open the manual" glyph={glyph("IconBook")} href="#/guide/palette" />
  </div>
  <output>Pressed {pressed}</output>
</div>
