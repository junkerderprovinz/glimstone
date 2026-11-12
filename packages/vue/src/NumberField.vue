<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useAttrs, watch } from "vue";
import { attachNumberSteppers, syncNumberSteppers } from "@glimstone/core";
import { useFieldName } from "./fieldName";

// A number input with its two steppers inside the field, bound with v-model:
// the number, or null while the field is empty. The steppers, the wheel and
// the greying at the ends come from numberField.ts in the core; min, max, step
// and every other attribute go to the <input>, where the range lives alone.
// Inside a FieldRow the row names it.
defineOptions({ inheritAttrs: false });
const model = defineModel<number | null>({ default: null });
const attrs = useAttrs();
const name = useFieldName(() => attrs["aria-label"] as string | undefined);
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
  <span data-glim="NumberField" class="glim-num-wrap">
    <input v-bind="$attrs" ref="input" :aria-label="name" type="number" class="glim-num-input glim-num-field glim-num" @input="onInput" />
  </span>
</template>
