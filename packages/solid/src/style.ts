import type { JSX } from "solid-js";

/**
 * The core hands styles over as objects in the DOM's camel case, such as
 * `minWidth`, and Solid sets each key with setProperty, which only knows the
 * hyphenated name.
 */
export function css(style: Record<string, string> | undefined): JSX.CSSProperties | undefined {
  if (!style) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(style)) out[key.startsWith("--") ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)] = value;
  return out;
}
