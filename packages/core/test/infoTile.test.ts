import { test } from 'node:test';
import assert from 'node:assert/strict';
import { offersDiscord, offersMail, versionLink } from '../src/infoTile.ts';
import { GLIMSTONE_RELEASE_URL, GLIMSTONE_REPO } from '../src/version.ts';
import { readmeUnitClass } from '../src/readmeButton.ts';

const repoUrl = 'https://github.com/example/app';

test('a released version opens its own release page', () => {
  assert.equal(versionLink({ name: 'App', version: '3.8.0', repoUrl }).href, `${repoUrl}/releases/tag/v3.8.0`);
});

test('a row that follows the latest release opens it whatever version it shows', () => {
  const link = versionLink({ name: 'GlimStone', version: '4.4.1', repoUrl, latest: true });
  assert.equal(link.href, `${repoUrl}/releases/latest`);
  assert.equal(link.shown, '4.4.1');
});

test('a build that is no release opens nothing, even when it follows the latest release', () => {
  assert.equal(versionLink({ name: 'GlimStone', version: '4.6.0-rc.1', repoUrl, latest: true }).href, undefined);
});

test('the GlimStone link opens its newest release', () => {
  assert.equal(GLIMSTONE_RELEASE_URL, `${GLIMSTONE_REPO}/releases/latest`);
  assert.equal(GLIMSTONE_REPO, 'https://github.com/junkerderprovinz/glimstone');
});

const invite = 'https://discord.gg/example';

test('the Help card offers Discord where its sentence names it and there is an invite', () => {
  assert.equal(offersDiscord('Questions? Come say hi on Discord.', invite), true);
});

test('the Help card offers no Discord without an invite', () => {
  assert.equal(offersDiscord('Questions? Come say hi on Discord.', undefined), false);
  assert.equal(offersDiscord('Questions? Come say hi on Discord.', ''), false);
});

test('the Help card offers no Discord where its sentence does not name it', () => {
  assert.equal(offersDiscord('Open an issue on GitHub, or send an email.', invite), false);
});

test('mail stays on offer beside Discord when the sentence names both', () => {
  const report = 'Open an issue on GitHub, send an email or find us on Discord.';
  assert.equal(offersMail(report, 'post@example.com'), true);
  assert.equal(offersDiscord(report, invite), true);
});

test('a sentence that swaps mail for Discord offers no mail', () => {
  assert.equal(offersMail('Open an issue on GitHub, or ask on Discord.', 'post@example.com'), false);
});

test('a Discord unit lights up in the Discord tile', () => {
  assert.match(readmeUnitClass('discord', 1, false, false), /\bglim-tile-discord\b/);
});
