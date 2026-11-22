// Hermes, the engine of a React Native app, and older WebViews ship Intl
// without some of its constructors, and a Hermes built without ICU has no Intl
// at all, so each use asks first and has a plain stand-in.

/** Whether this engine's Intl has the named constructor, such as `Segmenter`. */
export function intlHas(name: "Segmenter" | "Collator" | "PluralRules" | "ListFormat" | "RelativeTimeFormat"): boolean {
  return typeof Intl === "object" && typeof (Intl as unknown as Record<string, unknown>)[name] === "function";
}
