import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SignInApi, SignInFailure, SignInMe, SignInResult, SignInService } from '../src/signInApi.ts';
import {
  createSignInTileFlow,
  passkeyFacts,
  passwordGoes,
  removalQuestion,
  signInServicePicker,
  signInCodeShape,
  signInDevice,
  signInErrorText,
  signInServiceBadge,
  signInServiceMissing,
  signInServiceStatus,
  signInClientPaste,
  signInServiceLabel,
  signInServiceQuiet,
  signInRoleItems,
  passkeysAllowedAt,
  signInCardNotice,
  signInPasswordElsewhere,
  signInTileCards,
  signInTileTextEn as text,
  SIGN_IN_TILE_CARDS,
  type SignInTileOptions,
} from '../src/signInTile.ts';

const ok = <T>(value: T): SignInResult<T> => ({ ok: true, value });
const no = (error: SignInFailure['error'], status = 400, more: Partial<SignInFailure> = {}): SignInFailure => ({ ok: false, status, error, ...more });

const ME: SignInMe = { account: 'a1', name: 'owner', role: 'admin', via: 'password', owner: true, password: true, twoFactor: false, recoveryLeft: 0, fresh: true, askPassword: true };

const SERVICE: SignInService = {
  id: 's1',
  provider: 'pocket-id',
  name: 'Pocket ID',
  issuer: 'https://id.example',
  clientId: 'client',
  secretSet: true,
  scopes: 'openid profile email groups',
  nameClaim: 'preferred_username',
  groupsClaim: 'groups',
  ca: false,
  on: false,
  paused: false,
  tested: false,
  redirect: 'https://app.example/signin/oidc/callback',
  fromConfig: false,
  role: 'admin',
};

// Every call answers as a quiet kit would, and `over` changes the ones a test is about.
function kit(over: Partial<SignInApi> = {}) {
  const calls: string[] = [];
  const done = async () => ok({});
  const base: SignInApi = {
    root: '/',
    reauth: { state: () => ({ asking: false, password: '', busy: false, error: null, refused: 0 }), subscribe: () => () => {}, set() {}, submit: async () => {}, cancel() {} },
    subscribe: () => () => {},
    options: async () => ok({ open: false, owner: true, minPassword: 12, signedIn: true, passkeys: true, services: [] }),
    login: async () => ok({}),
    loginCode: async () => ok({ visitor: ME }),
    offerPasskey: async () => null,
    logout: done,
    resetCode: done,
    reset: async () => ok({ visitor: ME, removed: { tokens: 0, passkeys: 0, twoFactor: false, services: 0 } }),
    serviceAddress: () => '',
    me: async () => ok(ME),
    setPassword: done,
    removePassword: done,
    confirm: done,
    sessions: async () => ok([]),
    endOtherSessions: async () => ok({ ended: 1 }),
    endSession: done,
    startTwoFactor: async () => ok({ secret: 'ABCD', uri: 'otpauth://totp/x' }),
    confirmTwoFactor: async () => ok({ codes: ['aaaaa-bbbbb'] }),
    stopTwoFactor: done,
    newRecoveryCodes: async () => ok({ codes: ['ccccc-ddddd'] }),
    passkeys: async () => ok([]),
    addPasskey: async () => ok({ id: 'p1' }),
    renamePasskey: done,
    removePasskey: done,
    identities: async () => ok([]),
    unlinkIdentity: done,
    linkService: async () => ok({ url: '' }),
    tokens: async () => ok([]),
    makeToken: async (input) => ok({ token: { id: 't1', name: input.name, scopes: input.scopes, created: '' }, value: 'kt_value' }),
    revokeToken: done,
    accounts: async () => ok([]),
    addAccount: async () => no('forbidden'),
    changeAccount: async (id, input) => ok({ account: { id, name: 'guest', role: 'admin', owner: false, via: 'service', created: '', blocked: !!input.blocked, password: false } }),
    removeAccount: done,
    roles: async () => ok({ roles: ['admin'], serviceRole: 'admin' }),
    presets: async () => ok([{ id: 'pocket-id', scopes: 'openid profile email groups', nameClaim: 'preferred_username', groupsClaim: 'groups' }, { id: 'custom', scopes: 'openid profile email', nameClaim: 'preferred_username', groupsClaim: 'groups' }]),
    services: async () => ok([]),
    addService: async (input) => ok({ service: { ...SERVICE, ...input, id: 'new' } as SignInService }),
    changeService: async (id, input) => ok({ service: { ...SERVICE, ...input, id } as SignInService }),
    removeService: done,
    checkService: done,
    testService: async () => ok({ url: 'https://id.example/authorize' }),
    settings: async () => ok({ askPassword: true }),
    changeSettings: async (input) => ok({ askPassword: input.askPassword ?? true }),
    log: async () => ok([]),
  };
  const api = new Proxy({ ...base, ...over }, {
    get(target, key: string) {
      const value = target[key as keyof SignInApi];
      if (typeof value !== 'function' || key === 'subscribe') return value;
      return (...args: unknown[]) => {
        calls.push(key);
        return (value as (...a: unknown[]) => unknown)(...args);
      };
    },
  });
  return { api, calls };
}

function tile(api: SignInApi, more: Partial<SignInTileOptions> = {}) {
  const said: [string, string][] = [];
  const left: string[] = [];
  const flow = createSignInTileFlow(() => ({
    api,
    text,
    lang: 'en',
    cards: SIGN_IN_TILE_CARDS,
    scopes: ['read', 'all'],
    notify: (m, s) => said.push([s, m]),
    returnTo: '/settings',
    onLeave: (url) => left.push(url),
    ...more,
  }));
  return { flow, said, left };
}

test('a tile reads only what its cards show', async () => {
  const { api, calls } = kit();
  const { flow } = tile(api, { cards: ['twoFactor'] });
  await flow.refresh();
  assert.deepEqual(calls.sort(), ['me', 'options']);
});

test('an open app shows no sessions and no accounts, and the services card waits for a password', async () => {
  const { api } = kit({ me: async () => ok({ ...ME, via: 'open', password: false, account: undefined }), settings: async () => no('setPasswordFirst', 409) });
  const { flow } = tile(api);
  await flow.refresh();
  assert.deepEqual(signInTileCards(flow.state(), SIGN_IN_TILE_CARDS), ['password', 'twoFactor', 'passkeys', 'tokens', 'services']);
});

test('an admin of a signed-in app sees every card that has something to show', async () => {
  const { api } = kit({ accounts: async () => ok([{ id: 'a1', name: 'owner', role: 'admin', owner: true, via: 'password', created: '', blocked: false, password: true }]) });
  const { flow } = tile(api);
  await flow.refresh();
  assert.deepEqual(signInTileCards(flow.state(), SIGN_IN_TILE_CARDS), [...SIGN_IN_TILE_CARDS]);
});

test('a short new password is caught before anything is sent', async () => {
  const { api, calls } = kit();
  const { flow } = tile(api);
  await flow.refresh();
  flow.editPassword();
  flow.set('current', 'old password');
  flow.set('next', 'short');
  flow.setConfirmed(true);
  await flow.savePassword();
  assert.deepEqual(flow.state().invalid, { field: 'next', message: 'The new password needs at least 12 characters.' });
  assert.equal(flow.state().refusal?.hook, 'save-password');
  assert.ok(!calls.includes('setPassword'));
});

test('a wrong current password stands under its field, and the next key clears it', async () => {
  const { api } = kit({ setPassword: async () => no('wrongPassword', 401) });
  const { flow, said } = tile(api);
  await flow.refresh();
  flow.editPassword();
  flow.set('current', 'nope');
  flow.set('next', 'a long new password');
  flow.setConfirmed(true);
  await flow.savePassword();
  assert.deepEqual(flow.state().invalid, { field: 'current', message: text.password.wrongCurrent });
  assert.deepEqual(said, []);
  flow.set('current', 'nope!');
  assert.equal(flow.state().invalid, null);
});

test('a saved password closes the fields and says so', async () => {
  const { api } = kit();
  const { flow, said } = tile(api);
  await flow.refresh();
  flow.editPassword();
  flow.set('current', 'old password');
  flow.set('next', 'a long new password');
  flow.setConfirmed(true);
  await flow.savePassword();
  assert.equal(flow.state().editing, false);
  assert.deepEqual(said, [['success', text.password.saved]]);
});

test('removing the password names everything that goes with it', async () => {
  const { api } = kit({
    me: async () => ok({ ...ME, twoFactor: true }),
    passkeys: async () => ok([{ id: 'p', name: 'Laptop', created: '', rpID: 'app.example', synced: false, here: true }]),
    tokens: async () => ok([{ id: 't', name: 'a', scopes: [], created: '' }, { id: 'u', name: 'b', scopes: [], created: '' }]),
    services: async () => ok([{ ...SERVICE, on: true }, { ...SERVICE, id: 's2', name: 'authentik', on: true }]),
  });
  const { flow } = tile(api);
  await flow.refresh();
  assert.deepEqual(passwordGoes(text, 'en', flow.state()), ['Two-factor authentication', '1 passkey', 'Sign-in with Pocket ID and authentik', '2 API tokens']);
});

test('the question before sensitive changes saves on the flip and snaps back when refused', async () => {
  const { api } = kit({ changeSettings: async () => no('forbidden', 403) });
  const { flow, said } = tile(api);
  await flow.refresh();
  await flow.setAskPassword(false);
  assert.equal(flow.state().settings?.askPassword, true);
  assert.equal(flow.state().refusal?.hook, 'ask-password');
  assert.deepEqual(said, [['fail', text.failed]]);
});

test('two-factor turns on with the first code, and the recovery codes stay until they are acknowledged', async () => {
  const { api } = kit();
  const { flow, said } = tile(api);
  await flow.refresh();
  await flow.setUpTwoFactor();
  assert.deepEqual(flow.state().window, { kind: 'twoFactorSetup', secret: 'ABCD', uri: 'otpauth://totp/x' });
  flow.set('code', '12345');
  await flow.confirmTwoFactor();
  assert.equal(flow.state().invalid?.message, text.twoFactor.sixDigits);
  flow.set('code', '123456');
  await flow.confirmTwoFactor();
  assert.deepEqual(flow.state().window, { kind: 'recoveryCodes', codes: ['aaaaa-bbbbb'], fresh: true });
  flow.close();
  assert.equal(flow.state().window, null);
  assert.deepEqual(said, [['success', text.twoFactor.turnedOn]]);
});

test('a wrong first code stands under the code field', async () => {
  const { api } = kit({ confirmTwoFactor: async () => no('wrongCode', 401) });
  const { flow } = tile(api);
  await flow.refresh();
  await flow.setUpTwoFactor();
  flow.set('code', '000000');
  await flow.confirmTwoFactor();
  assert.equal(flow.state().window?.kind, 'twoFactorSetup');
  assert.equal(flow.state().invalid?.message, text.errors.wrongCode);
});

test('a code is six digits or a recovery code', () => {
  assert.equal(signInCodeShape('123 456'), 'totp');
  assert.equal(signInCodeShape('abcde-fghij'), 'recovery');
  assert.equal(signInCodeShape('12345'), null);
});

test('a passkey the browser does not make leaves the window open with the reason under its form', async () => {
  const { api } = kit({ addPasskey: async () => no('cancelled', 0) });
  const { flow } = tile(api);
  await flow.refresh();
  flow.askAddPasskey('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0');
  assert.equal(flow.state().draft.name, 'Firefox on Windows');
  await flow.addPasskey();
  assert.equal(flow.state().window?.kind, 'addPasskey');
  assert.deepEqual(flow.state().said, { ok: false, message: text.errors.cancelled });
  assert.equal(flow.state().refusal?.hook, 'passkey-add');
});

test('a passkey row shows when it was added, and the rest goes into its bubble', () => {
  const when = () => 'today';
  assert.deepEqual(passkeyFacts(text, { id: 'p', name: 'x', created: 'c', rpID: 'old.example', synced: true, here: false }, when), {
    added: 'Added today',
    more: 'Never used · works only on old.example · synced across your devices',
  });
});

test('a new token is shown once, with the scope and the life picked', async () => {
  let sent: unknown;
  const { api } = kit({
    makeToken: async (input) => {
      sent = input;
      return ok({ token: { id: 't', name: input.name, scopes: input.scopes, created: '' }, value: 'kt_once' });
    },
  });
  const { flow } = tile(api);
  await flow.refresh();
  flow.askToken();
  await flow.makeToken();
  assert.equal(flow.state().invalid?.message, text.tokens.nameMissing);
  flow.set('name', 'Backup script');
  flow.set('scope', 'all');
  flow.set('life', 'never');
  await flow.makeToken();
  assert.deepEqual(sent, { name: 'Backup script', scopes: ['all'], never: true });
  assert.deepEqual(flow.state().window, { kind: 'tokenShown', name: 'Backup script', value: 'kt_once' });
});

test('the service form fills in what the kit knows for the picked service', async () => {
  const { api } = kit();
  const { flow } = tile(api);
  await flow.refresh();
  flow.chooseService('pocket-id');
  assert.equal(flow.state().draft.scopes, 'openid profile email groups');
  flow.chooseService('custom');
  assert.equal(flow.state().draft.scopes, 'openid profile email');
});

test('the test sign-in waits for the address, the client and the secret, and a name is up to the person', () => {
  const d = { ...createSignInTileFlow(() => ({}) as SignInTileOptions).state().draft };
  assert.equal(signInServiceMissing({ ...d, issuer: 'id.example' }, false), 'issuer');
  assert.equal(signInServiceMissing({ ...d, issuer: 'https://id.example' }, false), 'clientId');
  assert.equal(signInServiceMissing({ ...d, issuer: 'https://id.example', clientId: 'c' }, false), 'secret');
  assert.equal(signInServiceMissing({ ...d, issuer: 'https://id.example', clientId: 'c' }, true), null);
});

test('a test sign-in stores the service once, checks the address and leaves for the service', async () => {
  const { api, calls } = kit();
  const { flow, left } = tile(api);
  await flow.refresh();
  flow.chooseService('pocket-id');
  flow.set('issuer', 'https://id.example');
  flow.set('clientId', 'client');
  flow.set('secret', 'secret');
  await flow.testDraft();
  await flow.testDraft();
  assert.deepEqual(left, ['https://id.example/authorize', 'https://id.example/authorize']);
  assert.deepEqual(calls.filter((c) => /Service$/.test(c)), ['addService', 'checkService', 'testService', 'changeService', 'checkService', 'testService']);
});

test('a service the app cannot reach says so under the form and on the test button', async () => {
  const { api } = kit({ checkService: async () => no('serviceUnreachable', 502) });
  const { flow, left } = tile(api);
  await flow.refresh();
  flow.chooseService('pocket-id');
  flow.set('issuer', 'https://id.example');
  flow.set('clientId', 'client');
  flow.set('secret', 'secret');
  await flow.testDraft();
  const message = 'The app can’t reach https://id.example. Is the address right, and can the app get there?';
  assert.deepEqual(flow.state().said, { ok: false, message });
  assert.deepEqual(flow.state().formTest, { tone: 'danger', title: message });
  assert.deepEqual(left, []);
});

test('a service turns on only after its test sign-in', async () => {
  const { api } = kit({ services: async () => ok([SERVICE]), changeService: async () => no('serviceUntested', 409) });
  const { flow, said } = tile(api);
  await flow.refresh();
  await flow.setServiceOn('s1', true);
  assert.equal(flow.state().services?.[0]?.on, false);
  assert.deepEqual(said, [['warn', text.services.mustTest]]);
  assert.equal(flow.state().refusal?.hook, 'service-on-s1');
});

test('a service from the configuration file says so, and turns on again after a reset', async () => {
  let sent: unknown;
  const pinned = { ...SERVICE, fromConfig: true, paused: true, tested: true };
  const { api } = kit({
    services: async () => ok([pinned]),
    changeService: async (id, input) => {
      sent = input;
      return ok({ service: { ...pinned, ...input, id, paused: false } as SignInService });
    },
  });
  const { flow, said } = tile(api);
  await flow.refresh();
  assert.equal(signInServiceStatus(text, pinned, () => ''), 'https://id.example · from the configuration file');
  await flow.confirmService('s1');
  assert.deepEqual(sent, { on: true });
  assert.deepEqual(said, [['success', 'Pocket ID is on the sign-in page.']]);
});

test('passkeys work on a name over https or on localhost, never on an IP address or plain http', () => {
  assert.equal(passkeysAllowedAt({ protocol: 'https:', hostname: 'files.example' }), true);
  assert.equal(passkeysAllowedAt({ protocol: 'http:', hostname: 'localhost' }), true);
  assert.equal(passkeysAllowedAt({ protocol: 'https:', hostname: '192.168.20.41' }), false);
  assert.equal(passkeysAllowedAt({ protocol: 'https:', hostname: '[fd00::1]' }), false);
  assert.equal(passkeysAllowedAt({ protocol: 'http:', hostname: 'files.example' }), false);
});

test('an account from a sign-in service is told where its password lives, and two-factor and passkeys point there', async () => {
  const { api } = kit({
    me: async () => ok({ ...ME, via: 'service', service: 's1', password: false, owner: false }),
    services: async () => ok([{ ...SERVICE, on: true, tested: true }]),
  });
  const { flow } = tile(api);
  await flow.refresh();
  const s = flow.state();
  assert.equal(signInPasswordElsewhere(text, s), 'You sign in through Pocket ID, so this account has no password here.');
  assert.deepEqual(signInCardNotice(text, s, 'twoFactor'), { title: text.notLocal.title, reason: 'You sign in through Pocket ID. Set up two-factor and passkeys there.' });
  assert.deepEqual(signInCardNotice(text, s, 'passkeys')?.title, text.notLocal.title);
  assert.equal(signInCardNotice(text, s, 'tokens'), null);
  assert.equal(signInCardNotice(text, s, 'services'), null);
});

test('an open app sends every lasting way in to the first password', async () => {
  const { api } = kit({ me: async () => ok({ ...ME, via: 'open', password: false, account: undefined }) });
  const { flow } = tile(api);
  await flow.refresh();
  for (const card of ['twoFactor', 'passkeys', 'tokens', 'services'] as const) assert.deepEqual(signInCardNotice(text, flow.state(), card), text.needsPassword);
  assert.equal(signInPasswordElsewhere(text, flow.state()), null);
});

test('a new service hands its newcomers the app\'s ordinary role, and the role goes with the save', async () => {
  const sent: unknown[] = [];
  const { api } = kit({
    roles: async () => ok({ roles: ['admin', 'user'], serviceRole: 'user' }),
    services: async () => ok([{ ...SERVICE, role: 'admin' }]),
    addService: async (input) => {
      sent.push(input);
      return ok({ service: { ...SERVICE, ...input, id: 'new' } as SignInService });
    },
    changeService: async (id, input) => {
      sent.push(input);
      return ok({ service: { ...SERVICE, ...input, id } as SignInService });
    },
  });
  const words = { ...text, roles: { admin: 'Admin', user: 'Member' } };
  const { flow } = tile(api, { text: words });
  await flow.refresh();
  assert.deepEqual(signInRoleItems(words, flow.state().roles), [{ id: 'admin', label: 'Admin' }, { id: 'user', label: 'Member' }]);

  flow.chooseService('pocket-id');
  assert.equal(flow.state().draft.role, 'user');
  assert.equal(signInServiceQuiet(words, flow.state(), 'Pocket ID'), 'Pocket ID decides who may sign in, for example through its groups. Whoever Pocket ID lets in for the first time gets the role Member here.');
  flow.set('issuer', 'https://id.example');
  flow.set('clientId', 'client');
  flow.set('secret', 'secret');
  await flow.testDraft();
  assert.equal((sent[0] as { role?: string }).role, 'user');

  flow.editService('s1');
  assert.equal(flow.state().draft.role, 'admin');
  flow.set('role', 'user');
  await flow.saveService();
  assert.equal((sent[1] as { role?: string }).role, 'user');
});

test('an app with one role offers no choice and sends none', async () => {
  let sent: { role?: string } = {};
  const { api } = kit({
    addService: async (input) => {
      sent = input;
      return ok({ service: { ...SERVICE, ...input, id: 'new' } as SignInService });
    },
  });
  const { flow } = tile(api);
  await flow.refresh();
  assert.equal(signInRoleItems(text, flow.state().roles), null);
  flow.chooseService('pocket-id');
  flow.set('issuer', 'https://id.example');
  flow.set('clientId', 'client');
  flow.set('secret', 'secret');
  await flow.testDraft();
  assert.equal('role' in sent, false);
});

test('a service is named by its own name, else by its kind in the catalog, else by the app\'s word, never the protocol', () => {
  const catalog = { groups: ['selfHosted'], entries: [{ id: 'pocket-id', name: 'Pocket ID', group: 'selfHosted', mark: { svg: '<svg/>' } }] };
  assert.deepEqual(signInServiceLabel({ name: 'Family login', provider: 'pocket-id' }, catalog, text), { name: 'Family login', mark: { svg: '<svg/>' } });
  assert.deepEqual(signInServiceLabel({ name: ' ', provider: 'pocket-id' }, catalog, text), { name: 'Pocket ID', mark: { svg: '<svg/>' } });
  assert.deepEqual(signInServiceLabel({ name: '', provider: 'custom' }, catalog, text), { name: 'Sign-in service', mark: null });
});

test('a service without a name of its own is named after its kind in what the tile says', async () => {
  const catalog = { groups: ['selfHosted'], entries: [{ id: 'pocket-id', name: 'Pocket ID', group: 'selfHosted' }] };
  const unnamed = { ...SERVICE, name: '', tested: true };
  const { api } = kit({
    services: async () => ok([unnamed]),
    changeService: async (id, input) => ok({ service: { ...unnamed, ...input, id } as SignInService }),
  });
  const { flow, said } = tile(api, { providers: catalog });
  await flow.refresh();
  assert.deepEqual(flow.state().serviceLabels, [{ id: 's1', name: 'Pocket ID' }]);
  await flow.setServiceOn('s1', true);
  assert.deepEqual(said, [['success', 'Pocket ID is on the sign-in page.']]);
});

test('a client ID and secret pasted together land in both fields', async () => {
  assert.deepEqual(signInClientPaste('glimstone\nsecret-123\n'), { clientId: 'glimstone', secret: 'secret-123' });
  assert.deepEqual(signInClientPaste('glimstone:secret-123'), { clientId: 'glimstone', secret: 'secret-123' });
  assert.deepEqual(signInClientPaste('{"client_id": "glimstone", "client_secret": "secret-123"}'), { clientId: 'glimstone', secret: 'secret-123' });
  assert.deepEqual(signInClientPaste('{"web": {"clientId": "glimstone", "clientSecret": "secret-123"}}'), { clientId: 'glimstone', secret: 'secret-123' });
  assert.equal(signInClientPaste('glimstone'), null);
  assert.equal(signInClientPaste('https://id.example'), null);
  assert.equal(signInClientPaste('{"client_id": "glimstone"}'), null);

  const { api } = kit();
  const { flow } = tile(api);
  await flow.refresh();
  flow.chooseService('pocket-id');
  assert.equal(flow.pasteClient('just-an-id'), false);
  assert.equal(flow.pasteClient('glimstone\nsecret-123'), true);
  assert.deepEqual([flow.state().draft.clientId, flow.state().draft.secret], ['glimstone', 'secret-123']);
});

test('a service badge says how it stands', () => {
  assert.equal(signInServiceBadge(text, SERVICE).label, 'Not tested yet');
  assert.equal(signInServiceBadge(text, { ...SERVICE, tested: true }).label, 'Off');
  assert.equal(signInServiceBadge(text, { ...SERVICE, tested: true, on: true }).label, 'On');
  assert.equal(signInServiceBadge(text, { ...SERVICE, tested: true, paused: true }).label, 'Paused');
});

test('a removal goes by its id and says so by name', async () => {
  const { api, calls } = kit({ tokens: async () => ok([{ id: 't1', name: 'Backup', scopes: ['read'], created: '' }]) });
  const { flow, said } = tile(api);
  await flow.refresh();
  assert.deepEqual(removalQuestion(text, 'token', 'Backup'), { message: 'Programs that use “Backup” won’t get in anymore.', confirm: 'Revoke' });
  await flow.remove('token', 't1');
  assert.ok(calls.includes('revokeToken'));
  assert.deepEqual(said, [['success', text.tokens.revoked]]);
});

test('the picker marks a service that is set up and puts the other service last', () => {
  const catalog = { groups: ['selfHosted'], entries: [{ id: 'pocket-id', name: 'Pocket ID', group: 'selfHosted' }, { id: 'authelia', name: 'Authelia', group: 'selfHosted' }] };
  const { items } = signInServicePicker(catalog, text, 'en', [SERVICE], (e) => e?.id ?? 'glyph');
  assert.deepEqual(items.map((i) => [i.id, i.sub]), [['authelia', undefined], ['pocket-id', 'set up'], ['custom', 'OpenID Connect']]);
  assert.equal(items[2]!.last, true);
});

test('coming back from a test sign-in that worked closes the form and says so', async () => {
  const { api } = kit();
  const { flow, said } = tile(api);
  await flow.refresh();
  flow.chooseService('pocket-id');
  flow.arrive('testOk');
  assert.equal(flow.state().window, null);
  assert.deepEqual(said, [['success', text.arrived.testOk]]);
});

test('a read asked for while one runs still sees the change', async () => {
  let n = 0;
  const { api } = kit({ tokens: async () => ok(Array.from({ length: ++n }, (_, i) => ({ id: `t${i}`, name: 't', scopes: [], created: '' }))) });
  const { flow } = tile(api);
  const first = flow.refresh();
  const second = flow.refresh();
  await Promise.all([first, second]);
  assert.equal(flow.state().tokens.length, 2);
});

test('an agent string becomes the browser and its system', () => {
  const on = text.sessions;
  assert.deepEqual(signInDevice('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36', on), { name: 'Chrome on Android', phone: true });
  assert.deepEqual(signInDevice('', on), { name: 'Browser', phone: false });
});

test('a code the app has no words for says the fallback, and the numbers are filled in', () => {
  assert.equal(signInErrorText(text, { error: 'internal' }), text.failed);
  assert.equal(signInErrorText(text, { error: 'passwordShort', min: 14 }), 'The new password needs at least 14 characters.');
});
