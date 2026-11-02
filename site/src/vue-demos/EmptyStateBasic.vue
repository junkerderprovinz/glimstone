<script setup lang="ts">
import { Button, EmptyState } from "@glimstone/vue";
import { glyph } from "../vue/glyph";

const archive = glyph("IconArchive");
const filter = glyph("IconFilter");
const close = glyph("IconClose");
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 16px; width: 100%">
    <EmptyState :glyph="archive" title="No backups yet" hint="Choose what to back up, and the first run starts tonight.">
      <Button label="Add a backup" label-key="add" />
    </EmptyState>
    <EmptyState :glyph="filter" title="No backups match the filter">
      <Button label="Clear the filter" :label-key="null" :glyph="close" />
    </EmptyState>
  </div>
</template>
