<script setup lang="ts">
import { computed } from "vue";
import { badgeClassName, hueVars, type BadgeForm, type BadgeShape, type BadgeSize, type BadgeTone, type NotchInset } from "@glimstone/core";
import IconTipButton from "./IconTipButton.vue";

// The shared status chip; sizes, tones and the heading notch are described in
// badgeClassName() in the core. `as="button"` and `as="a"` resolve to the same
// box as a span. Listeners such as @click and the link's href go through
// attributes to the element.
const props = withDefaults(
  defineProps<{
    tone?: BadgeTone;
    size?: BadgeSize;
    /** The corners: rounded, square, pill or circle. Without it they follow
     *  the shape setting. */
    form?: BadgeForm;
    /** @deprecated Use `form`. Only "circle" has an effect: it makes the
     *  badge icon-only. Removed in 5.0.0. */
    shape?: BadgeShape;
    as?: "span" | "button" | "a";
    disabled?: boolean;
    /** Let content that wraps grow the box instead of overflowing it. */
    wrap?: boolean;
    /** Rainbow position. Only `heading` and `active` take it, since the other
     *  tones are status signals. */
    hueIndex?: number;
    /** `as="button"` only: the tooltip and accessible name of an icon-only
     *  button; it also makes the badge icon-only for sizing. */
    tip?: string;
    /** Heading notch only: the card's content padding in quarter-rem steps. */
    insetStart?: NotchInset;
    /** Heading notch only: keep its look without positioning it. */
    inFlow?: boolean;
  }>(),
  { tone: "neutral", size: "medium", as: "span", disabled: false, wrap: false, inFlow: false },
);

// Rainbow never colours text: --accent-ink is not redefined under .glim-hue,
// so a hued active badge's text keeps the single accent's ink.
const hueOn = computed(() => props.hueIndex !== undefined && (props.tone === "heading" || props.tone === "active"));
const classes = computed(() =>
  [
    hueOn.value && "glim-hue",
    // `.glim-notch-hue` drives the card-wide reactive hover in tokens.css.
    hueOn.value && props.size === "heading" && "glim-notch-hue",
    badgeClassName({
      tone: props.tone,
      size: props.size,
      form: props.form,
      shape: props.shape,
      wrap: props.wrap,
      iconOnly: props.tip !== undefined,
      inFlow: props.inFlow,
      insetStart: props.insetStart,
      action: props.as !== "span",
    }),
  ].filter(Boolean),
);
const style = computed(() => (hueOn.value ? hueVars(props.hueIndex!) : undefined));
</script>

<template>
  <IconTipButton v-if="as === 'button' && tip !== undefined" data-glim="Badge" :tip="tip" :disabled="disabled" :class="classes" :style="style">
    <slot />
  </IconTipButton>
  <button v-else-if="as === 'button'" data-glim="Badge" type="button" :disabled="disabled" :class="classes" :style="style">
    <slot />
  </button>
  <a v-else-if="as === 'a'" data-glim="Badge" :class="classes" :style="style"><slot /></a>
  <span v-else data-glim="Badge" :class="classes" :style="style"><slot /></span>
</template>
