import { portalTarget } from "@glimstone/core";

/**
 * An attachment that moves its element into the portal target, the body or an
 * open sheet, so no card's `overflow: hidden` clips it.
 */
export function lift(node: HTMLElement): () => void {
  portalTarget().append(node);
  return () => node.remove();
}
