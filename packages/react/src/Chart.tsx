import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";
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

export function Chart({ data, x, series, label, kind = "bar", height = 200, format, legend = true }: ChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, radius: 4 });
  useLayoutEffect(() => watchChartFrame(box.current!, setFrame), []);
  const [hover, setHover] = useState<number | null>(null);
  const layout = chartLayout({ data, x, series, kind, width: frame.width, height, radius: frame.radius, format });
  const tip = hover === null ? null : { ...chartTooltip(data, x, series, hover, format), ...chartTooltipPlace(layout, hover) };
  const move = (e: PointerEvent<SVGSVGElement>) => setHover(chartIndexAt(layout, e.clientX - e.currentTarget.getBoundingClientRect().left));

  return (
    <div data-glim="Chart" className="glim-chart">
      <div ref={box} className="glim-chart-plot" style={{ height }}>
        {frame.width > 0 && (
          <svg width={frame.width} height={height} role="img" aria-label={label} onPointerMove={move} onPointerLeave={() => setHover(null)}>
            {layout.ticks.map((t) => (
              <g key={t.value}>
                <line x1={layout.plot.left} x2={layout.plot.left + layout.plot.width} y1={t.y} y2={t.y} className="glim-chart-grid" />
                <text x={layout.plot.left - 8} y={t.y} dy="0.32em" textAnchor="end" className="glim-chart-tick">
                  {t.text}
                </text>
              </g>
            ))}
            {hover !== null &&
              (kind === "bar" ? (
                <rect x={layout.plot.left + layout.band * hover} y={layout.plot.top} width={layout.band} height={layout.plot.height} className="glim-chart-cursor" />
              ) : (
                <line x1={layout.centres[hover]} x2={layout.centres[hover]} y1={layout.plot.top} y2={layout.plot.top + layout.plot.height} className="glim-chart-cursor-line" />
              ))}
            {layout.bars.map((b) => (
              <path key={b.key} className="glim-chart-bar" d={b.d} fill={b.color} />
            ))}
            {layout.lines.map((l) => (
              <g key={l.key}>
                {kind === "area" && <path d={l.area} fill={l.color} className="glim-chart-area" />}
                <polyline points={l.points} fill="none" stroke={l.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {hover !== null && <circle cx={l.dots[hover]!.x} cy={l.dots[hover]!.y} r={4} fill={l.color} className="glim-chart-dot" />}
              </g>
            ))}
            {layout.labels.map((l, i) => (
              <text key={i} x={l.x} y={height - 6} textAnchor="middle" className="glim-chart-tick">
                {l.text}
              </text>
            ))}
          </svg>
        )}
        {tip && (
          <div className="glim-chart-tooltip" aria-hidden="true" style={{ left: tip.left, top: tip.top, translate: tip.flip ? "calc(-100% - 12px) 0" : "12px 0" }}>
            <div className="glim-chart-tooltip-title">{tip.title}</div>
            {tip.rows.map((r) => (
              <div key={r.label} className="glim-chart-tooltip-row">
                <span className="glim-chart-swatch" style={{ background: r.color }} />
                <span>{r.label}</span>
                <span className="glim-chart-tooltip-value glim-num">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {legend && series.length > 1 && <ChartLegend series={series} />}
    </div>
  );
}

export function ChartLegend({ series }: { series: readonly ChartSeries[] }) {
  return (
    <ul data-glim="ChartLegend" className="glim-chart-legend">
      {series.map((s, i) => (
        <li key={s.key}>
          <span className="glim-chart-swatch" style={{ background: seriesColor(s, i) }} />
          {s.label}
        </li>
      ))}
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
export function Sparkline({ values, label, color = "var(--chart-1)", width = 96, height = 28 }: SparklineProps) {
  const line = sparkline(values, width, height);
  return (
    <svg data-glim="Sparkline" className="glim-sparkline" width={width} height={height} role="img" aria-label={label}>
      <path d={line.area} fill={color} className="glim-chart-area" />
      <polyline points={line.points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={line.last[0]} cy={line.last[1]} r={2.5} fill={color} />
    </svg>
  );
}
