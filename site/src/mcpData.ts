// The MCP picker demos, from the MCP catalog, with the app's own words for the
// client that takes any address, which stands last. Each framework's demo
// draws the glyphs its own way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { MCP_PROVIDERS } from "@glimstone/core/mcpProviders";
import { MCP_IDS } from "./mcpIds";

const TITLES = {
  chat: "Chat apps",
  models: "Local models",
  web: "In the browser",
  editor: "Editors",
  extension: "VS Code extensions",
  terminal: "In the terminal",
  automation: "Automation",
};

export const MCP_TEXT: PickerText = {
  search: "Search clients",
  none: "Nothing matches “{query}”. Other client connects anything that speaks MCP.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

/** The picker's tiles and groups, with the framework's own glyph for a client without a mark. */
export function mcpPicker<M>(glyph: (name: string) => M) {
  return catalogPicker(MCP_PROVIDERS, {
    ids: MCP_IDS,
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconApp"),
    lang: "en",
    own: (entry) => (entry.id === "other" ? { tip: "Any client that reaches a server by its address" } : undefined),
  });
}

const NAMES = new Map(MCP_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

/** The client picked last, for the line beside the demo's button. */
export const mcpLine = (picked: string | null) => (picked ? `Picked: ${NAMES.get(picked) ?? picked}` : "No client yet");
