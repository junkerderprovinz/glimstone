<script setup lang="ts">
import { Selector } from "@glimstone/vue";
defineProps<{ phone: boolean }>();
const pick = defineModel<string>();
</script>

<template>
  <Selector v-model="pick" :items="[]" />
  <Selector v-model="pick" :items="[]" fit />
  <Selector v-model="pick" :items="[]" />
</template>
