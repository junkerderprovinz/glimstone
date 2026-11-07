<script setup lang="ts">
import { computed, onScopeDispose, shallowRef, useId, type StyleValue } from "vue";
import { shake } from "@glimstone/core";
import { useFieldName } from "./fieldName";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";

// The shared switch, bound with v-model. The label is always the accessible
// name; `hideLabel` only drops the visible caption. No `title`: the label is
// visible beside the switch, so a tooltip would only repeat it. Attributes and
// listeners go to the switch, which is what a script asks for its state; `class`
// and `style` go to the frame, which carries the row's layout. Inside a FieldRow
// the row names the switch and draws the words.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The accessible name, shown beside the switch. Inside a FieldRow the row gives it. */
    label?: string;
    /** Use it only when the caller draws the same text right next to the
     *  switch, never because a card title further up already says it. */
    hideLabel?: boolean;
    disabled?: boolean;
    /** Why the switch cannot be flipped right now, as OLED while Light is
     *  chosen (`oledRefusal`). It keeps its state and its focus, its track
     *  dims, a press shakes it, and the reason is its bubble, or a line under
     *  the row on a touch screen. */
    refused?: string;
  }>(),
  { hideLabel: false, disabled: false },
);
const checked = defineModel<boolean>({ required: true });
const name = useFieldName(() => props.label);
const caption = computed(() => props.label !== undefined && !props.hideLabel);
const tip = useTipBubble(() => props.refused);
const reason = useId();
const frame = shallowRef<HTMLElement | null>(null);

let stopShake: (() => void) | undefined;
onScopeDispose(() => stopShake?.());
function press() {
  if (!props.refused) {
    checked.value = !checked.value;
    return;
  }
  stopShake?.();
  stopShake = shake(frame.value!);
}
</script>

<template>
  <span ref="frame" :class="['glim-toggle', $attrs.class]" :style="$attrs.style as StyleValue">
    <span v-if="caption" class="glim-toggle-label">{{ label }}</span>
    <button
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      :ref="(el: unknown) => (tip.trigger.value = el as HTMLElement | null)"
      type="button"
      role="switch"
      :aria-checked="checked"
      :aria-label="name"
      :aria-disabled="refused ? true : undefined"
      :aria-describedby="refused ? reason : ($attrs['aria-describedby'] as string | undefined)"
      :disabled="disabled"
      class="glim-toggle-track"
      @click="press"
      @mouseenter="tip.show"
      @mouseleave="tip.hide"
      @focus="tip.showOnFocus"
      @blur="tip.hide"
    >
      <span class="glim-toggle-thumb" />
    </button>
  </span>
  <span v-if="refused" :id="reason" class="glim-toggle-refusal">{{ refused }}</span>
  <TipBubble :state="tip" />
</template>
