<script setup lang="ts">
import { computed, inject, provide, shallowRef } from "vue";
import { pressRowControl, type PillTone } from "@glimstone/core";
import { FIELD_ROW, FIELD_ROW_GROUP } from "./fieldName";
import InfoBubble from "./InfoBubble.vue";
import Pill from "./Pill.vue";

// One labelled row of a card or a window (rule 35): the name at its start and
// the control at its end, which takes its accessible name from `label`. The
// `label` slot draws the words in other markup, and the name stays `label`.
const props = defineProps<{
  /** The row's name, and the accessible name of the control in it. */
  label: string;
  /** What the row does, drawn as an "(i)" beside the name. */
  hint?: string;
  /** A row with only a value to show holds it as a pill. */
  value?: string | number;
  /** The pill's tone. */
  tone?: PillTone;
  /** In a FieldRowGroup with columns, spans all of them. */
  wide?: boolean;
}>();

provide(FIELD_ROW, computed(() => props.label));

const inGroup = inject(FIELD_ROW_GROUP, false);
const row = shallowRef<HTMLElement | null>(null);
</script>

<template>
  <div ref="row" data-glim="FieldRow" :class="['glim-field-row', { 'glim-field-row--wide': wide }]">
    <span class="glim-field-row-name">
      <span class="glim-field-row-label" @click="pressRowControl(row!)"><slot name="label">{{ label }}</slot></span>
      <InfoBubble v-if="hint" :tip="hint" />
    </span>
    <span v-if="inGroup" class="glim-field-row-controls">
      <slot>
        <Pill v-if="value !== undefined" class="glim-num" :tone="tone">{{ value }}</Pill>
      </slot>
    </span>
    <slot v-else>
      <Pill v-if="value !== undefined" class="glim-num" :tone="tone">{{ value }}</Pill>
    </slot>
  </div>
</template>
