import { createSignal } from "solid-js";
import { Selector } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const THEMES = [
  { id: "light", label: "Light", glyph: () => glyph("IconSun") },
  { id: "dark", label: "Dark", glyph: () => glyph("IconMoon") },
  { id: "system", label: "System", glyph: () => glyph("IconThemeSystem") },
];

const STATES = [
  { id: "running", label: "Running" },
  { id: "stopped", label: "Stopped" },
  { id: "paused", label: "Paused" },
  { id: "failed", label: "Failed", disabled: true, title: "Nothing has failed" },
];

const caption = { "font-size": "13px", color: "var(--carbon-text-sub)" };

export default function SelectorPickers() {
  const [theme, setTheme] = createSignal("dark");
  const [shown, setShown] = createSignal(["running", "paused"]);
  return (
    <div style={{ display: "grid", gap: "20px", width: "100%" }}>
      <div style={{ display: "grid", gap: "8px" }}>
        <span style={caption}>Theme</span>
        <Selector label="Theme" items={THEMES} value={theme()} onChange={setTheme} activation="manual" equalWidth />
      </div>
      <div style={{ display: "flex", "align-items": "center", gap: "12px", "flex-wrap": "wrap" }}>
        <span style={caption}>Show</span>
        <Selector label="Show" select="many" items={STATES} value={shown()} onChange={setShown} variant="chip" inline />
      </div>
    </div>
  );
}
