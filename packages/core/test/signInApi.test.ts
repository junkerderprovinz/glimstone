import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSignInApi, signInRoot, SIGN_IN_ERRORS, SIGN_IN_REDIRECTS } from '../src/signInApi.ts';

interface Sent {
  method: string;
  url: string;
  type?: string;
  body?: unknown;
}

// A server that answers from `reply`, by method and path below the API's base.
function server(reply: (method: string, path: string, body: unknown) => [number, unknown?]) {
  const sent: Sent[] = [];
  const fetch = (async (input: string, init: RequestInit = {}) => {
    const body = init.body ? JSON.parse(init.body as string) : undefined;
    const headers = (init.headers ?? {}) as Record<string, string>;
    sent.push({ method: init.method ?? 'GET', url: input, type: headers['Content-Type'], body });
    const path = input.replace(/^.*\/api\/signin\/v1\//, '');
    const [status, json] = reply(init.method ?? 'GET', path, body);
    return new Response(json === undefined ? '' : JSON.stringify(json), { status });
  }) as typeof globalThis.fetch;
  return { fetch, sent };
}

test('an app under a sub-path reaches the contract below its root', async () => {
  const s = server(() => [200, { open: false, owner: true, minPassword: 12, signedIn: false, passkeys: false, services: [] }]);
  const api = createSignInApi({ root: '/files', fetch: s.fetch });
  await api.options();
  assert.equal(s.sent[0]!.url, '/files/api/signin/v1/options');
  assert.equal(api.serviceAddress('pocket id', '/files/settings'), '/files/signin/oidc/pocket%20id?return=%2Ffiles%2Fsettings');
});

test('a root comes out with a slash at both ends', () => {
  assert.equal(signInRoot(), '/');
  assert.equal(signInRoot('files/'), '/files/');
  assert.equal(signInRoot('//a/b//'), '/a/b/');
  assert.equal(signInRoot('///'), '/');
  assert.equal(signInRoot(`a${'/'.repeat(100_000)}b`), `/a${'/'.repeat(100_000)}b/`);
});

test('a change goes as JSON and a read sends no body', async () => {
  const s = server(() => [200, {}]);
  const api = createSignInApi({ fetch: s.fetch });
  await api.login('secret');
  await api.sessions();
  assert.deepEqual(s.sent[0], { method: 'POST', url: '/api/signin/v1/login', type: 'application/json', body: { password: 'secret' } });
  assert.deepEqual(s.sent[1], { method: 'GET', url: '/api/signin/v1/me/sessions', type: undefined, body: undefined });
});

test('a refusal comes back as the kit sent its code, with the numbers beside it', async () => {
  const s = server(() => [429, { error: 'throttled', retryAfter: 30 }]);
  const r = await createSignInApi({ fetch: s.fetch }).login('x');
  assert.deepEqual(r, { ok: false, status: 429, error: 'throttled', retryAfter: 30 });
});

test('no answer at all is offline', async () => {
  const fetch = (async () => {
    throw new TypeError('network');
  }) as typeof globalThis.fetch;
  const r = await createSignInApi({ fetch }).me();
  assert.deepEqual(r, { ok: false, status: 0, error: 'offline' });
});

test('a list comes back as its items', async () => {
  const s = server(() => [200, { tokens: [{ id: 't1', name: 'Backup', scopes: ['read'], created: '2026-11-01T10:00:00Z' }] }]);
  const r = await createSignInApi({ fetch: s.fetch }).tokens();
  assert.ok(r.ok);
  assert.equal(r.value[0]!.name, 'Backup');
});

test('an id in a path is escaped', async () => {
  const s = server(() => [200, {}]);
  await createSignInApi({ fetch: s.fetch }).removePasskey('a/b c');
  assert.equal(s.sent[0]!.url, '/api/signin/v1/me/passkeys/a%2Fb%20c');
});

test('every change that went through is reported, and no read is', async () => {
  const s = server((_, path) => (path.endsWith('/gone') ? [404, { error: 'notFound' }] : [200, {}]));
  const api = createSignInApi({ fetch: s.fetch });
  let changes = 0;
  const stop = api.subscribe(() => changes++);
  await api.me();
  await api.endOtherSessions();
  await api.endSession('gone');
  assert.equal(changes, 1);
  stop();
  await api.endOtherSessions();
  assert.equal(changes, 1);
});

test('without a window to ask in, a change that wants the password answers signInAgain', async () => {
  const s = server(() => [403, { error: 'signInAgain', askPassword: true }]);
  const r = await createSignInApi({ fetch: s.fetch }).makeToken({ name: 'x', scopes: ['read'] });
  assert.deepEqual(r, { ok: false, status: 403, error: 'signInAgain', askPassword: true });
  assert.equal(s.sent.length, 1);
});

test('a change that wants the password waits for it, and runs again once it is confirmed', async () => {
  let fresh = false;
  const s = server((method, path, body) => {
    if (path === 'me/confirm') {
      if ((body as { password: string }).password !== 'right') return [401, { error: 'wrongPassword' }];
      fresh = true;
      return [200, {}];
    }
    return fresh ? [200, { token: { id: 't' }, value: 'kt_secret' }] : [403, { error: 'signInAgain', askPassword: true }];
  });
  const api = createSignInApi({ fetch: s.fetch });
  api.reauth.subscribe(() => {});
  const made = api.makeToken({ name: 'Backup', scopes: ['read'] });
  await new Promise((done) => setTimeout(done, 0));
  assert.equal(api.reauth.state().asking, true);

  api.reauth.set('wrong');
  await api.reauth.submit();
  assert.deepEqual([api.reauth.state().asking, api.reauth.state().error, api.reauth.state().refused], [true, 'wrongPassword', 1]);

  api.reauth.set('right');
  await api.reauth.submit();
  const r = await made;
  assert.ok(r.ok);
  assert.equal(r.value.value, 'kt_secret');
  assert.deepEqual(api.reauth.state(), { asking: false, password: '', busy: false, error: null, refused: 1 });
  assert.deepEqual(
    s.sent.map((x) => x.url.replace('/api/signin/v1/', '')),
    ['me/tokens', 'me/confirm', 'me/confirm', 'me/tokens'],
  );
});

test('a question the person cancels leaves the change refused', async () => {
  const s = server(() => [403, { error: 'signInAgain', askPassword: true }]);
  const api = createSignInApi({ fetch: s.fetch });
  api.reauth.subscribe(() => {});
  const made = api.startTwoFactor();
  await new Promise((done) => setTimeout(done, 0));
  api.reauth.cancel();
  const r = await made;
  assert.equal(r.ok, false);
  assert.equal(s.sent.length, 1);
});

test('a change the kit wants fresh without the question goes back unasked', async () => {
  const s = server(() => [403, { error: 'signInAgain', askPassword: false }]);
  const api = createSignInApi({ fetch: s.fetch });
  api.reauth.subscribe(() => {});
  await api.startTwoFactor();
  assert.equal(api.reauth.state().asking, false);
});

test('every code is listed once', () => {
  assert.equal(new Set(SIGN_IN_ERRORS).size, SIGN_IN_ERRORS.length);
  assert.ok(SIGN_IN_ERRORS.includes('signInAgain'));
  assert.ok(SIGN_IN_REDIRECTS.includes('testOk'));
});
