<script setup lang="ts">
import { ref } from "vue";
import { SignaturePad } from "@glimstone/vue/SignaturePad";

const strokes = ref<string[]>([]);
</script>

<template>
  <div style="width: min(26rem, 100%); display: grid; gap: 12px">
    <SignaturePad v-model="strokes" label="Signed for the handover" />
    <span>{{ strokes.length === 0 ? "Not signed yet" : `Signed in ${strokes.length} ${strokes.length === 1 ? "stroke" : "strokes"}` }}</span>
  </div>
</template>
