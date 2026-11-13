import type { CSSProperties, ReactNode } from "react";
import { Code, H2 } from "../ui";

const SERIES = ["Blue", "Orange", "Teal", "Magenta", "Sunflower", "Purple", "Green", "Red"];
const LOOKS: { name: string; attrs: Record<string, string> }[] = [
  { name: "Dark", attrs: { "data-theme": "dark" } },
  { name: "OLED", attrs: { "data-theme": "dark", "data-oled": "" } },
  { name: "Light", attrs: { "data-theme": "light" } },
];

// Backups per day of the week for four apps, made up for the picture.
const BARS = [
  [3, 5, 2, 4],
  [4, 6, 3, 2],
  [2, 4, 5, 3],
  [5, 3, 4, 6],
  [6, 5, 2, 4],
];

// A week by the hour, the busier the deeper, made up as well.
const HEAT = Array.from({ length: 7 }, (_, d) => Array.from({ length: 12 }, (_, h) => Math.round(3 + 3 * Math.sin((h + d) / 2.2))));

function Ground({ attrs, children }: { attrs: Record<string, string>; children: ReactNode }) {
  return (
    <div {...attrs} className="glim-card" style={{ padding: 16, display: "grid", gap: 16, background: "var(--carbon-surface)", color: "var(--carbon-text)" }}>
      {children}
    </div>
  );
}

function Bars() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110 }} role="img" aria-label="Bars in the first four series">
      {BARS.map((day, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {day.map((v, s) => (
            <span key={s} style={{ width: 10, height: v * 16, borderRadius: 2, background: `var(--chart-${s + 1})` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Heat() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }} role="img" aria-label="A heatmap on the sequential ramp">
      {HEAT.flat().map((v, i) => (
        <span key={i} style={{ aspectRatio: "1", borderRadius: 2, background: `var(--chart-seq-${Math.min(7, Math.max(1, v + 1))})` }} />
      ))}
    </div>
  );
}

const strip: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 };

export function Charts() {
  return (
    <>
      <p className="lead">
        Colours for charts, as tokens: eight series in a fixed order, a sequential ramp for heatmaps and a diverging
        ramp for values on either side of a middle. All of them are OKLCH values, in every theme.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))", gap: 16 }}>
        {LOOKS.map((l) => (
          <Ground key={l.name} attrs={l.attrs}>
            <span className="look-label" style={{ margin: 0 }}>{l.name}</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
              {SERIES.map((name, i) => (
                <span key={name} title={`--chart-${i + 1}, ${name}`} style={{ height: 28, borderRadius: 4, background: `var(--chart-${i + 1})` }} />
              ))}
            </div>
            <Bars />
            <Heat />
            <div style={strip} role="img" aria-label="The diverging ramp">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} style={{ height: 20, borderRadius: 2, background: `var(--chart-div-${i + 1})` }} />
              ))}
            </div>
          </Ground>
        ))}
      </div>
      <H2>Series</H2>
      <p>
        <code>--chart-1</code> to <code>--chart-8</code>, always in this order: blue, orange, teal, magenta, sunflower,
        purple, green and red. Take them from the start, so a chart with three lines uses the first three. Warm and cool
        take turns, and the lightness steps are chosen so any two stay apart for people with protanopia, deuteranopia or
        tritanopia. Each reaches 3:1 against a card and the page, light, dark and OLED alike. Beyond eight, a chart needs a
        legend and labels on the lines rather than a ninth colour.
      </p>
      <H2>Sequential and diverging</H2>
      <p>
        <code>--chart-seq-1</code> to <code>--chart-seq-7</code> start next to the ground and gain contrast and colour as
        the value grows, so the lightest step on the light theme and the darkest on the dark ones means little.{" "}
        <code>--chart-div-1</code> to <code>--chart-div-7</code> run from blue through a near-grey middle at{" "}
        <code>--chart-div-4</code> to orange. Blue and orange stay apart in every kind of colour blindness.
      </p>
      <Code code={`.bar--2 { background: var(--chart-2); }\n.cell[data-level="5"] { background: var(--chart-seq-5); }`} />
    </>
  );
}
