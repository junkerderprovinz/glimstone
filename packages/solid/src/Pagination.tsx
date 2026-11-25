import { createMemo, createSignal, createUniqueId, For, mergeProps, onCleanup, onMount, type JSX } from "solid-js";
import * as pagination from "@zag-js/pagination";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { PAGINATION_TEXT, pageDir, watchPaginationFit, type PaginationText } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconBack, IconForward } from "./glyphs.tsx";

export type { PaginationText } from "@glimstone/core";

// The pages of a long list, for the place a list cannot show every row at once.
// The page in force is filled with the accent, as anything chosen is, and the
// two steps follow the label mode like every other button. Where the row has no
// room, the steps stand as glyphs around "3 / 20" (watchPaginationFit).

export interface PaginationProps {
  /** How many items the pages hold between them. */
  count: number;
  pageSize?: number;
  /** The page in force, counted from 1. Left out, it keeps its own. */
  page?: number;
  onPageChange?: (page: number) => void;
  /** How many pages stand on each side of the one in force before a gap. */
  siblingCount?: number;
  text?: Partial<PaginationText>;
}

export function Pagination(raw: PaginationProps) {
  const props = mergeProps({ pageSize: 10, siblingCount: 1 }, raw);
  const words = () => ({ ...PAGINATION_TEXT, ...props.text });
  const id = createUniqueId();
  const [own, setOwn] = createSignal(1);
  const service = useMachine(pagination.machine, () => ({
    id,
    dir: pageDir(),
    count: props.count,
    pageSize: props.pageSize,
    siblingCount: props.siblingCount,
    page: props.page ?? own(),
    onPageChange: (d: { page: number }) => {
      setOwn(d.page);
      props.onPageChange?.(d.page);
    },
    translations: {
      rootLabel: words().label,
      itemLabel: (d: { page: number; totalPages: number }) => words().page(d.page, d.totalPages),
    },
  }));
  const api = createMemo(() => pagination.connect(service, normalizeProps));
  // Keyed by page number, so a page keeps its button and its focus while the
  // gaps around it move.
  const keys = createMemo(() => api().pages.map((p, index) => (p.type === "page" ? p.value : `gap-${index}`)));
  let nav!: HTMLElement;
  onMount(() => onCleanup(watchPaginationFit(nav)));
  const step = (label: () => string, glyph: () => JSX.Element, disabled: () => boolean, onClick: () => void) => (
    <>
      <Button class="glim-page-step" label={label()} labelKey={null} glyph={glyph()} variant="icon" disabled={disabled()} onClick={onClick} />
      <Button class="glim-page-step-short" label={label()} labelKey={null} glyph={glyph()} compact disabled={disabled()} onClick={onClick} />
    </>
  );
  return (
    <nav ref={nav} data-glim="Pagination" {...api().getRootProps()} class="glim-pagination">
      {step(() => words().previous, () => <IconBack />, () => api().previousPage === null, () => api().goToPrevPage())}
      <For each={keys()}>
        {(key) =>
          typeof key === "number" ? (
            <button {...api().getItemProps({ type: "page", value: key })} class="glim-page glim-num">
              {key}
            </button>
          ) : (
            <span {...api().getEllipsisProps({ index: Number(key.slice(4)) })} class="glim-page-gap">
              …
            </span>
          )
        }
      </For>
      <span class="glim-page-status glim-num">
        <span aria-hidden="true">{words().status(api().page, api().totalPages)}</span>
        <span class="glim-sr-only">{words().page(api().page, api().totalPages)}</span>
      </span>
      {step(() => words().next, () => <IconForward />, () => api().nextPage === null, () => api().goToNextPage())}
    </nav>
  );
}
