<script setup lang="ts">
import { computed, useSlots, type Component, type StyleValue } from "vue";
import { sidebarRowView } from "@glimstone/core";
import { useLabelMode } from "./engines";
import SidebarRowLink from "./SidebarRowLink.vue";

// One destination of the navigation rail; what it shows comes from
// sidebarRowView() in the core. Listeners and attributes go to the link, so a
// router can take the click. The slots `before` and `after` hold what stands in
// the row beside it, such as a tree's toggle, a meter or a pin. They are not
// inside the link, whose press still covers the rest of the row.
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The destination's name: shown, or hidden but still the link's name. */
    label: string;
    /** Without one the row shows its name in every mode. */
    glyph?: Component;
    /** Without one the row is a button. */
    href?: string;
    /** This destination is showing; the row is filled and marked as the current page. */
    active?: boolean;
    /** The row's rank among the rows the rail shows. */
    hueIndex?: number;
    /** The figure on the row, with the figure in words as `label`. Nothing shows at zero. */
    count?: { value: number; label: string };
    /** A tree's row at this level, stepped in with a smaller glyph and gap. */
    depth?: number;
  }>(),
  { active: false },
);

const mode = useLabelMode("sidebar");
const slots = useSlots();
const view = computed(() =>
  sidebarRowView({
    mode: mode.value,
    label: props.label,
    hasGlyph: !!props.glyph,
    active: props.active,
    hueIndex: props.hueIndex,
    count: props.count?.value,
    framed: !!(slots.before || slots.after),
    depth: props.depth,
  }),
);
const link = computed(() => ({ view: view.value, label: props.label, glyph: props.glyph, href: props.href, active: props.active, count: props.count }));
</script>

<template>
  <div
    v-if="$slots.before || $slots.after"
    data-glim="SidebarRow"
    :class="[view.className, 'glim-nav-row--slots', $attrs.class]"
    :style="[view.style, $attrs.style as StyleValue]"
  >
    <span v-if="$slots.before" class="glim-nav-row-slot"><slot name="before" /></span>
    <SidebarRowLink v-bind="{ ...$attrs, ...link, class: undefined, style: undefined }" class-name="glim-nav-row-main" />
    <span v-if="$slots.after" class="glim-nav-row-slot"><slot name="after" /></span>
  </div>
  <SidebarRowLink v-else data-glim="SidebarRow" v-bind="{ ...$attrs, ...link, class: undefined }" :class-name="view.className" :class="$attrs.class" :style="view.style" />
</template>
