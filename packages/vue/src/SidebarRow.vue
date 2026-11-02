<script setup lang="ts">
import { computed, type Component } from "vue";
import { sidebarRowView } from "@glimstone/core";
import { useLabelMode } from "./engines";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";

// One destination of the navigation rail; what it shows comes from
// sidebarRowView() in the core. Listeners and attributes go to the <a>, so a
// router can take the click.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The destination's name: shown, or hidden but still the link's name. */
    label: string;
    /** Without one the row shows its name in every mode. */
    glyph?: Component;
    href: string;
    /** This destination is showing; the row is filled and marked as the current page. */
    active?: boolean;
    /** The row's rank among the rows the rail shows. */
    hueIndex?: number;
    /** The figure on the row, with the figure in words as `label`. Nothing shows at zero. */
    count?: { value: number; label: string };
  }>(),
  { active: false },
);

const mode = useLabelMode("sidebar");
const view = computed(() =>
  sidebarRowView({
    mode: mode.value,
    label: props.label,
    hasGlyph: !!props.glyph,
    active: props.active,
    hueIndex: props.hueIndex,
    count: props.count?.value,
  }),
);
const bubble = useTipBubble(() => view.value.tip);

function attach(node: unknown) {
  bubble.trigger.value = node as HTMLElement | null;
}
</script>

<template>
  <a
    v-bind="$attrs"
    :ref="attach"
    :href="href"
    :aria-current="active ? 'page' : undefined"
    :aria-describedby="bubble.describedBy.value"
    :class="view.className"
    :style="view.style"
    @mouseenter="bubble.show"
    @mouseleave="bubble.hide"
    @focus="bubble.showOnFocus"
    @blur="bubble.hide"
  >
    <component :is="glyph" v-if="view.showGlyph && glyph" />
    <span :class="view.labelClass">{{ label }}</span>
    <template v-if="view.countClass && count">
      <span :class="view.countClass" aria-hidden="true">{{ count.value }}</span>
      <span class="glim-sr-only">{{ count.label }}</span>
    </template>
  </a>
  <TipBubble :state="bubble" />
</template>
