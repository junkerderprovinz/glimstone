import { createMemo, type Accessor } from "solid-js";
import { readPortalHue } from "@glimstone/core";

/** What a portalled panel needs to stand in its trigger's palette position. */
export interface PortalHue {
  /** Inline custom properties to spread onto the portalled element. */
  style: Accessor<Record<string, string> | undefined>;
  /** `"glim-hue"` when there is a hue to apply, otherwise `""`. */
  className: Accessor<string>;
}

/** Copies the trigger's rainbow position onto a portalled panel while it is open. */
export function usePortalHue(open: () => boolean, trigger: () => HTMLElement | null | undefined): PortalHue {
  const hue = createMemo(() => {
    const el = trigger();
    return open() && el ? readPortalHue(el) : null;
  });
  return { style: () => hue() ?? undefined, className: () => (hue() ? "glim-hue" : "") };
}
