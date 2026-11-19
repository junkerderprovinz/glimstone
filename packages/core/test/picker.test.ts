import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTileMark, pickKey, pickMarkClass, pickMatches, pickSections, pickTileStyle, type PickBox } from '../src/picker.ts';

const services = [
  { id: 'slack', label: 'Slack', group: 'services' },
  { id: 'smtp', label: 'Email', group: 'standards', terms: ['mail'] },
  { id: 'apprise', label: 'Apprise', group: 'services' },
  { id: 'shoutrrr', label: 'Shoutrrr', group: 'services', terms: ['Telegram', 'Pushover'] },
  { id: 'webhook', label: 'Webhook', group: 'standards' },
];
const groups = [
  { id: 'services', title: 'Services' },
  { id: 'standards', title: 'Email and webhooks' },
];
const view = (query: string) => pickSections(services, groups, query, 'en').map((s) => [s.title, s.items.map((i) => i.label)]);

test('the tiles stand in their groups in the order the groups are given, each alphabetical', () => {
  assert.deepEqual(view(''), [
    ['Services', ['Apprise', 'Shoutrrr', 'Slack']],
    ['Email and webhooks', ['Email', 'Webhook']],
  ]);
});

test('without groups every tile stands in one section with no title', () => {
  const one = pickSections(services, [], '', 'en');
  assert.equal(one.length, 1);
  assert.equal(one[0]!.title, undefined);
  assert.deepEqual(one[0]!.items.map((i) => i.label), ['Apprise', 'Email', 'Shoutrrr', 'Slack', 'Webhook']);
});

test('a tile outside every group stands after the groups, in a section with no title', () => {
  const sections = pickSections([...services, { id: 'other', label: 'Other' }], groups, '', 'en');
  assert.deepEqual(sections.at(-1), { id: '', title: undefined, items: [{ id: 'other', label: 'Other' }] });
});

test('the tile that takes anything stands last in its section, whatever its name', () => {
  const items = [
    { id: 'custom', label: 'Any address', last: true },
    { id: 'b', label: 'Bucket' },
    { id: 'z', label: 'Zone' },
  ];
  assert.deepEqual(pickSections(items, [], '', 'en')[0]!.items.map((i) => i.id), ['b', 'z', 'custom']);
});

test('the order follows the language, so an umlaut sorts beside its letter', () => {
  const items = [{ id: 'z', label: 'Zeit' }, { id: 'o', label: 'Ölbaum' }, { id: 'p', label: 'Pult' }];
  assert.deepEqual(pickSections(items, [], '', 'de')[0]!.items.map((i) => i.id), ['o', 'p', 'z']);
});

test("a group's badge and (i) travel with its section, for the eyebrow's line", () => {
  const rated = [
    { id: 'services', title: 'Services', badge: { label: 'Best fit', tone: 'ok' as const }, hint: 'Reached from the internet.' },
    { id: 'standards', title: 'Email and webhooks' },
  ];
  const [first, second] = pickSections(services, rated, '', 'en');
  assert.deepEqual(first!.badge, { label: 'Best fit', tone: 'ok' });
  assert.equal(first!.hint, 'Reached from the internet.');
  assert.equal(second!.badge, undefined);
  assert.equal(second!.hint, undefined);
});

test('a search narrows every section at once and drops the ones it empties', () => {
  assert.deepEqual(view('web'), [['Email and webhooks', ['Webhook']]]);
});

test('a search finds a tile by its id and by its own words as well as by its name', () => {
  assert.deepEqual(view('smtp'), [['Email and webhooks', ['Email']]]);
  assert.deepEqual(view('mail'), [['Email and webhooks', ['Email']]]);
  assert.deepEqual(view('pushover'), [['Services', ['Shoutrrr']]]);
});

test('a search finds a tile by the second line of its name, and not by its tooltip', () => {
  const items = [
    { id: 'smb', label: 'SMB', sub: 'Windows share', tip: 'Reaches a NAS' },
    { id: 'sftp', label: 'SFTP' },
  ];
  assert.deepEqual(pickSections(items, [], 'windows', 'en')[0]!.items.map((i) => i.id), ['smb']);
  assert.deepEqual(pickSections(items, [], 'nas', 'en'), []);
});

test('a search leaves no section when nothing matches', () => {
  assert.deepEqual(view('carrier pigeon'), []);
});

test('every word of a query has to turn up, in any of the names', () => {
  assert.equal(pickMatches('tele shout', ['Shoutrrr', 'Telegram']), true);
  assert.equal(pickMatches('tele slack', ['Shoutrrr', 'Telegram']), false);
});

test('a query matches without regard to case, accents, a sharp s or hyphens', () => {
  assert.equal(pickMatches('zeitplane', ['Zeitpläne']), true);
  assert.equal(pickMatches('STRASSE', ['Straße']), true);
  assert.equal(pickMatches('offsite', ['Off-site']), true);
  assert.equal(pickMatches('  ', ['anything']), true);
});

test('a tile mark is markup with the colours its tile lights up in', () => {
  assert.equal(isTileMark({ svg: '<svg/>', tile: '#5865f2', ink: '#ffffff' }), true);
  assert.equal(isTileMark({ svg: '<svg/>' }), true);
  assert.equal(isTileMark(undefined), false);
  assert.equal(isTileMark(null), false);
  assert.equal(isTileMark('<svg/>'), false);
  assert.equal(isTileMark(() => null), false);
  assert.equal(isTileMark({ type: 'span', props: {} }), false);
});

test("a brand's mark box takes the class its mark brings, and an app's glyph the house mark's", () => {
  assert.equal(pickMarkClass({ svg: '<svg/>', className: 'glim-tile-mark-registry' }), 'glim-tile-mark-registry');
  assert.equal(pickMarkClass({ svg: '<svg/>' }), undefined);
  assert.equal(pickMarkClass('a glyph'), 'glim-house-mark');
  assert.equal(pickMarkClass(undefined), 'glim-house-mark');
});

test("a wordmark's box takes the class that spreads it across the tile, beside the class its mark brings", () => {
  assert.equal(pickMarkClass({ svg: '<svg/>', wordmark: true }), 'glim-readme-btn-mark--wordmark');
  assert.equal(
    pickMarkClass({ svg: '<svg/>', wordmark: true, className: 'glim-demo-mark' }),
    'glim-demo-mark glim-readme-btn-mark--wordmark',
  );
  assert.equal(pickMarkClass({ svg: '<svg/>', wordmark: false, className: 'glim-demo-mark' }), 'glim-demo-mark');
});

test("a brand's tile hands its colour pair down, and any other tile lights up in the accent", () => {
  assert.deepEqual(pickTileStyle({ svg: '<svg/>', tile: '#5865f2', ink: '#ffffff' }), {
    '--provider-tile': '#5865f2',
    '--provider-ink': '#ffffff',
  });
  assert.equal(pickTileStyle({ svg: '<svg/>' }), undefined);
  assert.equal(pickTileStyle({ type: 'span' }), undefined);
  assert.equal(pickTileStyle(undefined), undefined);
});

// Three tiles to a row, 100 wide and 40 tall, then a second section whose two
// tiles start lower down after its heading.
const grid: PickBox[] = [
  { left: 0, top: 0, width: 100, height: 40 },
  { left: 110, top: 0, width: 100, height: 40 },
  { left: 220, top: 0, width: 100, height: 40 },
  { left: 0, top: 50, width: 100, height: 40 },
  { left: 110, top: 50, width: 100, height: 40 },
  { left: 0, top: 140, width: 100, height: 40 },
  { left: 110, top: 140, width: 100, height: 40 },
];

test('the arrows across move to the tile beside, and stop at either end', () => {
  assert.equal(pickKey('ArrowRight', 0, grid, false), 1);
  assert.equal(pickKey('ArrowRight', 2, grid, false), 3);
  assert.equal(pickKey('ArrowLeft', 1, grid, false), 0);
  assert.equal(pickKey('ArrowLeft', 0, grid, false), 0);
  assert.equal(pickKey('ArrowRight', 6, grid, false), 6);
});

test('in a right-to-left language the arrows across follow the reading direction', () => {
  assert.equal(pickKey('ArrowLeft', 0, grid, true), 1);
  assert.equal(pickKey('ArrowRight', 1, grid, true), 0);
});

test('the arrows up and down move to the nearest tile in the row above or below, across sections too', () => {
  assert.equal(pickKey('ArrowDown', 1, grid, false), 4);
  assert.equal(pickKey('ArrowDown', 2, grid, false), 4);
  assert.equal(pickKey('ArrowDown', 4, grid, false), 6);
  assert.equal(pickKey('ArrowUp', 6, grid, false), 4);
  assert.equal(pickKey('ArrowUp', 3, grid, false), 0);
});

test('down from the last row stays put, and up from the first row goes back to the search', () => {
  assert.equal(pickKey('ArrowDown', 5, grid, false), 5);
  assert.equal(pickKey('ArrowUp', 1, grid, false), 'search');
});

test('Home and End go to the first and the last tile', () => {
  assert.equal(pickKey('Home', 4, grid, false), 0);
  assert.equal(pickKey('End', 1, grid, false), 6);
});

test('any other key is left to the page', () => {
  assert.equal(pickKey('Enter', 1, grid, false), null);
  assert.equal(pickKey('a', 1, grid, false), null);
});
