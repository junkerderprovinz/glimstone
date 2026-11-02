import { useState } from "react";
import { Selector } from "@glimstone/react";
import { Glyph } from "../glyph";

const PAGES = [
  { id: "general", label: "General", glyph: <Glyph name="IconTabGeneral" /> },
  { id: "look", label: "Look", glyph: <Glyph name="IconTabLook" /> },
  { id: "storage", label: "Storage locations", glyph: <Glyph name="IconTabStorage" /> },
  { id: "notifications", label: "Notifications", glyph: <Glyph name="IconNotifications" /> },
  { id: "security", label: "Security", glyph: <Glyph name="IconTabSecurity" /> },
  { id: "app", label: "App", glyph: <Glyph name="IconTabApp" />, dim: true },
].map((p) => ({ ...p, href: `#/settings/${p.id}` }));

export default function SelectorTiles() {
  const [page, setPage] = useState("general");
  return (
    <div style={{ display: "flex", gap: 16, width: "100%", height: 320 }}>
      <Selector label="Settings pages" orientation="vertical" items={PAGES} value={page} onChange={setPage} />
      <div style={{ flex: 1, padding: "8px 0" }}>The {PAGES.find((p) => p.id === page)!.label} page.</div>
    </div>
  );
}
