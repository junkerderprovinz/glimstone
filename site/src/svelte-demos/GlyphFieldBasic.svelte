<script lang="ts">
  import { FieldRow, GlyphField, IconButton } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  let query = $state("");
  let cleared = $state(0);
  const clear = () => {
    query = "";
    cleared++;
  };
</script>

{#snippet clearButton()}<IconButton tip="Clear" glyph={glyph("IconClose")} onclick={clear} />{/snippet}

<div style="display: grid; gap: 8px; width: 360px">
  <GlyphField
    label="Filter"
    glyph={glyph("IconSearch")}
    placeholder="Filter this folder"
    class="demo-filter"
    data-hook="filter"
    bind:value={query}
    after={clearButton}
  />
  <FieldRow label="From the row">
    <GlyphField glyph={glyph("IconFolder")} mono width="medium" value="/mnt/user" />
  </FieldRow>
  <output>Cleared {cleared}</output>
</div>
