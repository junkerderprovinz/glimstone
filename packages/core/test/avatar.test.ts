import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avatarView, initials } from '../src/avatar.ts';

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

test('an avatar with a palette position takes its hue', () => {
  const view = avatarView({ size: 'lg', hueIndex: 2 });
  assert.equal(view.className, 'glim-avatar glim-avatar--lg glim-avatar--hued glim-hue');
  assert.equal(view.style?.['--item-hue'], 'var(--rb-2)');
});
