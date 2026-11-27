<script setup lang="ts">
import { computed } from "vue";
import { meterFigure, meterShowsValue, meterView, type MeterSize } from "@glimstone/core";
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
    /** The figure beside the track, such as "1.4 / 2 TB". The percentage when left out. */
    figure?: string;
    /** Shows the figure beside the track. On by default for `medium`, off for `small` and `quiet`. */
    showValue?: boolean;
  }>(),
  { value: null, size: "medium", threshold: 0.9, quiet: false, showValue: undefined },
);
const view = computed(() => meterView(props.value, { size: props.size, threshold: props.threshold, quiet: props.quiet }));
const busy = computed(() => view.value.percent === null);
const bubble = useTipBubble(() => props.valueText);
const shown = computed(() => meterShowsValue(props.size, props.quiet, props.showValue));
</script>

<!-- The figure repeats what the meter already says, so a screen reader hears it once. -->
<template>
  <span v-if="shown" :class="['glim-meter-row', `glim-meter-row--${size}`]">
    <span
      data-glim="Meter"
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
    <span class="glim-meter-value glim-num" aria-hidden="true">{{ meterFigure(view.percent, figure) }}</span>
    <TipBubble :state="bubble" />
  </span>
  <template v-else>
    <span
      data-glim="Meter"
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
</template>
