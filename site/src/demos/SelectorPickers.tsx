import { useState } from "react";
import { Selector } from "@glimstone/react";
import { Glyph } from "../glyph";

const THEMES = [
  { id: "light", label: "Light", glyph: <Glyph name="IconSun" /> },
  { id: "dark", label: "Dark", glyph: <Glyph name="IconMoon" /> },
  { id: "system", label: "System", glyph: <Glyph name="IconThemeSystem" /> },
];

const STATES = [
  { id: "running", label: "Running" },
  { id: "stopped", label: "Stopped" },
  { id: "paused", label: "Paused" },
  { id: "failed", label: "Failed", disabled: true, title: "Nothing has failed" },
];

const caption = { fontSize: 13, color: "var(--carbon-text-sub)" };

export default function SelectorPickers() {
  const [theme, setTheme] = useState("dark");
  const [shown, setShown] = useState(["running", "paused"]);
  return (
    <div style={{ display: "grid", gap: 20, width: "100%" }}>
      <div style={{ display: "grid", gap: 8 }}>
        <span style={caption}>Theme</span>
        <Selector label="Theme" items={THEMES} value={theme} onChange={setTheme} activation="manual" equalWidth />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={caption}>Show</span>
        <Selector label="Show" select="many" items={STATES} value={shown} onChange={setShown} variant="chip" inline />
      </div>
    </div>
  );
}
