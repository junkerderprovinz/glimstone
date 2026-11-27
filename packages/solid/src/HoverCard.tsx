import { createMemo, createSignal, createUniqueId, For, mergeProps, Show, type JSX } from "solid-js";
import * as hoverCard from "@zag-js/hover-card";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { hoverCardFacts, pageDir, type HoverCardFact } from "@glimstone/core";
import { Lift } from "./Lift.tsx";
import { usePortalHue } from "./portalHue.ts";
import { css } from "./style.ts";

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
  media?: JSX.Element;
  /** The head's name. */
  title?: string;
  /** One quiet line under the name, such as an address or a state. */
  meta?: string;
  /** Up to three figures under the head, each a name and a value. */
  facts?: readonly HoverCardFact[];
  /** Draws the card's body below the head, or the whole card without one. */
  content?: () => JSX.Element;
}

export function HoverCard(raw: HoverCardProps) {
  const props = mergeProps({ openDelay: 400, closeDelay: 150 }, raw);
  const id = createUniqueId();
  const service = useMachine(hoverCard.machine, () => ({
    id,
    dir: pageDir(),
    openDelay: props.openDelay,
    closeDelay: props.closeDelay,
    positioning: { placement: "bottom" as const, gutter: 8 },
  }));
  const api = createMemo(() => hoverCard.connect(service, normalizeProps));
  const [trigger, setTrigger] = createSignal<HTMLAnchorElement>();
  const hue = usePortalHue(() => api().open, trigger);
  const positioner = () => api().getPositionerProps();
  return (
    <>
      <a data-glim="HoverCard" {...api().getTriggerProps()} ref={setTrigger} href={props.href} class="glim-hovercard-link">
        {props.label}
      </a>
      <Show when={api().open}>
        <Lift>
          <div
            {...positioner()}
            style={{ ...(positioner().style as JSX.CSSProperties), ...css(hue.style()) }}
            class={`glim-hovercard-positioner ${hue.className()}`.trim()}
          >
            <div {...api().getContentProps()} class="glim-hovercard">
              <Show when={props.media || props.title}>
                <div class="glim-hovercard-head">
                  <Show when={props.media}>
                    <span class="glim-hovercard-media">{props.media}</span>
                  </Show>
                  <span class="glim-hovercard-names">
                    <Show when={props.title}>
                      <strong class="glim-hovercard-title">{props.title}</strong>
                    </Show>
                    <Show when={props.meta}>
                      <span class="glim-hovercard-meta">{props.meta}</span>
                    </Show>
                  </span>
                </div>
              </Show>
              <Show when={hoverCardFacts(props.facts).length}>
                <dl class="glim-hovercard-facts">
                  <For each={hoverCardFacts(props.facts)}>
                    {(f) => (
                      <div class="glim-hovercard-fact">
                        <dt>{f.label}</dt>
                        <dd class="glim-num">{f.value}</dd>
                      </div>
                    )}
                  </For>
                </dl>
              </Show>
              {props.content?.()}
            </div>
          </div>
        </Lift>
      </Show>
    </>
  );
}
