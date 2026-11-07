import { useState } from "react";
import { oledRefusal } from "@glimstone/core";
import { FieldRow, Selector, Toggle } from "@glimstone/react";
import { Glyph } from "../glyph";

const THEMES = [
  { id: "dark", label: "Dark", glyph: <Glyph name="IconMoon" /> },
  { id: "light", label: "Light", glyph: <Glyph name="IconSun" /> },
  { id: "system", label: "System", glyph: <Glyph name="IconThemeSystem" /> },
];

export default function ToggleRefused() {
  const [theme, setTheme] = useState("light");
  const [oled, setOled] = useState(true);
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 420 }}>
      <Selector label="Design" items={THEMES} value={theme} onChange={setTheme} activation="manual" equalWidth />
      <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
        <Toggle checked={oled} onChange={setOled} refused={oledRefusal(theme)} />
      </FieldRow>
    </div>
  );
}
