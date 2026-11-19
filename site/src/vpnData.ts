// The VPN picker demos: the whole VPN catalog, as an app that connects to every
// provider would offer it. A provider that keeps WireGuard to its own app waits
// in view with the reason, and the own configuration stands last. Each
// framework's demo draws the glyphs its own way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { VPN_PROVIDERS } from "@glimstone/core/vpnProviders";
import { VPN_LAST } from "./vpnIds";

const TITLES = { provider: "Providers", appOnly: "Only in their own app" };

export const VPN_TEXT: PickerText = {
  search: "Search VPNs",
  none: "Nothing matches “{query}”. Own WireGuard config takes any WireGuard server.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

const LAST = new Set<string>(VPN_LAST);

/** The picker's tiles and groups, with the framework's own glyph for a provider without a mark. */
export function vpnPicker<M>(glyph: (name: string) => M) {
  return catalogPicker(VPN_PROVIDERS, {
    ids: VPN_PROVIDERS.entries.map((e) => e.id),
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconShieldOn"),
    lang: "en",
    own: (entry) =>
      entry.group === "appOnly"
        ? { status: "Not supported", hint: "Allows WireGuard only in its own app." }
        : LAST.has(entry.id)
          ? { tip: "Any WireGuard server", last: true }
          : undefined,
  });
}

const NAMES = new Map(VPN_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

/** The provider picked last, for the line beside the demo's button. */
export const vpnLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No VPN yet");
