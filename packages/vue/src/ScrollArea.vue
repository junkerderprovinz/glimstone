<script setup lang="ts">
import { computed, useId } from "vue";
import * as scrollArea from "@zag-js/scroll-area";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { pageDir } from "@glimstone/core";

// A box that scrolls its content behind thin bars of the house's own, instead
// of the platform's, which draw a different width and colour on every system.
// The box is a region a keyboard can reach and scroll with the arrow keys.
defineProps<{
  /** The region's accessible name. */
  label: string;
  /** How tall it grows before it scrolls, as a CSS length. */
  maxHeight: string;
}>();

const id = useId();
const service = useMachine(scrollArea.machine, { id, dir: pageDir() });
const api = computed(() => scrollArea.connect(service, normalizeProps));
const viewport = computed(() => api.value.getViewportProps());
</script>

<template>
  <div data-glim="ScrollArea" v-bind="api.getRootProps()" class="glim-scroll">
    <div v-bind="viewport" role="region" :aria-label="label" tabindex="0" :style="[viewport.style, { maxHeight }]" class="glim-scroll-viewport">
      <div v-bind="api.getContentProps()" class="glim-scroll-content"><slot /></div>
    </div>
    <div v-bind="api.getScrollbarProps({ orientation: 'vertical' })" class="glim-scroll-bar">
      <div v-bind="api.getThumbProps({ orientation: 'vertical' })" class="glim-scroll-thumb" />
    </div>
    <div v-bind="api.getScrollbarProps({ orientation: 'horizontal' })" class="glim-scroll-bar">
      <div v-bind="api.getThumbProps({ orientation: 'horizontal' })" class="glim-scroll-thumb" />
    </div>
    <div v-bind="api.getCornerProps()" class="glim-scroll-corner" />
  </div>
</template>
