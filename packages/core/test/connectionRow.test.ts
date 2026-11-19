import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectionTestFace, connectionTile } from '../src/connectionRow.ts';

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
