<script setup lang="ts">
import { computed } from "vue";
import { meterView, type MeterSize } from "@glimstone/core";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";

// A level that stands, such as how full a disk is. meterView() in the core
// decides when it turns red and how it runs without a value. Attributes go to
// the track, beside the bubble.
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    /** From 0 to 1. Without it the meter shows stripes while the level is still being read. */
    value?: number | null;
    /** The accessible name, such as the disk's. */
    label: string;
    /** `small` sits beside a row's name, `medium` is as wide as its column. */
    size?: MeterSize;
    /** From here on the fill is the fault colour. */
    threshold?: number;
    /** Slim and grey, for a footer line or a dense list. Inside a button it takes the accent when the button is reached. */
    quiet?: boolean;
    /** The level in words, such as "120 GB free of 4 TB": read out, and shown in the bubble. */
    valueText?: string;
  }>(),
  { value: null, size: "medium", threshold: 0.9, quiet: false },
);
const view = computed(() => meterView(props.value, { size: props.size, threshold: props.threshold, quiet: props.quiet }));
const busy = computed(() => view.value.percent === null);
const bubble = useTipBubble(() => props.valueText);
</script>

<template>
  <span
    v-bind="$attrs"
    :ref="(el) => (bubble.trigger.value = el as HTMLElement | null)"
    :role="busy ? 'progressbar' : 'meter'"
    :aria-label="label"
    :aria-valuemin="busy ? undefined : 0"
    :aria-valuemax="busy ? undefined : 100"
    :aria-valuenow="view.percent ?? undefined"
    :aria-valuetext="valueText"
    :aria-busy="busy || undefined"
    :class="view.className"
    @mouseenter="bubble.show"
    @mouseleave="bubble.hide"
  >
    <span class="glim-meter-fill" :style="view.width ? { width: view.width } : undefined" />
  </span>
  <TipBubble :state="bubble" />
</template>
