import { useState } from "react";
import { Selector } from "@glimstone/react";
import { Glyph } from "../glyph";

const SHOWN = [
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed in the last 30 days" },
];

const LOOKS = [
  { id: "light", label: "Always the light theme", glyph: <Glyph name="IconSun" /> },
  { id: "dark", label: "Always the dark theme", glyph: <Glyph name="IconMoon" /> },
  { id: "system", label: "Follow the system", glyph: <Glyph name="IconThemeSystem" /> },
];

const THEMES = [
  { id: "system", label: "Donaudampfschifffahrtsgesellschaft" },
  { id: "light", label: "Always the light theme" },
  { id: "dark", label: "Always the dark theme" },
  { id: "bright", label: "Bright with a high contrast" },
  { id: "custom", label: "Your own colours" },
];

export default function SelectorOneRow() {
  const [shown, setShown] = useState("open");
  const [look, setLook] = useState("light");
  const [a, setA] = useState("light");
  const [b, setB] = useState("light");
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 560 }}>
      <div data-row="labels">
        <Selector label="Shown" items={SHOWN} value={shown} onChange={setShown} activation="manual" equalWidth />
      </div>
      <div data-row="glyphs">
        <Selector label="Look" items={LOOKS} value={look} onChange={setLook} activation="manual" size="lg" equalWidth />
      </div>
      <div data-row="cut">
        <Selector label="Theme" items={THEMES} value={a} onChange={setA} activation="manual" />
      </div>
      <div data-row="cut-inline">
        <Selector label="Theme, inline" items={THEMES} value={b} onChange={setB} activation="manual" size="sm" inline buttonHeight />
      </div>
    </div>
  );
}
