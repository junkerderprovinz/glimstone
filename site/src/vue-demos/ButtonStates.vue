<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@glimstone/vue";

const busy = ref(false);
function run() {
  busy.value = true;
  setTimeout(() => (busy.value = false), 1800);
}
</script>

<template>
  <Button label="Back up now" label-key="backup" tone="accent" :busy="busy" :title="busy ? 'Backing up' : undefined" @click="run" />
  <Button label="Download" label-key="download" disabled title="Nothing to download yet" />
  <Button label="Edit" label-key="edit" variant="icon" />
  <Button label="Remove /mnt/user/media" :label-key="null" variant="chip" tone="subtle" />
</template>
