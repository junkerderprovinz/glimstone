import { createMemo, createSignal, For, mergeProps, onCleanup, onMount, Show } from "solid-js";
import {
  chartIndexAt,
  chartLayout,
  chartTooltip,
  chartTooltipPlace,
  seriesColor,
  sparkline,
  watchChartFrame,
  type ChartKind,
  type ChartRow,
  type ChartSeries,
} from "@glimstone/core";

export type { ChartKind, ChartRow, ChartSeries } from "@glimstone/core";

// A bar, line or area chart on the frame every chart shares; chart.ts in the
// core lays it out. The figures live in the tooltip, so the drawing itself is
// one image named by `label`.

export interface ChartProps {
  data: readonly ChartRow[];
  /** The field that names each point on the x axis, such as "day". */
  x: string;
  series: readonly ChartSeries[];
  /** What the chart shows, for a screen reader. */
  label: string;
  kind?: ChartKind;
  height?: number;
  /** How a figure reads on the axis and in the tooltip. */
  format?: (n: number) => string;
  /** The legend under the plot, shown where there is more than one series. */
  legend?: boolean;
}

export function Chart(raw: ChartProps) {
  const props = mergeProps({ kind: "bar", height: 200, legend: true } as const, raw);
  let box!: HTMLDivElement;
  const [frame, setFrame] = createSignal({ width: 0, radius: 4 });
  onMount(() => onCleanup(watchChartFrame(box, setFrame)));
  const [hover, setHover] = createSignal<number | null>(null);
  const kind = () => props.kind;
  const height = () => props.height;
  const layout = createMemo(() => chartLayout({ data: props.data, x: props.x, series: props.series, kind: kind(), width: frame().width, height: height(), radius: frame().radius, format: props.format }));
  const tip = () => {
    const i = hover();
    return i === null ? null : { ...chartTooltip(props.data, props.x, props.series, i, props.format), ...chartTooltipPlace(layout(), i) };
  };
  const move = (e: PointerEvent & { currentTarget: SVGSVGElement }) => setHover(chartIndexAt(layout(), e.clientX - e.currentTarget.getBoundingClientRect().left));

  return (
    <div data-glim="Chart" class="glim-chart">
      <div ref={box} class="glim-chart-plot" style={{ height: `${height()}px` }}>
        <Show when={frame().width > 0}>
          <svg width={frame().width} height={height()} role="img" aria-label={props.label} onPointerMove={move} onPointerLeave={() => setHover(null)}>
            <For each={layout().ticks}>
              {(t) => (
                <g>
                  <line x1={layout().plot.left} x2={layout().plot.left + layout().plot.width} y1={t.y} y2={t.y} class="glim-chart-grid" />
                  <text x={layout().plot.left - 8} y={t.y} dy="0.32em" text-anchor="end" class="glim-chart-tick">
                    {t.text}
                  </text>
                </g>
              )}
            </For>
            <Show when={hover() !== null}>
              <Show
                when={kind() === "bar"}
                fallback={<line x1={layout().centres[hover()!]} x2={layout().centres[hover()!]} y1={layout().plot.top} y2={layout().plot.top + layout().plot.height} class="glim-chart-cursor-line" />}
              >
                <rect x={layout().plot.left + layout().band * hover()!} y={layout().plot.top} width={layout().band} height={layout().plot.height} class="glim-chart-cursor" />
              </Show>
            </Show>
            <For each={layout().bars}>{(b) => <path class="glim-chart-bar" d={b.d} fill={b.color} />}</For>
            <For each={layout().lines}>
              {(l) => (
                <g>
                  <Show when={kind() === "area"}>
                    <path d={l.area} fill={l.color} class="glim-chart-area" />
                  </Show>
                  <polyline points={l.points} fill="none" stroke={l.color} stroke-width={2} stroke-linejoin="round" stroke-linecap="round" />
                  <Show when={hover() !== null}>
                    <circle cx={l.dots[hover()!]!.x} cy={l.dots[hover()!]!.y} r={4} fill={l.color} class="glim-chart-dot" />
                  </Show>
                </g>
              )}
            </For>
            <For each={layout().labels}>
              {(l) => (
                <text x={l.x} y={height() - 6} text-anchor="middle" class="glim-chart-tick">
                  {l.text}
                </text>
              )}
            </For>
          </svg>
        </Show>
        <Show when={tip()}>
          {(t) => (
            <div class="glim-chart-tooltip" aria-hidden="true" style={{ left: `${t().left}px`, top: `${t().top}px`, translate: t().flip ? "calc(-100% - 12px) 0" : "12px 0" }}>
              <div class="glim-chart-tooltip-title">{t().title}</div>
              <For each={t().rows}>
                {(r) => (
                  <div class="glim-chart-tooltip-row">
                    <span class="glim-chart-swatch" style={{ background: r.color }} />
                    <span>{r.label}</span>
                    <span class="glim-chart-tooltip-value glim-num">{r.value}</span>
                  </div>
                )}
              </For>
            </div>
          )}
        </Show>
      </div>
      <Show when={props.legend && props.series.length > 1}>
        <ChartLegend series={props.series} />
      </Show>
    </div>
  );
}

export function ChartLegend(props: { series: readonly ChartSeries[] }) {
  return (
    <ul data-glim="ChartLegend" class="glim-chart-legend">
      <For each={props.series}>
        {(s, i) => (
          <li>
            <span class="glim-chart-swatch" style={{ background: seriesColor(s, i()) }} />
            {s.label}
          </li>
        )}
      </For>
    </ul>
  );
}

export interface SparklineProps {
  values: readonly number[];
  /** What the line shows, for a screen reader. */
  label: string;
  color?: string;
  width?: number;
  height?: number;
}

/** A small line of the last values, beside a figure, without axes or a tooltip. */
export function Sparkline(raw: SparklineProps) {
  const props = mergeProps({ color: "var(--chart-1)", width: 96, height: 28 }, raw);
  const color = () => props.color;
  const width = () => props.width;
  const height = () => props.height;
  const line = () => sparkline(props.values, width(), height());
  return (
    <svg data-glim="Sparkline" class="glim-sparkline" width={width()} height={height()} role="img" aria-label={props.label}>
      <path d={line().area} fill={color()} class="glim-chart-area" />
      <polyline points={line().points} fill="none" stroke={color()} stroke-width={1.5} stroke-linejoin="round" stroke-linecap="round" />
      <circle cx={line().last[0]} cy={line().last[1]} r={2.5} fill={color()} />
    </svg>
  );
}
