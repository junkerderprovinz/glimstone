<script setup lang="ts">
import { ToastViewport } from "@glimstone/vue";
defineProps<{ toasts: { id: number; text: string }[] }>();
const hold = () => {};
const go = () => {};
</script>

<template>
  <ToastViewport :toasts="toasts" @mouse-enter="hold" @mouse-leave="go" v-on:focus="hold" @blur.self="go" />
  <ToastViewport
    :toasts="toasts"
    @mouse-enter="hold"
    @dismiss="go"
  />
  <ListRow @enter="hold" />
</template>
