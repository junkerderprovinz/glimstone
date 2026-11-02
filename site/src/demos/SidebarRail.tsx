import { useState } from "react";
import { SidebarRow, useLabelMode } from "@glimstone/react";
import { Glyph } from "../glyph";

const MAIN = [
  { id: "overview", label: "Overview", glyph: "IconDashboard" },
  { id: "backups", label: "Backups", glyph: "IconArchive", count: { value: 3, label: "3 need attention" } },
  { id: "restore", label: "Restore", glyph: "IconRestore" },
];
const FOOT = [{ id: "settings", label: "Settings", glyph: "IconGear" }];

export default function SidebarRail() {
  const [here, setHere] = useState("overview");
  // The rail narrows in glyph mode only; reactive keeps its width.
  const narrow = useLabelMode("sidebar") === "glyph";
  const row = (r: (typeof MAIN)[number], i: number) => (
    <SidebarRow
      key={r.id}
      label={r.label}
      glyph={<Glyph name={r.glyph} />}
      href={`#/${r.id}`}
      active={here === r.id}
      hueIndex={i}
      count={r.count}
      onClick={(e) => {
        e.preventDefault();
        setHere(r.id);
      }}
    />
  );
  return (
    <nav
      aria-label="Main"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 24,
        width: narrow ? "var(--rail-narrow)" : "14rem",
        height: 300,
        padding: 12,
        borderRadius: "var(--radius-card)",
        background: "var(--carbon-sidebar)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{MAIN.map(row)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{FOOT.map((r, i) => row(r, MAIN.length + i))}</div>
    </nav>
  );
}
