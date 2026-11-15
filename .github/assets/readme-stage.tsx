/**
 * The page gen-readme-pictures.mjs photographs. It draws the README's pictures
 * from the real components on the site's own styles, one scene per URL:
 *
 *   ?scene=strip&theme=dark                 the component strip
 *   ?scene=tile&engine=shape&theme=dark     one engine tile
 *   ?scene=cell&theme=light&shape=square    one sample inside a tile
 *   ?scene=glossary&theme=dark              the glossary in a browser window
 *   ?scene=eggs&theme=dark                  the three easter eggs
 *
 * The engines set attributes on <html>, so a tile shows its variants side by
 * side by loading each one as a cell in an iframe of its own.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/noto-sans/wght.css";
import "../../site/src/styles.css";
import "../../site/src/glyph";
import {
  addToast,
  applyAccent,
  applyMotion,
  applyRainbow,
  applyShape,
  CONTROL_AXES,
  labelModeChanged,
  setLabelMode,
  setStoragePrefix,
  type LabelMode,
} from "@glimstone/core";
import { Badge, Button, Card, InfoBubble, Selector, ToastViewport, Toggle } from "@glimstone/react";
import logoForLight from "./glimstone-dunkel.svg?url";
import logoForDark from "./glimstone-hell.svg?url";
import "./readme-stage.css";

const q = new URLSearchParams(location.search);
const scene = q.get("scene") ?? "strip";
const theme = q.get("theme") === "light" ? "light" : "dark";
const root = document.documentElement;
root.dataset.theme = theme;
root.dataset.scene = scene;
if (scene === "glossary") {
  // The site shares the stage's origin and reads its look from these keys.
  localStorage.setItem("gs-docs-look", JSON.stringify({ theme }));
  localStorage.setItem("gs-docs-glossary-lang", "en");
}
// Every cell is the same origin; a prefix of its own keeps one cell's label
// mode from reaching the others through storage.
setStoragePrefix(`readme-${location.search}-`);
applyShape(q.get("shape") ?? "soft");
applyAccent(q.get("accent") ?? undefined);
applyMotion(q.get("motion") ?? "subtle");
applyRainbow({ on: q.has("rainbow"), rotate: q.has("seed"), seed: Number(q.get("seed") ?? 0) });
for (const axis of CONTROL_AXES) setLabelMode(axis, (q.get("labels") as LabelMode) ?? "textGlyph");
labelModeChanged();

const logo = theme === "light" ? logoForLight : logoForDark;

function Ground({ children, relief = true }: { children: ReactNode; relief?: boolean }) {
  return (
    <div className="rs-ground">
      <div className="rs-wall" />
      {/* Pressed from the pale mark in both themes; the dark one turns to a flat slab under the filter. */}
      {relief && <img className="rs-relief" src={logoForDark} alt="" />}
      <div className="rs-vignette" />
      {children}
    </div>
  );
}

function Copy({ heading, sub }: { heading: ReactNode; sub: string }) {
  return (
    <div className="rs-copy">
      <img src={logo} alt="" />
      <h1>{heading}</h1>
      <p className="rs-sub">{sub}</p>
    </div>
  );
}

const idle = () => {};

const THEMES = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];
const CORNERS = [
  { id: "round", label: "Round" },
  { id: "soft", label: "Soft" },
  { id: "square", label: "Square" },
];

function Strip() {
  const [verify, setVerify] = useState(true);
  const [notify, setNotify] = useState(false);
  const [look, setLook] = useState("system");
  const [corners, setCorners] = useState("soft");
  const toasts = addToast([], { id: "saved", message: "Settings saved.", severity: "success" }, Date.now());
  return (
    <Ground>
      <Copy heading={<>Every control, <em>built once</em></>} sub="The real components, the same in React and Vue." />
      <div className="rs-board">
        <div className="rs-side">
          <Card title="Backups" hint="Every job that writes to a target." hueIndex={0}>
            <div className="rs-rows">
              <div className="rs-row"><span>Nightly appdata</span><Badge tone="ok">Settled</Badge></div>
              <div className="rs-row"><span>Photos to the cloud</span><Badge tone="active">Running</Badge></div>
              <div className="rs-row"><span>Weekly archive</span><Badge tone="warn">Almost full</Badge></div>
              <div className="rs-row">
                <Toggle label="Verify after each run" checked={verify} onChange={setVerify} />
              </div>
              <div className="rs-actions">
                <Button label="Edit" labelKey="edit" />
                <Button label="Back up now" labelKey="backup" tone="accent" />
              </div>
            </div>
          </Card>
          <div className="rs-actions rs-start">
            <Button label="Refresh" labelKey="refresh" />
            <Button label="Restore" labelKey="restore" tone="ok" />
            <Button label="Delete" labelKey="delete" tone="danger" />
          </div>
        </div>
        <div className="rs-side">
          <Card title="Look" hueIndex={1}>
            <div className="rs-rows">
              <Selector label="Theme" items={THEMES} value={look} onChange={setLook} equalWidth />
              <Selector label="Corners" items={CORNERS} value={corners} onChange={setCorners} equalWidth />
              <span className="rs-with-tip">
                <Toggle label="Tell me when a job fails" checked={notify} onChange={setNotify} />
                <InfoBubble tip="Sends a notice the moment a job stops with an error." />
              </span>
            </div>
          </Card>
          <div className="rs-badges">
            <Badge tone="ok">Settled</Badge>
            <Badge tone="active">Running</Badge>
            <Badge tone="warn">Warning</Badge>
            <Badge tone="fail">Fault</Badge>
          </div>
        </div>
        <ToastViewport
          toasts={toasts}
          dismissLabel="Dismiss"
          onDismiss={idle}
          onMouseEnter={idle}
          onMouseLeave={idle}
          onFocus={idle}
          onBlur={idle}
        />
      </div>
    </Ground>
  );
}

/** The sample every engine tile repeats, so only the setting differs between rows. */
function Cell() {
  const [on, setOn] = useState(true);
  return (
    <div className="rs-cell">
      <Card title="Backups" hueIndex={0}>
        <div className="rs-cell-row">
          <Button label="Edit" labelKey="edit" />
          <Button label="Save" labelKey="save" tone="accent" />
        </div>
      </Card>
      <Card title="Targets" hueIndex={1}>
        <div className="rs-cell-row">
          <Toggle label="Verify" hideLabel checked={on} onChange={setOn} />
          <Badge tone="ok">Settled</Badge>
        </div>
      </Card>
    </div>
  );
}

interface Variant {
  label: string;
  params: Record<string, string>;
}

const ENGINES: Record<string, { name: string; sub: string; variants: Variant[] }> = {
  shape: {
    name: "Shape",
    sub: "Every corner from one token",
    variants: [
      { label: "Round", params: { shape: "round" } },
      { label: "Soft", params: { shape: "soft" } },
      { label: "Square", params: { shape: "square" } },
    ],
  },
  colour: {
    name: "Colour",
    sub: "Theme, accent and rainbow",
    variants: [
      { label: "Light, sunflower", params: { theme: "light" } },
      { label: "Dark, blue accent", params: { theme: "dark", accent: "#1D99F3" } },
      { label: "Rainbow", params: { rainbow: "on" } },
    ],
  },
  motion: {
    name: "Motion",
    sub: "One page entrance, three numbers",
    variants: [],
  },
  label: {
    name: "Label",
    sub: "Text, glyph or both",
    variants: [
      { label: "Text", params: { labels: "text" } },
      { label: "Text and glyph", params: { labels: "textGlyph" } },
      { label: "Glyph", params: { labels: "glyph" } },
    ],
  },
};

function cellUrl(params: Record<string, string>) {
  const p = new URLSearchParams({ scene: "cell", theme, ...params });
  return `${location.pathname}?${p}`;
}

function Frames({ variants }: { variants: Variant[] }) {
  return (
    <div className="rs-frames">
      {variants.map((v) => (
        <figure key={v.label}>
          <figcaption>{v.label}</figcaption>
          <iframe src={cellUrl(v.params)} title={v.label} />
        </figure>
      ))}
    </div>
  );
}

interface Level {
  name: string;
  dur: number;
  travel: number;
  ease: [number, number, number, number] | null;
}

/** Reads a level's numbers from the motion engine itself rather than copying them. */
function readLevel(name: string): Level {
  const before = root.dataset.motion;
  root.dataset.motion = name;
  const css = getComputedStyle(root);
  const durText = css.getPropertyValue("--motion-page-dur").trim();
  const dur = parseFloat(durText) * (durText.endsWith("ms") ? 1 : 1000);
  const travel = parseFloat(css.getPropertyValue("--motion-page-travel"));
  const m = css.getPropertyValue("--motion-page-ease").match(/cubic-bezier\(([^)]+)\)/);
  root.dataset.motion = before;
  return { name, dur, travel, ease: m ? (m[1].split(",").map(Number) as Level["ease"]) : null };
}

// The offset still to travel at time t, sampled along the curve's parameter.
function curvePoints(l: Level, maxMs: number) {
  if (!l.ease || l.dur === 0 || l.travel === 0) return [[0, 0], [maxMs, 0]];
  const [x1, y1, x2, y2] = l.ease;
  const bez = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const pts: number[][] = [];
  for (let i = 0; i <= 80; i++) {
    const s = i / 80;
    pts.push([bez(x1, x2, s) * l.dur, l.travel * (1 - bez(y1, y2, s))]);
  }
  pts.push([maxMs, 0]);
  return pts;
}

function MotionChart({ levels }: { levels: string[] }) {
  const data = levels.map(readLevel);
  const maxMs = Math.max(500, ...data.map((d) => d.dur)) * 1.12;
  const maxTravel = Math.max(...data.map((d) => d.travel));
  const minTravel = Math.min(0, ...data.flatMap((d) => curvePoints(d, maxMs).map((p) => p[1])));
  const W = 520, H = 330, L = 10, R = 10, T = 12, B = 44;
  const x = (ms: number) => L + (ms / maxMs) * (W - L - R);
  const y = (px: number) => T + ((maxTravel - px) / (maxTravel - minTravel)) * (H - T - B);
  const shade = (i: number) => (i === data.length - 1 ? "var(--chart-hot)" : i === 0 ? "var(--chart-faint)" : "var(--chart-mid)");
  return (
    <div className="rs-motion">
      <svg className="rs-chart" viewBox={`0 0 ${W} ${H}`}>
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} className="rs-axis" />
        <text x={W - R} y={y(0) + 36} textAnchor="end" className="rs-tick">at rest</text>
        <text x={L} y={y(0) + 36} className="rs-tick">time</text>
        {data.map((d, i) => {
          const path = curvePoints(d, maxMs)
            .map((p, k) => `${k ? "L" : "M"}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`)
            .join("");
          return (
            <g key={d.name}>
              <path d={path} fill="none" stroke={shade(i)} strokeWidth={i === data.length - 1 ? 7 : 5} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={x(0)} cy={y(d.travel)} r={9} fill={shade(i)} />
            </g>
          );
        })}
      </svg>
      <ul className="rs-legend">
        {data.map((d, i) => (
          <li key={d.name}>
            <i style={{ background: shade(i) }} />
            <b>{d.name}</b>
            <span>{d.dur === 0 ? "appears at once" : `${d.travel}px in ${Math.round(d.dur)} ms`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tile({ engine }: { engine: string }) {
  const e = ENGINES[engine];
  return (
    <Ground relief={false}>
      <div className="rs-tile">
        <h1>{e.name}</h1>
        <p className="rs-sub">{e.sub}</p>
        {engine === "motion" ? <MotionChart levels={["off", "subtle", "wild"]} /> : <Frames variants={e.variants} />}
      </div>
    </Ground>
  );
}

function Eggs() {
  return (
    <Ground>
      <Copy heading={<>Three settings <em>hide an extra</em></>} sub="Each opens with five taps on the setting it extends." />
      <div className="rs-eggs">
        <section>
          <h2>Leaf</h2>
          <p>Two corners round, two sharp</p>
          <Frames
            variants={[
              { label: "Square", params: { shape: "square" } },
              { label: "Leaf", params: { shape: "leaf" } },
            ]}
          />
        </section>
        <section>
          <h2>Disco</h2>
          <p>The rainbow steps every second</p>
          <Frames
            variants={[0, 1].map((seed) => ({
              label: seed === 0 ? "Now" : "One second later",
              params: { rainbow: "on", seed: String(seed) },
            }))}
          />
        </section>
        <section>
          <h2>Storm</h2>
          <p>Bigger, springier numbers</p>
          <MotionChart levels={["subtle", "wild", "storm"]} />
        </section>
      </div>
    </Ground>
  );
}

const DOCS = "junkerderprovinz.github.io/glimstone/#/guide/glossary";

function Glossary() {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const el = frame.current!;
    const settle = () => {
      const doc = el.contentDocument!;
      const target = doc.querySelector(q.get("entry") ? `#gl-${q.get("entry")}` : ".gl-entry");
      if (!target) return void setTimeout(settle, 200);
      const top = target.getBoundingClientRect().top + el.contentWindow!.scrollY - 150;
      el.contentWindow!.scrollTo(0, top);
      setTimeout(() => (el.dataset.ready = "1"), 400);
    };
    el.addEventListener("load", settle, { once: true });
  }, []);
  return (
    <Ground>
      <Copy heading={<>Every element, <em>named twice</em></>} sub="English and German, each beside a live example." />
      <div className="rs-window">
        <div className="rs-bar rs-tabs">
          <div className="rs-tab"><img src={logo} alt="" /><span>GlimStone</span></div>
        </div>
        <div className="rs-bar rs-address">
          <i className="rs-nav" />
          <i className="rs-nav rs-fwd" />
          <div className="rs-url">{DOCS}</div>
        </div>
        <iframe ref={frame} src="/#/guide/glossary" title="Glossary" />
      </div>
    </Ground>
  );
}

const SCENES = new Map<string, () => ReactNode>([
  ["strip", () => <Strip />],
  ["cell", () => <Cell />],
  ["tile", () => <Tile engine={q.get("engine") ?? "shape"} />],
  ["glossary", () => <Glossary />],
  ["eggs", () => <Eggs />],
]);

const stage = SCENES.get(scene);
if (!stage) throw new Error(`no scene named ${scene}`);
createRoot(document.getElementById("root")!).render(stage());
