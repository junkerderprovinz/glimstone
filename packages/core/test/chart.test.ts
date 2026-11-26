import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrastRatio } from '../src/contrast.ts';
import { oklabOf, srgbOf, type Oklab } from '../src/oklab.ts';
import { barPath, chartIndexAt, chartLayout, niceTicks, sparkline } from '../src/chart.ts';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Each chart token's two halves, light and dark, as `#RRGGBB`. */
const tokens: Record<string, [string, string]> = Object.fromEntries(
  [...css.matchAll(/(--chart-[\w-]+):\s*light-dark\(oklch\(([\d.]+) ([\d.]+) ([\d.]+)\),\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)\);/g)].map((m) => {
    const hex = (l: string, c: string, h: string) => {
      const rad = (Number(h) * Math.PI) / 180;
      return srgbOf([Number(l), Number(c) * Math.cos(rad), Number(c) * Math.sin(rad)]);
    };
    return [m[1]!, [hex(m[2]!, m[3]!, m[4]!), hex(m[5]!, m[6]!, m[7]!)]];
  }),
);
const ramp = (prefix: string) => Object.keys(tokens).filter((k) => new RegExp(`^--chart-${prefix}\\d+$`).test(k)).map((k) => tokens[k]!);

const SERIES = ramp('');
const SEQUENTIAL = ramp('seq-');
const DIVERGING = ramp('div-');

// The grounds a chart stands on in each theme: the card and the page, OLED's included.
const GROUNDS = [['#FFFFFF', '#F4F4F4'], ['#262626', '#161616', '#000000']] as const;
const THEMES = ['light', 'dark'] as const;

// Machado, Oliveira and Fernandes (2009) at full severity, on linear RGB.
const VISION: Record<string, number[][] | null> = {
  normal: null,
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};

function seen(hex: string, m: number[][] | null): Oklab {
  if (!m) return oklabOf(hex);
  const n = parseInt(hex.slice(1), 16);
  const lin = [16, 8, 0].map((s) => {
    const v = ((n >> s) & 255) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const out = m.map((row) => Math.min(1, Math.max(0, row[0]! * lin[0]! + row[1]! * lin[1]! + row[2]! * lin[2]!)));
  const gamma = (v: number) => Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255);
  return oklabOf('#' + out.map((v) => gamma(v).toString(16).padStart(2, '0')).join(''));
}

const distance = (a: Oklab, b: Oklab) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// About three times what most people can just tell apart in OKLab.
const APART = 0.06;

test('there are eight series, seven sequential steps and seven diverging ones', () => {
  assert.equal(SERIES.length, 8);
  assert.equal(SEQUENTIAL.length, 7);
  assert.equal(DIVERGING.length, 7);
});

THEMES.forEach((theme, t) => {
  test(`every series reaches 3:1 on the grounds of the ${theme} theme`, () => {
    for (const [i, s] of SERIES.entries()) for (const g of GROUNDS[t]) assert.ok(contrastRatio(s[t], g) >= 3, `series ${i + 1} on ${g}`);
  });

  for (const [vision, m] of Object.entries(VISION)) {
    test(`every two series stay apart with ${vision} on the ${theme} theme`, () => {
      const looks = SERIES.map((s) => seen(s[t], m));
      for (let i = 0; i < looks.length; i++) {
        for (let j = i + 1; j < looks.length; j++) {
          const d = distance(looks[i]!, looks[j]!);
          assert.ok(d >= APART, `series ${i + 1} and ${j + 1}: ${d.toFixed(3)}`);
        }
      }
    });

    test(`the diverging ends stay apart with ${vision} on the ${theme} theme`, () => {
      assert.ok(distance(seen(DIVERGING[0]![t], m), seen(DIVERGING[6]![t], m)) >= 0.15);
    });
  }

  test(`the sequential ramp climbs away from the ground in even steps on the ${theme} theme`, () => {
    const l = SEQUENTIAL.map((s) => oklabOf(s[t])[0]);
    const away = theme === 'light' ? -1 : 1;
    for (let i = 1; i < l.length; i++) assert.ok((l[i]! - l[i - 1]!) * away >= 0.07, `steps ${i} and ${i + 1}`);
  });

  test(`the diverging ramp is quiet in the middle and strongest at the ends on the ${theme} theme`, () => {
    const lab = DIVERGING.map((s) => oklabOf(s[t]));
    const chroma = lab.map(([, a, b]) => Math.hypot(a, b));
    assert.ok(chroma[3]! < 0.02);
    for (const side of [[2, 1, 0], [4, 5, 6]]) {
      for (let i = 1; i < side.length; i++) {
        const [near, far] = [lab[side[i - 1]!]!, lab[side[i]!]!];
        assert.ok(distance(near, lab[3]!) < distance(far, lab[3]!), `step ${side[i]! + 1} is not further from the middle`);
      }
    }
  });
});

test('an axis counts from zero in round steps that reach the largest figure', () => {
  assert.deepEqual(niceTicks(0), [0]);
  assert.deepEqual(niceTicks(87), [0, 25, 50, 75, 100]);
  assert.deepEqual(niceTicks(4.2), [0, 2, 4, 6]);
  assert.deepEqual(niceTicks(1200), [0, 500, 1000, 1500]);
});

test('a bar rounds its top corners and keeps its foot square on the base line', () => {
  assert.equal(barPath(10, 20, 30, 50, 4), 'M10,70V24Q10,20 14,20H36Q40,20 40,24V70Z');
  assert.equal(barPath(0, 0, 6, 2, 4), 'M0,2V2Q0,0 2,0H4Q6,0 6,2V2Z');
});

test('a chart lays its grid, its bars and its labels out on the plot', () => {
  const data = [{ day: 'Mon', a: 40 }, { day: 'Tue', a: 87 }];
  const layout = chartLayout({ data, x: 'day', series: [{ key: 'a', label: 'A' }], kind: 'bar', width: 248, height: 200, radius: 4 });
  assert.deepEqual(layout.ticks.map((t) => t.value), [0, 25, 50, 75, 100]);
  assert.equal(layout.ticks[0]!.y, 176);
  assert.equal(layout.ticks[4]!.y, 8);
  assert.equal(layout.bars.length, 2);
  assert.equal(layout.bars[0]!.color, 'var(--chart-1)');
  assert.deepEqual(layout.labels.map((l) => [l.text, l.x]), [['Mon', 90], ['Tue', 190]]);
  assert.equal(chartIndexAt(layout, 60), 0);
  assert.equal(chartIndexAt(layout, 239), 1);
  assert.equal(chartIndexAt(layout, 10), null);
});

test('a sparkline spans its box from the lowest value to the highest', () => {
  const s = sparkline([1, 3, 2], 100, 20);
  assert.equal(s.points, '2,18 50,2 98,10');
  assert.deepEqual(s.last, [98, 10]);
});

test('the chart frame draws its grid across only, quiet ticks and a band under the pointer', () => {
  const rule = (sel: string) => css.match(new RegExp(`${sel.replace(/[.()]/g, '\$&')} \{([^}]*)\}`))?.[1] ?? '';
  assert.match(rule('.glim-chart'), /--chart-grid:/);
  assert.match(rule('.glim-chart-grid'), /stroke: var\(--chart-grid\)/);
  assert.match(rule('.glim-chart-tick'), /fill: var\(--chart-axis\)/);
  assert.match(rule('.glim-chart-tooltip'), /background-color: var\(--surface-overlay\)/);
});

test('the series share one band of lightness per theme, so none outshines the rest', () => {
  for (const [l, d] of SERIES.map(([light, dark]) => [oklabOf(light)[0], oklabOf(dark)[0]])) {
    assert.ok(l >= 0.49 && l <= 0.65, `light ${l.toFixed(3)}`);
    assert.ok(d >= 0.67 && d <= 0.81, `dark ${d.toFixed(3)}`);
  }
});
