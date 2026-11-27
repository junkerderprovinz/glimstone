<script setup lang="ts">
import { HoverCard } from "@glimstone/vue/HoverCard";
import { Glyph } from "../vue/glyph";

const FACTS = [
  { label: "Free", value: "2.1 TB" },
  { label: "Backups", value: "214" },
  { label: "Last run", value: "4 min" },
];
</script>

<template>
  <p style="margin: 0; max-width: 32rem">
    Last night's backup went to
    <HoverCard label="the server in the cellar" href="#/components/hover-card" title="Cellar" meta="Connected, last seen a minute ago" :facts="FACTS">
      <template #media><Glyph name="IconServer" :size="20" /></template>
    </HoverCard>
    and finished in four minutes.
  </p>
</template>
