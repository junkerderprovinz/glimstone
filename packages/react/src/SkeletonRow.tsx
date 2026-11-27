import type { CSSProperties } from "react";
import { skeletonRowView } from "@glimstone/core";

// A row that holds a ListRow's place while the list loads, so nothing jumps
// when the rows arrive. It shows only after BUSY_DELAY. The list around it
// carries aria-busy and says what is loading; the row itself is hidden from
// assistive technology.

export interface SkeletonRowProps {
  /** Milliseconds before it shows; 0 shows it at once. */
  delay?: number;
  /** The tile at the row's start, for a list whose rows have one. */
  tile?: boolean;
  /** The badge at the row's end, for a list whose rows have one. */
  badge?: boolean;
  /** A bar in the value column, for a list whose rows carry a `value`. */
  value?: boolean;
  /** How many row buttons to keep room for, so the value bar stands where the real rows put their figures. */
  actions?: number;
  className?: string;
}

export function SkeletonRow({ delay, tile = true, badge = true, value = false, actions = 0, className }: SkeletonRowProps) {
  const view = skeletonRowView({ delay, tile, badge, value, actions });
  return (
    <div data-glim="SkeletonRow" aria-hidden="true" className={className ? `${view.className} ${className}` : view.className} style={view.style as CSSProperties}>
      {view.tile && <span className="glim-skeleton-block glim-skeleton-tile" />}
      <span className="glim-skeleton-block glim-skeleton-name" />
      {view.badge && <span className="glim-skeleton-block glim-skeleton-badge" />}
      {view.value && <span className="glim-skeleton-block glim-skeleton-value" />}
      {view.actions > 0 && <span className="glim-skeleton-actions" />}
    </div>
  );
}
