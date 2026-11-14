import { createSignal, For } from "solid-js";
import { SidebarRow, useLabelMode } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

const MAIN = [
  { id: "overview", label: "Overview", glyph: "IconDashboard" },
  { id: "backups", label: "Backups", glyph: "IconArchive", count: { value: 3, label: "3 need attention" } },
  { id: "restore", label: "Restore", glyph: "IconRestore" },
];
const FOOT = [{ id: "settings", label: "Settings", glyph: "IconGear" }];

export default function SidebarRail() {
  const [here, setHere] = createSignal("overview");
  // The rail narrows in glyph mode only; reactive keeps its width.
  const mode = useLabelMode("sidebar");
  const row = (r: (typeof MAIN)[number], i: number) => (
    <SidebarRow
      label={r.label}
      glyph={<Glyph name={r.glyph} />}
      href={`#/${r.id}`}
      active={here() === r.id}
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
        "flex-direction": "column",
        "justify-content": "space-between",
        gap: "24px",
        width: mode() === "glyph" ? "var(--rail-narrow)" : "14rem",
        height: "300px",
        padding: "12px",
        "border-radius": "var(--radius-card)",
        background: "var(--carbon-sidebar)",
      }}
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
        <For each={MAIN}>{(r, i) => row(r, i())}</For>
      </div>
      <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
        <For each={FOOT}>{(r, i) => row(r, MAIN.length + i())}</For>
      </div>
    </nav>
  );
}
