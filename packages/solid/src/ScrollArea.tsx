import { createMemo, createUniqueId, type JSX } from "solid-js";
import * as scrollArea from "@zag-js/scroll-area";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { pageDir } from "@glimstone/core";

// A box that scrolls its content behind thin bars of the house's own, instead
// of the platform's, which draw a different width and colour on every system.
// The box is a region a keyboard can reach and scroll with the arrow keys.

export interface ScrollAreaProps {
  /** The region's accessible name. */
  label: string;
  /** How tall it grows before it scrolls, as a CSS length. */
  maxHeight: string;
  children: JSX.Element;
}

export function ScrollArea(props: ScrollAreaProps) {
  const id = createUniqueId();
  const service = useMachine(scrollArea.machine, () => ({ id, dir: pageDir() }));
  const api = createMemo(() => scrollArea.connect(service, normalizeProps));
  const viewport = () => api().getViewportProps();
  return (
    <div data-glim="ScrollArea" {...api().getRootProps()} class="glim-scroll">
      <div
        {...viewport()}
        role="region"
        aria-label={props.label}
        tabIndex={0}
        style={{ ...(viewport().style as JSX.CSSProperties), "max-height": props.maxHeight }}
        class="glim-scroll-viewport"
      >
        <div {...api().getContentProps()} class="glim-scroll-content">
          {props.children}
        </div>
      </div>
      <div {...api().getScrollbarProps({ orientation: "vertical" })} class="glim-scroll-bar">
        <div {...api().getThumbProps({ orientation: "vertical" })} class="glim-scroll-thumb" />
      </div>
      <div {...api().getScrollbarProps({ orientation: "horizontal" })} class="glim-scroll-bar">
        <div {...api().getThumbProps({ orientation: "horizontal" })} class="glim-scroll-thumb" />
      </div>
      <div {...api().getCornerProps()} class="glim-scroll-corner" />
    </div>
  );
}
