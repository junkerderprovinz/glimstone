import { useId, type ReactNode } from "react";
import * as scrollArea from "@zag-js/scroll-area";
import { normalizeProps, useMachine } from "@zag-js/react";
import { pageDir } from "@glimstone/core";

// A box that scrolls its content behind thin bars of the house's own, instead
// of the platform's, which draw a different width and colour on every system.
// The box is a region a keyboard can reach and scroll with the arrow keys.

export interface ScrollAreaProps {
  /** The region's accessible name. */
  label: string;
  /** How tall it grows before it scrolls, as a CSS length. */
  maxHeight: string;
  children: ReactNode;
}

export function ScrollArea({ label, maxHeight, children }: ScrollAreaProps) {
  const service = useMachine(scrollArea.machine, { id: useId(), dir: pageDir() });
  const api = scrollArea.connect(service, normalizeProps);
  const viewport = api.getViewportProps();
  return (
    <div data-glim="ScrollArea" {...api.getRootProps()} className="glim-scroll">
      <div {...viewport} role="region" aria-label={label} tabIndex={0} style={{ ...viewport.style, maxHeight }} className="glim-scroll-viewport">
        <div {...api.getContentProps()} className="glim-scroll-content">
          {children}
        </div>
      </div>
      <div {...api.getScrollbarProps({ orientation: "vertical" })} className="glim-scroll-bar">
        <div {...api.getThumbProps({ orientation: "vertical" })} className="glim-scroll-thumb" />
      </div>
      <div {...api.getScrollbarProps({ orientation: "horizontal" })} className="glim-scroll-bar">
        <div {...api.getThumbProps({ orientation: "horizontal" })} className="glim-scroll-thumb" />
      </div>
      <div {...api.getCornerProps()} className="glim-scroll-corner" />
    </div>
  );
}
