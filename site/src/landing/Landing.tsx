import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ACCENTS, oklab } from "@glimstone/core";
import { Button, GLIMSTONE_VERSION } from "@glimstone/react";
import { FrameworkMark } from "../frameworks";
import { Glyph } from "../glyph";
import { useLook } from "../look";
import { setLookPanel, useLookPanel } from "../lookPanel";
import { Gem } from "./Gem";
import { Beams, useRelay, type Stop } from "./relay";
import { StageWindow } from "./StageWindow";
import {
  CORNERS,
  HUES,
  PACES,
  SPEECHES,
  STEPS,
  quietMotion,
  scopeOf,
  useActiveStep,
  useRevealFallback,
  type Corner,
  type WindowLook,
} from "./story";
import "./landing.css";

const CHAPTERS = ["Colour", "Shape", "Motion", "Labels"];

// The headline names the colour the visitor just picked, a colour of their own
// by the preset whose hue comes closest. Sunflower reads as plain yellow in a sentence.
const hue = (hex: string) => {
  const [, a, b] = oklab(hex);
  return Math.atan2(b, a);
};
const apart = (x: number, y: number) => Math.abs(Math.atan2(Math.sin(x - y), Math.cos(x - y)));
const colourName = (hex: string) => {
  const h = hue(hex);
  const near = ACCENTS.reduce((best, a) => (apart(hue(a.hex), h) < apart(hue(best.hex), h) ? a : best));
  return near.name === "Sunflower" ? "yellow" : near.name.toLowerCase();
};

const FRAMEWORKS = [
  { id: "react", name: "React", pkg: "@glimstone/react", href: "#/guide/adopting?s=react" },
  { id: "vue", name: "Vue", pkg: "@glimstone/vue", href: "#/guide/adopting?s=vue" },
  { id: "solid", name: "Solid", pkg: "@glimstone/solid", href: "#/guide/adopting?s=solid" },
  { id: "svelte", name: "Svelte", pkg: "@glimstone/svelte", href: "#/guide/adopting?s=svelte" },
  { id: "flutter", name: "Flutter", pkg: "package:glimstone", href: "#/guide/adopting" },
];

const stepsOf = (chapter: number) => STEPS.map((s, i) => ({ ...s, at: i })).filter((s) => s.chapter === chapter);

function Markers({ chapter }: { chapter: number }) {
  return (
    <div className="la-markers" aria-hidden="true">
      {stepsOf(chapter).map((s) => (
        <span key={s.at} className="la-marker" data-step={s.at} />
      ))}
    </div>
  );
}

function Chapter({ n, id, children }: { n: number; id: string; children: ReactNode }) {
  return (
    <section className="la-ch" aria-labelledby={`la-${id}`} data-la-shot={id}>
      <div className="la-ch-copy">{children}</div>
      <Markers chapter={n} />
    </section>
  );
}

function Readout<T extends string>({ items, value }: { items: { id: T; name: string; glyph: string }[]; value: T }) {
  return (
    <ol className="la-readout">
      {items.map((x) => (
        <li key={x.id} className={x.id === value ? "is-on" : undefined}>
          <Glyph name={x.glyph} size={22} />
          {x.name}
        </li>
      ))}
    </ol>
  );
}

// Each letter of the motion heading is its own box, so a change of level can
// play the word again at that level.
function MotionWord({ pace }: { pace: string }) {
  return (
    <span className={`la-letters la-letters--${pace}`} key={pace} aria-hidden="true">
      {"Motion".split("").map((c, i) => (
        <span key={i} style={{ "--i": i } as CSSProperties}>
          {c}
        </span>
      ))}
    </span>
  );
}

export function Landing() {
  const global = useLook();
  const panel = useLookPanel();
  const page = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const gem = useRef<HTMLDivElement>(null);
  const [story, step] = useActiveStep();
  useRevealFallback(page);

  // The page's own shape carries over, except one no picker offers.
  const corner = CORNERS.some((c) => c.id === global.shape) ? (global.shape as Corner) : "soft";
  const start: WindowLook = { accent: global.accent, corner, pace: "subtle", speech: "both" };
  const [look, setLook] = useState<WindowLook>(start);
  const [toast, setToast] = useState(0);
  const [toastOn, setToastOn] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setToastOn(true);
    const t = window.setTimeout(() => setToastOn(false), 4200);
    return () => clearTimeout(t);
  }, [toast]);
  const [replay, setReplay] = useState(0);
  const [touched, setTouched] = useState(false);
  const [aim, setAim] = useState<number | null>(null);
  const [pressing, setPressing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const current = STEPS[step];

  useEffect(() => {
    const next = STEPS[step].look;
    if (next) setLook(next);
    else setLook((l) => ({ ...l, pace: "subtle", speech: "both", corner: start.corner }));
    // `start` is the look the visitor arrived with and never changes afterwards.
  }, [step]);

  // On the first view the window shows its own use: a pointer picks one accent
  // after another until the visitor takes over or scrolls on.
  useEffect(() => {
    if (step !== 0 || touched || hovered) {
      setAim(null);
      return;
    }
    let n = Math.max(0, ACCENTS.findIndex((a) => a.hex === look.accent));
    const timers: number[] = [];
    const loop = window.setInterval(() => {
      if (document.hidden || quietMotion()) return;
      n = (n + 1) % ACCENTS.length;
      setAim(n);
      timers.push(window.setTimeout(() => setPressing(true), 820));
      timers.push(
        window.setTimeout(() => {
          setPressing(false);
          setLook((l) => ({ ...l, accent: ACCENTS[n].hex }));
        }, 960),
      );
    }, 2900);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
    // The loop reads the accent once when it starts and then carries its own count.
  }, [step, touched, hovered]);

  // The pinned window sits in the middle of the viewport and the chapter copy
  // lines up with its top, so both need the window's height. On a phone the
  // copy pins below the window instead.
  useLayoutEffect(() => {
    const s = stage.current;
    const t = story.current;
    if (!s || !t) return;
    const ro = new ResizeObserver(() => t.style.setProperty("--la-pin-h", `${s.offsetHeight}px`));
    ro.observe(s);
    return () => ro.disconnect();
  }, [story]);

  const pick = useCallback((change: Partial<WindowLook>) => {
    setTouched(true);
    setLook((l) => ({ ...l, ...change }));
  }, []);

  // A new motion level shows where something moves: the meters fill again and
  // the toast comes in, each at the moment the light reaches it.
  const arrive = useCallback((stop: Stop) => {
    if (stop === "toast") setToast((t) => t + 1);
    if (stop === "meters") setReplay((n) => n + 1);
  }, []);
  const { taken, pulse, flash } = useRelay(look, { root: page, origin: stage, gem, head: step === 0, onArrive: arrive });

  const shown = taken.page;
  const chapter = current.chapter;
  const hue = HUES.find((h) => h.hex === shown.accent);

  return (
    <div className="la" ref={page}>
      <div className="la-show accent-scope" style={scopeOf(shown)}>
        <header className="la-hero" data-la-shot="top">
          <h1 className="la-title">
            <span className="la-line">
              Your users want{" "}
              <span className="la-hot accent-scope" style={scopeOf(taken.head)} data-la-stop="head">
                {colourName(taken.head.accent)}
              </span>{" "}
              buttons.
            </span>
            <span className="la-line la-line--quiet">Fine. Every framework plays along.</span>
          </h1>
        </header>

        <div className="la-track" ref={story}>
          <div className="la-stage">
            <div className="la-stage-pin" ref={stage}>
              <div className="la-stage-glow" aria-hidden="true" />
              <Gem ref={gem} flash={flash} style={scopeOf(shown)} />
              <div className="la-stage-window" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
                <StageWindow
                  look={look}
                  taken={taken}
                  onPick={pick}
                  toast={toastOn ? toast : 0}
                  replay={replay}
                  onRun={() => setToast((t) => t + 1)}
                  aim={aim}
                  pressing={pressing}
                />
              </div>
              <Beams pulse={pulse} />
              <ol className="la-rail" aria-label="Chapters">
                {CHAPTERS.map((name, i) => {
                  const own = stepsOf(i + 1);
                  const fill = chapter > i + 1 ? 1 : chapter === i + 1 ? (current.index + 1) / own.length : 0;
                  return (
                    <li key={name} className={chapter === i + 1 ? "is-on" : undefined}>
                      <span>{name}</span>
                      <span className="la-rail-bar" style={{ "--la-fill": fill } as CSSProperties} />
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="la-story">
            <section className="la-intro" aria-label="Introduction">
              <p className="la-lead">
                GlimStone is a design language with components for React, Vue, Solid, Svelte and Flutter. Colour, corners,
                motion and labels are settings the person using the app picks once. Every component follows them, and the
                contrast holds for any colour they choose.
              </p>
              <div className="la-actions">
                <Button label="Make it yours" labelKey="look" tone="accent" size="key" onClick={() => setLookPanel(!panel)} aria-expanded={panel} />
                <Button label="Browse blocks" labelKey={null} glyph={<Glyph name="IconForward" />} size="key" href="#/blocks" />
              </div>
              <p className="la-hint">
                <Glyph name="IconTabLook" size={18} />
                <span>The window is real. Pick a colour and follow it through the stone, or scroll on and watch every setting take the same path.</span>
              </p>
              <div className="la-markers la-markers--intro" aria-hidden="true">
                <span className="la-marker" data-step={0} />
              </div>
            </section>

            <Chapter n={1} id="colour">
              <h2 id="la-colour" className="la-word la-word--colour la-reveal">
                Colour
              </h2>
              <p className="la-text">
                One accent, picked once. Every fill, ink and hover in the app follows it, and the text on it stays readable
                whichever colour it is.
              </p>
              <div className="la-hues" aria-hidden="true">
                {HUES.map((h) => (
                  <span key={h.hex} className={h.hex === shown.accent ? "is-on" : undefined} style={{ "--la-swatch": h.hex } as CSSProperties} />
                ))}
              </div>
              <p className="la-hue-name" aria-hidden="true">
                {hue?.name ?? "Your own colour"}
              </p>
            </Chapter>

            <Chapter n={2} id="shape">
              <h2 id="la-shape" className="la-word la-reveal">
                Shape
                <span className={`la-corner la-corner--${shown.corner}`} aria-hidden="true" />
              </h2>
              <p className="la-text">
                Square, soft or round. One setting gives every card, field and button the same corners, and only round turns
                buttons into pills.
              </p>
              <Readout items={CORNERS} value={shown.corner} />
            </Chapter>

            <Chapter n={3} id="motion">
              <h2 id="la-motion" className="la-word la-reveal" aria-label="Motion">
                <MotionWord pace={shown.pace} />
              </h2>
              <p className="la-text">
                Off, subtle or lively. The person using the app decides how much moves, and when their device asks for less
                motion, the device wins.
              </p>
              <Readout items={PACES} value={shown.pace} />
            </Chapter>

            <Chapter n={4} id="labels">
              <h2 id="la-labels" className={`la-word la-word--speech la-speech--${shown.speech} la-reveal`} aria-label="Labels">
                <span className="la-speech-glyph" aria-hidden="true">
                  <Glyph name="IconSave" size={96} />
                </span>
                <span className="la-speech-text" aria-hidden="true">
                  Labels
                </span>
              </h2>
              <p className="la-text">
                Glyph only, text only, or both. Each person picks how the buttons speak to them, and every button in the app
                answers the same way.
              </p>
              <Readout items={SPEECHES} value={shown.speech} />
            </Chapter>
          </div>
        </div>
      </div>

      <section className="la-frameworks" aria-labelledby="la-fw" data-la-shot="frameworks">
        <h2 id="la-fw" className="la-sub la-reveal">
          One look, five frameworks.
        </h2>
        <ul className="la-fw-list">
          {FRAMEWORKS.map((f, i) => (
            <li key={f.id} className="la-reveal" style={{ "--la-dir": i % 2 ? 1 : -1 } as CSSProperties}>
              <a href={f.href} className="la-fw">
                <span className="la-fw-mark">
                  <FrameworkMark id={f.id} />
                </span>
                <span className="la-fw-name">{f.name}</span>
                <code className="la-fw-pkg">{f.pkg}</code>
                <span className="la-fw-go">
                  <Glyph name="IconForward" size={22} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="la-base" aria-label="What it stands on" data-la-shot="base">
        <p className="la-statement la-reveal">
          Behaviour comes from <a href="#/guide/behaviour">Zag.js</a>. The tokens are written in DTCG and arrive as a
          Tailwind v4 theme. Density, dark and light are settings too. Between all of it stand{" "}
          <a href="#/guide/rules">52 written design rules</a>.
        </p>
      </section>

      <section className="la-end" aria-labelledby="la-end" data-la-shot="end">
        <h2 id="la-end" className="la-word la-word--end la-reveal">
          Make it yours.
        </h2>
        <p className="la-text la-text--end">Open the look panel and choose. This page follows you, the way an app would.</p>
        <div className="la-actions la-actions--end">
          <Button label="Open the look panel" labelKey="look" tone="accent" size="key" onClick={() => setLookPanel(!panel)} aria-expanded={panel} />
          <Button label="Read the guide" labelKey={null} glyph={<Glyph name="IconBook" />} size="key" href="#/introduction" />
          <Button label="Browse blocks" labelKey={null} glyph={<Glyph name="IconForward" />} size="key" href="#/blocks" />
        </div>
        <p className="la-foot">
          <span>GlimStone {GLIMSTONE_VERSION}</span>
          <a href="https://github.com/junkerderprovinz/glimstone" target="_blank" rel="noreferrer">
            <Glyph name="IconGithub" size={16} />
            GitHub
          </a>
        </p>
      </section>
    </div>
  );
}

