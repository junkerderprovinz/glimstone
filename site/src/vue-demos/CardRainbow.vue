<script setup lang="ts">
import { Button, Card } from "@glimstone/vue";

const SECTIONS = ["Sources", "Targets", "Retention"];
</script>

<template>
  <div style="display: grid; gap: 28px; width: 100%; max-width: 420px; padding-top: 12px">
    <Card v-for="(title, i) in SECTIONS" :key="title" :title="title" :hue-index="i">
      <Button label="Add" label-key="add" tone="accent" />
    </Card>
  </div>
</template>
