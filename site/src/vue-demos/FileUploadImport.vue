<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { FileUpload } from "@glimstone/vue/FileUpload";

const files = ref<File[]>([]);

// Stands in for an upload, so each row shows how far its file has gone.
const sent = ref(new Map<File, number>());
watch(
  files,
  (now, _, onCleanup) => {
    const tick = setInterval(() => {
      if (now.every((file) => sent.value.get(file) === 1)) return;
      sent.value = new Map(now.map((file) => [file, Math.min(1, (sent.value.get(file) ?? 0) + 0.25)]));
    }, 200);
    onCleanup(() => clearInterval(tick));
  },
  { immediate: true },
);
const progress = (file: File) => sent.value.get(file) ?? 0;
const done = computed(() => files.value.filter((f) => progress(f) >= 1).length);
</script>

<template>
  <div style="width: min(30rem, 100%); display: grid; gap: 12px">
    <FileUpload
      v-model="files"
      label="Settings to import"
      :accept="['application/json']"
      :max-files="3"
      :max-file-size="1_000_000"
      :progress="progress"
    />
    <span class="glim-num">{{ files.length === 0 ? "Nothing chosen yet" : `${done} of ${files.length} sent` }}</span>
  </div>
</template>
