// The sign-in picker demos: the whole identity catalog, as an app that signs
// in through every one of those services would offer it, with the app's own
// tile for any other OpenID Connect issuer, which stands last. Each
// framework's demo draws the glyphs its own way.
import { catalogPicker, type PickItem, type PickerText } from "@glimstone/core";
import { IDENTITY_PROVIDERS } from "@glimstone/core/identityProviders";

const TITLES = { selfHosted: "Self-hosted" };

const OTHER = "Other provider";

export const IDENTITY_TEXT: PickerText = {
  search: "Search sign-in services",
  none: `Nothing matches “{query}”. ${OTHER} takes any OpenID Connect issuer.`,
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

/** The picker's tiles and groups, with the framework's own glyph for a service without a mark. */
export function identityPicker<M>(glyph: (name: string) => M) {
  const { items, groups } = catalogPicker(IDENTITY_PROVIDERS, {
    ids: IDENTITY_PROVIDERS.entries.map((e) => e.id),
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconSignIn"),
    lang: "en",
  });
  const other: PickItem<M> = { id: "custom", label: OTHER, group: "selfHosted", tip: "Any OpenID Connect issuer", last: true, mark: glyph("IconSignIn") };
  return { items: [...items, other], groups };
}

const NAMES = new Map<string, string>([...IDENTITY_PROVIDERS.entries.map((e) => [e.id, e.name] as const), ["custom", OTHER]]);

/** The service picked last, for the line beside the demo's button. */
export const identityLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No sign-in service yet");
