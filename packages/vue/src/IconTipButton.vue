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
    /** Makes it a link. A disabled one stays a disabled button. */
    href?: string;
    type?: "button" | "submit";
  }>(),
  { disabled: false, type: "button" },
);
const bubble = useTipBubble(() => props.tip, () => props.disabled);
</script>

<template>
  <TipWrap :on="disabled" :show="bubble.show" :hide="bubble.hide">
    <component
      :is="href && !disabled ? 'a' : 'button'"
      data-glim="IconTipButton"
      v-bind="$attrs"
      :ref="(el: unknown) => (bubble.trigger.value = el as HTMLElement | null)"
      :href="disabled ? undefined : href"
      :type="href && !disabled ? undefined : type"
      :disabled="href && !disabled ? undefined : disabled"
      :aria-label="tip"
      :aria-describedby="bubble.describedBy.value"
      @mouseenter="bubble.show"
      @mouseleave="bubble.hide"
      @focus="bubble.showOnFocus"
      @blur="bubble.hide"
    >
      <slot />
    </component>
  </TipWrap>
  <TipBubble :state="bubble" />
</template>
