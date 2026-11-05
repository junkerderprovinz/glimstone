<script setup lang="ts">
import { GlyphTile } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const folder = glyph("IconFolder");
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
    <span data-tile="plain"><GlyphTile :glyph="folder" /></span>
    <span data-tile="quiet"><GlyphTile :glyph="folder" quiet /></span>
    <span data-tile="ground"><GlyphTile :glyph="folder" ground /></span>
    <span data-tile="active"><GlyphTile :glyph="folder" active /></span>
    <button type="button" data-tile="reached" class="demo-dense-row">
      <GlyphTile :glyph="folder" />
      Reached
    </button>
  </div>
</template>
