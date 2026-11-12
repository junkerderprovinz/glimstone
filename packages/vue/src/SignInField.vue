<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { labelInside } from "@glimstone/core";
import InfoBubble from "./InfoBubble.vue";

// A field on the sign-in card, for the card's own fields and for the ones an
// app puts in its `fields` slot. Its label stands inside the field until the
// first key, and above it when the field brings a placeholder or a hint.
const props = defineProps<{
  label: string;
  /** The id of the field in the slot. */
  for: string;
  /** What the field asks for, drawn as an "(i)" beside the label. */
  hint?: string;
}>();

const inside = ref(false);
const place = (was?: string) => {
  inside.value = labelInside(document.getElementById(props.for) as HTMLInputElement | null, props.label, props.hint, was);
};
onMounted(() => place());
watch(() => [props.label, props.hint], (_, [was]) => place(was as string));
</script>

<template>
  <div data-glim="SignInField" class="glim-signin-field">
    <label :for="$props.for" :class="inside ? 'glim-sr-only' : 'glim-signin-label'">{{ label }}<InfoBubble v-if="hint" :tip="hint" /></label>
    <slot />
  </div>
</template>
