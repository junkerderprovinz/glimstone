<script setup lang="ts">
import { ref } from "vue";
import { Steps } from "@glimstone/vue/Steps";

const steps = [
  { title: "Kind", body: "Pick where the backups go: a folder, a server or a cloud." },
  { title: "Address", body: "Name the place, such as the share and the folder on it." },
  { title: "Check", body: "A first test writes a file there and reads it back." },
];
const finished = ref(false);
</script>

<template>
  <div style="width: min(34rem, 100%); display: grid; gap: 12px">
    <Steps :items="steps" @finish="finished = true">
      <template #content="{ item }">{{ item.body }}</template>
    </Steps>
    <span class="glim-num">{{ finished ? "Storage location added" : "Not added yet" }}</span>
  </div>
</template>
