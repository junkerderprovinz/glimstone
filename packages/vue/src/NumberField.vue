<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useAttrs, useId, watch } from "vue";
import { attachNumberSteppers, fieldErrorView, syncNumberSteppers } from "@glimstone/core";
import FieldError from "./FieldError.vue";
import { useFieldName } from "./fieldName";

// A number input with its two steppers inside the field, bound with v-model:
// the number, or null while the field is empty. The steppers, the wheel and
// the greying at the ends come from numberField.ts in the core; min, max, step
// and every other attribute go to the <input>, where the range lives alone.
// Inside a FieldRow the row names it.
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  /** Why the value cannot stand, as a line under the field until it is fixed. */
  error?: string;
}>();
const model = defineModel<number | null>({ default: null });
const attrs = useAttrs();
const name = useFieldName(() => attrs["aria-label"] as string | undefined);
const own = useId();
const err = computed(() => fieldErrorView(props.error, (attrs.id as string | undefined) ?? own, attrs["aria-describedby"] as string | undefined));
const input = shallowRef<HTMLInputElement | null>(null);

let detach: (() => void) | undefined;
onMounted(() => {
  write(model.value);
  detach = attachNumberSteppers(input.value!);
});
onBeforeUnmount(() => detach?.());

// Written only when it differs from what the field holds, so "1." stays as
// typed while it means 1.
function write(value: number | null) {
  const el = input.value;
  if (!el) return;
  const held = el.value === "" ? null : el.valueAsNumber;
  if (held !== value) el.value = value === null ? "" : String(value);
}

// A value or range set from script fires no input event, so the arrows look again.
watch(
  [model, () => attrs.min, () => attrs.max, () => attrs.step, () => attrs.disabled, () => attrs.readonly],
  () => {
    write(model.value);
    if (input.value) syncNumberSteppers(input.value);
  },
  { flush: "post" },
);

function onInput(e: Event) {
  const el = e.target as HTMLInputElement;
  model.value = el.value === "" ? null : el.valueAsNumber;
}
</script>

<template>
  <span class="glim-num-wrap">
    <input
      v-bind="$attrs"
      ref="input"
      :aria-label="name"
      :aria-invalid="err.invalid"
      :aria-describedby="err.describedBy"
      type="number"
      class="glim-num-input glim-num-field glim-num"
      @input="onInput"
    />
  </span>
  <FieldError v-if="err.errorId" :id="err.errorId">{{ error }}</FieldError>
</template>
