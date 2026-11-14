import { createMemo, createSignal, createUniqueId, For, mergeProps } from "solid-js";
import * as pagination from "@zag-js/pagination";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { PAGINATION_TEXT, pageDir, type PaginationText } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconBack, IconForward } from "./glyphs.tsx";

export type { PaginationText } from "@glimstone/core";

// The pages of a long list, for the place a list cannot show every row at once.
// The page in force is filled with the accent, as anything chosen is, and the
// two steps follow the label mode like every other button.

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
  return (
    <nav data-glim="Pagination" {...api().getRootProps()} class="glim-pagination">
      <Button
        label={words().previous}
        labelKey={null}
        glyph={<IconBack />}
        variant="icon"
        disabled={api().previousPage === null}
        onClick={() => api().goToPrevPage()}
      />
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
      <Button
        label={words().next}
        labelKey={null}
        glyph={<IconForward />}
        variant="icon"
        disabled={api().nextPage === null}
        onClick={() => api().goToNextPage()}
      />
    </nav>
  );
}
