import { ACCENTS, MOTION_LEVELS, SHAPES } from "@gs/appearance";
import { LABEL_MODES, type LabelMode } from "@gs/controls";
import { Glyph } from "./glyph";
import { setLook, useLook, type Rainbow, type Theme } from "./look";
import { Selector } from "./ui";

const LABEL_NAMES: Record<LabelMode, string> = { text: "Text", textGlyph: "Both", glyph: "Glyph", reactive: "Reactive" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ThemeControl() {
  const { theme } = useLook();
  return (
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
