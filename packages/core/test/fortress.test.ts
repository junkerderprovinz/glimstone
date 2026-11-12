import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  appCardView,
  createFortressFlow,
  enterWords,
  memberName,
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
  assert.deepEqual(view.open, { label: 'Open', href: 'https://atlas:8080' });
});

test('an app with one instance names its device, and one that opens elsewhere says where', async () => {
  const { en } = await import('../src/fortressLocales/en.ts');
  const plugin = appCardView({ id: 'p', name: 'P', instances: [{ id: 'p1', device: 'Atlas', form: 'plugin', presence: 'connected', open: { href: 'https://atlas/P', host: 'Unraid' } }] }, en, 'en');
  assert.deepEqual(plugin.facts, ['Atlas']);
  assert.deepEqual(plugin.rows, []);
  assert.equal(plugin.open?.label, 'Open in Unraid');
  const phone = appCardView({ id: 'q', name: 'Q', instances: [{ id: 'q1', device: 'Pocket', form: 'Watch app', presence: 'away' }] }, en, 'en');
  assert.equal(phone.open, null);
  assert.equal(phone.note, 'Opens only on Pocket');
  assert.equal(phone.eyebrow, 'Watch app');
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
