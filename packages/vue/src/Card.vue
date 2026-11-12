<script setup lang="ts">
import { computed } from "vue";
import { hueVars } from "@glimstone/core";
import Badge from "./Badge.vue";
import InfoBubble from "./InfoBubble.vue";

// The surface everything else sits on, and the one place a section heading is
// drawn. The heading is a filled badge straddling the card's top edge, and the
// `hint` rides inside it because the badge is out of normal flow. With a
// `hueIndex` the card sets `--accent` once for everything inside it. The `title`
// slot holds markup for the notch, such as an unsaved dot. A card with no title
// of either kind and no `hint` draws no heading.
const props = defineProps<{
  /** Omit it where a control inside already carries the same name. */
  title?: string;
  /** One line saying what this whole card does, drawn as an "(i)" beside the title. */
  hint?: string;
  /** This card's position in the rainbow, counted across the cards visible on the active tab. */
  hueIndex?: number;
  /** This card sits inside another card that already provides the surface and the padding. */
  nested?: boolean;
}>();

const style = computed(() => (props.hueIndex !== undefined ? hueVars(props.hueIndex) : undefined));
</script>

<template>
  <div
    data-glim="Card"
    :data-glim-title="title"
    :class="['glim-panel', 'glim-notch-card', { 'glim-panel--nested': nested, 'glim-hue': hueIndex !== undefined }]"
    :style="style"
  >
    <h2 v-if="title || hint || $slots.title" class="glim-panel-heading">
      <Badge tone="heading" size="heading" wrap :hue-index="hueIndex">
        <slot name="title">{{ title }}</slot><InfoBubble v-if="hint" :tip="hint" on-accent />
      </Badge>
    </h2>
    <slot />
  </div>
</template>
