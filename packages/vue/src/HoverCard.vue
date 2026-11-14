<script setup lang="ts">
import { computed, ref, useId } from "vue";
import * as hoverCard from "@zag-js/hover-card";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { pageDir, portalTarget } from "@glimstone/core";
import { usePortalHue } from "./selectParts";

// A card that shows what a link leads to while the pointer rests on it or the
// keyboard reaches it, such as the details of a server named in a sentence.
// It only previews: everything in it is also behind the link, so a touch
// screen, which has no hover, loses nothing. The `content` slot draws the card.
const props = withDefaults(
  defineProps<{
    /** The link's words. */
    label: string;
    href: string;
    /** How long the pointer rests before the card opens, and after it leaves before it closes, in ms. */
    openDelay?: number;
    closeDelay?: number;
  }>(),
  { openDelay: 600, closeDelay: 300 },
);
defineSlots<{ content(): unknown }>();

const id = useId();
const service = useMachine(
  hoverCard.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    openDelay: props.openDelay,
    closeDelay: props.closeDelay,
    positioning: { placement: "bottom" as const, gutter: 8 },
  })),
);
const api = computed(() => hoverCard.connect(service, normalizeProps));
const triggerRef = ref<HTMLElement | null>(null);
const hue = usePortalHue(() => api.value.open, triggerRef);
</script>

<template>
  <a ref="triggerRef" data-glim="HoverCard" v-bind="api.getTriggerProps()" :href="href" class="glim-hovercard-link">{{ label }}</a>
  <Teleport v-if="api.open" :to="portalTarget()">
    <div v-bind="api.getPositionerProps()" :style="hue.style.value" :class="['glim-hovercard-positioner', hue.className.value]">
      <div v-bind="api.getContentProps()" class="glim-hovercard"><slot name="content" /></div>
    </div>
  </Teleport>
</template>
