// The toast stack (design-language.md, "Toasts"): the newest card in front,
// the two before it showing only their edge behind it, the rest out of sight,
// and all of them fanned out one above the other while the pointer or the focus
// is on the stack.

export interface ToastPlace {
  /** How far back the card lies, 0 for the newest. */
  depth: number;
  /** How far the card moves up once the stack fans out, in px. */
  lift: number;
  /** It shows only its edge behind the newer cards. */
  behind: boolean;
  /** It lies too far back to show at all. */
  buried: boolean;
}

/** How many cards show an edge behind the newest one. */
export const TOAST_EDGES = 2;

/** The place of each card from the newest down, given their heights in that order and the gap between them when fanned out. */
export function toastPlaces(heights: readonly number[], gap: number): ToastPlace[] {
  let lift = 0;
  return heights.map((h, depth) => {
    const place = { depth, lift, behind: depth > 0, buried: depth > TOAST_EDGES };
    lift += h + gap;
    return place;
  });
}

/**
 * Lays out a `.glim-toast-stack` and keeps it laid out while cards come, go and
 * change size. Each card gets `--toast-i`, `--toast-y`, `data-behind` and
 * `data-buried`, and the stack the front card's height as `--toast-front-h`.
 * A card leaving on its exit animation keeps the place it had, so the others
 * close up over it. Returns the teardown.
 */
export function watchToastStack(stack: HTMLElement): () => void {
  const sizes = new ResizeObserver(() => lay());
  const lay = () => {
    const cards = [...stack.children].filter((c): c is HTMLElement => c instanceof HTMLElement && !c.hasAttribute("data-leaving")).reverse();
    // A card shown as an edge is clipped to the front card's height, so its
    // own comes from what it holds.
    const height = (c: HTMLElement) => (c.hasAttribute("data-behind") ? c.scrollHeight : c.offsetHeight);
    const places = toastPlaces(cards.map(height), parseFloat(getComputedStyle(stack).rowGap) || 0);
    cards.forEach((card, i) => {
      const p = places[i]!;
      card.style.setProperty("--toast-i", String(p.depth));
      card.style.setProperty("--toast-y", `${p.lift}px`);
      card.toggleAttribute("data-behind", p.behind);
      card.toggleAttribute("data-buried", p.buried);
      sizes.observe(card);
    });
    stack.style.setProperty("--toast-front-h", `${cards[0] ? cards[0].offsetHeight : 0}px`);
  };
  const changes = new MutationObserver(lay);
  changes.observe(stack, { childList: true });
  lay();
  return () => {
    changes.disconnect();
    sizes.disconnect();
  };
}
