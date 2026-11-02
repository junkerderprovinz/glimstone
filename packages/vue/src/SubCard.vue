<script setup lang="ts">
import { useId } from "vue";
import InfoBubble from "./InfoBubble.vue";

// A flat, filled group inside a card under a small uppercase title, in place
// of a card inside a card or a fold-out. Fields and quiet buttons inside it
// step up one surface, so they do not vanish into its fill.
defineProps<{
  /** The group's name, set small and uppercase above it. */
  title: string;
  /** One line on what the group does, drawn as an "(i)" beside the title. */
  hint?: string;
}>();
const titleId = useId();
</script>

<template>
  <section class="glim-subcard" :aria-labelledby="titleId">
    <!-- The id is on the words alone, or the bubble's text would join the
         group's name. -->
    <h3 class="glim-subcard-title">
      <span :id="titleId">{{ title }}</span>
      <InfoBubble v-if="hint" :tip="hint" />
    </h3>
    <slot />
  </section>
</template>
