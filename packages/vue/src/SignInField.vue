<script setup lang="ts">
import InfoBubble from "./InfoBubble.vue";

// A field on the sign-in card with its label above it, for the card's own
// fields and for the ones an app puts in its `fields` slot.
defineProps<{
  label: string;
  /** The id of the field in the slot. */
  for: string;
  /** What the field asks for, drawn as an "(i)" beside the label. */
  hint?: string;
}>();
</script>

<template>
  <div class="glim-signin-field">
    <label :for="$props.for" class="glim-signin-label">{{ label }}<InfoBubble v-if="hint" :tip="hint" /></label>
    <slot />
  </div>
</template>
