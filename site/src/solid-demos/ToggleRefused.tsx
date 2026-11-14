import { createSignal } from "solid-js";
import { oledRefusal } from "@glimstone/core";
import { FieldRow, Selector, Toggle } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const THEMES = [
  { id: "dark", label: "Dark", glyph: () => glyph("IconMoon") },
  { id: "light", label: "Light", glyph: () => glyph("IconSun") },
  { id: "system", label: "System", glyph: () => glyph("IconThemeSystem") },
];

export default function ToggleRefused() {
  const [theme, setTheme] = createSignal("light");
  const [oled, setOled] = createSignal(true);
  return (
    <div style={{ display: "grid", gap: "12px", width: "100%", "max-width": "420px" }}>
      <Selector label="Design" items={THEMES} value={theme()} onChange={setTheme} activation="manual" equalWidth />
      <FieldRow label="OLED" hint="True black for OLED and AMOLED screens, whenever the dark look is showing.">
        <Toggle checked={oled()} onChange={setOled} refused={oledRefusal(theme())} />
      </FieldRow>
    </div>
  );
}
