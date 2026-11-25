import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import * as pagination from "@zag-js/pagination";
import { normalizeProps, useMachine } from "@zag-js/react";
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

export function Pagination({ count, pageSize = 10, page, onPageChange, siblingCount = 1, text }: PaginationProps) {
  const words = { ...PAGINATION_TEXT, ...text };
  const [own, setOwn] = useState(1);
  const service = useMachine(pagination.machine, {
    id: useId(),
    dir: pageDir(),
    count,
    pageSize,
    siblingCount,
    page: page ?? own,
    onPageChange: (d) => {
      setOwn(d.page);
      onPageChange?.(d.page);
    },
    translations: { rootLabel: words.label, itemLabel: (d) => words.page(d.page, d.totalPages) },
  });
  const api = pagination.connect(service, normalizeProps);
  const nav = useRef<HTMLElement>(null);
  useLayoutEffect(() => watchPaginationFit(nav.current!), []);
  const step = (label: string, glyph: ReactNode, disabled: boolean, onClick: () => void) => (
    <>
      <Button className="glim-page-step" label={label} labelKey={null} glyph={glyph} variant="icon" disabled={disabled} onClick={onClick} />
      <Button className="glim-page-step-short" label={label} labelKey={null} glyph={glyph} compact disabled={disabled} onClick={onClick} />
    </>
  );
  return (
    <nav ref={nav} data-glim="Pagination" {...api.getRootProps()} className="glim-pagination">
      {step(words.previous, <IconBack />, api.previousPage === null, api.goToPrevPage)}
      {api.pages.map((p, index) =>
        p.type === "page" ? (
          <button key={p.value} {...api.getItemProps(p)} className="glim-page glim-num">
            {p.value}
          </button>
        ) : (
          <span key={`gap-${index}`} {...api.getEllipsisProps({ index })} className="glim-page-gap">
            …
          </span>
        ),
      )}
      <span className="glim-page-status glim-num">
        <span aria-hidden="true">{words.status(api.page, api.totalPages)}</span>
        <span className="glim-sr-only">{words.page(api.page, api.totalPages)}</span>
      </span>
      {step(words.next, <IconForward />, api.nextPage === null, api.goToNextPage)}
    </nav>
  );
}
