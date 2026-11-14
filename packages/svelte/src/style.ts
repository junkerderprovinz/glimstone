/**
 * The core hands styles over as objects in the DOM's camel case, such as
 * `minWidth`, and a Svelte element takes its style as text.
 */
export function css(style: Record<string, string | number> | undefined): string | undefined {
  if (!style) return undefined;
  const text = Object.entries(style)
    .map(([key, value]) => `${key.startsWith("--") ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value}`)
    .join("; ");
  return text || undefined;
}
