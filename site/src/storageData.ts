// The storage picker demos: the whole storage catalog, as an app that reaches
// every provider would offer it. Each framework's demo draws the glyphs its own
// way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { STORAGE_PROVIDERS } from "@glimstone/core/storageProviders";

const TITLES = { cloud: "Clouds", storage: "Object storage", protocol: "Servers and shares", layered: "On another target" };

export const STORAGE_TEXT: PickerText = {
  search: "Search providers",
  none: "Nothing matches “{query}”. Custom S3 reaches most bucket stores, and WebDAV most servers.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

/** The picker's tiles and groups, with the framework's own glyph for a provider without a mark. */
export function storagePicker<M>(glyph: (name: string) => M) {
  return catalogPicker(STORAGE_PROVIDERS, {
    ids: STORAGE_PROVIDERS.entries.map((e) => e.id),
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconCloud"),
    lang: "en",
  });
}

const NAMES = new Map(STORAGE_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

/** The provider picked last, for the line beside the demo's button. */
export const storageLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No storage yet");
