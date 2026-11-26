import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The small motions and the quieter looks of the form controls, as the
// stylesheet draws them.
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The bodies of every rule whose selector is exactly `selector`, in order. */
function body(selector: string): string {
  const bodies: string[] = [];
  for (let at = css.indexOf(`${selector} {`); at >= 0; at = css.indexOf(`${selector} {`, at + 1)) {
    if (/(^|[{}])\s*$/.test(css.slice(Math.max(0, at - 200), at))) bodies.push(css.slice(at + selector.length + 2, css.indexOf('}', at)));
  }
  assert.ok(bodies.length > 0, `no rule ${selector}`);
  return bodies.join(';');
}

/** The last value `property` takes in `b`. */
const declared = (b: string, property: string) => [...b.matchAll(new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;]+);`, 'g'))].at(-1)?.[1]!.trim();

/** Whether the rule at `selector` stands inside the reduced-motion gate. */
function gated(selector: string): boolean {
  const at = css.indexOf(`${selector} {`);
  const gate = css.lastIndexOf('@media (prefers-reduced-motion: no-preference)', at);
  return gate >= 0 && !css.slice(gate, at).includes('\n}\n');
}

test('the error line opens and closes in the time the engine gives a wipe', () => {
  const open = ':root:not([data-motion="off"]) .glim-field-error';
  assert.match(declared(body(open), 'animation')!, /^glim-error-open var\(--motion-wipe-dur\)/);
  assert.match(declared(body(`${open}[data-closing]`), 'animation')!, /^glim-error-close var\(--motion-wipe-dur\)/);
  assert.ok(gated(open));
  assert.equal(declared(body('.glim-field-error[data-closing]'), 'display'), 'none');
});

test('a text area grows with its text from three lines to ten, without a grip', () => {
  const area = body('.glim-input--area');
  assert.equal(declared(area, 'field-sizing'), 'content');
  assert.equal(declared(area, 'resize'), 'none');
  assert.match(declared(area, 'min-height')!, /^calc\(3lh /);
  assert.match(declared(area, 'max-height')!, /^calc\(10lh /);
});

test('a field in a row fills what the name leaves, up to the widest width, past a shared name column', () => {
  const row = body('.glim-field-row');
  assert.equal(declared(row, '--field-row-name'), '9rem');
  assert.equal(declared(row, '--field-row-max'), '24rem');
  assert.match(css, /max-width: max\(min\(var\(--field-row-max\), 100% - var\(--field-row-name\)\), min\(var\(--field-row-min\), 100%\)\);/);
  assert.match(css, /\.glim-field-row\[data-stacked\][^{]*\{\s*max-width: none;/);
});

test('a row with a switch is one target and shows it under the pointer', () => {
  assert.equal(declared(body('.glim-field-row[data-press]:has([role="switch"])'), 'cursor'), 'pointer');
});

test('a typed secret stands in larger dots further apart, the placeholder in words', () => {
  const dots = body('.glim-secret > .glim-input[type="password"]:not(:placeholder-shown)');
  assert.equal(declared(dots, 'letter-spacing'), '0.14em');
  assert.match(declared(dots, 'font-size')!, /1\.15/);
});

test('the number field\'s arrows are one column of two halves with a hover of their own', () => {
  assert.equal(declared(body('.glim-num-wrap:has(> .glim-num-field) > .glim-num-steppers'), 'width'), '1.5rem');
  assert.equal(declared(body('.glim-num-wrap:has(> .glim-num-field) .glim-num-step:hover:not(:disabled)'), 'background-color'), 'var(--hover)');
  assert.match(declared(body('.glim-num-field[data-roll="up"]'), 'animation')!, /^glim-roll-up /);
});

test('a checkbox draws its tick, and a locked one is grey with a grey tick', () => {
  assert.match(declared(body('.glim-checkbox-tick'), 'transition')!, /^stroke-dashoffset var\(--motion-/);
  assert.equal(declared(body('.glim-checkbox:disabled > .glim-checkbox-box'), 'background-color'), 'var(--carbon-surface3)');
  assert.equal(declared(body('.glim-checkbox:disabled[aria-checked="true"] > .glim-checkbox-box'), 'color'), 'var(--carbon-text-muted)');
  assert.equal(declared(body('.glim-checkbox:disabled'), 'opacity'), undefined);
});

test('a slider shows its value in a bubble while it is dragged', () => {
  assert.equal(declared(body('.glim-slider-bubble'), 'opacity'), '0');
  assert.equal(declared(body('.glim-slider-thumb:is([data-dragging], :active) > .glim-slider-bubble'), 'opacity'), '1');
});

test('the angle dial has a hand from the middle and its value in the middle', () => {
  assert.equal(declared(body('.glim-angle-hand'), 'background-color'), 'var(--accent)');
  assert.equal(declared(body('.glim-angle-value'), 'place-items'), 'center');
  assert.ok(css.includes('.glim-angle-mark[data-quarter]::before {'));
});

test('a pointer over the stars fills them one after the other', () => {
  assert.equal(declared(body('.glim-rating-fill'), 'transition-delay'), 'calc(var(--i, 0) * var(--motion-stagger-step))');
});

test('a calendar strikes nothing through', () => {
  assert.doesNotMatch(css.slice(css.indexOf('.glim-date {'), css.indexOf('.glim-time {')), /line-through/);
});

test('a time picker tints the segment the keys change', () => {
  assert.equal(declared(body('.glim-time-seg:focus'), 'background-color'), 'var(--accent-soft)');
  assert.equal(declared(body('.glim-time'), 'direction'), 'ltr');
});

test('a PIN box that waits for a character draws a caret, and the boxes stand in groups', () => {
  assert.match(declared(body('.glim-pin-cell:focus:not([data-filled])'), 'background-image')!, /linear-gradient/);
  assert.equal(declared(body('.glim-pin-sep'), 'border-radius'), '50%');
});

test('a tag stands on a wash of the field, its cross a step quieter than its words', () => {
  assert.equal(declared(body('.glim-tag'), 'background-color'), 'var(--field-part)');
  assert.equal(declared(body('.glim-tag-remove'), 'color'), 'var(--carbon-text-sub)');
});

test('a file\'s row fills as it goes up', () => {
  assert.match(declared(body('.glim-upload-file[data-progress="sending"]'), 'background-image')!, /var\(--glim-upload-progress\)/);
  assert.ok(css.includes('@property --glim-upload-progress'));
});

test('a colour picker offers ready colours', () => {
  assert.equal(declared(body('.glim-picker-preset'), 'background-color'), 'var(--glim-preset)');
});
