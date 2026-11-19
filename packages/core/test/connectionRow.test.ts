import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectionButtons, connectionTestFace, connectionTile } from '../src/connectionRow.ts';

test('a brand stands on its own tile colour with its ink', () => {
  assert.deepEqual(connectionTile({ svg: '<svg/>', tile: '#192e45', ink: '#ffffff' }), {
    svg: '<svg/>',
    style: { '--tile': '#192e45', '--tile-ink': '#ffffff' },
  });
});

test('a brand whose layers do not survive one ink shows its lit drawing', () => {
  assert.equal(connectionTile({ svg: '<svg id="rest"/>', hover: '<svg id="lit"/>', tile: '#6d4aff', ink: '#ffffff' }).svg, '<svg id="lit"/>');
});

test('a mark without its colour pair and a glyph of the app stand on the accent', () => {
  assert.deepEqual(connectionTile({ svg: '<svg/>' }), { svg: '<svg/>', style: undefined });
  assert.deepEqual(connectionTile({ type: 'span' }), {});
  assert.deepEqual(connectionTile(undefined), {});
});

test('a test that has not run keeps the neutral button', () => {
  assert.deepEqual(connectionTestFace(undefined), { tone: 'neutral', outcome: undefined, shake: false });
  assert.deepEqual(connectionTestFace({}), { tone: 'neutral', outcome: undefined, shake: false });
});

test('a running test shows nothing of the last outcome', () => {
  assert.deepEqual(connectionTestFace({ busy: true, tone: 'danger', title: 'Not reached' }), { tone: 'neutral', outcome: undefined, shake: false });
});

test('a passed test turns the button green with a check', () => {
  assert.deepEqual(connectionTestFace({ tone: 'ok', title: 'Reached' }), { tone: 'ok', outcome: 'check', shake: false });
});

test('a failed test turns the button red with a cross and shakes it', () => {
  assert.deepEqual(connectionTestFace({ tone: 'danger', title: 'Not reached' }), { tone: 'danger', outcome: 'cross', shake: true });
});

const text = { test: 'Test', edit: 'Edit', remove: 'Remove' };
const run = () => {};
const mount = { id: 'mount', label: 'Mount', labelKey: 'mount', onClick: run };

test("the app's own actions stand first, then Test, Edit and Remove", () => {
  const ids = connectionButtons({ actions: [mount, { ...mount, id: 'eject' }], text, onTest: run, onEdit: run, onRemove: run }).map((b) => b.id);
  assert.deepEqual(ids, ['mount', 'eject', 'test', 'edit', 'remove']);
});

test('a built-in button stands only where its handler is passed', () => {
  assert.deepEqual(connectionButtons({ text, onEdit: run }).map((b) => b.id), ['edit']);
  assert.deepEqual(connectionButtons({ text }), []);
});

test('the built-in buttons take their words from the text and their glyphs from the label keys', () => {
  const [testButton, edit] = connectionButtons({ text, labelKeys: { test: 'probe' }, onTest: run, onEdit: run });
  assert.deepEqual([testButton?.label, testButton?.labelKey, edit?.label, edit?.labelKey], ['Test', 'probe', 'Edit', 'edit']);
});

test('only the test button carries where the test stands', () => {
  const [testButton, edit] = connectionButtons({ text, test: { busy: true, title: 'Running' }, onTest: run, onEdit: run });
  assert.deepEqual([testButton?.busy, testButton?.title], [true, 'Running']);
  assert.deepEqual([edit?.busy, edit?.title], [undefined, undefined]);
});

test('each button runs its own handler', () => {
  const pressed: string[] = [];
  const buttons = connectionButtons({
    actions: [{ ...mount, onClick: () => pressed.push('mount') }],
    text,
    onTest: () => pressed.push('test'),
    onRemove: () => pressed.push('remove'),
  });
  for (const b of buttons) b.onClick();
  assert.deepEqual(pressed, ['mount', 'test', 'remove']);
});
