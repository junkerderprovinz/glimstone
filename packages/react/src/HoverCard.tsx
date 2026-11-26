import { useId, useRef, type ReactNode } from "react";
import * as hoverCard from "@zag-js/hover-card";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { hoverCardFacts, pageDir, portalTarget, type HoverCardFact } from "@glimstone/core";
import { usePortalHue } from "./portalHue.ts";

// A card that shows what a link leads to while the pointer rests on it or the
// keyboard reaches it, such as the details of a server named in a sentence.
// It only previews: everything in it is also behind the link, so a touch
// screen, which has no hover, loses nothing.

export type { HoverCardFact } from "@glimstone/core";

export interface HoverCardProps {
  /** The link's words. */
  label: string;
  href: string;
  /** How long the pointer rests before the card opens, and after it leaves before it closes, in ms. */
  openDelay?: number;
  closeDelay?: number;
  /** A glyph or an avatar for the card's head, in a 40px tile. */
  media?: ReactNode;
  /** The head's name. */
  title?: string;
  /** One quiet line under the name, such as an address or a state. */
  meta?: string;
  /** Up to three figures under the head, each a name and a value. */
  facts?: readonly HoverCardFact[];
  /** Draws the card's body below the head, or the whole card without one. */
  content?: () => ReactNode;
}

export function HoverCard({ label, href, openDelay = 400, closeDelay = 150, media, title, meta, facts, content }: HoverCardProps) {
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
              {(media || title) && (
                <div className="glim-hovercard-head">
                  {media && <span className="glim-hovercard-media">{media}</span>}
                  <span className="glim-hovercard-names">
                    {title && <strong className="glim-hovercard-title">{title}</strong>}
                    {meta && <span className="glim-hovercard-meta">{meta}</span>}
                  </span>
                </div>
              )}
              {hoverCardFacts(facts).length > 0 && (
                <dl className="glim-hovercard-facts">
                  {hoverCardFacts(facts).map((f) => (
                    <div key={f.label} className="glim-hovercard-fact">
                      <dt>{f.label}</dt>
                      <dd className="glim-num">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {content?.()}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
