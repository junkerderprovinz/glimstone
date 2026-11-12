<script setup lang="ts">
import { computed, shallowRef, watchEffect, type Component } from "vue";
import { buttonView, mediaMatches, narrowerThan, subscribeMedia, takePageHue, type ButtonSize, type ButtonTone, type ButtonVariant, type WidthStage } from "@glimstone/core";
import { useLabelMode } from "./engines";
import BusyRing from "./BusyRing.vue";
import { glyphFor, IconClose } from "./glyphs";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";
import { TipWrap } from "./TipWrap";

// The one clickable control; what it shows and how wide it is come from
// buttonView() in the core. Listeners and attributes go to the element. The slots
// `before` and `after` hold what stands around the words, such as a count.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The button's words, present in every mode: visible, or hidden but
     *  announced and shown as the tooltip. Keep it stable; put changing state
     *  in `title`. */
    label: string;
    /** The translation key behind `label`, or `null` when the label is data
     *  such as a path. It picks the glyph by meaning, so the same verb wears
     *  the same symbol everywhere; an explicit `glyph` wins. */
    labelKey: string | null;
    /** Overrides whatever `labelKey` would have chosen. */
    glyph?: Component;
    tone?: ButtonTone;
    /** "chip" inside a pill, "icon" for a row action; see ButtonVariant. */
    variant?: ButtonVariant;
    disabled?: boolean;
    /** Makes it a link with the button's look. A disabled one stays a disabled button. */
    href?: string;
    type?: "button" | "submit";
    /** Extra explanation, and the place for anything that changes. It shows
     *  in the hover and focus bubble, joined with the label where the label
     *  is hidden, and still reaches a disabled button. */
    title?: string;
    /** This button's own rainbow position, for a colour different from its card's. */
    hueIndex?: number;
    /** Shows the busy ring in place of the glyph, at once. Separate from `disabled`. */
    busy?: boolean;
    /** Forces a width stage, for two buttons in different components that should match. */
    stage?: WidthStage;
    /** Keeps the label visible in every mode, for a label that is content rather than a verb. */
    keepLabel?: boolean;
    /** Its glyph alone in a square in every label mode, where the words have no room. The label stays the name and the bubble. */
    compact?: boolean;
    /** Turns compact while the window is narrower than this many pixels. */
    compactBelow?: number;
    size?: ButtonSize;
  }>(),
  { tone: "neutral", variant: "default", disabled: false, type: "button", busy: false, keepLabel: false },
);

const mode = useLabelMode("buttons");
const narrow = shallowRef(false);
watchEffect((onCleanup) => {
  if (props.compactBelow === undefined) return void (narrow.value = false);
  const query = narrowerThan(props.compactBelow);
  const read = () => (narrow.value = mediaMatches(query));
  read();
  onCleanup(subscribeMedia(query, read));
});
// A chip always closes, so it has a glyph even when no call site passes one.
const resolved = computed(
  () => props.glyph ?? (props.labelKey ? glyphFor(props.labelKey) : undefined) ?? (props.variant === "chip" ? IconClose : undefined),
);
const view = computed(() =>
  buttonView({
    mode: mode.value,
    label: props.label,
    hasGlyph: !!resolved.value || props.busy,
    tone: props.tone,
    variant: props.variant,
    disabled: props.disabled,
    keepLabel: props.keepLabel,
    compact: props.compact || narrow.value,
    size: props.size,
    title: props.title,
    hueIndex: props.hueIndex,
    stage: props.stage,
  }),
);
const link = computed(() => !!props.href && !props.disabled);
const bubble = useTipBubble(() => view.value.tip, () => props.disabled);
const el = shallowRef<HTMLButtonElement | null>(null);

function attach(node: unknown) {
  el.value = node as HTMLButtonElement | null;
  bubble.trigger.value = el.value;
}
function enter(e: MouseEvent) {
  if (view.value.pageHue) takePageHue(e.currentTarget as HTMLElement);
  bubble.show();
}
function focus(e: FocusEvent) {
  if (view.value.pageHue) takePageHue(e.currentTarget as HTMLElement);
  bubble.showOnFocus();
}

defineExpose({ el });
</script>

<template>
  <TipWrap :on="disabled && !!view.tip" :show="bubble.show" :hide="bubble.hide">
    <component
      :is="link ? 'a' : 'button'"
      data-glim="Button"
      v-bind="$attrs"
      :ref="attach"
      :href="link ? href : undefined"
      :type="link ? undefined : type"
      :disabled="link ? undefined : disabled"
      :aria-busy="busy || undefined"
      :aria-describedby="bubble.describedBy.value"
      :style="view.style"
      :class="view.className"
      @mouseenter="enter"
      @mouseleave="bubble.hide"
      @focus="focus"
      @blur="bubble.hide"
    >
      <slot name="before" />
      <span v-if="view.showGlyph" class="glim-btn-glyph">
        <BusyRing v-if="busy" size="small" :delay="0" />
        <component :is="resolved" v-else />
      </span>
      <span :class="view.labelClass">{{ label }}</span>
      <slot name="after" />
    </component>
  </TipWrap>
  <TipBubble :state="bubble" />
</template>
