import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const select = readFileSync(new URL('../src/select.ts', import.meta.url), 'utf8');

const STEPS = ['--z-raised', '--z-raised-top', '--z-docked', '--z-chrome', '--z-window', '--z-menu', '--z-toast', '--z-bubble'];

function value(name: string): string {
  const m = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  assert.ok(m, `${name} is not declared`);
  return m[1]!.trim();
}

test('every stacking order in the stylesheet is one of the steps', () => {
  const orders = [...css.matchAll(/z-index:\s*([^;]+);/g)].map((m) => m[1]!.trim());
  assert.ok(orders.length > 10);
  for (const order of orders) assert.match(order, /^var\(--(z-[a-z-]+|drag-lift-z)\)$/, order);
  assert.equal(value('--drag-lift-z'), 'var(--z-raised)');
});

test('the stacking steps climb in the order they are named', () => {
  const numbers = STEPS.map((s) => Number(value(s)));
  for (let i = 1; i < numbers.length; i++) assert.ok(numbers[i]! > numbers[i - 1]!, `${STEPS[i]} is not above ${STEPS[i - 1]}`);
});

test('a select list stacks with the windows it may open from', () => {
  assert.match(select, /zIndex = 'var\(--z-window\)'/);
});

test('every surface shadow is an elevation step', () => {
  const surfaces = [...css.matchAll(/box-shadow:\s*([^;]+);/g)].map((m) => m[1]!.trim()).filter((v) => /\d+px \d+px/.test(v) && !v.startsWith('inset'));
  for (const shadow of surfaces) assert.fail(`a shadow of its own: ${shadow}`);
});

test('the higher steps build on the theme\'s raised shadow', () => {
  assert.match(value('--elevation-float'), /var\(--elevation-raised\)$/);
  assert.match(value('--elevation-modal'), /var\(--elevation-raised\)$/);
  assert.equal(value('--elevation'), 'var(--elevation-raised)');
});
