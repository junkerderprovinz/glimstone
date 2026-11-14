import { mergeProps, Show } from "solid-js";
import { skeletonRowView } from "@glimstone/core";
import { css } from "./style.ts";

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
  class?: string;
}

export function SkeletonRow(props: SkeletonRowProps) {
  const merged = mergeProps({ tile: true, badge: true }, props);
  const view = () => skeletonRowView({ delay: merged.delay, tile: merged.tile, badge: merged.badge });
  return (
    <div data-glim="SkeletonRow" aria-hidden="true" class={merged.class ? `${view().className} ${merged.class}` : view().className} style={css(view().style)}>
      <Show when={view().tile}>
        <span class="glim-skeleton-block glim-skeleton-tile" />
      </Show>
      <span class="glim-skeleton-block glim-skeleton-name" />
      <Show when={view().badge}>
        <span class="glim-skeleton-block glim-skeleton-badge" />
      </Show>
    </div>
  );
}
