// The transfer picker demos: the whole transfer catalog, as an app that
// fetches from every transfer service would offer it. Each framework's demo
// draws the glyphs its own way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { TRANSFER_PROVIDERS } from "@glimstone/core/transferProviders";

const TITLES = {
  transfer: { title: "Transfer services", hint: "A file sent as a link, fetched without an account." },
};

export const TRANSFER_TEXT: PickerText = {
  search: "Search transfer services",
  none: "Nothing matches “{query}”. A cloud drive's link goes in as storage.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

/** The picker's tiles and groups, with the framework's own glyph for a service without a mark. */
export function transferPicker<M>(glyph: (name: string) => M) {
  return catalogPicker(TRANSFER_PROVIDERS, {
    ids: TRANSFER_PROVIDERS.entries.map((e) => e.id),
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconCloud"),
    lang: "en",
  });
}

const NAMES = new Map(TRANSFER_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

/** The service picked last, for the line beside the demo's button. */
export const transferLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No service yet");
