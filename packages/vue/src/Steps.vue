<script setup lang="ts" generic="T extends StepsItem">
import { computed, useId } from "vue";
import * as steps from "@zag-js/steps";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { STEPS_TEXT, pageDir, stepsKeyTarget, type StepsItem, type StepsText } from "@glimstone/core";
import Button from "./Button.vue";
import { IconBack, IconCheck, IconForward } from "./glyphs";

// A task walked in named steps, bound with v-model:step, such as setting up a
// storage location: the row of steps on top, the step in force below, Back
// and Next in its foot. The step in force takes the accent, a finished one a
// tick. The `content` slot draws a step's content.
const props = withDefaults(
  defineProps<{
    items: readonly T[];
    /** Only Back and Next move, so no step is skipped. */
    linear?: boolean;
    text?: Partial<StepsText>;
  }>(),
  { linear: false },
);
const step = defineModel<number>("step");
const emit = defineEmits<{
  /** The forward button of the last step. */
  finish: [];
}>();
defineSlots<{ content(props: { item: T; index: number }): unknown }>();

const words = computed(() => ({ ...STEPS_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    count: props.items.length,
    step: step.value ?? 0,
    linear: props.linear,
    onStepChange: (d: { step: number }) => (step.value = d.step),
  })),
);
const api = computed(() => steps.connect(service, normalizeProps));
const last = computed(() => api.value.value === props.items.length - 1);

function move(index: number, e: KeyboardEvent) {
  const target = stepsKeyTarget(e.key, index, props.items.length, pageDir());
  if (target === null) return;
  e.preventDefault();
  document.getElementById(api.value.getItemState({ index: target }).triggerId)?.focus();
}
</script>

<template>
  <div data-glim="Steps" v-bind="api.getRootProps()" class="glim-steps">
    <div v-bind="api.getListProps()" class="glim-steps-list">
      <div v-for="(item, index) in items" :key="index" v-bind="api.getItemProps({ index })" class="glim-steps-item">
        <button v-bind="api.getTriggerProps({ index })" :tabindex="index === api.value ? 0 : -1" class="glim-steps-trigger" @keydown="move(index, $event)">
          <span v-bind="api.getIndicatorProps({ index })" class="glim-steps-indicator glim-num">
            <IconCheck v-if="api.getItemState({ index }).completed" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="glim-steps-title">{{ item.title }}</span>
        </button>
        <div v-if="index < items.length - 1" v-bind="api.getSeparatorProps({ index })" class="glim-steps-separator" />
      </div>
    </div>
    <div v-for="(item, index) in items" :key="index" v-bind="api.getContentProps({ index })" class="glim-steps-content">
      <slot name="content" :item="item" :index="index" />
    </div>
    <div class="glim-steps-foot">
      <Button :label="words.back" :label-key="null" :glyph="IconBack" :disabled="!api.hasPrevStep" @click="api.goToPrevStep()" />
      <Button v-if="last" :label="words.finish" :label-key="null" :glyph="IconCheck" @click="emit('finish')" />
      <Button v-else :label="words.next" :label-key="null" :glyph="IconForward" @click="api.goToNextStep()" />
    </div>
  </div>
</template>
