<script setup lang="ts">
import type { Component } from "vue";
import type { SidebarRowView } from "@glimstone/core";
import { useTipBubble } from "./tipBubble";
import TipBubble from "./TipBubble.vue";

// What a SidebarRow presses: a link with an href, a button without one, either
// the whole row or, beside slots, its inner part. Attributes go to the element.
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  view: SidebarRowView;
  className: string;
  label: string;
  glyph?: Component;
  href?: string;
  active?: boolean;
  count?: { value: number; label: string };
}>();
const bubble = useTipBubble(() => props.view.tip);

function attach(node: unknown) {
  bubble.trigger.value = node as HTMLElement | null;
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    v-bind="$attrs"
    :ref="attach"
    :href="href"
    :type="href ? undefined : 'button'"
    :aria-current="active ? 'page' : undefined"
    :aria-describedby="bubble.describedBy.value"
    :class="className"
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
  </component>
  <TipBubble :state="bubble" />
</template>
