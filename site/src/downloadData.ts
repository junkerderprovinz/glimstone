// The download picker demos: the whole download catalog, as an app that signs
// in to every debrid service and hoster would offer it. Each framework's demo
// draws the glyphs its own way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { DOWNLOAD_PROVIDERS } from "@glimstone/core/downloadProviders";

const TITLES = {
  debrid: { title: "Debrid services", hint: "One account unlocks the links of many hosters." },
  hoster: { title: "File hosters", hint: "A login of your own at one hoster." },
};

export const DOWNLOAD_TEXT: PickerText = {
  search: "Search services and hosters",
  none: "Nothing matches “{query}”. A debrid service reaches most hosters.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

/** The picker's tiles and groups, with the framework's own glyph for a provider without a mark. */
export function downloadPicker<M>(glyph: (name: string) => M) {
  return catalogPicker(DOWNLOAD_PROVIDERS, {
    ids: DOWNLOAD_PROVIDERS.entries.map((e) => e.id),
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconCloud"),
    lang: "en",
  });
}

const NAMES = new Map(DOWNLOAD_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

/** The account picked last, for the line beside the demo's button. */
export const downloadLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No account yet");
