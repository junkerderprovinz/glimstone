<script setup lang="ts">
import { ref } from "vue";
import { TagsInput } from "@glimstone/vue/TagsInput";

const labels = ref(["photos", "weekly"]);
</script>

<template>
  <div style="width: min(26rem, 100%); display: grid; gap: 12px">
    <TagsInput v-model="labels" label="Labels" placeholder="Add a label" />
    <span class="glim-num">{{ labels.length === 1 ? "1 label" : `${labels.length} labels` }}</span>
  </div>
</template>
