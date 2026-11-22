<script setup lang="ts">
import { computed, useAttrs } from "vue";
import InfoBubble from "./InfoBubble.vue";

// One row of a list: a glyph tile, the name, badges and buttons that come in on
// hover and focus (rule 6), in the slots `tile`, `badges` and `actions`. A click
// listener makes the whole row a way into its object, by keyboard too.
const props = defineProps<{
  name: string;
  /** More about the row, drawn as an "(i)" beside the name. */
  tip?: string | null;
  /** Sets the name in monospace, for a path. */
  mono?: boolean;
  /** A quiet line under the name, such as when it was made or where it comes from. */
  meta?: string;
  /** Keeps the buttons in view at rest, for a short list of the person's own things, where each row's buttons are the point. */
  steady?: boolean;
}>();
const attrs = useAttrs();
const opens = computed(() => !!attrs.onClick);
const nameClass = computed(() => ["glim-list-row-name", { "glim-list-row-name--mono": props.mono }]);

function press(e: KeyboardEvent) {
  e.preventDefault();
  (e.currentTarget as HTMLElement).click();
}
</script>

<template>
  <div
    data-glim="ListRow"
    role="group"
    :aria-label="name"
    :tabindex="opens ? 0 : undefined"
    :class="['glim-list-row', { 'glim-list-row--opens': opens, 'glim-list-row--steady': steady }]"
    @keydown.enter.self="press"
    @keydown.space.self="press"
  >
    <span v-if="$slots.tile" class="glim-list-row-tile"><slot name="tile" /></span>
    <span v-if="meta" class="glim-list-row-text">
      <span :class="nameClass">
        <span class="glim-list-row-title">{{ name }}</span>
        <span v-if="tip" class="glim-list-row-tip" @click.stop><InfoBubble :tip="tip" /></span>
      </span>
      <span class="glim-list-row-meta">{{ meta }}</span>
    </span>
    <span v-else :class="nameClass">
      <span class="glim-list-row-title">{{ name }}</span>
      <span v-if="tip" class="glim-list-row-tip" @click.stop><InfoBubble :tip="tip" /></span>
    </span>
    <span v-if="$slots.badges" class="glim-list-row-badges"><slot name="badges" /></span>
    <span v-if="$slots.actions" class="glim-list-row-actions" @click.stop><slot name="actions" /></span>
  </div>
</template>
