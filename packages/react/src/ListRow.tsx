import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { InfoBubble } from "./InfoBubble.tsx";

// One row of a list: a glyph tile, the name, badges and buttons that come in on
// hover and focus (rule 6). A click handler makes the whole row a way into its
// object, by keyboard too. The other props of a <div> go to the row.

export interface ListRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  name: string;
  /** More about the row, drawn as an "(i)" beside the name. */
  tip?: string | null;
  /** Sets the name in monospace, for a path. */
  mono?: boolean;
  /** The glyph at the row's start, which fills with the accent while the row is reached. */
  tile?: ReactNode;
  /** What stands at the row's end at rest. */
  badges?: ReactNode;
  /** The buttons that come in on hover and focus. A press on one does not open the row. */
  actions?: ReactNode;
  className?: string;
}

const stay = (e: MouseEvent) => e.stopPropagation();

export function ListRow({ name, tip, mono, tile, badges, actions, className, onClick, onKeyDown, ...rest }: ListRowProps) {
  function keys(e: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(e);
    if (!onClick || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    e.currentTarget.click();
  }
  const classes = ["glim-list-row", onClick && "glim-list-row--opens", className].filter(Boolean).join(" ");
  return (
    <div role="group" aria-label={name} tabIndex={onClick ? 0 : undefined} {...rest} onClick={onClick} onKeyDown={keys} className={classes}>
      {tile && <span className="glim-list-row-tile">{tile}</span>}
      <span className={mono ? "glim-list-row-name glim-list-row-name--mono" : "glim-list-row-name"}>
        <span className="glim-list-row-title">{name}</span>
        {tip && (
          <span className="glim-list-row-tip" onClick={stay}>
            <InfoBubble tip={tip} />
          </span>
        )}
      </span>
      {badges && <span className="glim-list-row-badges">{badges}</span>}
      {actions && (
        <span className="glim-list-row-actions" onClick={stay}>
          {actions}
        </span>
      )}
    </div>
  );
}
