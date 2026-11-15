import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versionLink } from '../src/infoTile.ts';
import { GLIMSTONE_RELEASE_URL, GLIMSTONE_REPO } from '../src/version.ts';

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
