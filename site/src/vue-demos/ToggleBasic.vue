<script setup lang="ts">
import { ref } from "vue";
import { Toggle } from "@glimstone/vue";

const quiet = ref(true);
const sound = ref(false);
</script>

<template>
  <div style="display: grid; gap: 16px">
    <Toggle id="quiet-notifications" v-model="quiet" data-hook="quiet" class="demo-toggle" label="Quiet notifications" />
    <Toggle v-model="sound" label="Play a sound" :disabled="!quiet" />
  </div>
</template>
