<script setup lang="ts">
import { ToastViewport } from "@glimstone/vue";
defineProps<{ toasts: { id: number; text: string }[] }>();
const hold = () => {};
const go = () => {};
</script>

<template>
  <ToastViewport :toasts="toasts" @enter="hold" @leave="go" v-on:focusin="hold" @focusout.self="go" />
  <ToastViewport
    :toasts="toasts"
    @enter="hold"
    @dismiss="go"
  />
  <ListRow @enter="hold" />
</template>
