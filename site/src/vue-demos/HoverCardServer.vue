<script setup lang="ts">
import { HoverCard } from "@glimstone/vue/HoverCard";
</script>

<template>
  <p style="margin: 0; max-width: 32rem">
    Last night's backup went to
    <HoverCard label="the server in the cellar" href="#/components/hover-card">
      <template #content>
        <div style="display: grid; gap: 4px">
          <strong>Cellar</strong>
          <span>Connected, 2.1 TB free, last seen a minute ago</span>
        </div>
      </template>
    </HoverCard>
    and finished in four minutes.
  </p>
</template>
