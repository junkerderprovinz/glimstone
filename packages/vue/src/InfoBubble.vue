<script setup lang="ts">
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";

// A neutral (i) beside a label that shows a short help text on hover and
// keyboard focus. Explanations live here rather than as a permanent grey
// paragraph under the control. The icon never takes the accent, which means
// "active". `onAccent` is for an icon inside a filled accent badge such as a
// card heading.
const props = withDefaults(defineProps<{ tip: string; onAccent?: boolean }>(), { onAccent: false });
const bubble = useTipBubble(() => props.tip);
</script>

<template>
  <!-- Inside a <label>, a click on a span is forwarded to the label's field,
       which takes focus and closes the bubble at once; preventing the default
       keeps the focus the span took on mousedown. -->
  <span
    data-glim="InfoBubble"
    :ref="(el) => (bubble.trigger.value = el as HTMLElement | null)"
    :aria-label="tip"
    :aria-describedby="bubble.describedBy.value"
    tabindex="0"
    :class="onAccent ? 'glim-info-icon glim-info-icon--on-accent' : 'glim-info-icon'"
    @mouseenter="bubble.show"
    @mouseleave="bubble.hide"
    @focus="bubble.showOnFocus"
    @blur="bubble.hide"
    @click.prevent
  >
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3" />
      <circle cx="8" cy="4.6" r="0.9" fill="currentColor" />
      <path d="M8 7v4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    </svg>
  </span>
  <TipBubble :state="bubble" />
</template>
