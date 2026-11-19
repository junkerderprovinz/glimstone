// The registry picker demos, from the registry catalog, with what the app
// keeps of its own: the host it signs in to as each tile's second line, and
// the registry at any address, which stands last. Each framework's demo draws
// the glyph its own way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { REGISTRY_PROVIDERS, type RegistryProviderId } from "@glimstone/core/registryProviders";
import { REGISTRY_IDS } from "./registryIds";

const TITLES = { public: "Public", cloud: "In a cloud account", selfHosted: "Self-hosted" };

const HOSTS: Partial<Record<RegistryProviderId, string>> = {
  codeberg: "codeberg.org",
  dockerhub: "docker.io",
  ghcr: "ghcr.io",
  gitlab: "registry.gitlab.com",
  quay: "quay.io",
};

export const REGISTRY_TEXT: PickerText = {
  search: "Search registries",
  none: "Nothing matches “{query}”. Other registry takes any address.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

/** The picker's tiles and groups, with the framework's own glyph for the registry at any address. */
export function registryPicker<M>(glyph: (name: string) => M) {
  return catalogPicker(REGISTRY_PROVIDERS, {
    ids: REGISTRY_IDS,
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconDatabase"),
    lang: "en",
    own: (entry) => ({ sub: HOSTS[entry.id] ?? "Your own address", last: entry.id === "other" }),
  });
}

const NAMES = new Map(REGISTRY_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

/** The registry picked last, for the line beside the demo's button. */
export const registryLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No registry yet");
