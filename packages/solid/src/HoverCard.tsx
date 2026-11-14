import { createMemo, createSignal, createUniqueId, mergeProps, Show, type JSX } from "solid-js";
import * as hoverCard from "@zag-js/hover-card";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { pageDir } from "@glimstone/core";
import { Lift } from "./Lift.tsx";
import { usePortalHue } from "./portalHue.ts";
import { css } from "./style.ts";

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
  content: () => JSX.Element;
}

export function HoverCard(raw: HoverCardProps) {
  const props = mergeProps({ openDelay: 600, closeDelay: 300 }, raw);
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
              {props.content()}
            </div>
          </div>
        </Lift>
      </Show>
    </>
  );
}
