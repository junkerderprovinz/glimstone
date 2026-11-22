import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSignInFlow, passkeyOfferKey, resetBlocked, signInCardHandlers, signInTextEn, type SignInAnswer, type SignInHandlers } from '../src/signIn.ts';
import type { SignInApi, SignInFailure } from '../src/signInApi.ts';
import { signInTileTextEn } from '../src/signInTile.ts';

const flow = (handlers: Partial<SignInHandlers>) =>
  createSignInFlow(() => ({ text: signInTextEn, minPassword: 12, onSignIn: async () => ({}), ...handlers }));

test('a passkey the browser offered and the person picked signs in without a press', async () => {
  let answered = false;
  const f = flow({
    onPasskeyOffer: async () => {
      answered = true;
      return { ok: true };
    },
  });
  await f.offer(new AbortController().signal);
  assert.ok(answered);
  assert.equal(f.state().error, null);
});

test('a refused passkey from the offer says why above Sign in and starts a new offer', async () => {
  const f = flow({ onPasskeyOffer: async () => ({ error: 'This passkey can’t sign you in here.' }) });
  const before = passkeyOfferKey(f.state());
  await f.offer(new AbortController().signal);
  assert.equal(f.state().error, 'This passkey can’t sign you in here.');
  assert.deepEqual(f.state().refusal, { button: 'submit', field: 'password', count: 1 });
  assert.notEqual(passkeyOfferKey(f.state()), before);
});

test('an offer that ended says nothing', async () => {
  const stop = new AbortController();
  const f = flow({
    onPasskeyOffer: async () => {
      stop.abort();
      return { error: 'gone' };
    },
  });
  await f.offer(stop.signal);
  assert.equal(f.state().error, null);
});

test('no offer runs in the code step or while a sign-in is busy', async () => {
  let release: (a: SignInAnswer) => void = () => {};
  const f = flow({ onSignIn: () => new Promise((done) => (release = done)) });
  f.set('password', 'secret');
  const signing = f.submit();
  assert.equal(passkeyOfferKey(f.state()), null);
  release({ needCode: true });
  await signing;
  assert.equal(passkeyOfferKey(f.state()), null);
});

test('a code step that ran out starts over with the password', async () => {
  const f = flow({ onSignIn: async ({ code }) => (code === undefined ? { needCode: true } : { error: 'That took too long.', restart: true }) });
  f.set('password', 'secret');
  await f.submit();
  f.set('code', '123456');
  await f.submit();
  assert.equal(f.state().needCode, false);
  assert.deepEqual(f.state().refusal, { button: 'submit', field: 'password', count: 1 });
});

test('an error from outside the card stands only until the card sends a try of its own', async () => {
  const f = flow({});
  assert.equal(f.state().tried, false);
  f.set('password', 'x');
  await f.submit();
  assert.equal(f.state().tried, true);
});

// The kit as the handlers meet it, with each route's answer given by the test.
function api(over: Partial<Record<'login' | 'loginCode' | 'offerPasskey' | 'resetCode' | 'reset', unknown>>) {
  return over as unknown as SignInApi;
}
const no = (error: SignInFailure['error'], status = 401): SignInFailure => ({ ok: false, status, error });

test('the handlers turn the kit’s codes into the app’s words', async () => {
  const signedIn: unknown[] = [];
  const h = signInCardHandlers(api({ login: async () => no('wrongPassword') }), { words: signInTileTextEn, onSignedIn: (v) => signedIn.push(v) });
  assert.deepEqual(await h.onSignIn({ password: 'x', passkey: false }), { error: 'That password is wrong.' });
  assert.deepEqual(signedIn, []);
});

test('a password that needs a code asks for it, and a wrong code keeps the step', async () => {
  const h = signInCardHandlers(
    api({ login: async () => ({ ok: true, value: { step: 'code' } }), loginCode: async () => no('wrongCode') }),
    { words: signInTileTextEn, onSignedIn: () => {} },
  );
  assert.deepEqual(await h.onSignIn({ password: 'x', passkey: false }), { needCode: true });
  assert.deepEqual(await h.onSignIn({ password: 'x', code: '000000', passkey: false }), { needCode: true, error: signInTileTextEn.errors.wrongCode });
});

test('a wrong code from the log is a rejection the card answers itself', async () => {
  const h = signInCardHandlers(api({ reset: async () => no('resetRefused') }), { words: signInTileTextEn, onSignedIn: () => {} });
  assert.deepEqual(await h.onSetPassword({ code: 'XXXX', password: 'a long password' }), { rejected: true });
});

test('the reset form asks for the name itself where the app has several accounts', async () => {
  let sent: unknown;
  const f = createSignInFlow(() => ({
    text: signInTextEn,
    minPassword: 12,
    resetName: true,
    onSignIn: async () => ({}),
    onAskCode: async () => ({ ok: true }),
    onSetPassword: async (input) => {
      sent = input;
      return { ok: true };
    },
  }));
  f.set('password', 'typed in the sign-in form');
  await f.forgot();
  f.set('resetCode', 'ABCD-EFGH-JKLM');
  f.set('newPassword', 'a long new password');
  f.set('confirm', 'a long new password');
  assert.equal(resetBlocked(f.state(), true), true);
  await f.submit();
  assert.equal(sent, undefined);
  f.set('resetName', ' sam ');
  await f.submit();
  assert.deepEqual(sent, { code: 'ABCD-EFGH-JKLM', password: 'a long new password', name: 'sam' });
});

test('the handlers reset the account the reset form names', async () => {
  let asked: unknown[] = [];
  const h = signInCardHandlers(
    api({ reset: async (...args: unknown[]) => ((asked = args), { ok: true, value: { removed: { tokens: 0, passkeys: 0, twoFactor: false, services: 0 } } }) }),
    { words: signInTileTextEn, onSignedIn: () => {}, name: () => 'from the sign-in form' },
  );
  await h.onSetPassword({ code: 'X', password: 'a long password', name: 'sam' });
  assert.deepEqual(asked, ['X', 'a long password', 'sam']);
});

test('no passkey picked leaves the card as it was', async () => {
  const h = signInCardHandlers(api({ offerPasskey: async () => null }), { words: signInTileTextEn, onSignedIn: () => {} });
  assert.deepEqual(await h.onPasskeyOffer(new AbortController().signal), {});
});

test('the reset form sends a short new password on', async () => {
  let sent = '';
  const f = flow({
    onAskCode: async () => ({ ok: true }),
    onSetPassword: async ({ password }) => {
      sent = password;
      return { ok: true };
    },
  });
  await f.forgot();
  f.set('resetCode', 'ABCD');
  f.set('newPassword', 'short');
  f.set('confirm', 'short');
  await f.submit();
  assert.equal(sent, 'short');
  assert.equal(f.state().error, null);
});
