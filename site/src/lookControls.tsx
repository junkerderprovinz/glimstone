import { useSyncExternalStore } from "react";
import {
  ACCENTS,
  DENSITIES,
  MOTION_LEVELS,
  SHAPES,
  LABEL_MODES,
  SYSTEM_ACCENT,
  contrastOn,
  oledRefusal,
  subscribeSystemAccent,
  systemAccent,
  type LabelMode,
} from "@glimstone/core";
import { InfoBubble, Toggle } from "@glimstone/react";
import { Glyph } from "./glyph";
import { setLook, useLook, type Rainbow, type Theme } from "./look";
import { Selector } from "./ui";

const LABEL_NAMES: Record<LabelMode, string> = { text: "Text", textGlyph: "Both", glyph: "Glyph", reactive: "Reactive" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ThemeControl() {
  const { theme, oled } = useLook();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
      <Selector<Theme>
        label="Theme"
        value={theme}
        onChange={(theme) => setLook({ theme })}
        options={[
          { value: "dark", label: "Dark", glyph: <Glyph name="IconMoon" /> },
          { value: "light", label: "Light", glyph: <Glyph name="IconSun" /> },
          { value: "system", label: "System", glyph: <Glyph name="IconThemeSystem" /> },
        ]}
      />
      <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        <Toggle label="OLED" checked={oled} onChange={(oled) => setLook({ oled })} refused={oledRefusal(theme)} />
        <InfoBubble tip="True black for OLED and AMOLED screens, whenever the dark look is showing." />
      </span>
    </div>
  );
}

export function ShapeControl() {
  const { shape } = useLook();
  return (
    <Selector
      label="Corners"
      value={shape}
      onChange={(shape) => setLook({ shape })}
      options={SHAPES.map((s) => ({ value: s, label: cap(s), glyph: <Glyph name={`IconCorner${cap(s)}`} /> }))}
    />
  );
}

export function MotionControl() {
  const { motion } = useLook();
  return (
    <Selector
      label="Motion"
      value={motion}
      onChange={(motion) => setLook({ motion })}
      options={MOTION_LEVELS.map((m) => ({ value: m, label: cap(m), glyph: <Glyph name={`IconMotion${cap(m)}`} /> }))}
    />
  );
}

export function DensityControl() {
  const { density } = useLook();
  return (
    <Selector
      label="Density"
      value={density}
      onChange={(density) => setLook({ density })}
      options={DENSITIES.map((d) => ({ value: d, label: cap(d) }))}
    />
  );
}

export function LabelControl() {
  const { labels } = useLook();
  return (
    <Selector
      label="Labels"
      value={labels}
      onChange={(labels) => setLook({ labels })}
      options={LABEL_MODES.map((m) => ({ value: m, label: LABEL_NAMES[m] }))}
    />
  );
}

export function RainbowControl() {
  const { rainbow } = useLook();
  return (
    <Selector<Rainbow>
      label="Rainbow"
      value={rainbow}
      onChange={(rainbow) => setLook({ rainbow })}
      options={[
        { value: "off", label: "Off" },
        { value: "on", label: "On" },
        { value: "reactive", label: "Reactive" },
      ]}
    />
  );
}

export function AccentControl() {
  const { accent, rainbow } = useLook();
  const system = useSyncExternalStore(subscribeSystemAccent, systemAccent);
  return (
    <div
      role="radiogroup"
      aria-label="Accent"
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        opacity: rainbow === "off" ? 1 : 0.5,
        pointerEvents: rainbow === "off" ? "auto" : "none",
      }}
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
      {ACCENTS.map((a) => (
        <button
          key={a.hex}
          type="button"
          role="radio"
          className="swatch"
          aria-label={a.name}
          title={a.name}
          aria-checked={accent.toLowerCase() === a.hex.toLowerCase()}
          style={{ background: a.hex }}
          onClick={() => setLook({ accent: a.hex })}
        />
      ))}
    </div>
  );
}
