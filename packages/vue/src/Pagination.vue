<script setup lang="ts">
import { computed, useId } from "vue";
import * as pagination from "@zag-js/pagination";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { PAGINATION_TEXT, pageDir, type PaginationText } from "@glimstone/core";
import Button from "./Button.vue";
import { IconBack, IconForward } from "./glyphs";

// The pages of a long list, bound with v-model:page, for the place a list
// cannot show every row at once. The page in force is filled with the accent,
// as anything chosen is, and the two steps follow the label mode like every
// other button.
const props = withDefaults(
  defineProps<{
    /** How many items the pages hold between them. */
    count: number;
    pageSize?: number;
    /** How many pages stand on each side of the one in force before a gap. */
    siblingCount?: number;
    text?: Partial<PaginationText>;
  }>(),
  { pageSize: 10, siblingCount: 1 },
);
const page = defineModel<number>("page");

const words = computed(() => ({ ...PAGINATION_TEXT, ...props.text }));
const id = useId();
const service = useMachine(
  pagination.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    count: props.count,
    pageSize: props.pageSize,
    siblingCount: props.siblingCount,
    page: page.value ?? 1,
    onPageChange: (d: { page: number }) => (page.value = d.page),
    translations: {
      rootLabel: words.value.label,
      itemLabel: (d: { page: number; totalPages: number }) => words.value.page(d.page, d.totalPages),
    },
  })),
);
const api = computed(() => pagination.connect(service, normalizeProps));
</script>

<template>
  <nav data-glim="Pagination" v-bind="api.getRootProps()" class="glim-pagination">
    <Button :label="words.previous" :label-key="null" :glyph="IconBack" variant="icon" :disabled="api.previousPage === null" @click="api.goToPrevPage()" />
    <template v-for="(p, index) in api.pages" :key="p.type === 'page' ? p.value : `gap-${index}`">
      <button v-if="p.type === 'page'" v-bind="api.getItemProps(p)" class="glim-page glim-num">{{ p.value }}</button>
      <span v-else v-bind="api.getEllipsisProps({ index })" class="glim-page-gap">…</span>
    </template>
    <Button :label="words.next" :label-key="null" :glyph="IconForward" variant="icon" :disabled="api.nextPage === null" @click="api.goToNextPage()" />
  </nav>
</template>
