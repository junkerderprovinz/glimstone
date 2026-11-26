<script setup lang="ts">
import { ref, shallowRef, watch, watchEffect } from "vue";
import { TOAST_MARKS, whenFieldErrorClosed } from "@glimstone/core";
import { MarkSvg } from "./glyphs";

// The error line the fields draw under themselves. Once the value is fixed it
// stays a moment with data-closing, so the stylesheet can close it as softly
// as it opened instead of the form jumping.
const props = defineProps<{ id: string | undefined; error: string | undefined }>();
const shown = ref<{ id: string; error: string } | null>(props.id && props.error ? { id: props.id, error: props.error } : null);
const closing = ref(false);
const line = shallowRef<HTMLSpanElement | null>(null);

watch(
  () => [props.id, props.error] as const,
  ([id, error]) => {
    if (id && error) shown.value = { id, error };
    closing.value = !error && shown.value !== null;
  },
);

watchEffect(
  (onCleanup) => {
    if (!closing.value || !line.value) return;
    onCleanup(
      whenFieldErrorClosed(line.value, () => {
        shown.value = null;
        closing.value = false;
      }),
    );
  },
  { flush: "post" },
);
</script>

<template>
  <span v-if="shown" ref="line" data-glim="FieldError" :id="closing ? undefined : shown.id" :data-closing="closing ? '' : undefined" class="glim-field-error"
    ><MarkSvg :mark="TOAST_MARKS.fail" />{{ shown.error }}</span
  >
</template>
