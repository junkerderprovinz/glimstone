<script setup lang="ts">
import { computed, ref, useId } from "vue";
import * as hoverCard from "@zag-js/hover-card";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { hoverCardFacts, pageDir, portalTarget, type HoverCardFact } from "@glimstone/core";
import { usePortalHue } from "./selectParts";

// A card that shows what a link leads to while the pointer rests on it or the
// keyboard reaches it, such as the details of a server named in a sentence.
// It only previews: everything in it is also behind the link, so a touch
// screen, which has no hover, loses nothing. The `media` slot fills the head's
// tile, and the `content` slot draws the body below the head, or the whole card.
const props = withDefaults(
  defineProps<{
    /** The link's words. */
    label: string;
    href: string;
    /** How long the pointer rests before the card opens, and after it leaves before it closes, in ms. */
    openDelay?: number;
    closeDelay?: number;
    /** The head's name. */
    title?: string;
    /** One quiet line under the name, such as an address or a state. */
    meta?: string;
    /** Up to three figures under the head, each a name and a value. */
    facts?: readonly HoverCardFact[];
  }>(),
  { openDelay: 400, closeDelay: 150 },
);
const slots = defineSlots<{ media?(): unknown; content?(): unknown }>();

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
      <div v-bind="api.getContentProps()" class="glim-hovercard">
        <div v-if="slots.media || title" class="glim-hovercard-head">
          <span v-if="slots.media" class="glim-hovercard-media"><slot name="media" /></span>
          <span class="glim-hovercard-names">
            <strong v-if="title" class="glim-hovercard-title">{{ title }}</strong>
            <span v-if="meta" class="glim-hovercard-meta">{{ meta }}</span>
          </span>
        </div>
        <dl v-if="hoverCardFacts(facts).length" class="glim-hovercard-facts">
          <div v-for="f in hoverCardFacts(facts)" :key="f.label" class="glim-hovercard-fact">
            <dt>{{ f.label }}</dt>
            <dd class="glim-num">{{ f.value }}</dd>
          </div>
        </dl>
        <slot name="content" />
      </div>
    </div>
  </Teleport>
</template>
