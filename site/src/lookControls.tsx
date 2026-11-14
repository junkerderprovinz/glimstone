import { useState, useSyncExternalStore } from "react";
import {
  ACCENTS,
  RAINBOW,
  DENSITIES,
  MOTION_LEVELS,
  SHAPES,
  LABEL_MODES,
  SYSTEM_ACCENT,
  contrastOn,
  oledRefusal,
  subscribeSystemAccent,
  systemAccent,
  type Density,
  type LabelMode,
  type SelectorSize,
} from "@glimstone/core";
import { Button, ColorPicker, Selector, Toggle } from "@glimstone/react";
import { Glyph } from "./glyph";
import { DENSITY_GLYPHS } from "./glyphData";
import { setLook, useLook, type Theme } from "./look";

// Each control draws the control alone. In the look panel a FieldRow around it
// gives it its name; on an engine page it stands in a bar and names itself.
// The selectors save a setting, so they choose as a radio group does.
type Named = { label?: string; size?: SelectorSize };

const LABEL_NAMES: Record<LabelMode, string> = { text: "Text", textGlyph: "Both", glyph: "Glyph", reactive: "Reactive" };
const LABEL_GLYPHS: Record<LabelMode, string> = {
  text: "IconLabelText",
  textGlyph: "IconLabelTextGlyph",
  glyph: "IconLabelGlyph",
  reactive: "IconLabelReactive",
};
const DENSITY_NAMES: Record<Density, string> = { compact: "Compact", normal: "Normal", airy: "Airy" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ThemePicker({ label, size }: Named) {
  const { theme } = useLook();
  return (
    <Selector<"one", Theme>
      label={label}
      size={size}
      activation="manual"
      value={theme}
      onChange={(theme) => setLook({ theme })}
      items={[
        { id: "dark", label: "Dark", glyph: <Glyph name="IconMoon" /> },
        { id: "light", label: "Light", glyph: <Glyph name="IconSun" /> },
        { id: "system", label: "System", glyph: <Glyph name="IconThemeSystem" /> },
      ]}
    />
  );
}

export function OledControl({ label }: Named) {
  const { theme, oled } = useLook();
  return <Toggle label={label} checked={oled} onChange={(oled) => setLook({ oled })} refused={oledRefusal(theme)} />;
}

export function ThemeControl() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <ThemePicker label="Theme" />
      <OledControl label="OLED" />
    </div>
  );
}

export function ShapeControl({ label, size }: Named) {
  const { shape } = useLook();
  return (
    <Selector
      label={label}
      size={size}
      activation="manual"
      value={shape}
      onChange={(shape) => setLook({ shape })}
      items={SHAPES.map((s) => ({ id: s, label: cap(s), glyph: <Glyph name={`IconCorner${cap(s)}`} /> }))}
    />
  );
}

export function MotionControl({ label, size }: Named) {
  const { motion } = useLook();
  return (
    <Selector
      label={label}
      size={size}
      activation="manual"
      value={motion}
      onChange={(motion) => setLook({ motion })}
      items={MOTION_LEVELS.map((m) => ({ id: m, label: cap(m), glyph: <Glyph name={`IconMotion${cap(m)}`} /> }))}
    />
  );
}

export function DensityControl({ label, size }: Named) {
  const { density } = useLook();
  return (
    <Selector
      label={label}
      size={size}
      activation="manual"
      value={density}
      onChange={(density) => setLook({ density })}
      items={DENSITIES.map((d) => ({ id: d, label: DENSITY_NAMES[d], glyph: <Glyph name={DENSITY_GLYPHS[d]} /> }))}
    />
  );
}

export function LabelControl({ label, size }: Named) {
  const { labels } = useLook();
  return (
    <Selector
      label={label}
      size={size}
      activation="manual"
      value={labels}
      onChange={(labels) => setLook({ labels })}
      items={LABEL_MODES.map((m) => ({ id: m, label: LABEL_NAMES[m], glyph: <Glyph name={LABEL_GLYPHS[m]} /> }))}
    />
  );
}

export function ContrastControl({ label }: Named) {
  const { contrast } = useLook();
  return <Toggle label={label} checked={contrast === "more"} onChange={(more) => setLook({ contrast: more ? "more" : "system" })} />;
}

export function RainbowControl({ label }: Named) {
  const { rainbow } = useLook();
  return <Toggle label={label} checked={rainbow !== "off"} onChange={(on) => setLook({ rainbow: on ? "on" : "off" })} />;
}

export function ReactiveControl({ label }: Named) {
  const { rainbow } = useLook();
  return (
    <Toggle
      label={label}
      checked={rainbow === "reactive"}
      onChange={(reactive) => setLook({ rainbow: reactive ? "reactive" : "on" })}
      refused={rainbow === "off" ? "Only with the rainbow on." : undefined}
    />
  );
}

export function RotateControl({ label }: Named) {
  const { rotate } = useLook();
  // Turning rotation on draws a fresh offset, so the switch does something
  // visible instead of putting back the offset the palette already had.
  return (
    <Toggle
      label={label}
      checked={rotate}
      onChange={(on) => setLook({ rotate: on, seed: on ? 1 + Math.floor(Math.random() * (RAINBOW.length - 1)) : 0 })}
    />
  );
}

/** The rainbow's eight colours by position. Every swatch opens the picker, since all eight are in force at once. */
export function PaletteControl() {
  const { palette } = useLook();
  const [editing, setEditing] = useState<{ index: number; anchor: HTMLElement } | null>(null);
  const isDefault = palette.every((hex, i) => hex.toLowerCase() === RAINBOW[i].toLowerCase());
  const set = (index: number, hex: string) => setLook({ palette: palette.map((h, i) => (i === index ? hex : h)) });
  return (
    <div className="look-swatches" role="group" aria-label="Palette">
      {palette.map((hex, i) => (
        <button
          key={i}
          type="button"
          className="swatch"
          data-position={i}
          aria-label={`Palette colour ${i + 1}, ${hex.toUpperCase()}`}
          title={`Palette colour ${i + 1}, ${hex.toUpperCase()}`}
          aria-haspopup="dialog"
          style={{ background: hex }}
          onClick={(e) => setEditing(editing?.index === i ? null : { index: i, anchor: e.currentTarget })}
        />
      ))}
      <Button
        label="Reset the palette"
        labelKey="reset"
        tone="subtle"
        variant="icon"
        compact
        disabled={isDefault}
        onClick={() => setLook({ palette: RAINBOW })}
      />
      {editing && (
        <ColorPicker
          value={palette[editing.index]}
          anchor={editing.anchor}
          names={false}
          onInput={(hex) => set(editing.index, hex)}
          onApply={(hex) => set(editing.index, hex)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// A colour of one's own belongs to the nearest preset's slot, which wears it,
// stays marked and opens the picker on it again.
function slotOf(accent: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(accent)) return -1;
  const [r, g, b] = rgb(accent);
  let best = 0;
  let bestDistance = Infinity;
  ACCENTS.forEach((a, i) => {
    const [ar, ag, ab] = rgb(a.hex);
    const d = (r - ar) ** 2 + (g - ag) ** 2 + (b - ab) ** 2;
    if (d < bestDistance) [best, bestDistance] = [i, d];
  });
  return best;
}

/**
 * The eight presets, after the device's own colour where it gives one. A click
 * chooses a swatch, and a click on the chosen one opens the picker for any
 * colour.
 */
export function AccentControl() {
  const { accent, rainbow } = useLook();
  const system = useSyncExternalStore(subscribeSystemAccent, systemAccent);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const slot = accent === SYSTEM_ACCENT ? -1 : slotOf(accent);
  const off = rainbow !== "off";
  return (
    <div
      role="radiogroup"
      aria-label="Accent"
      className="look-swatches"
      style={{ opacity: off ? 0.5 : 1, pointerEvents: off ? "none" : "auto" }}
    >
      {system && (
        <button
          type="button"
          role="radio"
          className="swatch swatch-system"
          aria-label="System colour"
          title="System colour"
          aria-checked={accent === SYSTEM_ACCENT}
          style={{ background: system, color: contrastOn(system) }}
          onClick={() => setLook({ accent: SYSTEM_ACCENT })}
        >
          <Glyph name="IconAccentSystem" />
        </button>
      )}
      {ACCENTS.map((a, i) => {
        const chosen = i === slot;
        const own = chosen && accent.toLowerCase() !== a.hex.toLowerCase();
        const shown = chosen ? accent : a.hex;
        const name = own ? accent.toUpperCase() : a.name;
        return (
          <button
            key={a.hex}
            type="button"
            role="radio"
            className="swatch"
            data-swatch={a.name}
            aria-label={chosen ? `${name}, click again for any colour` : name}
            title={chosen ? `${name}. Click again for any colour.` : name}
            aria-checked={chosen}
            aria-haspopup={chosen ? "dialog" : undefined}
            style={{ background: shown, color: contrastOn(shown) }}
            onClick={(e) => (chosen ? setAnchor(anchor ? null : e.currentTarget) : setLook({ accent: a.hex }))}
          >
            {chosen && <Glyph name="IconPencil" size={12} />}
          </button>
        );
      })}
      {anchor && (
        <ColorPicker
          value={accent === SYSTEM_ACCENT ? (system ?? ACCENTS[0].hex) : accent}
          anchor={anchor}
          names={false}
          onInput={(hex) => setLook({ accent: hex })}
          onApply={(hex) => setLook({ accent: hex })}
          onClose={() => setAnchor(null)}
        />
      )}
    </div>
  );
}
