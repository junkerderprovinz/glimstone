import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { listRowStatus, type ListRowStatus } from "@glimstone/core";
import { InfoBubble } from "./InfoBubble.tsx";
import { MarkSvg } from "./glyphs.tsx";

export type { ListRowStatus } from "@glimstone/core";

// One row of a list: a glyph tile, the name, badges and buttons that come in on
// hover and focus (rule 6). A click handler makes the whole row a way into its
// object, by keyboard too. The other props of a <div> go to the row.

export interface ListRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  name: string;
  /** More about the row, drawn as an "(i)" beside the name. */
  tip?: string | null;
  /** Sets the name in monospace, for a path. */
  mono?: boolean;
  /** A quiet line under the name, such as when it was made or where it comes from. */
  meta?: string;
  /** Keeps the buttons in view at rest, for a short list of the person's own things, where each row's buttons are the point. */
  steady?: boolean;
  /** The glyph at the row's start, which fills with the accent while the row is reached. */
  tile?: ReactNode;
  /** What stands at the row's end at rest. */
  badges?: ReactNode;
  /** A row that differs from the rest, as a mark in the state colour with
   *  neutral words, in its own place before the value. The normal case passes
   *  nothing and stays quiet. */
  status?: ListRowStatus;
  /** The row's figure, such as a size, in a column of fixed width at its end,
   *  so a status beside it moves nothing. A unit in <small> stands quieter. */
  value?: ReactNode;
  /** The buttons that come in on hover and focus. A press on one does not open the row. */
  actions?: ReactNode;
  className?: string;
}

const stay = (e: MouseEvent) => e.stopPropagation();

export function ListRow({ name, tip, mono, meta, steady, tile, badges, status, value, actions, className, onClick, onKeyDown, ...rest }: ListRowProps) {
  function keys(e: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(e);
    if (!onClick || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    e.currentTarget.click();
  }
  const nameLine = (
    <span className={mono ? "glim-list-row-name glim-list-row-name--mono" : "glim-list-row-name"}>
      <span className="glim-list-row-title">{name}</span>
      {tip && (
        <span className="glim-list-row-tip" onClick={stay}>
          <InfoBubble tip={tip} />
        </span>
      )}
    </span>
  );
  const classes = ["glim-list-row", onClick && "glim-list-row--opens", steady && "glim-list-row--steady", className].filter(Boolean).join(" ");
  return (
    <div data-glim="ListRow" role="group" aria-label={name} tabIndex={onClick ? 0 : undefined} {...rest} onClick={onClick} onKeyDown={keys} className={classes}>
      {tile && <span className="glim-list-row-tile">{tile}</span>}
      {meta ? (
        <span className="glim-list-row-text">
          {nameLine}
          <span className="glim-list-row-meta">{meta}</span>
        </span>
      ) : (
        nameLine
      )}
      {badges && <span className="glim-list-row-badges">{badges}</span>}
      {status && (
        <span className="glim-list-row-status" data-tone={status.tone}>
          {listRowStatus(status.tone).mark ? <MarkSvg mark={listRowStatus(status.tone).mark!} className="glim-status-mark" /> : <span className="glim-status-dot" aria-hidden="true" />}
          <span>{status.label}</span>
        </span>
      )}
      {value !== undefined && <span className="glim-list-row-value">{value}</span>}
      {actions && (
        <span className="glim-list-row-actions" onClick={stay}>
          {actions}
        </span>
      )}
    </div>
  );
}
