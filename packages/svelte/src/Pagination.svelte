<script lang="ts" module>
  import type { PaginationText } from "@glimstone/core";

  export type { PaginationText } from "@glimstone/core";

  export interface PaginationProps {
    /** How many items the pages hold between them. */
    count: number;
    pageSize?: number;
    /** The page in force, counted from 1, bound with `bind:page`. Left out, it keeps its own. */
    page?: number;
    onPageChange?: (page: number) => void;
    /** How many pages stand on each side of the one in force before a gap. */
    siblingCount?: number;
    text?: Partial<PaginationText>;
  }
</script>

<script lang="ts">
  import * as pagination from "@zag-js/pagination";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { PAGINATION_TEXT, pageDir, watchPaginationFit } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { IconBack, IconForward } from "./glyphs.js";

  // The pages of a long list, for the place a list cannot show every row at once.
  // The page in force is filled with the accent, as anything chosen is, and the
  // two steps follow the label mode like every other button. Where the row has
  // no room, the steps stand as glyphs around "3 / 20" (watchPaginationFit).
  let { count, pageSize = 10, page = $bindable(), onPageChange, siblingCount = 1, text }: PaginationProps = $props();

  const words = $derived({ ...PAGINATION_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(pagination.machine, () => ({
    id,
    dir: pageDir(),
    count,
    pageSize,
    siblingCount,
    page: page ?? 1,
    onPageChange: (d: { page: number }) => {
      page = d.page;
      onPageChange?.(d.page);
    },
    translations: {
      rootLabel: words.label,
      itemLabel: (d: { page: number; totalPages: number }) => words.page(d.page, d.totalPages),
    },
  }));
  const api = $derived(pagination.connect(service, normalizeProps));

  let nav: HTMLElement;
  $effect(() => watchPaginationFit(nav));
</script>

<nav bind:this={nav} data-glim="Pagination" {...api.getRootProps()} class="glim-pagination">
  <Button class="glim-page-step" label={words.previous} labelKey={null} glyph={IconBack} variant="icon" disabled={api.previousPage === null} onClick={() => api.goToPrevPage()} />
  <Button class="glim-page-step-short" label={words.previous} labelKey={null} glyph={IconBack} compact disabled={api.previousPage === null} onClick={() => api.goToPrevPage()} />
  {#each api.pages as p, index (p.type === "page" ? p.value : `gap-${index}`)}
    {#if p.type === "page"}
      <button {...api.getItemProps(p)} class="glim-page glim-num">{p.value}</button>
    {:else}
      <span {...api.getEllipsisProps({ index })} class="glim-page-gap">…</span>
    {/if}
  {/each}
  <span class="glim-page-status glim-num">
    <span aria-hidden="true">{words.status(api.page, api.totalPages)}</span>
    <span class="glim-sr-only">{words.page(api.page, api.totalPages)}</span>
  </span>
  <Button class="glim-page-step" label={words.next} labelKey={null} glyph={IconForward} variant="icon" disabled={api.nextPage === null} onClick={() => api.goToNextPage()} />
  <Button class="glim-page-step-short" label={words.next} labelKey={null} glyph={IconForward} compact disabled={api.nextPage === null} onClick={() => api.goToNextPage()} />
</nav>
