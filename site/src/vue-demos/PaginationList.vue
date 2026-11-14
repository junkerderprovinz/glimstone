<script setup lang="ts">
import { ref } from "vue";
import { Pagination } from "@glimstone/vue/Pagination";

const page = ref(1);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <Pagination v-model:page="page" :count="195" />
    <span class="glim-num">{{ `Backups ${(page - 1) * 10 + 1} to ${Math.min(page * 10, 195)} of 195` }}</span>
  </div>
</template>
