import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MARKS } from '../src/marks.ts';
import { addToast, pauseToast, resumeToast, toastAnnouncement, toastPoliteness, TOAST_DURATION_MS } from '../src/toastEngine.ts';
import { toastPlaces } from '../src/toastStack.ts';

const undo = { label: 'Undo', onClick: () => {} };

test('a toast without an action leaves after the fixed duration', () => {
  const [t] = addToast([], { id: 'a', message: 'Saved', severity: 'success' }, 1000);
  assert.equal(t!.expiresAt, 1000 + TOAST_DURATION_MS);
});

test('a toast with an action stays until it is dismissed', () => {
  const list = addToast([], { id: 'a', message: 'Moved to the trash', severity: 'success', action: undo }, 1000);
  assert.equal(list[0]!.expiresAt, null);
  const touched = resumeToast(pauseToast(list, 'a', 2000), 'a', 3000);
  assert.equal(touched[0]!.expiresAt, null);
});

test('the cap drops running toasts before one that waits for its action', () => {
  let list = addToast([], { id: 'keep', message: 'Moved', severity: 'success', action: undo }, 0, TOAST_DURATION_MS, 2);
  list = addToast(list, { id: 'old', message: 'Saved', severity: 'success' }, 1, TOAST_DURATION_MS, 2);
  list = addToast(list, { id: 'new', message: 'Saved', severity: 'success' }, 2, TOAST_DURATION_MS, 2);
  assert.deepEqual(list.map((t) => t.id), ['keep', 'new']);
});

test('only a failure interrupts, every other toast is read out politely', () => {
  assert.equal(toastPoliteness('fail'), 'assertive');
  assert.equal(toastPoliteness('warn'), 'polite');
  assert.equal(toastPoliteness('success'), 'polite');
});

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const space = Object.fromEntries([...css.matchAll(/--(space-\d+):\s*([\d.]+)rem;/g)].map((m) => [m[1]!, Number(m[2]) * 16]));

function declared(selector: string, property: string): string {
  const body = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, s]) => s!.trim() === selector)?.[2] ?? '';
  return body.match(new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;]+);`))?.[1]!.trim() ?? '';
}

/** A length of the stylesheet in pixels: rem, px and the spacing steps, under calc() too. */
function px(value: string): number {
  const plain = value
    .replace(/var\(--(space-\d+)\)/g, (_, step: string) => String(space[step]))
    .replace(/([\d.]+)rem/g, (_, n: string) => String(Number(n) * 16))
    .replace(/([\d.]+)px/g, '$1')
    .replace(/^calc/, '');
  return Function(`return (${plain})`)() as number;
}

test('the dismiss cross sits centred on the first line of the message', () => {
  assert.match(declared('.glim-toast-dismiss', 'display'), /flex/);
  assert.equal(declared('.glim-toast-dismiss', 'align-items'), 'center');
  const box = MARKS.dismiss.size + 2 * px(declared('.glim-toast-dismiss', 'padding'));
  const top = px(declared('.glim-toast-dismiss', 'margin-block'));
  assert.equal(top + box / 2, px(declared('.glim-toast-message', 'line-height')) / 2);
});

test('a toast with a title keeps it, and is read out title first', () => {
  const [t] = addToast([], { id: 'a', title: 'Settings saved', message: 'The new schedule runs tonight.', severity: 'success' }, 0);
  assert.equal(t!.title, 'Settings saved');
  assert.equal(toastAnnouncement(t!), 'Settings saved. The new schedule runs tonight.');
  assert.equal(toastAnnouncement({ message: 'Saved' }), 'Saved');
});

test('the newest toast stands in front, two show their edge and the rest lie out of sight', () => {
  const places = toastPlaces([60, 44, 80, 44], 10);
  assert.deepEqual(places.map((p) => [p.depth, p.behind, p.buried]), [[0, false, false], [1, true, false], [2, true, false], [3, true, true]]);
  assert.deepEqual(places.map((p) => p.lift), [0, 70, 124, 214]);
});

test('a stack lays its cards over each other and fans them out under the pointer', () => {
  assert.equal(declared('.glim-toast-stack', 'display'), 'grid');
  assert.equal(declared('.glim-toast-stack > .glim-toast-card', 'grid-area'), '1 / 1');
  assert.equal(declared('.glim-toast-card', 'box-shadow'), 'var(--elevation-float)');
  assert.equal(declared('.glim-toast-card[data-behind]', 'height'), 'var(--toast-front-h)');
  assert.equal(declared('.glim-toast-card[data-buried]', 'opacity'), '0');
  assert.equal(declared('.glim-toast-stack:is(:hover, :focus-within) > .glim-toast-card[data-behind]', 'translate'), '0 calc(-1 * var(--toast-y))');
});
