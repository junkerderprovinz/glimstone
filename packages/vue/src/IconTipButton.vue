<script setup lang="ts">
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";
import { TipWrap } from "./TipWrap";

// An icon-only <button> whose accessible name and hover or focus explanation is
// the house bubble rather than the native `title` balloon. It has no label to
// hide: a bare glyph in a box the caller sizes and colours through `class`.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The hover and focus explanation, and the button's `aria-label`. */
    tip: string;
    disabled?: boolean;
    type?: "button" | "submit";
  }>(),
  { disabled: false, type: "button" },
);
const bubble = useTipBubble(() => props.tip, () => props.disabled);
</script>

<template>
  <TipWrap :on="disabled" :show="bubble.show" :hide="bubble.hide">
    <button
      v-bind="$attrs"
      :ref="(el) => (bubble.trigger.value = el as HTMLElement | null)"
      :type="type"
      :disabled="disabled"
      :aria-label="tip"
      :aria-describedby="bubble.describedBy.value"
      @mouseenter="bubble.show"
      @mouseleave="bubble.hide"
      @focus="bubble.showOnFocus"
      @blur="bubble.hide"
    >
      <slot />
    </button>
  </TipWrap>
  <TipBubble :state="bubble" />
</template>
