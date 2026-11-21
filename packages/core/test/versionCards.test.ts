import { test } from 'node:test';
import assert from 'node:assert/strict';
import { componentText } from '../src/componentTexts.ts';
import {
  VERSION_CARD_TEXT as T,
  autoSwitch,
  designRow,
  COMPONENTS_CARD_TEXT,
  canCheck,
  componentRows,
  numberLink,
  timeAgo,
  updateAction,
  updateLine,
  whatsNewLabel,
  withApp,
  type ComponentRow,
} from '../src/versionCards.ts';

const now = new Date('2026-11-21T12:00:00Z');

test('a current app says so, and when it last looked', () => {
  const at = new Date(now.getTime() - 3 * 60_000);
  assert.deepEqual(updateLine({ kind: 'current', checkedAt: at }, T, now), { line: 'Up to date', tone: 'ok', note: 'Last checked 3 minutes ago' });
  assert.deepEqual(updateLine({ kind: 'current' }, T, now), { line: 'Up to date', tone: 'ok', note: undefined });
});

test('each state has its own line and tone', () => {
  assert.equal(updateLine({ kind: 'checking' }, T).tone, 'neutral');
  assert.equal(updateLine({ kind: 'available', version: '2.10.0' }, T).line, 'Update to 2.10.0 available');
  assert.equal(updateLine({ kind: 'available', version: '2.10.0' }, T).tone, 'warn');
  assert.equal(updateLine({ kind: 'downloading', percent: 42 }, T).line, 'Downloading … 42%');
  assert.equal(updateLine({ kind: 'ready', version: '1.4.0' }, T).line, '1.4.0 is ready');
  assert.deepEqual(updateLine({ kind: 'failed', reason: 'GitHub cannot be reached.' }, T), { line: 'Check failed', tone: 'fail', note: 'GitHub cannot be reached.' });
  assert.equal(updateLine({ kind: 'store', store: 'F-Droid' }, T).line, 'Updates come through F-Droid.');
});

test('a line that names the new version comes split around it, so the number can be the link', () => {
  assert.deepEqual(updateLine({ kind: 'available', version: '2.10.0' }, T).version, { number: '2.10.0', before: 'Update to ', after: ' available' });
  assert.deepEqual(updateLine({ kind: 'ready', version: '1.4.0' }, componentText('ja').versionCard).version, { number: '1.4.0', before: '', after: ' の準備ができました' });
  assert.equal(updateLine({ kind: 'checking' }, T).version, undefined);
});

test('every language names the new version once, so the line can carry its link', async () => {
  const { COMPONENT_LANGUAGES } = await import('../src/componentTexts.ts');
  for (const lang of COMPONENT_LANGUAGES) {
    const words = componentText(lang).versionCard;
    for (const line of [words.available('9.8.7'), words.ready('9.8.7')]) assert.equal(line.split('9.8.7').length, 2, `${lang}: ${line}`);
  }
});

test('the one action follows the route and appears only once there is a new version', () => {
  const found = { kind: 'available', version: '2.0.0' } as const;
  assert.equal(updateAction('install', found, T)?.label, 'Update now');
  assert.equal(updateAction('guide', found, T)?.kind, 'guide');
  assert.equal(updateAction('plugins', found, T)?.label, 'Update in the Plugins tab');
  assert.equal(updateAction('store', found, T), null);
  assert.equal(updateAction('install', { kind: 'current' }, T), null);
  assert.equal(updateAction('install', { kind: 'failed' }, T), null);
});

test('a downloaded version asks for a restart, but only where the app installs it', () => {
  assert.deepEqual(updateAction('install', { kind: 'ready', version: '1.4.0' }, T), { kind: 'restart', label: 'Restart for 1.4.0', labelKey: 'version.restart' });
  assert.equal(updateAction('guide', { kind: 'ready', version: '1.4.0' }, T), null);
});

test('a store app never checks, and no check starts while one runs', () => {
  assert.equal(canCheck('store', { kind: 'store', store: 'F-Droid' }), false);
  assert.equal(canCheck('guide', { kind: 'checking' }), false);
  assert.equal(canCheck('install', { kind: 'downloading', percent: 10 }), false);
  assert.equal(canCheck('plugins', { kind: 'current' }), true);
});

test('the switch installs on a desktop, only looks in a container, and is absent elsewhere', () => {
  assert.equal(autoSwitch('install', T)?.label, 'Update automatically');
  assert.equal(autoSwitch('guide', T)?.label, 'Check for updates automatically');
  assert.equal(autoSwitch('plugins', T), null);
  assert.equal(autoSwitch('store', T), null);
});

test("what's new counts what is unseen and drops the count once nothing is", () => {
  assert.equal(whatsNewLabel(T, 5), "What's new · 5");
  assert.equal(whatsNewLabel(T, 0), "What's new");
  assert.equal(whatsNewLabel(componentText('fa').versionCard, 3), 'تازه‌ها · ۳');
});

test('a sentence takes the app name from the card, never from the table', () => {
  assert.equal(withApp(T.hint, 'Example'), 'The version of Example, where its updates stand and what this version brought.');
});

test('the words come in the language with its own digits and relative time', () => {
  const de = componentText('de').versionCard;
  assert.equal(de.available('2.10.0'), 'Update auf 2.10.0 verfügbar');
  assert.equal(de.checked(new Date(now.getTime() - 2 * 3_600_000), now), 'Zuletzt geprüft vor 2 Stunden');
  assert.equal(de.downloading(42), 'Wird geladen … 42 %');
  assert.equal(componentText('de').componentsCard.title, 'Komponenten');
});

test('a time before now picks the largest unit that fits', () => {
  assert.equal(timeAgo(new Date(now.getTime() - 20_000), 'en', now), 'now');
  assert.equal(timeAgo(new Date(now.getTime() - 125 * 60_000), 'en', now), '2 hours ago');
  assert.equal(timeAgo(new Date(now.getTime() - 26 * 3_600_000), 'en', now), 'yesterday');
});

test('components stand as parts, programs by name, then the design language, then the installer', () => {
  const rows: ComponentRow[] = [
    { name: 'Installer', version: '1.2.5', kind: 'installer' },
    { name: 'GlimStone', version: '4.8.1', kind: 'design' },
    { name: 'rclone', version: '1.75.2' },
    { name: 'Engine', version: '3.9.2', kind: 'part' },
    { name: '7-Zip', version: '26.01' },
    { name: 'MuPDF', version: '1.27.2', kind: 'tool' },
    { name: 'Server', version: '3.9.2', kind: 'part' },
    { name: 'ffmpeg', version: '9.0.2' },
  ];
  assert.deepEqual(componentRows(rows).map((r) => r.name), ['Engine', 'Server', '7-Zip', 'ffmpeg', 'MuPDF', 'rclone', 'GlimStone', 'Installer']);
});

test('every number opens the newest release of its project, and an unreleased build links nowhere', () => {
  assert.deepEqual(numberLink({ name: 'App', version: 'v2.9.4', repoUrl: 'https://example.org/app' }), {
    shown: '2.9.4',
    released: true,
    href: 'https://example.org/app/releases/latest',
  });
  assert.equal(numberLink({ name: 'App', version: '2.9.4+branch.1a2b3c', repoUrl: 'https://example.org/app' }).href, 'https://example.org/app/releases/latest');
  assert.equal(numberLink({ name: 'App', version: 'dev', repoUrl: 'https://example.org/app' }).href, undefined);
  assert.equal(numberLink({ name: 'Tool', version: '1.0.0' }).href, undefined);
});

test('a release numbered without a patch part still links its project', () => {
  assert.deepEqual(numberLink({ name: 'Archiver', version: '26.01', repoUrl: 'https://example.org/archiver' }), {
    shown: '26.01',
    released: true,
    href: 'https://example.org/archiver/releases/latest',
  });
});

test('a project that publishes its releases elsewhere links that page', () => {
  assert.deepEqual(numberLink({ name: 'Tool', version: '9.0.2', releasePage: 'https://example.org/download' }), { shown: '9.0.2', released: true, href: 'https://example.org/download' });
});

test("a program's own numbering without a repository is shown as it comes, not as an unreleased build", () => {
  assert.deepEqual(numberLink({ name: 'Archiver', version: '26.01' }), { shown: '26.01', released: true });
  assert.deepEqual(numberLink({ name: 'Backend', version: '48637' }), { shown: '48637', released: true });
  assert.equal(numberLink({ name: 'App', version: 'dev', repoUrl: 'https://example.org/app' }).released, false);
});

test('the design language row carries the version of the package it comes from', async () => {
  const { GLIMSTONE_VERSION } = await import('../src/version.ts');
  assert.deepEqual(numberLink(designRow(COMPONENTS_CARD_TEXT)), { shown: GLIMSTONE_VERSION, released: true, href: 'https://github.com/junkerderprovinz/glimstone/releases/latest' });
  assert.equal(designRow(COMPONENTS_CARD_TEXT).kind, 'design');
});
