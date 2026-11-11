<script setup lang="ts">
import { ref } from "vue";
import { Card, Selector, SubCard } from "@glimstone/vue";

const pages = ref("all");
const items = [
  { id: "all", label: "All pages" },
  { id: "current", label: "This page" },
  { id: "picked", label: "Picked pages" },
];
</script>

<template>
  <div style="width: 100%; max-width: 440px; padding-top: 12px">
    <Card title="Export">
      <SubCard title="Pages">
        <Selector v-model="pages" label="Pages" orientation="vertical" :items="items" />
      </SubCard>
    </Card>
  </div>
</template>
