import { createMemo, createSignal, createUniqueId, For, Index, mergeProps, type JSX } from "solid-js";
import * as marquee from "@zag-js/marquee";
import { normalizeProps, useMachine } from "@zag-js/solid";
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
  item: (item: T) => JSX.Element;
  text?: Partial<MarqueeText>;
}

export function Marquee<T>(raw: MarqueeProps<T>) {
  const props = mergeProps({ speed: 40, reverse: false }, raw);
  const words = () => ({ ...MARQUEE_TEXT, ...props.text });
  const id = createUniqueId();
  const [held, setHeld] = createSignal(false);
  const service = useMachine(marquee.machine, () => ({
    id,
    dir: pageDir(),
    speed: props.speed,
    reverse: props.reverse,
    autoFill: true,
    paused: held(),
    spacing: "var(--space-10)",
    translations: { root: props.label },
  }));
  const api = createMemo(() => marquee.connect(service, normalizeProps));
  return (
    <div data-glim="Marquee" class="glim-marquee-frame">
      <div {...api().getRootProps()} class="glim-marquee">
        <div {...api().getViewportProps()} class="glim-marquee-viewport">
          <Index each={Array.from({ length: api().contentCount })}>
            {(_, index) => (
              <div {...api().getContentProps({ index })} class="glim-marquee-content">
                <For each={props.items}>
                  {(entry) => (
                    <div {...api().getItemProps()} class="glim-marquee-item">
                      {props.item(entry)}
                    </div>
                  )}
                </For>
              </div>
            )}
          </Index>
        </div>
      </div>
      <IconButton tip={held() ? words().resume : words().pause} glyph={held() ? <IconPlay /> : <IconPause />} pressed={held()} onClick={() => setHeld(!held())} />
    </div>
  );
}
