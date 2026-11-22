<script setup lang="ts">
import { computed, ref, shallowRef, useAttrs, useId, watch, type StyleValue } from "vue";
import { fieldErrorView, fieldNoteView, fieldWidthClass, PASSWORD_FIELD_TEXT, passwordConfirmView, type FieldWidth, type PasswordFieldText } from "@glimstone/core";
import FieldError from "./FieldError.vue";
import { useFieldName } from "./fieldName";
import { IconEye, IconEyeOff } from "./glyphs";
import IconTipButton from "./IconTipButton.vue";

// A field for a secret with the reveal eye inside it ("The reveal eye" in the
// design language), bound with v-model. Attributes such as `autocomplete`,
// `placeholder` and `aria-label` go to the input; `class` and `style` go to the
// wrapper, which carries the field's width. Inside a FieldRow the row names it.
// With `confirm` it takes a new password, typed twice.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    width?: FieldWidth;
    /** Attributes for the eye, such as a data hook. */
    eyeAttrs?: Record<string, string>;
    /** The eye's words, and the second field's with `confirm`. English where left out. */
    text?: Partial<PasswordFieldText>;
    disabled?: boolean;
    /** Why the value cannot stand, as a line under the field until it is fixed. */
    error?: string;
    /** A quiet line under the field that only informs, such as a hint about the value. An error takes its place. */
    note?: string;
    /** Asks for the password again in a second field, which stands once the first holds something. */
    confirm?: boolean;
  }>(),
  { disabled: false, confirm: false },
);
const value = defineModel<string>({ default: "" });
const emit = defineEmits<{
  /** Whether both fields hold the same password, each time that changes. Set password waits for true. */
  confirmedChange: [confirmed: boolean];
}>();
const words = computed(() => ({ ...PASSWORD_FIELD_TEXT, ...props.text }));
const shown = ref(false);
const repeatShown = ref(false);
const repeat = ref("");
const attrs = useAttrs();
const name = useFieldName(() => attrs["aria-label"] as string | undefined);
const widthClass = computed(() => fieldWidthClass(props.width));
const own = useId();
const id = computed(() => (attrs.id as string | undefined) ?? own);
const quiet = computed(() => fieldNoteView(props.note, props.error, id.value, attrs["aria-describedby"] as string | undefined));
const err = computed(() => fieldErrorView(props.error, id.value, quiet.value.describedBy));
const view = computed(() => passwordConfirmView(value.value, repeat.value));
const mismatch = computed(() => fieldErrorView(view.value.mismatch ? words.value.mismatch : undefined, `${id.value}-confirm`));
watch(
  () => view.value.shown,
  (on) => {
    if (!on) repeat.value = "";
  },
);
watch(
  () => props.confirm && view.value.confirmed,
  (confirmed) => emit("confirmedChange", confirmed),
  { immediate: true },
);
const input = shallowRef<HTMLInputElement | null>(null);
defineExpose({ input });
</script>

<template>
  <span data-glim="PasswordField" :class="['glim-secret', widthClass, $attrs.class]" :style="$attrs.style as StyleValue">
    <input
      ref="input"
      v-model="value"
      :autocomplete="confirm ? 'new-password' : 'current-password'"
      spellcheck="false"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      :aria-label="name"
      :aria-invalid="err.invalid"
      :aria-describedby="err.describedBy"
      :disabled="disabled"
      :type="shown ? 'text' : 'password'"
      class="glim-input"
    />
    <IconTipButton v-bind="eyeAttrs" :tip="shown ? words.hide : words.show" class="glim-secret-eye" :disabled="disabled" @click="shown = !shown">
      <component :is="shown ? IconEyeOff : IconEye" />
    </IconTipButton>
  </span>
  <FieldError v-if="err.errorId" :id="err.errorId">{{ error }}</FieldError>
  <span v-if="quiet.noteId" :id="quiet.noteId" class="glim-field-note">{{ note }}</span>
  <span v-if="confirm && view.shown" class="glim-secret-confirm">
    <label :for="`${id}-confirm`" class="glim-secret-confirm-label">{{ words.confirm }}</label>
    <span :class="['glim-secret-confirm-box', widthClass]">
      <span class="glim-secret">
        <input
          :id="`${id}-confirm`"
          v-model="repeat"
          autocomplete="new-password"
          spellcheck="false"
          :aria-invalid="mismatch.invalid"
          :aria-describedby="mismatch.describedBy"
          :disabled="disabled"
          :type="repeatShown ? 'text' : 'password'"
          class="glim-input"
        />
        <IconTipButton :tip="repeatShown ? words.hide : words.show" class="glim-secret-eye" :disabled="disabled" @click="repeatShown = !repeatShown">
          <component :is="repeatShown ? IconEyeOff : IconEye" />
        </IconTipButton>
      </span>
      <span aria-live="polite" class="glim-secret-confirm-live">
        <FieldError v-if="mismatch.errorId" :id="mismatch.errorId">{{ words.mismatch }}</FieldError>
      </span>
    </span>
  </span>
</template>
