<script setup lang="ts">
import { ref } from "vue";
import { MultiSelect } from "@glimstone/vue/MultiSelect";

const KINDS = [
  "Photos", "Videos", "Music", "Documents", "Spreadsheets", "Presentations", "Archives", "Disk images",
  "E-books", "Fonts", "Subtitles", "Source code",
].map((k) => ({ value: k.toLowerCase().replace(/ /g, "-"), label: k }));
const kinds = ref(["photos"]);
</script>

<template>
  <div style="width: 320px">
    <MultiSelect v-model="kinds" label="File kinds" :options="KINDS" placeholder="Pick file kinds" />
  </div>
</template>
