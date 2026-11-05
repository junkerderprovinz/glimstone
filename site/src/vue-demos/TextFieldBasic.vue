<script setup lang="ts">
import { ref } from "vue";
import { TextArea, TextField } from "@glimstone/vue";

const name = ref("backup-weekly");
const port = ref("8080");
const notes = ref("");
</script>

<template>
  <div data-column style="display: grid; gap: 8px; width: 400px; justify-items: start">
    <TextField v-model="name" label="Job name" width="wide" />
    <TextField label="Group" width="medium" placeholder="None" />
    <TextField v-model="port" label="Port" width="short" mono maxlength="5" data-hook="port" />
    <TextField label="Address" mono placeholder="smb://server/share" />
    <TextArea v-model="notes" label="Notes" rows="3" placeholder="What this job is for" />
    <output>{{ name }}</output>
  </div>
</template>
