import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  appCardView,
  createFortressFlow,
  doubtView,
  enterWords,
  memberName,
  openRefusalText,
  statusView,
  othersLine,
  othersSummary,
  PHRASE_LENGTH,
  phraseFromText,
  phraseReady,
  permissionsWith,
  presenceTone,
  shownInstance,
  type FortressApp,
  type FortressHandlers,
} from '../src/fortress.ts';
import { en as fortressTextEn } from '../src/fortressLocales/en.ts';
import { FORTRESS_OPEN_REFUSALS } from '../src/fortressText.ts';

const blank = () => Array<string>(PHRASE_LENGTH).fill('');
const TWELVE = 'oak lamp tower harbour maple lantern bridge kettle cloud saddle feather lance';

test('a phrase has twelve words', () => {
  assert.equal(PHRASE_LENGTH, 12);
});

test('pasted text becomes its words in lower case, without numbering or punctuation between them', () => {
  assert.deepEqual(phraseFromText('  Oak, LAMP\n3. tower\t4) harbour  '), ['oak', 'lamp', 'tower', 'harbour']);
});

test('a single word typed into a field stays in that field as typed', () => {
  assert.deepEqual(enterWords(blank(), 2, 'Tow'), { words: ['', '', 'Tow', ...blank().slice(3)], focus: 2 });
});

test('a word followed by a space moves on to the next field', () => {
  const next = enterWords(blank(), 0, 'oak ');
  assert.equal(next.words[0], 'oak');
  assert.equal(next.focus, 1);
});

test('the whole phrase pasted into the first field spreads over all twelve', () => {
  const next = enterWords(blank(), 0, TWELVE);
  assert.deepEqual(next.words, TWELVE.split(' '));
  assert.equal(next.focus, 11);
});

test('words pasted into a later field fill from there and drop what does not fit', () => {
  const next = enterWords(blank(), 9, 'a b c d e');
  assert.deepEqual(next.words.slice(8), ['', 'a', 'b', 'c']);
  assert.equal(next.focus, 11);
});

test('words pasted into the middle put the focus on the field after the last one', () => {
  assert.equal(enterWords(blank(), 3, 'a b c').focus, 6);
});

test('the phrase is ready once every field holds a word', () => {
  assert.equal(phraseReady(blank()), false);
  assert.equal(phraseReady([...TWELVE.split(' ').slice(0, 11), '  ']), false);
  assert.equal(phraseReady(TWELVE.split(' ')), true);
});

const apps: FortressApp[] = [
  {
    id: 'alpha',
    name: 'Alpha',
    instances: [
      { id: 'a1', device: 'Atlas', presence: 'connected', open: { href: 'https://atlas:1' } },
      { id: 'a2', device: 'Pocket', presence: 'away' },
    ],
  },
  { id: 'bravo', name: 'Bravo', instances: [{ id: 'b1', device: 'Atlas', presence: 'connected' }] },
  { id: 'charlie', name: 'Charlie', instances: [{ id: 'c1', device: 'Studio', presence: 'checking' }] },
];

test('the other apps are counted once each, however many places they run in', () => {
  assert.deepEqual(othersSummary(apps), { apps: 3, devices: 3 });
});

test('the line under the switch counts the other apps and their devices', () => {
  assert.equal(othersLine(fortressTextEn, 'en', apps), '3 more apps on 3 devices. Applies to this device only.');
});

test('the instance a card names is the one that opens in the browser, else the first', () => {
  assert.equal(shownInstance(apps[0]).id, 'a1');
  assert.equal(shownInstance({ ...apps[0], instances: [...apps[0].instances].reverse() }).id, 'a1');
  assert.equal(shownInstance(apps[1]).id, 'b1');
});

test('only a connection shows green, since an app that is away is not at fault', () => {
  assert.equal(presenceTone('connected'), 'ok');
  assert.equal(presenceTone('checking'), 'neutral');
  assert.equal(presenceTone('away'), 'neutral');
});

test('the permissions with an app are those it gives or takes', () => {
  const perms = [
    { id: 'p1', from: 'alpha', to: ['bravo'], on: true, title: '' },
    { id: 'p2', from: 'bravo', to: ['charlie', 'alpha'], on: true, title: '' },
    { id: 'p3', from: 'charlie', to: ['bravo'], on: false, title: '' },
  ];
  assert.deepEqual(permissionsWith(perms, 'alpha').map((p) => p.id), ['p1', 'p2']);
});

function handlers(over: Partial<FortressHandlers> = {}): FortressHandlers & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    onJoin: async (words) => (calls.push(`join ${words.join(' ')}`), { ok: true }),
    onLeave: async () => (calls.push('leave'), { ok: true }),
    onRemove: async (id) => (calls.push(`remove ${id}`), { ok: true }),
    onShowPhrase: async (password) => (calls.push(`show ${password ?? '-'}`), { words: TWELVE.split(' ') }),
    onChangePhrase: async () => (calls.push('change'), { words: TWELVE.split(' ').reverse(), left: ['Pocket'] }),
    ...over,
  };
}

const failed = 'That did not work.';

test('joining sends the twelve words and then says the app is in', async () => {
  const h = handlers();
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openJoin();
  flow.enter(0, TWELVE.toUpperCase());
  await flow.join();
  assert.deepEqual(h.calls, [`join ${TWELVE}`]);
  assert.equal(flow.state().window?.kind, 'joined');
});

test('join waits for all twelve words', async () => {
  const h = handlers();
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openJoin();
  flow.enter(0, 'oak lamp');
  await flow.join();
  assert.deepEqual(h.calls, []);
});

test('refused words stay in their fields, with the reason and a refusal to shake', async () => {
  const flow = createFortressFlow(() => ({ ...handlers({ onJoin: async () => ({ error: 'Those words open no fortress.' }) }), failed }));
  flow.openJoin();
  flow.enter(0, TWELVE);
  await flow.join();
  const s = flow.state();
  assert.equal(s.window?.kind, 'join');
  assert.equal(s.error, 'Those words open no fortress.');
  assert.deepEqual(s.refusal, { button: 'join', count: 1 });
  assert.deepEqual(s.window?.kind === 'join' && s.window.words, TWELVE.split(' '));
});

test("a handler that throws is refused in the flow's own words", async () => {
  const flow = createFortressFlow(() => ({ ...handlers({ onLeave: async () => { throw new Error('offline'); } }), failed }));
  flow.openLeave();
  await flow.leave();
  assert.equal(flow.state().error, failed);
  assert.equal(flow.state().window?.kind, 'leave');
});

test('leaving and removing close their window once the app says yes, where the phrase cannot change here', async () => {
  const h = handlers({ onChangePhrase: undefined });
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openLeave();
  await flow.leave();
  assert.equal(flow.state().window, null);
  flow.openRemove('a2', 'Pocket');
  assert.deepEqual(flow.state().window, { kind: 'remove', id: 'a2', device: 'Pocket' });
  await flow.remove();
  assert.equal(flow.state().window, null);
  assert.deepEqual(h.calls, ['leave', 'remove a2']);
});

test('a removal asks next whether to change the phrase, and a yes shows the new words', async () => {
  const h = handlers();
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openRemove('b1', 'Bravo on Atlas');
  await flow.remove();
  assert.deepEqual(flow.state().window, { kind: 'removed', device: 'Bravo on Atlas' });
  await flow.change();
  assert.deepEqual(flow.state().window, { kind: 'changed', words: TWELVE.split(' ').reverse(), left: ['Pocket'] });
  assert.deepEqual(h.calls, ['remove b1', 'change']);
});

test('later after a removal keeps the phrase as it is', async () => {
  const h = handlers();
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openRemove('b1', 'Bravo on Atlas');
  await flow.remove();
  flow.close();
  assert.equal(flow.state().window, null);
  assert.deepEqual(h.calls, ['remove b1']);
});

test('a refused removal stays in its window with the reason, and asks nothing about the phrase', async () => {
  const flow = createFortressFlow(() => ({ ...handlers({ onRemove: async () => ({ error: 'Bravo is not reachable.' }) }), failed }));
  flow.openRemove('b1', 'Bravo on Atlas');
  await flow.remove();
  assert.equal(flow.state().window?.kind, 'remove');
  assert.equal(flow.state().error, 'Bravo is not reachable.');
  assert.deepEqual(flow.state().refusal, { button: 'remove', count: 1 });
});

test('a refused change after a removal keeps the question open with the reason', async () => {
  const flow = createFortressFlow(() => ({ ...handlers({ onChangePhrase: async () => ({ error: 'The phrase stays as it is.' }) }), failed }));
  flow.openRemove('b1', 'Bravo on Atlas');
  await flow.remove();
  await flow.change();
  assert.equal(flow.state().window?.kind, 'removed');
  assert.equal(flow.state().error, 'The phrase stays as it is.');
});

test('the phrase shows at once where no password guards it', async () => {
  const h = handlers();
  const flow = createFortressFlow(() => ({ ...h, failed }));
  await flow.openPhrase();
  assert.deepEqual(flow.state().window, { kind: 'phrase', step: 'words', password: '', words: TWELVE.split(' ') });
  assert.deepEqual(h.calls, ['show -']);
});

test('a guarded phrase asks for the password first and keeps it out of the state afterwards', async () => {
  const h = handlers({
    onShowPhrase: async (password) => (password === 'secret' ? { words: TWELVE.split(' ') } : { error: 'Wrong password.' }),
  });
  const flow = createFortressFlow(() => ({ ...h, failed, phrasePassword: true }));
  await flow.openPhrase();
  assert.deepEqual(flow.state().window, { kind: 'phrase', step: 'password', password: '', words: [] });
  flow.setPassword('nope');
  await flow.unlock();
  assert.equal(flow.state().error, 'Wrong password.');
  assert.deepEqual(flow.state().refusal, { button: 'unlock', count: 1 });
  flow.setPassword('secret');
  await flow.unlock();
  assert.deepEqual(flow.state().window, { kind: 'phrase', step: 'words', password: '', words: TWELVE.split(' ') });
  assert.equal(flow.state().error, null);
});

test('an empty password is not sent', async () => {
  const h = handlers();
  const flow = createFortressFlow(() => ({ ...h, failed, phrasePassword: true }));
  await flow.openPhrase();
  await flow.unlock();
  assert.deepEqual(h.calls, []);
});

test('changing the phrase shows the new words and the instances still on the old ones', async () => {
  const h = handlers();
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openChange();
  assert.deepEqual(flow.state().window, { kind: 'change' });
  await flow.change();
  assert.deepEqual(flow.state().window, { kind: 'changed', words: TWELVE.split(' ').reverse(), left: ['Pocket'] });
});

test('a second press while the app answers sends nothing more', async () => {
  let release = () => {};
  const h = handlers({ onLeave: () => new Promise((done) => (release = () => done({ ok: true }))) });
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openLeave();
  const first = flow.leave();
  assert.equal(flow.state().busy, 'leave');
  await flow.leave();
  release();
  await first;
  assert.equal(flow.state().busy, null);
});

test('closing a window while the app answers waits for the answer', async () => {
  let release = () => {};
  const h = handlers({ onJoin: () => new Promise((done) => (release = () => done({ ok: true }))) });
  const flow = createFortressFlow(() => ({ ...h, failed }));
  flow.openJoin();
  flow.enter(0, TWELVE);
  const pending = flow.join();
  flow.close();
  assert.equal(flow.state().window?.kind, 'join');
  release();
  await pending;
  assert.equal(flow.state().window?.kind, 'joined');
});

test('every change reaches the subscribers, and a closed window starts clean next time', () => {
  const flow = createFortressFlow(() => ({ ...handlers(), failed }));
  let heard = 0;
  const stop = flow.subscribe(() => heard++);
  flow.openJoin();
  flow.enter(0, 'oak');
  flow.close();
  flow.openJoin();
  stop();
  const s = flow.state();
  assert.deepEqual(s.window?.kind === 'join' && s.window.words, blank());
  flow.close();
  assert.equal(heard, 4);
  assert.deepEqual(flow.state().window, null);
});

test('an app card names its forms, its instance count and the instance that opens', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const view = appCardView(
    {
      id: 'alpha',
      name: 'Alpha',
      instances: [
        { id: 'a1', device: 'Atlas', form: 'container', version: '2.1.0', address: '10.0.0.5:8080', presence: 'connected', open: { href: 'https://atlas:8080' } },
        { id: 'a2', device: 'Pocket', form: 'android', version: '2.1.0', presence: 'away', lastSeen: '07:40', needs: 'A captcha waits' },
      ],
    },
    en,
    'en',
  );
  assert.equal(view.eyebrow, 'Container, Android app');
  assert.deepEqual(view.facts, ['2 instances', '10.0.0.5:8080', 'v2.1.0']);
  assert.equal(view.needs, 'A captcha waits');
  assert.equal(view.presence, 'connected');
  assert.deepEqual(view.rows.map((r) => r.sub), ['Container · v2.1.0', 'Android app · v2.1.0 · Last seen 07:40']);
  assert.deepEqual(view.rows.map((r) => r.open), [true, false]);
  assert.deepEqual(view.open, { label: 'Open', href: 'https://atlas:8080' });
});

test('an app with one instance names its device, and one with nothing to open offers nothing', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const plugin = appCardView({ id: 'p', name: 'P', instances: [{ id: 'p1', device: 'Atlas', form: 'plugin', presence: 'connected', open: { href: 'https://atlas/P', host: 'Unraid' } }] }, en, 'en');
  assert.deepEqual(plugin.facts, ['Atlas']);
  assert.deepEqual(plugin.rows, []);
  assert.equal(plugin.open?.label, 'Open in Unraid');
  const phone = appCardView({ id: 'q', name: 'Q', instances: [{ id: 'q1', device: 'Pocket', form: 'Watch app', presence: 'away' }] }, en, 'en');
  assert.equal(phone.open, null);
  assert.equal(phone.eyebrow, 'Watch app');
});

test('an instance opens through the fortress without an address of its own', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const view = appCardView({ id: 'r', name: 'R', instances: [{ id: 'r1', device: 'Atlas', presence: 'connected', open: {} }] }, en, 'en');
  assert.deepEqual(view.open, { label: 'Open', href: undefined });
});

test('two members claiming one app on one device warn on the card and ask by the id', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const app: FortressApp = {
    id: 'bravo',
    name: 'Bravo',
    instances: [
      { id: 'b1', device: 'Atlas', presence: 'connected', open: {}, doubt: true, print: '91c0' },
      { id: 'b2', device: 'Atlas', presence: 'connected', open: {}, doubt: true, print: '0b13' },
    ],
  };
  const view = appCardView(app, en, 'en');
  assert.deepEqual(view.doubt, { label: 'Named twice', tip: 'Two members call themselves Bravo on Atlas. Open only the one you know.' });
  assert.deepEqual(view.rows.map((r) => r.sub), ['', '']);
  assert.equal(appCardView({ ...app, instances: [{ ...app.instances[0]!, doubt: false }] }, en, 'en').doubt, null);
  assert.deepEqual(doubtView(en, app, app.instances[1]!), {
    title: 'Two members call themselves Bravo on Atlas',
    body: 'Open only if you know this is yours. Its id ends in 0b13.',
    open: 'Open anyway',
  });
  assert.equal(doubtView(en, app, { ...app.instances[1]!, print: undefined, id: 'member-7a41c9' }).body, 'Open only if you know this is yours. Its id ends in 7a41c9.');
});

test('a refusal code gets its sentence, and an unknown one the general sentence', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  assert.equal(openRefusalText(en, 'ui_no_login'), 'This app opens from elsewhere only once it has a password.');
  assert.equal(openRefusalText(en, 'failed'), "The app sent something that can't be shown here.");
  assert.equal(openRefusalText(en, 'teapot'), en.openRefused.failed);
  assert.equal(openRefusalText(en, 'toString'), en.openRefused.failed);
});

test('the refusal sentences cover the kit codes', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  assert.deepEqual(Object.keys(en.openRefused).sort(), [...FORTRESS_OPEN_REFUSALS].sort());
});

const plugin: FortressApp = { id: 'delta', name: 'Delta', instances: [{ id: 'd1', device: 'Atlas', form: 'plugin', presence: 'connected' }] };

test('the status window shows the report, the newest ten log lines and where the settings are', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const log = Array.from({ length: 12 }, (_, i) => ({ at: `07:${String(59 - i)}`, level: i === 0 ? 'error' : 'info', text: `Line ${i}` }));
  const view = statusView({
    app: plugin,
    instance: plugin.instances[0]!,
    report: {
      state: 'warning',
      needsYou: [{ severity: 'warn', text: '2 updates wait' }],
      work: [{ title: 'Checking disk 3', progress: 0.4 }],
      next: [{ title: 'Parity check', at: 'Sunday 03:00' }],
    },
    log,
    text: en,
  });
  assert.equal(view.title, 'Delta on Atlas');
  assert.deepEqual(view.state, { label: 'Needs a look', tone: 'warn' });
  assert.deepEqual(view.needsYou, [{ text: '2 updates wait', level: { label: 'Warning', tone: 'warn' } }]);
  assert.equal(view.log.length, 10);
  assert.deepEqual(view.log[0], { at: '07:59', text: 'Line 0', level: { label: 'Error', tone: 'fail' } });
  assert.equal(view.log[1]!.level, null);
  assert.equal(view.quiet, undefined);
  assert.equal(view.where, 'Delta keeps its settings in Unraid on Atlas.');
});

test('only a plugin says its settings are in Unraid', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const app: FortressApp = { id: 'f', name: 'Foxtrot', instances: [{ id: 'f1', device: 'Atlas', form: 'container', presence: 'connected' }] };
  assert.equal(statusView({ app, instance: app.instances[0]!, report: { state: 'ok', needsYou: [], work: [], next: [] }, text: en }).where, undefined);
});

test('a report with nothing in it says so, and an unknown state shows as it is', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const view = statusView({ app: plugin, instance: plugin.instances[0]!, report: { state: 'resting', needsYou: [], work: [], next: [] }, text: en });
  assert.deepEqual(view.state, { label: 'resting', tone: 'neutral' });
  assert.equal(view.quiet, 'Nothing needs you right now, and nothing is running.');
});

test('while loading or after an error the window holds only that line and where the settings are', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const base = { app: plugin, instance: plugin.instances[0]!, text: en };
  const loading = statusView({ ...base, loading: true, log: [{ at: '07:00', level: 'info', text: 'x' }] });
  assert.equal(loading.loading, "Asking Delta how it's doing.");
  assert.deepEqual([loading.state, loading.log, loading.error], [null, [], undefined]);
  const failed = statusView({ ...base, error: en.openRefused.unreachable });
  assert.equal(failed.error, en.openRefused.unreachable);
  assert.equal(failed.state, null);
  assert.equal(failed.where, 'Delta keeps its settings in Unraid on Atlas.');
});

test('a step whose callback is missing does nothing', async () => {
  const flow = createFortressFlow(() => ({ failed }));
  flow.openLeave();
  await flow.leave();
  flow.openJoin();
  flow.enter(0, TWELVE);
  await flow.join();
  assert.deepEqual(flow.state(), { window: { kind: 'join', words: TWELVE.split(' '), focus: 11 }, busy: null, error: null, refusal: null });
});

test('an instance of another app is named by its app and its device', () => {
  const app: FortressApp = { id: 'bravo', name: 'Bravo', instances: [{ id: 'b1', device: 'Atlas', presence: 'connected' }] };
  assert.equal(memberName(fortressTextEn, app, app.instances[0]!), 'Bravo on Atlas');
});
