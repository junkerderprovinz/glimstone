<script setup lang="ts">
import { computed } from "vue";
import { progressView } from "@glimstone/core";

// Work that moves toward its end, such as a copy. A sheen runs over the fill
// while the work does; progressView() in the core says when it stops.
const props = withDefaults(
  defineProps<{
    /** From 0 to 1. Without it the bar runs indeterminate, while the work has no measure yet. */
    value?: number | null;
    /** The accessible name, such as what is being copied. */
    label: string;
    /** The work waits: the fill takes the waiting tone and the sheen stops. */
    paused?: boolean;
    /** The work stopped on an error: the fill takes the fault colour. */
    failed?: boolean;
    /** The progress in words, such as "1.2 GB of 4 GB", read out instead of the percentage. */
    valueText?: string;
  }>(),
  { value: null, paused: false, failed: false },
);
const view = computed(() => progressView(props.value, { paused: props.paused, failed: props.failed }));
</script>

<template>
  <span
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="view.percent === null ? undefined : 0"
    :aria-valuemax="view.percent === null ? undefined : 100"
    :aria-valuenow="view.percent ?? undefined"
    :aria-valuetext="valueText"
    :class="view.className"
  >
    <span class="glim-progress-fill" :style="view.width ? { width: view.width } : undefined" />
  </span>
</template>
