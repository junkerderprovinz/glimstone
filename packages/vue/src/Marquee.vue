<script setup lang="ts" generic="T">
import { computed, ref, useId } from "vue";
import * as marquee from "@zag-js/marquee";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { MARQUEE_TEXT, pageDir, type MarqueeText } from "@glimstone/core";
import IconButton from "./IconButton.vue";
import { IconPause, IconPlay } from "./glyphs";

// A row that runs past on its own, such as the names of the people a release
// thanks. It is a continuous animation, so it stops outright at the motion
// level off and under reduced motion, it halts while the pointer or the focus
// is on it, and its own button holds it for good, as WCAG 2.2.2 asks. The
// `item` slot draws one item.
const props = withDefaults(
  defineProps<{
    /** The row's accessible name. */
    label: string;
    items: readonly T[];
    /** How fast it runs, in pixels a second. */
    speed?: number;
    /** Runs the other way. */
    reverse?: boolean;
    text?: Partial<MarqueeText>;
  }>(),
  { speed: 40, reverse: false },
);
defineSlots<{ item(props: { item: T }): unknown }>();

const words = computed(() => ({ ...MARQUEE_TEXT, ...props.text }));
const held = ref(false);
const id = useId();
const service = useMachine(
  marquee.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    speed: props.speed,
    reverse: props.reverse,
    autoFill: true,
    paused: held.value,
    spacing: "var(--space-10)",
    translations: { root: props.label },
  })),
);
const api = computed(() => marquee.connect(service, normalizeProps));
</script>

<template>
  <div data-glim="Marquee" class="glim-marquee-frame">
    <div v-bind="api.getRootProps()" class="glim-marquee">
      <div v-bind="api.getViewportProps()" class="glim-marquee-viewport">
        <div v-for="index in api.contentCount" :key="index - 1" v-bind="api.getContentProps({ index: index - 1 })" class="glim-marquee-content">
          <div v-for="(entry, i) in items" :key="i" v-bind="api.getItemProps()" class="glim-marquee-item"><slot name="item" :item="entry" /></div>
        </div>
      </div>
    </div>
    <IconButton :tip="held ? words.resume : words.pause" :glyph="held ? IconPlay : IconPause" :pressed="held" @click="held = !held" />
  </div>
</template>
