import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { KEYS, render } from '../../../scripts/gen-fortress-card.mjs';
import { FORTRESS_LANGUAGES, fortressText } from '../src/fortressTexts.ts';

const file = join(import.meta.dirname, '..', 'vanilla', 'fortress-card.js');
const src = readFileSync(file, 'utf8');
await import('../vanilla/fortress-card.js');
const card = (globalThis as unknown as { GlimFortressCard: Record<string, (...a: never[]) => unknown> }).GlimFortressCard;

test('the card carries the texts and glyphs of the current tables', () => {
  assert.equal(render(src), src, 'run node scripts/gen-fortress-card.mjs');
});

test('the card speaks every language of the glossary, in the words of its table', () => {
  for (const lang of FORTRESS_LANGUAGES) {
    const t = card.text(lang as never) as Record<string, unknown>;
    for (const k of KEYS) assert.deepEqual(t[k], fortressText(lang)[k as keyof ReturnType<typeof fortressText>], `${lang}.${k}`);
  }
  assert.equal((card.text('pt-BR' as never) as Record<string, string>).leaveConfirm, fortressText('pt').leaveConfirm);
});

test('a pasted phrase spreads over the fields from the one it went into', () => {
  const empty = Array<string>(12).fill('');
  const r = card.enterWords(empty as never, 2 as never, '1. alpha 2. bravo charlie' as never) as { words: string[]; focus: number };
  assert.deepEqual(r.words.slice(0, 6), ['', '', 'alpha', 'bravo', 'charlie', '']);
  assert.equal(r.focus, 5);
});

test('the apps that keep the phrase are those in reach first, each once, and never a plugin', () => {
  const t = card.text('en' as never);
  const members = [
    { id: '1', name: 'Bravo', device: 'Atlas', form: 'container', online: false },
    { id: '2', name: 'Delta', device: 'Atlas', form: 'plugin', online: true },
    { id: '3', name: 'Echo', device: 'Pocket', form: 'android', online: true },
    { id: '4', name: 'Bravo', device: 'Atlas', form: 'container', online: true },
  ];
  assert.deepEqual(card.keepers(t as never, members as never), ['Echo on Pocket', 'Bravo on Atlas']);
});

test('the instances of one app share a card', () => {
  const apps = card.groupApps([
    { id: '1', app: 'bravo', name: 'Bravo', device: 'Atlas' },
    { id: '2', app: 'delta', name: 'Delta', device: 'Atlas', icon: 'data:,d' },
    { id: '3', app: 'bravo', name: 'Bravo', device: 'Pocket', icon: 'data:,b' },
  ] as never) as { id: string; icon: string; members: unknown[] }[];
  assert.deepEqual(apps.map((a) => [a.id, a.members.length, a.icon]), [['bravo', 2, 'data:,b'], ['delta', 1, 'data:,d']]);
});
