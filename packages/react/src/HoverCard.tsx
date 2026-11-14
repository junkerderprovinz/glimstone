import { useId, useRef, type ReactNode } from "react";
import * as hoverCard from "@zag-js/hover-card";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { pageDir, portalTarget } from "@glimstone/core";
import { usePortalHue } from "./portalHue.ts";

// A card that shows what a link leads to while the pointer rests on it or the
// keyboard reaches it, such as the details of a server named in a sentence.
// It only previews: everything in it is also behind the link, so a touch
// screen, which has no hover, loses nothing.

export interface HoverCardProps {
  /** The link's words. */
  label: string;
  href: string;
  /** How long the pointer rests before the card opens, and after it leaves before it closes, in ms. */
  openDelay?: number;
  closeDelay?: number;
  /** Draws the card. */
  content: () => ReactNode;
}

export function HoverCard({ label, href, openDelay = 600, closeDelay = 300, content }: HoverCardProps) {
  const service = useMachine(hoverCard.machine, {
    id: useId(),
    dir: pageDir(),
    openDelay,
    closeDelay,
    positioning: { placement: "bottom", gutter: 8 },
  });
  const api = hoverCard.connect(service, normalizeProps);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const hue = usePortalHue(api.open, triggerRef);
  const positioner = api.getPositionerProps();
  return (
    <>
      <a data-glim="HoverCard" {...api.getTriggerProps()} ref={triggerRef} href={href} className="glim-hovercard-link">
        {label}
      </a>
      {api.open && (
        <Portal container={{ current: portalTarget() }}>
          <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`glim-hovercard-positioner ${hue.className}`.trim()}>
            <div {...api.getContentProps()} className="glim-hovercard">
              {content()}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
