// The DOM half of the one hover and focus bubble that a framework component
// opens next to its trigger (design-language.md, "The tooltip and info
// bubble"). The framework owns the open state and renders the bubble into
// <body>; these place it and close it again.

import { computeBubblePosition } from "./bubblePosition.ts";

/**
 * Places a rendered bubble against its trigger. Call it after the bubble
 * mounts and before paint, because its wrapped height depends on the tip's
 * length and a bubble placed later visibly jumps.
 */
export function placeBubble(trigger: HTMLElement, bubble: HTMLElement): void {
  const viewport = {
    width: document.documentElement.clientWidth || window.innerWidth,
    height: document.documentElement.clientHeight || window.innerHeight,
  };
  const { left, top } = computeBubblePosition(
    trigger.getBoundingClientRect(),
    { width: bubble.offsetWidth, height: bubble.offsetHeight },
    viewport,
  );
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

/**
 * Closes an open bubble on any scroll, which would leave it behind its
 * trigger, and on Escape, which has to work without a pointer move. Returns
 * the cleanup.
 */
export function dismissBubbleOn(hide: () => void): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") hide();
  };
  window.addEventListener("scroll", hide, true);
  window.addEventListener("keydown", onKey);
  return () => {
    window.removeEventListener("scroll", hide, true);
    window.removeEventListener("keydown", onKey);
  };
}

/** A tooltip names a control; an info bubble explains, so it opens at once and reads roomier. */
export type BubbleKind = "tip" | "info";

/** How long the pointer rests on a control before its tooltip opens. */
export const TOOLTIP_DELAY_MS = 500;

/** How soon after one tooltip closes the next opens without the wait, so running along a toolbar reads each tip at once. */
export const TOOLTIP_SKIP_MS = 300;

let lastTooltipClose = -Infinity;

/** The wait before a tooltip opens under the pointer: none while another has just closed, the full delay otherwise. */
export function tooltipDelay(now: number = performance.now(), delay: number = TOOLTIP_DELAY_MS): number {
  return now - lastTooltipClose < TOOLTIP_SKIP_MS ? 0 : delay;
}

/** Notes that a tooltip closed, which opens the window in which the next one needs no wait. */
export function tooltipClosed(now: number = performance.now()): void {
  lastTooltipClose = now;
}

/**
 * The wait between the pointer coming to rest on a trigger and its bubble
 * opening. `rest` opens a tooltip after the delay and an info bubble at once,
 * `cancel` drops an open still waiting, and `closed` notes a tooltip that was
 * showing.
 */
export function restTimer(kind: BubbleKind, delay: number = TOOLTIP_DELAY_MS) {
  let wait: ReturnType<typeof setTimeout> | undefined;
  return {
    rest(open: () => void) {
      clearTimeout(wait);
      const ms = kind === "tip" ? tooltipDelay(performance.now(), delay) : 0;
      if (ms === 0) open();
      else wait = setTimeout(open, ms);
    },
    cancel() {
      clearTimeout(wait);
    },
    closed(wasOpen: boolean) {
      if (wasOpen && kind === "tip") tooltipClosed();
    },
  };
}
