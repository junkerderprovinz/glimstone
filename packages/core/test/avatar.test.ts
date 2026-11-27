import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avatarTone, avatarView, initials } from '../src/avatar.ts';

test('initials take the first letter of the first and the last name', () => {
  assert.equal(initials('Ada Lovelace'), 'AL');
  assert.equal(initials('Grace Brewster Murray Hopper'), 'GH');
});

test('a single name gives a single letter', () => {
  assert.equal(initials('Linus'), 'L');
});

test('initials are capitals in the language of the name', () => {
  assert.equal(initials('ingrid ıssız'), 'II');
  assert.equal(initials('élodie durand'), 'ÉD');
});

test('a letter made of several code points stays whole', () => {
  assert.equal(initials('Ñ̃ora Smith'), 'Ñ̃S');
});

test('a name with no letters, such as an empty one, gives none', () => {
  assert.equal(initials('   '), '');
});

test('an avatar without a palette position stays neutral', () => {
  assert.deepEqual(avatarView({ size: 'md' }), { className: 'glim-avatar glim-avatar--md', style: undefined });
});

test('an avatar with a palette position takes that chart tone, never the accent', () => {
  const view = avatarView({ size: 'lg', hueIndex: 2 });
  assert.equal(view.className, 'glim-avatar glim-avatar--lg glim-avatar--toned');
  assert.equal(view.style?.['--avatar-tone'], 'var(--chart-3)');
});

test('a named avatar takes a soft tone from its name, the same on every visit', () => {
  const a = avatarView({ size: 'md', name: 'Grace Hopper' });
  assert.equal(a.className, 'glim-avatar glim-avatar--md glim-avatar--toned');
  assert.deepEqual(avatarView({ size: 'md', name: '  grace hopper ' }).style, a.style);
  const tones = new Set(['Ada Lovelace', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton', 'Alan Turing', 'Barbara Liskov'].map(avatarTone));
  assert.ok(tones.size >= 3);
  for (const t of tones) assert.ok(t >= 1 && t <= 8);
});
