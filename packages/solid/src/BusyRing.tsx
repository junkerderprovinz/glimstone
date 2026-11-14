import { Show } from "solid-js";
import { busyRingView, type BusyRingSize } from "@glimstone/core";
import { css } from "./style.ts";

export type { BusyRingSize } from "@glimstone/core";

// The ring that turns while the app works on something: two arcs turning
// against each other. It shows only after BUSY_DELAY, so a quick answer never
// flashes it.

export interface BusyRingProps {
  /** `small` fits a button's glyph slot, `large` a card that waits. */
  size?: BusyRingSize;
  /** What is being waited for. With it the ring is a status that says so, without
   *  it the ring is hidden from assistive technology and its surroundings speak. */
  label?: string;
  /** Milliseconds before it shows; 0 shows it at once. */
  delay?: number;
  class?: string;
}

export function BusyRing(props: BusyRingProps) {
  const view = () => busyRingView({ size: props.size, delay: props.delay });
  return (
    <span
      data-glim="BusyRing"
      role={props.label ? "status" : undefined}
      aria-hidden={props.label ? undefined : true}
      class={props.class ? `${view().className} ${props.class}` : view().className}
      style={css(view().style)}
    >
      <span class="glim-busy-ring-arc">
        <span class="glim-busy-ring-tail" />
      </span>
      <span class="glim-busy-ring-arc glim-busy-ring-arc--inner">
        <span class="glim-busy-ring-tail" />
      </span>
      <Show when={props.label}>
        <span class="glim-sr-only">{props.label}</span>
      </Show>
    </span>
  );
}
