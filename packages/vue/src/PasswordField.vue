<script setup lang="ts">
import { ref, type StyleValue } from "vue";
import { IconEye, IconEyeOff } from "./glyphs";
import IconTipButton from "./IconTipButton.vue";

// A field for a secret with the reveal eye inside it ("The reveal eye" in the
// design language), bound with v-model. Attributes such as `autocomplete`,
// `placeholder` and `aria-label` go to the input; `class` and `style` go to the
// wrapper, which carries the field's width.
defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The eye's name and bubble while the secret is hidden, and once it shows. */
    text?: { show: string; hide: string };
    disabled?: boolean;
  }>(),
  { text: () => ({ show: "Show", hide: "Hide" }), disabled: false },
);
const value = defineModel<string>({ default: "" });
const shown = ref(false);
</script>

<template>
  <span :class="['glim-secret', $attrs.class]" :style="$attrs.style as StyleValue">
    <input
      v-model="value"
      autocomplete="current-password"
      spellcheck="false"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      :disabled="disabled"
      :type="shown ? 'text' : 'password'"
      class="glim-input"
    />
    <IconTipButton :tip="shown ? text.hide : text.show" class="glim-secret-eye" :disabled="disabled" @click="shown = !shown">
      <component :is="shown ? IconEyeOff : IconEye" />
    </IconTipButton>
  </span>
</template>
