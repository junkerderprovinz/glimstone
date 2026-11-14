<script setup lang="ts">
import { computed, useId } from "vue";
import * as timer from "@zag-js/timer";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { TIMER_TEXT, type TimerText } from "@glimstone/core";
import Button from "./Button.vue";
import { IconPause, IconPlay, IconResetArrow } from "./glyphs";

// A clock that counts up from a start or down to zero, such as the time a
// test may run. The figure is data and runs left to right in every language,
// and it takes the accent's ink while it runs, the one moment it is activity.
const props = withDefaults(
  defineProps<{
    /** Counts down from startMs to zero rather than up. */
    countdown?: boolean;
    /** Where it starts, in milliseconds. */
    startMs?: number;
    /** Where a count up stops, in milliseconds. */
    targetMs?: number;
    autoStart?: boolean;
    text?: Partial<TimerText>;
  }>(),
  { countdown: false, startMs: 0, autoStart: false },
);
const emit = defineEmits<{
  /** A countdown reached zero or a count up its target. */
  complete: [];
}>();

const words = computed(() => ({ ...TIMER_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  timer.machine,
  computed(() => ({
    id,
    countdown: props.countdown,
    startMs: props.startMs,
    targetMs: props.targetMs,
    autoStart: props.autoStart,
    interval: 250,
    onComplete: () => emit("complete"),
  })),
);
const api = computed(() => timer.connect(service, normalizeProps));
const spoken = computed(() => words.value.spoken(api.value.time.hours, api.value.time.minutes, api.value.time.seconds));
</script>

<template>
  <div data-glim="Timer" v-bind="api.getRootProps()" class="glim-timer">
    <div v-bind="api.getAreaProps()" role="timer" :aria-label="spoken" :data-running="api.running ? '' : undefined" class="glim-timer-figure glim-num">
      <span v-bind="api.getItemProps({ type: 'hours' })">{{ api.formattedTime.hours }}</span>
      <span v-bind="api.getSeparatorProps()">:</span>
      <span v-bind="api.getItemProps({ type: 'minutes' })">{{ api.formattedTime.minutes }}</span>
      <span v-bind="api.getSeparatorProps()">:</span>
      <span v-bind="api.getItemProps({ type: 'seconds' })">{{ api.formattedTime.seconds }}</span>
    </div>
    <div v-bind="api.getControlProps()" class="glim-timer-control">
      <Button v-if="api.running" :label="words.pause" :label-key="null" :glyph="IconPause" @click="api.pause()" />
      <Button v-else-if="api.paused" :label="words.resume" :label-key="null" :glyph="IconPlay" @click="api.resume()" />
      <Button v-else :label="words.start" :label-key="null" :glyph="IconPlay" @click="api.start()" />
      <Button :label="words.reset" :label-key="null" :glyph="IconResetArrow" @click="api.reset()" />
    </div>
  </div>
</template>
