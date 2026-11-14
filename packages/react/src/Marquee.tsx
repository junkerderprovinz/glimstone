import { useId, useState, type ReactNode } from "react";
import * as marquee from "@zag-js/marquee";
import { normalizeProps, useMachine } from "@zag-js/react";
import { MARQUEE_TEXT, pageDir, type MarqueeText } from "@glimstone/core";
import { IconButton } from "./IconButton.tsx";
import { IconPause, IconPlay } from "./glyphs.tsx";

export type { MarqueeText } from "@glimstone/core";

// A row that runs past on its own, such as the names of the people a release
// thanks. It is a continuous animation, so it stops outright at the motion
// level off and under reduced motion, it halts while the pointer or the focus
// is on it, and its own button holds it for good, as WCAG 2.2.2 asks.

export interface MarqueeProps<T> {
  /** The row's accessible name. */
  label: string;
  items: readonly T[];
  /** How fast it runs, in pixels a second. */
  speed?: number;
  /** Runs the other way. */
  reverse?: boolean;
  /** Draws one item. */
  item: (item: T) => ReactNode;
  text?: Partial<MarqueeText>;
}

export function Marquee<T>({ label, items, speed = 40, reverse = false, item, text }: MarqueeProps<T>) {
  const words = { ...MARQUEE_TEXT, ...text };
  const [held, setHeld] = useState(false);
  const service = useMachine(marquee.machine, {
    id: useId(),
    dir: pageDir(),
    speed,
    reverse,
    autoFill: true,
    paused: held,
    spacing: "var(--space-10)",
    translations: { root: label },
  });
  const api = marquee.connect(service, normalizeProps);
  return (
    <div data-glim="Marquee" className="glim-marquee-frame">
      <div {...api.getRootProps()} className="glim-marquee">
        <div {...api.getViewportProps()} className="glim-marquee-viewport">
          {Array.from({ length: api.contentCount }, (_, index) => (
            <div key={index} {...api.getContentProps({ index })} className="glim-marquee-content">
              {items.map((entry, i) => (
                <div key={i} {...api.getItemProps()} className="glim-marquee-item">
                  {item(entry)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <IconButton tip={held ? words.resume : words.pause} glyph={held ? <IconPlay /> : <IconPause />} pressed={held} onClick={() => setHeld(!held)} />
    </div>
  );
}
