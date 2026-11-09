<script setup lang="ts">
import { computed, onScopeDispose, shallowRef, watch, type Component } from "vue";
import { keepReadmeFit, readmePartClass, readmePartLabel, readmeSoon, readmeUnitClass, type ReadmeBrand, type ReadmePart } from "@glimstone/core";
import InfoBubble from "./InfoBubble.vue";

// A button in the shape of the README's download buttons ("The App tab" in
// design-language.md). The first part carries the mark and the full name; the
// parts after it are segments that name only what differs, such as ARM beside
// Windows. The unit lights up as one in its brand's colour. A link where a part
// leads to a file or a listing, a button where it does something, and a quiet
// unit with "Soon" as its second line where the listing does not exist yet. The
// mark and a vendor's own artwork go in the `mark` and `art` slots.
const props = withDefaults(
  defineProps<{
    brand: ReadmeBrand;
    /** The button, then its segments. */
    parts: [ReadmePart, ...ReadmePart[]];
    /** The class that paints the mark at rest, such as `glim-windows-mark`. */
    markClass?: string;
    /** The "(i)" at the end of the unit, for what the name cannot say. */
    hint?: string;
    /** Holds the second lines in view while one reports what it did, such as "Copied". */
    note?: boolean;
    /** The second line of a unit whose first part has neither `href` nor `onClick`. */
    soonLabel?: string;
  }>(),
  { note: false },
);
const emit = defineEmits<{ linkClick: [e: MouseEvent] }>();
defineSlots<{ mark?: () => unknown; art?: () => unknown }>();

const soon = computed(() => readmeSoon(props.parts));
const root = shallowRef<HTMLElement | null>(null);
const words = computed(() => props.parts.map((p) => `${p.name}\n${p.sub ?? ""}`).join("\n") + (soon.value ? props.soonLabel : ""));
let stop: (() => void) | undefined;
watch(
  [root, words],
  () => {
    stop?.();
    stop = root.value ? keepReadmeFit(root.value) : undefined;
  },
  { flush: "post" },
);
onScopeDispose(() => stop?.());

const sub = (p: ReadmePart) => (soon.value ? props.soonLabel : p.sub);
const label = (p: ReadmePart) => readmePartLabel(p, sub(p));
const tag = (p: ReadmePart): string | Component => (soon.value ? "span" : p.href ? "a" : "button");
const attrs = (p: ReadmePart) =>
  soon.value
    ? { "aria-disabled": true }
    : p.href
      ? { href: p.href, target: "_blank", rel: "noreferrer noopener", onClick: (e: MouseEvent) => emit("linkClick", e) }
      : { type: "button", onClick: p.onClick };
</script>

<template>
  <div ref="root" :class="readmeUnitClass(brand, parts.length, note, soon)">
    <component :is="tag(p)" v-for="(p, i) in parts" :key="i" v-bind="attrs(p)" :aria-label="label(p)" :class="readmePartClass(i, soon)">
      <span v-if="i === 0 && $slots.art" class="glim-readme-btn-art" aria-hidden="true"><slot name="art" /></span>
      <template v-else>
        <span v-if="i === 0 && $slots.mark" :class="`glim-readme-btn-mark ${markClass ?? ''}`" aria-hidden="true"><slot name="mark" /></span>
        <span class="glim-readme-btn-text">
          <span class="glim-readme-btn-name">{{ p.name }}</span>
          <span v-if="sub(p)" class="glim-readme-btn-sub">{{ sub(p) }}</span>
        </span>
      </template>
    </component>
    <span v-if="!soon" class="glim-readme-btn-sheen" aria-hidden="true" />
    <span v-if="hint" class="glim-readme-btn-hint"><InfoBubble :tip="hint" /></span>
  </div>
</template>
