import { children, createRenderEffect, onCleanup, type JSX } from "solid-js";
import { portalTarget } from "@glimstone/core";

/**
 * Puts its children straight into the portal target, the body or an open
 * sheet, so no card's `overflow: hidden` clips them. Solid's Portal would
 * wrap them in a div of its own, and the markup would differ from the other
 * frameworks'. They arrive while rendering, so an effect can measure them.
 */
export function Lift(props: { children: JSX.Element }) {
  const resolved = children(() => props.children);
  createRenderEffect(() => {
    const nodes = resolved.toArray().filter((n): n is Node => n instanceof Node);
    portalTarget().append(...nodes);
    onCleanup(() => nodes.forEach((n) => (n as ChildNode).remove()));
  });
  return null;
}
