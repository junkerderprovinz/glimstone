<script setup lang="ts">
import { ref } from "vue";
import { Rating } from "@glimstone/vue/Rating";

const stars = ref(3);
const average = ref(3.5);
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <Rating v-model="stars" label="How well did the update go?" />
    <Rating v-model="average" label="Average of all answers" allow-half read-only />
    <span class="glim-num">{{ `${stars} of 5` }}</span>
  </div>
</template>
