<script setup lang="ts">
import { Selector } from "@glimstone/vue";
defineProps<{ phone: boolean }>();
const pick = defineModel<string>();
</script>

<template>
  <Selector v-model="pick" :items="[]" pairs-on-phone />
  <Selector v-model="pick" :items="[]" :pairs-on-phone="phone" fit />
  <Selector v-model="pick" :items="[]" :pairsOnPhone="true" />
</template>
