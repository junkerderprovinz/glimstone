import { createSignal, createUniqueId } from "solid-js";
import { Selector, selectorTabId } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const PAGES = [
  { id: "general", label: "General", glyph: () => glyph("IconTabGeneral") },
  { id: "look", label: "Look", glyph: () => glyph("IconTabLook") },
  { id: "storage", label: "Storage", glyph: () => glyph("IconTabStorage") },
  { id: "notifications", label: "Notifications", glyph: () => glyph("IconNotifications") },
];

export default function SelectorTabs() {
  const [page, setPage] = createSignal("general");
  const panel = createUniqueId();
  return (
    <div style={{ display: "grid", gap: "16px", width: "100%" }}>
      <Selector label="Settings pages" items={PAGES} value={page()} onChange={setPage} size="lg" variant="chip" hueOffset={0} panelId={panel} />
      <div role="tabpanel" id={panel} aria-labelledby={selectorTabId(panel, page())}>
        The {PAGES.find((p) => p.id === page())!.label} page.
      </div>
    </div>
  );
}
