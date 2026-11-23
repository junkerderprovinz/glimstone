import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createNotifyCardFlow,
  newNotifyChannel,
  notifyForm,
  notifyHasSecret,
  notifyOutgoing,
  notifyPicker,
  notifyProblemText,
  notifyRemoval,
  notifyResultText,
  notifyRows,
  notifyTarget,
  notifyWaitsForSecret,
  placeNotifyProblems,
  NOTIFY_REDACTED,
  type NotifyApi,
  type NotifyCardOptions,
  type NotifyChannel,
  type NotifyConfig,
  type NotifySaveAnswer,
} from '../src/notifyCard.ts';
import { notifyCardTextEn as text } from '../src/notifyCardTexts.ts';
import { NOTIFY_PROVIDERS } from '../src/notifyProviders.ts';

const GOTIFY: NotifyChannel = { id: 'gotify', kind: 'gotify', enabled: true, on: 'failure', gotify: { url: 'https://push.example', token: NOTIFY_REDACTED } };

const settle = () => new Promise((done) => setTimeout(done, 0));

// An app's three calls over one stored config. `answer` decides how a save comes back.
function app(stored: NotifyConfig, answer: (sent: NotifyConfig) => NotifySaveAnswer = () => ({ ok: true })) {
  const saves: NotifyConfig[] = [];
  const tests: NotifyChannel[] = [];
  const api: NotifyApi = {
    load: async () => structuredClone(stored),
    save: async (sent) => {
      saves.push(sent);
      return answer(sent);
    },
    test: async (channel) => {
      tests.push(channel);
      return channel.kind === 'discord' ? { ok: false, code: 'auth' } : { ok: true };
    },
  };
  return { api, saves, tests };
}

function card(api: NotifyApi, more: Partial<NotifyCardOptions> = {}) {
  const said: [string, string][] = [];
  const options: NotifyCardOptions = {
    api,
    text,
    app: 'Atlas',
    lang: 'en',
    providers: NOTIFY_PROVIDERS,
    kinds: ['ntfy', 'gotify', 'discord', 'smtp', 'webhook', 'healthchecks', 'unraid'],
    events: [],
    checks: [],
    unavailable: {},
    notify: (message, severity) => said.push([message, severity]),
    ...more,
  };
  const flow = createNotifyCardFlow(() => options);
  return { flow, said, options };
}

test('a new channel takes its kind as its id, and a number once that is taken', () => {
  assert.equal(newNotifyChannel('ntfy', []).id, 'ntfy');
  const taken = [newNotifyChannel('ntfy', []), { ...newNotifyChannel('ntfy', []), id: 'ntfy-2' }];
  assert.equal(newNotifyChannel('ntfy', taken).id, 'ntfy-3');
  assert.deepEqual(newNotifyChannel('smtp', []).smtp, { host: '', port: 587, username: '', password: '', from: '', to: '', tls: 'starttls' });
  assert.equal(newNotifyChannel('healthchecks', []).on, 'always');
});

test('a row names where its channel sends', () => {
  assert.equal(notifyTarget({ id: 'm', kind: 'matrix', enabled: true, matrix: { homeserver: 'https://matrix.org', room: '!r:matrix.org', token: '' } }), '!r:matrix.org, https://matrix.org');
  assert.equal(notifyTarget({ id: 'a', kind: 'apprise', enabled: true, apprise: { url: '', urls: [' ', 'tgram://x/y'] } }), 'tgram://x/y');
  assert.equal(notifyTarget({ id: 'u', kind: 'unraid', enabled: true }), '');
});

test('a moved address waits for its secret and goes out where it was', () => {
  const moved = { ...GOTIFY, gotify: { ...GOTIFY.gotify!, url: 'https://elsewhere.example' } };
  assert.equal(notifyHasSecret(moved, [GOTIFY]), true);
  assert.equal(notifyWaitsForSecret(moved, [GOTIFY]), true);
  assert.equal(notifyOutgoing({ channels: [moved] }, [GOTIFY]).channels[0]!.gotify!.url, 'https://push.example');
  const retyped = { ...moved, gotify: { ...moved.gotify!, token: 'fresh' } };
  assert.equal(notifyWaitsForSecret(retyped, [GOTIFY]), false);
  assert.equal(notifyOutgoing({ channels: [retyped] }, [GOTIFY]).channels[0]!.gotify!.url, 'https://elsewhere.example');
});

test('blank check rows and blank Apprise lines stay out of what is sent', () => {
  const hc: NotifyChannel = { id: 'hc', kind: 'healthchecks', enabled: true, healthchecks: { url: 'https://hc-ping.com/a', byKey: { nightly: '', weekly: 'https://hc-ping.com/b' } } };
  const ap: NotifyChannel = { id: 'ap', kind: 'apprise', enabled: true, apprise: { url: 'http://apprise:8000/notify', urls: ['', '  '] } };
  const out = notifyOutgoing({ channels: [hc, ap], digest: true }, []);
  assert.deepEqual(out.channels[0]!.healthchecks!.byKey, { weekly: 'https://hc-ping.com/b' });
  assert.equal('urls' in out.channels[1]!.apprise!, false);
  assert.equal(out.digest, true);
});

test('a problem lands on the channel it was about, and each code has its sentence', () => {
  const placed = placeNotifyProblems({ channels: [GOTIFY] }, [{ index: 0, field: 'gotify.url', code: 'bad_url' }, { index: 5, channel: 'gone', code: 'bad_on' }]);
  assert.deepEqual(placed, [
    { channel: 'gotify', field: 'gotify.url', code: 'bad_url' },
    { channel: 'gone', field: '', code: 'bad_on' },
  ]);
  assert.equal(notifyProblemText(text, 'bad_url'), text.problems.badUrl);
  assert.equal(notifyProblemText(text, 'bad_on'), text.problems.other);
});

test('a failed test says why in the app\'s words, by its code, or that it was not sent', () => {
  assert.equal(notifyResultText(text, 'Atlas', { code: 'refused' }), "Atlas couldn't reach that address.");
  assert.equal(notifyResultText(text, 'Atlas', { code: 'unraid-ssh', message: 'Set up SSH first.' }), 'Set up SSH first.');
  assert.equal(notifyResultText(text, 'Atlas', { code: 'something-new' }), text.notSent);
});

test('the picker offers the kinds the app sends to, services first and the webhook last', () => {
  const { items, groups } = notifyPicker(NOTIFY_PROVIDERS, text, 'en', ['webhook', 'smtp', 'ntfy', 'discord'], (kind) => kind);
  assert.deepEqual(items.map((i) => i.id), ['discord', 'ntfy', 'smtp', 'webhook']);
  assert.deepEqual(items.map((i) => i.label), ['Discord', 'ntfy', 'Email', 'Webhook']);
  assert.deepEqual(groups.map((g) => g.title), ['Services', 'Email and webhooks']);
});

test('the card loads the channels and draws a row for each', async () => {
  const { api } = app({ channels: [GOTIFY, { id: 'smtp', kind: 'smtp', enabled: false, smtp: { host: 'mail', from: 'a@x', to: 'me@x' } }] });
  const { flow, options } = card(api);
  flow.start();
  await settle();
  const rows = notifyRows(flow.state(), options);
  assert.deepEqual(rows.map((r) => [r.name, r.meta]), [
    ['Gotify', 'https://push.example · Only on failure'],
    ['Email (SMTP)', 'me@x · Switched off'],
  ]);
  assert.equal(rows[0]!.mark?.svg !== undefined, true);
  assert.equal(rows[1]!.mark, null);
});

test('nothing saves when the load failed', async () => {
  const { flow, said } = card({ ...app({ channels: [] }).api, load: async () => Promise.reject(new Error('down')) });
  flow.start();
  await settle();
  assert.equal(flow.state().loadFailed, true);
  flow.pick();
  assert.equal(flow.state().window, null);
  assert.deepEqual(said, []);
});

test('a picked kind opens its form, and Save adds the channel', async () => {
  const { api, saves } = app({ channels: [], digest: 'daily' });
  const { flow, said } = card(api);
  flow.start();
  await settle();
  flow.pick();
  flow.choose('ntfy');
  assert.deepEqual(flow.state().window, { kind: 'form', adding: true });
  flow.set('ntfy.url', 'https://ntfy.sh/atlas');
  await flow.save();
  assert.equal(saves.length, 1);
  assert.equal(saves[0]!.digest, 'daily');
  assert.equal(saves[0]!.channels[0]!.ntfy!.url, 'https://ntfy.sh/atlas');
  assert.equal(flow.state().window, null);
  assert.equal(flow.state().channels.length, 1);
  assert.deepEqual(said, [['Settings saved', 'success']]);
});

test('a refused save keeps the form open with each problem under its field', async () => {
  const { api } = app({ channels: [] }, () => ({ ok: false, problems: [{ index: 0, channel: 'gotify', field: 'gotify.url', code: 'missing_field' }] }));
  const { flow, options } = card(api);
  flow.start();
  await settle();
  flow.pick();
  flow.choose('gotify');
  await flow.save();
  const form = notifyForm(flow.state(), options)!;
  assert.equal(form.fields.find((f) => f.path === 'gotify.url')!.error, text.problems.missingField);
  assert.equal(flow.state().refusal?.hook, 'save');
  flow.set('gotify.url', 'https://push.example');
  assert.equal(notifyForm(flow.state(), options)!.fields.find((f) => f.path === 'gotify.url')!.error, undefined);
});

test('a stored secret shows empty, says it is kept, and an emptied field keeps it', async () => {
  const { api, saves } = app({ channels: [GOTIFY] });
  const { flow, options } = card(api);
  flow.start();
  await settle();
  flow.edit('gotify');
  let token = notifyForm(flow.state(), options)!.fields.find((f) => f.path === 'gotify.token')!;
  assert.equal(token.value, '');
  assert.equal(token.note, text.secretKept);
  flow.set('gotify.token', 'x');
  flow.set('gotify.token', '');
  flow.set('gotify.url', 'https://moved.example');
  token = notifyForm(flow.state(), options)!.fields.find((f) => f.path === 'gotify.token')!;
  assert.equal(token.note, text.secretAgain);
  flow.set('name', 'Phone');
  await flow.save();
  assert.equal(saves[0]!.channels[0]!.gotify!.token, NOTIFY_REDACTED);
  assert.equal(saves[0]!.channels[0]!.gotify!.url, 'https://push.example');
});

test('a channel offers the app\'s events, all ticked, and keeps at least one', async () => {
  const events = [
    { id: 'upload', label: 'A file request received an upload' },
    { id: 'full', label: 'Storage almost full' },
  ];
  const { api, saves } = app({ channels: [GOTIFY] });
  const { flow, options } = card(api, { events });
  flow.start();
  await settle();
  flow.edit('gotify');
  const checks = () => notifyForm(flow.state(), options)!.fields.find((f) => f.path === 'events')!.options!.map((o) => o.checked);
  assert.deepEqual(checks(), [true, true]);
  flow.setEvent('upload', false);
  assert.deepEqual(checks(), [false, true]);
  flow.setEvent('full', false);
  assert.deepEqual(checks(), [false, true]);
  assert.equal(flow.state().refusal?.hook, 'events');
  await flow.save();
  assert.deepEqual(saves[0]!.channels[0]!.events, ['full']);
  flow.edit('gotify');
  flow.setEvent('upload', true);
  assert.equal(flow.state().draft!.events, undefined);
});

test('without events from the app the form leaves the choice out', async () => {
  const { flow, options } = card(app({ channels: [GOTIFY] }).api);
  flow.start();
  await settle();
  flow.edit('gotify');
  assert.equal(notifyForm(flow.state(), options)!.fields.some((f) => f.path === 'events'), false);
});

test('a Healthchecks channel gives each of the app\'s checks a field of its own', async () => {
  const { api, saves } = app({ channels: [] });
  const { flow, options } = card(api, { checks: [{ id: 'nightly', label: 'Nightly job' }] });
  flow.start();
  await settle();
  flow.pick();
  flow.choose('healthchecks');
  const form = notifyForm(flow.state(), options)!;
  assert.deepEqual(form.fields.map((f) => f.path), ['name', 'healthchecks.url', 'healthchecks.byKey.nightly']);
  assert.equal(form.fields[1]!.hint, text.checksHint);
  flow.set('healthchecks.byKey.nightly', 'https://hc-ping.com/n');
  await flow.save();
  assert.deepEqual(saves[0]!.channels[0]!.healthchecks!.byKey, { nightly: 'https://hc-ping.com/n' });
});

test('webhook headers keep a stored value when its field is emptied', async () => {
  const hook: NotifyChannel = { id: 'webhook', kind: 'webhook', enabled: true, webhook: { url: 'https://hooks.example/in', headers: { Authorization: NOTIFY_REDACTED } } };
  const { api, saves } = app({ channels: [hook] });
  const { flow, options } = card(api);
  flow.start();
  await settle();
  flow.edit('webhook');
  assert.equal(notifyForm(flow.state(), options)!.fields.find((f) => f.path === 'webhook.headers')!.note, text.secretKept);
  flow.setHeader(0, 'value', 'Bearer new');
  flow.setHeader(0, 'value', '');
  flow.addHeader();
  flow.setHeader(1, 'name', 'X-Team');
  flow.setHeader(1, 'value', 'ops');
  await flow.save();
  assert.deepEqual(saves[0]!.channels[0]!.webhook!.headers, { Authorization: NOTIFY_REDACTED, 'X-Team': 'ops' });
});

test('a channel switched on that the kit refuses snaps back and opens its form', async () => {
  const off = { ...GOTIFY, enabled: false, gotify: { url: '', token: '' } };
  const { api } = app({ channels: [off] }, () => ({ ok: false, problems: [{ index: 0, channel: 'gotify', field: 'gotify.url', code: 'missing_field' }] }));
  const { flow } = card(api);
  flow.start();
  await settle();
  await flow.setEnabled('gotify', true);
  assert.equal(flow.state().channels[0]!.enabled, false);
  assert.deepEqual(flow.state().window, { kind: 'form', adding: false });
  assert.equal(flow.state().draft!.enabled, true);
  assert.deepEqual(flow.state().problems, [{ field: 'gotify.url', code: 'missing_field' }]);
});

test('a switch that fails for another reason snaps back and shakes', async () => {
  const { api } = app({ channels: [GOTIFY] }, () => ({ ok: false, message: 'Disk full' }));
  const { flow, said } = card(api);
  flow.start();
  await settle();
  await flow.setEnabled('gotify', false);
  assert.equal(flow.state().channels[0]!.enabled, true);
  assert.equal(flow.state().refusal?.hook, 'switch-gotify');
  assert.deepEqual(said, [['Disk full', 'fail']]);
});

test('a row\'s test reports in its line, and the form\'s under the form', async () => {
  const discord: NotifyChannel = { id: 'discord', kind: 'discord', enabled: true, discord: { url: 'https://discord.com/api/webhooks/1' } };
  const { api, tests } = app({ channels: [GOTIFY, discord] });
  const { flow, options } = card(api);
  flow.start();
  await settle();
  await flow.testRow('gotify');
  await flow.testRow('discord');
  const rows = notifyRows(flow.state(), options);
  assert.equal(rows[0]!.meta, 'https://push.example · Sent');
  assert.equal(rows[1]!.meta, `https://discord.com/api/webhooks/1 · ${text.results.auth}`);
  flow.edit('discord');
  await flow.test();
  assert.deepEqual(flow.state().said, { ok: false, message: text.results.auth });
  assert.equal(tests.length, 3);
});

test('a removal asks by name, then saves without the channel', async () => {
  const { api, saves } = app({ channels: [GOTIFY] });
  const { flow } = card(api);
  flow.start();
  await settle();
  assert.equal(notifyRemoval(text, GOTIFY).message, 'Remove Gotify? It stops sending right away.');
  await flow.remove('gotify');
  assert.deepEqual(saves[0]!.channels, []);
  assert.deepEqual(flow.state().channels, []);
});

test('an Unraid channel that is on where Unraid is not wears the idle badge and says why', async () => {
  const unraid: NotifyChannel = { id: 'unraid', kind: 'unraid', enabled: true };
  const { flow, options } = card(app({ channels: [unraid] }).api, { unavailable: { unraid: 'This host is not Unraid.' } });
  flow.start();
  await settle();
  assert.equal(notifyRows(flow.state(), options)[0]!.idle, true);
  flow.edit('unraid');
  assert.equal(notifyForm(flow.state(), options)!.unavailable, 'This host is not Unraid.');
});
