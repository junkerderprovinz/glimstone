import { readPortalHue } from "@glimstone/core";

/** What a portalled panel needs to stand in its trigger's palette position. */
export interface PortalHue {
  /** Inline custom properties for the portalled element; `css()` turns them into style text. */
  readonly style: Record<string, string> | undefined;
  /** `"glim-hue"` when there is a hue to apply, otherwise `""`. */
  readonly className: string;
}

/** Copies the trigger's rainbow position onto a portalled panel while it is open. */
export function usePortalHue(open: () => boolean, trigger: () => HTMLElement | null | undefined): PortalHue {
  const hue = $derived.by(() => {
    const el = trigger();
    return open() && el ? readPortalHue(el) : null;
  });
  return {
    get style() {
      return hue ?? undefined;
    },
    get className() {
      return hue ? "glim-hue" : "";
    },
  };
}
