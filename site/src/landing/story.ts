import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ACCENTS } from "@glimstone/core";

export type Corner = "square" | "soft" | "round";
export type Pace = "off" | "subtle" | "wild";
export type Speech = "text" | "glyph" | "both";

export interface WindowLook {
  accent: string;
  corner: Corner;
  pace: Pace;
  speech: Speech;
}

export const SUNFLOWER = ACCENTS[0].hex;

// The colour chapter walks every preset and ends where it started, on the default.
export const HUES = [...ACCENTS.slice(1), ACCENTS[0]];

export const CORNERS: { id: Corner; name: string; glyph: string }[] = [
  { id: "square", name: "Square", glyph: "IconCornerSquare" },
  { id: "soft", name: "Soft", glyph: "IconCornerSoft" },
  { id: "round", name: "Round", glyph: "IconCornerRound" },
];

export const PACES: { id: Pace; name: string; glyph: string }[] = [
  { id: "off", name: "Off", glyph: "IconMotionOff" },
  { id: "subtle", name: "Subtle", glyph: "IconMotionSubtle" },
  { id: "wild", name: "Lively", glyph: "IconMotionWild" },
];

export const SPEECHES: { id: Speech; name: string; glyph: string }[] = [
  { id: "text", name: "Text only", glyph: "IconLabelText" },
  { id: "glyph", name: "Glyph only", glyph: "IconLabelGlyph" },
  { id: "both", name: "Both", glyph: "IconLabelTextGlyph" },
];

// The corner radii of each shape, the same three the look layer uses for the
// whole app. Round stops at a radius that already makes every control a pill,
// so the morph has no dead stretch while a huge radius clamps.
export const RADII: Record<Corner, { card: string; control: string; pill: string }> = {
  square: { card: "0rem", control: "0rem", pill: "0rem" },
  soft: { card: "0.875rem", control: "0.5rem", pill: "0.5rem" },
  round: { card: "1.5rem", control: "1rem", pill: "1.5rem" },
};

/** The custom properties that give one part of the page its own accent and corners. */
export function scopeOf(look: WindowLook): CSSProperties {
  const r = RADII[look.corner];
  return { "--scope-accent": look.accent, "--radius-card": r.card, "--radius-control": r.control, "--radius-pill": r.pill } as CSSProperties;
}

export interface Step {
  chapter: number;
  index: number;
  look: WindowLook | null;
}

const BASE: WindowLook = { accent: SUNFLOWER, corner: "soft", pace: "subtle", speech: "both" };

function buildSteps(): Step[] {
  const steps: Step[] = [{ chapter: 0, index: 0, look: null }];
  let look = BASE;
  const push = (chapter: number, index: number, change: Partial<WindowLook>) => {
    look = { ...look, ...change };
    steps.push({ chapter, index, look });
  };
  HUES.forEach((h, i) => push(1, i, { accent: h.hex }));
  CORNERS.forEach((c, i) => push(2, i, { corner: c.id }));
  PACES.forEach((p, i) => push(3, i, { pace: p.id }));
  SPEECHES.forEach((s, i) => push(4, i, { speech: s.id }));
  return steps;
}

export const STEPS = buildSteps();

export const quietMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";

// The step whose marker crosses the middle of the viewport. An observer
// rather than a scroll handler, so scrolling never waits on this page's code.
export function useActiveStep() {
  const [step, setStep] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-49% 0px -49% 0px" },
    );
    el.querySelectorAll("[data-step]").forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, []);
  return [root, step] as const;
}

// Browsers without scroll-driven animations get the same reveals from an
// observer: each element turns on once it is a little way into the viewport.
export function useRevealFallback(root: { current: HTMLElement | null }) {
  useEffect(() => {
    const el = root.current;
    if (!el || CSS.supports("animation-timeline: view()")) return;
    el.classList.add("la-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    el.querySelectorAll(".la-reveal").forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, [root]);
}
