<script setup lang="ts">
import { ref } from "vue";
import { AngleSlider } from "@glimstone/vue/AngleSlider";

const angle = ref(90);
</script>

<template>
  <AngleSlider v-model="angle" label="Turn the picture" />
</template>
