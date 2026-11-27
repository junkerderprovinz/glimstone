// The frame every chart shares (design-language.md, rule 50): grid lines
// across only, ticks as quiet text without an axis line, a band under the
// pointer, a tooltip with a swatch and right-aligned tabular figures, and a
// legend. This lays a chart out; a framework draws the SVG from it. Series
// take --chart-1 onwards in order unless they name a colour.

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export type ChartRow = Record<string, string | number>;

export type ChartKind = "bar" | "line" | "area";

/** The room around the plot for the ticks, in px. */
export const CHART_PAD = { top: 8, right: 8, bottom: 24, left: 40 };

/** A series' colour: its own, or the chart series of its place. */
export function seriesColor(series: ChartSeries, index: number): string {
  return series.color ?? `var(--chart-${(index % 8) + 1})`;
}

/** Round steps for an axis from zero to at least `max`, about `count` of them. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toPrecision(12));
}

/** A bar whose top corners round and whose foot stays square on the base line. */
export function barPath(x: number, y: number, w: number, h: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, w / 2, h));
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export interface ChartLayout {
  width: number;
  height: number;
  kind: ChartKind;
  /** The width of one point's share of the plot. */
  band: number;
  plot: { left: number; top: number; width: number; height: number };
  ticks: { value: number; y: number; text: string }[];
  labels: { x: number; text: string }[];
  bars: { key: string; d: string; color: string }[];
  lines: { key: string; points: string; area: string; color: string; dots: { x: number; y: number }[] }[];
  /** The x of each point's middle. */
  centres: number[];
}

/** Lays a bar or line chart out on a plot `width` by `height` px. */
export function chartLayout({
  data,
  x,
  series,
  kind = "bar",
  width,
  height,
  radius = 4,
  format = (n: number) => n.toLocaleString(),
}: {
  data: readonly ChartRow[];
  x: string;
  series: readonly ChartSeries[];
  kind?: ChartKind;
  width: number;
  height: number;
  radius?: number;
  format?: (n: number) => string;
}): ChartLayout {
  const value = (row: ChartRow, key: string) => Number(row[key]) || 0;
  const ticks = niceTicks(Math.max(0, ...data.flatMap((d) => series.map((s) => value(d, s.key)))));
  const top = ticks[ticks.length - 1] || 1;
  const plot = { left: CHART_PAD.left, top: CHART_PAD.top, width: Math.max(0, width - CHART_PAD.left - CHART_PAD.right), height: height - CHART_PAD.top - CHART_PAD.bottom };
  const band = data.length ? plot.width / data.length : 0;
  const yOf = (v: number) => plot.top + plot.height - (v / top) * plot.height;
  const centres = data.map((_, i) => plot.left + band * (i + 0.5));

  const inner = band * 0.72;
  const gap = series.length > 1 ? 2 : 0;
  const w = Math.max(1, (inner - gap * (series.length - 1)) / series.length);
  const bars =
    kind === "bar"
      ? data.flatMap((d, i) =>
          series.map((s, k) => {
            const left = plot.left + band * i + (band - inner) / 2 + k * (w + gap);
            return { key: `${i}-${s.key}`, d: barPath(left, yOf(value(d, s.key)), w, yOf(0) - yOf(value(d, s.key)), radius), color: seriesColor(s, k) };
          }),
        )
      : [];
  const lines =
    kind === "bar"
      ? []
      : series.map((s, k) => {
          const dots = data.map((d, i) => ({ x: centres[i]!, y: yOf(value(d, s.key)) }));
          const points = dots.map((p) => `${p.x},${p.y}`).join(" ");
          const area = dots.length ? `M${dots[0]!.x},${yOf(0)} L${dots.map((p) => `${p.x},${p.y}`).join(" L")} L${dots[dots.length - 1]!.x},${yOf(0)} Z` : "";
          return { key: s.key, points, area, color: seriesColor(s, k), dots };
        });

  return {
    width,
    height,
    kind,
    band,
    plot,
    ticks: ticks.map((t) => ({ value: t, y: yOf(t), text: format(t) })),
    labels: data.map((d, i) => ({ x: centres[i]!, text: String(d[x]) })),
    bars,
    lines,
    centres,
  };
}

/** The point under the pointer at `offsetX` px from the plot's left edge of the drawing, or null beside the points. */
export function chartIndexAt(layout: ChartLayout, offsetX: number): number | null {
  if (!layout.band) return null;
  const i = Math.floor((offsetX - layout.plot.left) / layout.band);
  return i >= 0 && i < layout.centres.length ? i : null;
}

/** What the tooltip shows for the point at `index`: its name, and each series' swatch and figure. */
export function chartTooltip(data: readonly ChartRow[], x: string, series: readonly ChartSeries[], index: number, format = (n: number) => n.toLocaleString()) {
  return {
    title: String(data[index]![x]),
    rows: series.map((s, k) => ({ label: s.label, color: seriesColor(s, k), value: format(Number(data[index]![s.key]) || 0) })),
  };
}

/** A small line of the last values, beside a figure, without axes or a tooltip. */
export function sparkline(values: readonly number[], width: number, height: number) {
  const lo = Math.min(...values);
  const span = Math.max(...values) - lo || 1;
  const step = values.length > 1 ? (width - 4) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [2 + i * step, 2 + (height - 4) * (1 - (v - lo) / span)] as [number, number]);
  const last = pts[pts.length - 1] ?? [0, 0];
  const joined = pts.map((p) => p.join(",")).join(" ");
  return { points: joined, area: pts.length ? `M${pts[0]![0]},${height} L${pts.map((p) => p.join(",")).join(" L")} L${last[0]},${height} Z` : "", last };
}

/** Where the tooltip for the point at `index` stands: beside the band, turned to the left once the point lies past 60% of the plot. */
export function chartTooltipPlace(layout: ChartLayout, index: number): { left: number; top: number; flip: boolean } {
  const centre = layout.centres[index]!;
  return {
    left: layout.kind === "bar" ? layout.plot.left + layout.band * (index + 1) : centre,
    top: layout.plot.top,
    flip: centre > layout.width * 0.6,
  };
}

/** Reads a chart's width and the bar radius the theme sets, again on every resize. Returns the teardown. */
export function watchChartFrame(box: HTMLElement, onFrame: (frame: { width: number; radius: number }) => void): () => void {
  const watch = new ResizeObserver(([entry]) => {
    const radius = parseFloat(getComputedStyle(box).getPropertyValue("--chart-bar-radius"));
    onFrame({ width: Math.floor(entry!.contentRect.width), radius: Number.isNaN(radius) ? 4 : radius });
  });
  watch.observe(box);
  return () => watch.disconnect();
}
