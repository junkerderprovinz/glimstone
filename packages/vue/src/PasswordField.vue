<script setup lang="ts">
import { computed, ref, shallowRef, useAttrs, useId, type StyleValue } from "vue";
import { fieldErrorView, fieldWidthClass, type FieldWidth } from "@glimstone/core";
import FieldError from "./FieldError.vue";
import { useFieldName } from "./fieldName";
import { IconEye, IconEyeOff } from "./glyphs";
import IconTipButton from "./IconTipButton.vue";

// A field for a secret with the reveal eye inside it ("The reveal eye" in the
// design language), bound with v-model. Attributes such as `autocomplete`,
// `placeholder` and `aria-label` go to the input; `class` and `style` go to the
// wrapper, which carries the field's width. Inside a FieldRow the row names it.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    width?: FieldWidth;
    /** Attributes for the eye, such as a data hook. */
    eyeAttrs?: Record<string, string>;
    /** The eye's name and bubble while the secret is hidden, and once it shows. */
    text?: { show: string; hide: string };
    disabled?: boolean;
    /** Why the value cannot stand, as a line under the field until it is fixed. */
    error?: string;
  }>(),
  { text: () => ({ show: "Show", hide: "Hide" }), disabled: false },
);
const value = defineModel<string>({ default: "" });
const shown = ref(false);
const attrs = useAttrs();
const name = useFieldName(() => attrs["aria-label"] as string | undefined);
const widthClass = computed(() => fieldWidthClass(props.width));
const own = useId();
const err = computed(() => fieldErrorView(props.error, (attrs.id as string | undefined) ?? own, attrs["aria-describedby"] as string | undefined));
const input = shallowRef<HTMLInputElement | null>(null);
defineExpose({ input });
</script>

<template>
  <span data-glim="PasswordField" :class="['glim-secret', widthClass, $attrs.class]" :style="$attrs.style as StyleValue">
    <input
      ref="input"
      v-model="value"
      autocomplete="current-password"
      spellcheck="false"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      :aria-label="name"
      :aria-invalid="err.invalid"
      :aria-describedby="err.describedBy"
      :disabled="disabled"
      :type="shown ? 'text' : 'password'"
      class="glim-input"
    />
    <IconTipButton v-bind="eyeAttrs" :tip="shown ? text.hide : text.show" class="glim-secret-eye" :disabled="disabled" @click="shown = !shown">
      <component :is="shown ? IconEyeOff : IconEye" />
    </IconTipButton>
  </span>
  <FieldError v-if="err.errorId" :id="err.errorId">{{ error }}</FieldError>
</template>
