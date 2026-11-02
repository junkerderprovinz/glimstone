import { useId, useState } from "react";
import { Selector, selectorTabId } from "@glimstone/react";
import { Glyph } from "../glyph";

const PAGES = [
  { id: "general", label: "General", glyph: <Glyph name="IconTabGeneral" /> },
  { id: "look", label: "Look", glyph: <Glyph name="IconTabLook" /> },
  { id: "storage", label: "Storage", glyph: <Glyph name="IconTabStorage" /> },
  { id: "notifications", label: "Notifications", glyph: <Glyph name="IconNotifications" /> },
];

export default function SelectorTabs() {
  const [page, setPage] = useState("general");
  const panel = useId();
  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Selector
        label="Settings pages"
        items={PAGES}
        value={page}
        onChange={setPage}
        size="lg"
        variant="chip"
        hueOffset={0}
        panelId={panel}
      />
      <div role="tabpanel" id={panel} aria-labelledby={selectorTabId(panel, page)}>
        The {PAGES.find((p) => p.id === page)!.label} page.
      </div>
    </div>
  );
}
