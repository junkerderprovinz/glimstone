import { createSignal } from "solid-js";
import { Selector } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const PAGES = [
  { id: "general", label: "General", glyph: () => glyph("IconTabGeneral") },
  { id: "look", label: "Look", glyph: () => glyph("IconTabLook") },
  { id: "storage", label: "Storage locations", glyph: () => glyph("IconTabStorage") },
  { id: "notifications", label: "Notifications", glyph: () => glyph("IconNotifications") },
  { id: "security", label: "Security", glyph: () => glyph("IconTabSecurity") },
  { id: "app", label: "App", glyph: () => glyph("IconTabApp"), dim: true },
].map((p) => ({ ...p, href: `#/settings/${p.id}` }));

export default function SelectorTiles() {
  const [page, setPage] = createSignal("general");
  return (
    <div style={{ display: "flex", gap: "16px", width: "100%", height: "320px" }}>
      <Selector label="Settings pages" orientation="vertical" items={PAGES} value={page()} onChange={setPage} />
      <div style={{ flex: 1, padding: "8px 0" }}>The {PAGES.find((p) => p.id === page())!.label} page.</div>
    </div>
  );
}
