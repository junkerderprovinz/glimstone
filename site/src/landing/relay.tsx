import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { quietMotion, type WindowLook } from "./story";

/** A part of the page that takes a setting on its own, when the light reaches it. */
export type Stop = "page" | "head" | "rail" | "backups" | "runs" | "meters" | "toast" | "restore" | "run";
type Field = keyof WindowLook;

// Where each kind of setting is carried after the stone. The page itself, the
// window frame and the chapter words take it in the stone's own moment.
const ROUTES: Record<Field, Exclude<Stop, "page">[]> = {
  accent: ["head", "rail", "backups", "runs"],
  corner: ["rail", "backups", "runs"],
  pace: ["meters", "toast"],
  speech: ["restore", "run"],
};

// The spot inside a stop where its beam lands, and the side it comes in from.
// The light keeps to the window's gutters, the bar's lower edge, the side
// margins and the gaps between cards, so it never crosses the control that
// sent it.
type Side = "top" | "bottom" | "right" | "left";
const LANDING: Record<Exclude<Stop, "page" | "head">, { at: string; from: Side }> = {
  rail: { at: '[aria-selected="true"]', from: "left" },
  backups: { at: ".glim-toggle-track", from: "top" },
  runs: { at: ".glim-panel-heading .glim-badge", from: "right" },
  meters: { at: ".glim-progress", from: "right" },
  toast: { at: "", from: "right" },
  restore: { at: "button", from: "bottom" },
  run: { at: "button", from: "bottom" },
};

// The light covers about this many pixels per millisecond, so a long way takes
// longer, within bounds that keep a short hop visible and a long one brisk.
const SPEED = 1.7;
const runFor = (length: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, length / SPEED)));
// The pause between one beam leaving the stone and the next.
const GAP = 90;

export interface Beam {
  stop: Stop | "stone";
  d: string;
  x: number;
  y: number;
  start: number;
  run: number;
}

export interface Pulse {
  id: number;
  colour: string;
  beams: Beam[];
}

type Point = [number, number];

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
  cx: number;
  cy: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// A route through the given points with its corners rounded off, and its length.
function trace(points: Point[], radius = 18): { d: string; length: number } {
  const pts = points.filter((p, i) => i === 0 || Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) > 0.5);
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  let length = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [px, py] = pts[i];
    length += Math.hypot(px - ax, py - ay);
    if (i === pts.length - 1) {
      d += ` L${r1(px)} ${r1(py)}`;
      break;
    }
    const [bx, by] = pts[i + 1];
    const la = Math.hypot(px - ax, py - ay);
    const lb = Math.hypot(bx - px, by - py);
    const k = Math.min(radius, la / 2, lb / 2);
    d += ` L${r1(px + ((ax - px) / la) * k)} ${r1(py + ((ay - py) / la) * k)}`;
    d += ` Q${r1(px)} ${r1(py)} ${r1(px + ((bx - px) / lb) * k)} ${r1(py + ((by - py) / lb) * k)}`;
  }
  return { d, length };
}

const everywhere = (look: WindowLook) =>
  Object.fromEntries((["page", "head", "rail", "backups", "runs", "meters", "toast", "restore", "run"] as Stop[]).map((s) => [s, look])) as Record<Stop, WindowLook>;

interface Options {
  root: RefObject<HTMLElement | null>;
  origin: RefObject<HTMLElement | null>;
  gem: RefObject<HTMLElement | null>;
  // Whether the headline is on screen, so a beam to it would be seen.
  head: boolean;
  onArrive: (stop: Stop) => void;
}

/**
 * Carries every change of the look from its control through the stone to the
 * parts that follow it. Returns what each part has taken so far, the pulse to
 * draw and how many changes have reached the stone.
 */
export function useRelay(look: WindowLook, { root, origin, gem, head, onArrive }: Options) {
  const [taken, setTaken] = useState(() => everywhere(look));
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [flash, setFlash] = useState(0);
  const last = useRef(look);
  const count = useRef(0);
  const timers = useRef(new Set<number>());
  const arrive = useRef(onArrive);
  arrive.current = onArrive;
  const headOn = useRef(head);
  headOn.current = head;

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useLayoutEffect(() => {
    const before = last.current;
    last.current = look;
    const fields = (Object.keys(look) as Field[]).filter((f) => look[f] !== before[f]);
    if (!fields.length) return;
    const change = Object.fromEntries(fields.map((f) => [f, look[f]])) as Partial<WindowLook>;
    const stops = [...new Set(fields.flatMap((f) => ROUTES[f]))];
    const deliver = (to: Stop[]) => {
      setTaken((t) => {
        const next = { ...t };
        for (const s of to) next[s] = { ...next[s], ...change };
        return next;
      });
      to.forEach((s) => arrive.current(s));
    };
    const later = (ms: number, fn: () => void) => {
      const t = window.setTimeout(() => {
        timers.current.delete(t);
        fn();
      }, ms);
      timers.current.add(t);
    };

    const o = origin.current;
    const g = gem.current;
    const page = root.current;
    const win = o?.querySelector(".la-window");
    const bar = o?.querySelector(".la-window-bar");
    const main = o?.querySelector(".la-window-main");
    const control = page?.querySelector(`[data-la-src="${fields[0]}"] :is([aria-checked="true"], [aria-selected="true"])`);
    if (quietMotion() || !o || !g || !page || !win || !bar || !main || !control) {
      deliver(["page", ...stops]);
      return;
    }

    // One measurement per change, never per frame: once the routes are known
    // the drawing runs on its own in CSS.
    const origin0 = o.getBoundingClientRect();
    const box = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      const l = r.left - origin0.left;
      const t = r.top - origin0.top;
      return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
    };
    const G = box(g);
    const W = box(win);
    const B = box(bar);
    const M = box(main);
    const gem0: Point = [G.cx, G.cy];
    // The two lanes the light runs down: the window's right margin and, for
    // the page list, its left one.
    const right = (M.r + W.r) / 2;

    // A swatch sits in the card's top row and sends its light straight up; a
    // selector sends it from its far end, past none of its other options.
    const S = box(control);
    const strip = box(control.closest(".glim-sel") ?? control);
    const sourceCard = box(control.closest(".glim-panel") ?? control);
    const way =
      fields[0] === "accent"
        ? trace([[S.cx, S.t], [S.cx, B.b], [G.cx, B.b], gem0])
        : trace([[strip.r, strip.cy], [sourceCard.r + 12, strip.cy], [sourceCard.r + 12, B.b], [G.cx, B.b], gem0]);
    const into = runFor(way.length, 260, 620);

    const now: Stop[] = ["page"];
    const routed: Omit<Beam, "start">[] = [];
    for (const stop of stops) {
      const at = page.querySelector<HTMLElement>(`[data-la-stop="${stop}"]`);
      if (stop === "head") {
        // The beam arcs over the headline and drops onto the word, which only
        // reads while the stone stands beside the headline. On a phone the
        // stone sits below it and the arc would cut through the lines.
        const last = at?.closest("h1")?.lastElementChild;
        if (!at || !last || !headOn.current || G.t > box(last).b) {
          now.push(stop);
          continue;
        }
        const T = box(at);
        const x = T.r - (T.r - T.l) * 0.3;
        const y = T.t + (T.b - T.t) * 0.3;
        const d = `M${r1(G.cx)} ${r1(G.cy)} C${r1(G.cx - (G.cx - x) * 0.12)} ${r1(T.t)} ${r1(x + (G.cx - x) * 0.3)} ${r1(T.t)} ${r1(x)} ${r1(y)}`;
        routed.push({ stop, d, x, y, run: runFor(Math.hypot(G.cx - x, G.cy - y) * 1.25, 320, 900) });
        continue;
      }
      const spec = LANDING[stop];
      const land = spec.at ? at?.querySelector(spec.at) : at;
      if (!land || !land.getBoundingClientRect().width) {
        now.push(stop);
        continue;
      }
      const T = box(land);
      const card = box(land.closest(".glim-panel") ?? land);
      let points: Point[];
      let end: Point;
      if (spec.from === "left") {
        const lane = (W.l + T.l) / 2 - 2;
        end = [T.l, T.cy];
        points = [gem0, [G.cx, B.b], [lane, B.b], [lane, T.cy], end];
      } else if (spec.from === "right") {
        end = [T.r, T.cy];
        points = [gem0, [right, G.cy], [right, T.cy], end];
      } else if (spec.from === "bottom") {
        const lane = card.b + 12;
        end = [T.cx, T.b];
        points = [gem0, [right, G.cy], [right, lane], [T.cx, lane], end];
      } else if (card.t - B.b < 56) {
        end = [T.cx, T.t];
        points = [gem0, [G.cx, B.b], [T.cx, B.b], end];
      } else {
        const lane = card.t - 12;
        end = [T.cx, T.t];
        points = [gem0, [right, G.cy], [right, lane], [T.cx, lane], end];
      }
      const { d, length } = trace(points);
      routed.push({ stop, d, x: end[0], y: end[1], run: runFor(length, 320, 900) });
    }
    routed.sort((a, b) => a.run - b.run);
    const beams: Beam[] = [
      { stop: "stone", d: way.d, x: G.cx, y: G.cy, start: 0, run: into },
      ...routed.map((b, i) => ({ ...b, x: r1(b.x), y: r1(b.y), start: into + i * GAP })),
    ];

    count.current += 1;
    setPulse({ id: count.current, colour: look.accent, beams });
    later(into, () => {
      setFlash((n) => n + 1);
      deliver(now);
    });
    for (const b of beams.slice(1)) later(b.start + b.run, () => deliver([b.stop as Stop]));
    // The parts are read from the page as it stands, so a new look is enough.
  }, [look]);

  return { taken, pulse, flash };
}

/** The light's paths for one pulse, drawn over the stage and gone once it has landed. */
export function Beams({ pulse }: { pulse: Pulse | null }) {
  if (!pulse) return null;
  return (
    <svg className="la-beams" key={pulse.id} style={{ "--la-beam": pulse.colour } as CSSProperties} aria-hidden="true">
      {pulse.beams.map((b) => (
        <g key={b.stop} style={{ "--la-at": `${b.start}ms`, "--la-run": `${b.run}ms` } as CSSProperties}>
          <path className="la-beam-trace" d={b.d} pathLength={100} />
          <path className="la-beam-head" d={b.d} pathLength={100} />
          {b.stop !== "stone" && <circle className="la-beam-land" cx={b.x} cy={b.y} r={5} />}
        </g>
      ))}
    </svg>
  );
}
