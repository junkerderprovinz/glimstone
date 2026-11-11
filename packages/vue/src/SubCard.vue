<script setup lang="ts">
import { useId } from "vue";
import Badge from "./Badge.vue";
import InfoBubble from "./InfoBubble.vue";

// A flat, filled group inside a card or a window, in place of a card inside a
// card or a fold-out. Its title is a section badge in the notch on its top
// edge, like a card's, and the `end` slot stands at the end of that row.
// Fields and quiet buttons inside it step up one surface, so they do not
// vanish into its fill.
defineProps<{
  /** The group's name, drawn as a section badge on its top edge. */
  title?: string;
  /** One line on what the group does, drawn as an "(i)" inside the badge. */
  hint?: string;
}>();
const titleId = useId();
</script>

<template>
  <section :class="['glim-subcard', { 'glim-subcard--titled': title }]" :aria-labelledby="title ? titleId : undefined">
    <!-- The id is on the words alone, or the bubble's text would join the
         group's name. -->
    <h3 v-if="title" class="glim-panel-heading">
      <Badge tone="heading" size="heading" wrap>
        <span :id="titleId">{{ title }}</span><InfoBubble v-if="hint" :tip="hint" on-accent />
      </Badge>
    </h3>
    <div v-if="$slots.end" class="glim-subcard-end"><slot name="end" /></div>
    <slot />
  </section>
</template>
