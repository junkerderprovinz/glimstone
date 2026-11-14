<script setup lang="ts">
import { ref } from "vue";
import { FileUpload } from "@glimstone/vue/FileUpload";

const files = ref<File[]>([]);
</script>

<template>
  <div style="width: min(30rem, 100%); display: grid; gap: 12px">
    <FileUpload v-model="files" label="Settings to import" :accept="['application/json']" :max-file-size="1_000_000" />
    <span class="glim-num">{{ files.length === 0 ? "Nothing chosen yet" : `Ready to import ${files[0]!.name}` }}</span>
  </div>
</template>
