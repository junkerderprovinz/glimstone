import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const rule = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `no rule ${selector}`);
  return css.slice(start + selector.length + 2, css.indexOf('}', start));
};

const TONES = { ok: 'ok', danger: 'fail', warn: 'warn' } as const;

test('ok, fail and warn are OKLCH hues on one band of lightness per theme', () => {
  const lightness = { light: [] as number[], dark: [] as number[] };
  for (const hue of Object.values(TONES)) {
    const m = css.match(new RegExp(`--status-${hue}-solid: light-dark\\(oklch\\(([\\d.]+) [\\d.]+ [\\d.]+\\), oklch\\(([\\d.]+) [\\d.]+ [\\d.]+\\)\\);`));
    assert.ok(m, hue);
    lightness.light.push(Number(m[1]));
    lightness.dark.push(Number(m[2]));
  }
  for (const [side, steps] of Object.entries(lightness)) assert.ok(Math.max(...steps) - Math.min(...steps) <= 0.08, `${side}: ${steps.join(' ')}`);
});

for (const [tone, hue] of Object.entries(TONES)) {
  test(`the ${tone} button is a soft wash of its hue under the hue's own text`, () => {
    const body = rule(`.glim-btn--${tone}`);
    assert.match(body, new RegExp(`background-color: var\\(--status-${hue}-wash\\);`));
    assert.match(body, new RegExp(`color: var\\(--status-${hue}-text\\);`));
    assert.match(rule(`.glim-btn--${tone}:hover`), new RegExp(`background-color: var\\(--status-${hue}-wash-hover\\);`));
  });
}
