<script setup lang="ts">
import { Accordion } from "@glimstone/vue/Accordion";

const questions = [
  { value: "where", title: "Where are the backups kept?", answer: "In the storage locations of the entry, the newest first." },
  { value: "how-long", title: "How long is a backup kept?", answer: "As long as the retention of its schedule says, thirty days unless it was changed." },
  { value: "restore", title: "Can a single file be restored?", answer: "Yes. Open the backup, pick the file and choose Restore." },
];
</script>

<template>
  <div style="width: min(32rem, 100%)">
    <Accordion :items="questions">
      <template #content="{ item }">{{ item.answer }}</template>
    </Accordion>
  </div>
</template>
