// The fortress in the Instances tab ("The fortress" in the design language):
// what the cards show about the other apps, how twelve typed or pasted words
// land in their fields, and the flow behind the windows to join, leave,
// remove, show and change the phrase. The app answers each step through a
// callback and hands in its data; nothing here talks to a server.

import type { BadgeTone } from "./badge.ts";
import { fill, plural, type FortressMemberState, type FortressOpenRefusal, type FortressText } from "./fortressText.ts";
import { openInBrowser } from "./infoTile.ts";
import { storageKey } from "./storage.ts";

export const PHRASE_LENGTH = 12;

/** Reachable now, being looked for, or away. Away is no fault: a phone with the app closed is away. */
export type FortressPresence = "connected" | "checking" | "away";

/** What a device is, for the glyph in front of its name. */
export type FortressDevice = "server" | "pc" | "laptop" | "phone";

/** The forms an app comes in. Any other string is shown as it is. */
export type FortressForm = "container" | "plugin" | "desktop" | "android" | "extension";

export interface FortressInstance {
  id: string;
  /** The name of the device it runs on. */
  device: string;
  deviceKind?: FortressDevice;
  form?: FortressForm | (string & {});
  version?: string;
  /** Where it answers, shown as a fact. Nothing in the fortress is ever reached by typing an address. */
  address?: string;
  presence: FortressPresence;
  /** Reached through the relay only. */
  relay?: boolean;
  /** When it was last seen, already in the app's own format, for an instance that is away. */
  lastSeen?: string;
  /** What needs the person there, in a few words, such as "2 updates waiting". */
  needs?: string;
  /**
   * Set when the instance can be opened from here. The app's `onOpen` opens it,
   * through the fortress where it runs elsewhere, and without `onOpen` the card
   * opens `href` in a new tab. `host` names a page it lives in, such as Unraid.
   * Without `open` the card offers no Open.
   */
  open?: { href?: string; host?: string };
  /** Another member claims the same app on the same device, so the card warns and Open asks first. */
  doubt?: boolean;
  /** The end of the member's id, which the question before Open names. Without it the question takes the end of `id`. */
  print?: string;
  /** The instance showing the page, which leaves the fortress rather than being removed. */
  self?: boolean;
}

export interface FortressApp {
  id: string;
  name: string;
  /** The address of the app's mark, a data URI included. */
  logo?: string;
  instances: FortressInstance[];
}

/** What one app may do at others, as one switch. `title` and `detail` are the app's own words. */
export interface FortressPermission {
  id: string;
  from: string;
  to: string[];
  on: boolean;
  title: string;
  detail?: string;
}

/** How many other apps the switch would show, and on how many devices. */
export function othersSummary(apps: FortressApp[]): { apps: number; devices: number } {
  const devices = new Set(apps.flatMap((a) => a.instances.map((i) => i.device)));
  return { apps: apps.length, devices: devices.size };
}

/** The line under the switch: how many other apps it shows, on how many devices. */
export function othersLine(text: FortressText, lang: string, apps: FortressApp[]): string {
  const n = othersSummary(apps);
  return fill(text.othersLine, { apps: plural(lang, text.othersApps, n.apps), devices: plural(lang, text.othersDevices, n.devices) });
}

/** The instance an app's card names in its facts: the first that opens, else the first. */
export function shownInstance(app: FortressApp): FortressInstance {
  return app.instances.find((i) => i.open) ?? app.instances[0]!;
}

/** What an app's card shows, worked out once for every framework. */
export interface AppCardView {
  main: FortressInstance;
  presence: FortressPresence;
  relay: boolean;
  needs: string | undefined;
  eyebrow: string;
  facts: string[];
  /** The warning while some instance claims the same app on the same device as another member, with its (i). */
  doubt: { label: string; tip: string } | null;
  /** A row per instance, or none when the app runs in one place. `open` says whether the row has its own Open. */
  rows: { instance: FortressInstance; sub: string; open: boolean }[];
  /** The card's Open, for the instance it names. */
  open: { label: string; href?: string } | null;
}

const formName = (text: FortressText, form: string | undefined) =>
  form === undefined ? undefined : (text.forms as Record<string, string>)[form] ?? form;

export function appCardView(app: FortressApp, text: FortressText, lang: string): AppCardView {
  const main = shownInstance(app);
  const many = app.instances.length > 1;
  const doubted = app.instances.find((i) => i.doubt);
  const version = (i: FortressInstance) => (i.version ? `v${i.version}` : undefined);
  const rowSub = (i: FortressInstance) =>
    [formName(text, i.form), version(i), i.presence === "away" && i.lastSeen ? fill(text.lastSeen, { time: i.lastSeen }) : undefined]
      .filter(Boolean)
      .join(" · ");
  return {
    main,
    presence: main.presence,
    relay: !!main.relay,
    needs: app.instances.find((i) => i.needs)?.needs,
    eyebrow: [...new Set(app.instances.map((i) => formName(text, i.form)).filter(Boolean))].join(", "),
    facts: [many ? plural(lang, text.instanceCount, app.instances.length) : main.device, main.address, version(main)].filter(
      (f): f is string => !!f,
    ),
    doubt: doubted ? { label: text.doubtBadge, tip: fill(text.doubtHint, { app: app.name, device: doubted.device }) } : null,
    rows: many ? app.instances.map((instance) => ({ instance, sub: rowSub(instance), open: !!instance.open })) : [],
    open: main.open ? { label: main.open.host ? fill(text.openIn, { host: main.open.host }) : text.open, href: main.open.href } : null,
  };
}

/** Opens an instance: through the app's `onOpen` where it has one, else at `open.href` in a new tab. */
export function openInstance(app: FortressApp, instance: FortressInstance, onOpen?: (app: FortressApp, instance: FortressInstance) => void): void {
  if (onOpen) onOpen(app, instance);
  else if (instance.open?.href) openInBrowser(instance.open.href);
}

/** How much of an id the question before Open names when the instance has no `print`. */
const PRINT_LENGTH = 6;

/**
 * The question before an instance with `doubt` opens. Two members that claim
 * the same app on the same device may be one honest app and one that copies
 * its sign-in page, so the person opens only the one whose id they know.
 */
export function doubtView(text: FortressText, app: FortressApp, instance: FortressInstance): { title: string; body: string; open: string } {
  return {
    title: fill(text.doubtTitle, { app: app.name, device: instance.device }),
    body: fill(text.doubtBody, { id: instance.print ?? instance.id.slice(-PRINT_LENGTH) }),
    open: text.openAnyway,
  };
}

/** The sentence for why an instance did not open, by the code the fortress refused it with. An unknown code gets `failed`. */
export function openRefusalText(text: FortressText, code: string): string {
  return Object.hasOwn(text.openRefused, code) ? text.openRefused[code as FortressOpenRefusal] : text.openRefused.failed;
}

/** What a member's status report says, its words already in the person's language and its times already formatted. */
export interface FortressStatusReport {
  /** off, ok, starting, warning, overdue or failed. Any other string shows as it is. */
  state: string;
  /** `severity` is info, warn or error. */
  needsYou: { severity: string; text: string }[];
  /** `progress` runs from 0 to 1 and is left out where the app cannot tell. */
  work: { title: string; progress?: number }[];
  next: { title: string; at: string }[];
}

/** The sentence for a join the kit turned away, by its code: words that open no fortress, or a fortress that takes no new app until its phrase changes. An unknown code gets `failed`. */
export function joinRefusalText(text: FortressText, code: string): string {
  if (code === "phrase") return text.joinRefused;
  if (code === "closedUntilNewPhrase") return text.joinLocked;
  return text.failed;
}

/** A line of a member's log. `level` is info, warn or error. */
export interface FortressLogLine {
  at: string;
  level: string;
  text: string;
}

export interface StatusViewInput {
  app: FortressApp;
  instance: FortressInstance;
  report?: FortressStatusReport;
  /** Newest first. */
  log?: FortressLogLine[];
  loading?: boolean;
  error?: string;
  text: FortressText;
}

type Tagged = { label: string; tone: BadgeTone } | null;

/** What the status window of a member without pages of its own shows, worked out once for every framework. */
export interface StatusView {
  title: string;
  /** While the report is on its way, the line that says so, in place of everything but `where`. */
  loading: string | undefined;
  /** Why the report did not come, in place of its sections. */
  error: string | undefined;
  state: Tagged;
  needsYou: { text: string; level: Tagged }[];
  work: { title: string; progress?: number }[];
  next: { title: string; at: string }[];
  log: { at: string; text: string; level: Tagged }[];
  /** Said when nothing needs the person, runs or comes next. */
  quiet: string | undefined;
  /** Where an Unraid plugin keeps its settings. Other members leave it out. */
  where: string | undefined;
}

/** The most log lines the window shows. */
export const STATUS_LOG_LINES = 10;

const STATE_TONES: Record<FortressMemberState, BadgeTone> = { off: "neutral", ok: "ok", starting: "active", warning: "warn", overdue: "warn", failed: "fail" };

// Info is the usual case, so only a warning or an error is marked.
function level(text: FortressText, severity: string): Tagged {
  if (severity === "warn") return { label: text.levels.warn, tone: "warn" };
  if (severity === "error") return { label: text.levels.error, tone: "fail" };
  return null;
}

export function statusView({ app, instance, report, log = [], loading, error, text }: StatusViewInput): StatusView {
  const title = memberName(text, app, instance);
  const where = instance.form === "plugin" ? fill(text.statusWhere, { app: app.name, device: instance.device }) : undefined;
  const none = { state: null, needsYou: [], work: [], next: [], log: [], quiet: undefined };
  if (loading) return { ...none, title, where, loading: fill(text.statusLoading, { app: app.name }), error: undefined };
  const lines = log.slice(0, STATUS_LOG_LINES).map((l) => ({ at: l.at, text: l.text, level: level(text, l.level) }));
  if (error !== undefined || !report) return { ...none, title, where, loading: undefined, error, log: lines };
  const known = Object.hasOwn(STATE_TONES, report.state);
  const something = report.needsYou.length + report.work.length + report.next.length > 0;
  return {
    title,
    where,
    loading: undefined,
    error: undefined,
    state: known
      ? { label: text.states[report.state as FortressMemberState], tone: STATE_TONES[report.state as FortressMemberState] }
      : { label: report.state, tone: "neutral" },
    needsYou: report.needsYou.map((n) => ({ text: n.text, level: level(text, n.severity) })),
    work: report.work,
    next: report.next,
    log: lines,
    quiet: something ? undefined : text.statusQuiet,
  };
}

/** How the remove window and the reminder name an instance of another app: "Bravo on Atlas". */
export function memberName(text: FortressText, app: FortressApp, instance: FortressInstance): string {
  return fill(text.memberOn, { app: app.name, device: instance.device });
}

export function presenceTone(presence: FortressPresence): BadgeTone {
  return presence === "connected" ? "ok" : "neutral";
}

export function permissionsWith(permissions: FortressPermission[], app: string): FortressPermission[] {
  return permissions.filter((p) => p.from === app || p.to.includes(app));
}

const SHOW_OTHERS = "fortress-others";

/** Whether this device shows the other apps. It is kept per device, never synced. */
export function storedShowOthers(): boolean {
  try {
    return localStorage.getItem(storageKey(SHOW_OTHERS)) === "1";
  } catch {
    return false;
  }
}

export function storeShowOthers(on: boolean): void {
  try {
    localStorage.setItem(storageKey(SHOW_OTHERS), on ? "1" : "0");
  } catch {
    // The switch still holds until the page reloads.
  }
}

/** The words of a pasted phrase, in lower case, without the numbers a copied list carries. */
export function phraseFromText(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter((w) => w !== "" && !/^\d+[.):]?$/.test(w));
}

/**
 * What typing `typed` into field `at` does: one word stays as typed, a word
 * and a space moves on, and several words fill the fields from there on. The
 * focus goes to the field after the last word, or stays on the last field.
 */
export function enterWords(words: string[], at: number, typed: string): { words: string[]; focus: number } {
  const next = [...words];
  if (!/\s/.test(typed)) {
    next[at] = typed;
    return { words: next, focus: at };
  }
  const found = phraseFromText(typed).slice(0, PHRASE_LENGTH - at);
  if (found.length === 0) {
    next[at] = "";
    return { words: next, focus: at };
  }
  found.forEach((w, i) => (next[at + i] = w));
  return { words: next, focus: Math.min(PHRASE_LENGTH - 1, at + found.length) };
}

export function phraseReady(words: string[]): boolean {
  return words.length === PHRASE_LENGTH && words.every((w) => w.trim() !== "");
}

/** What the app answers to a join, a leave or a removal. Without `ok`, `error` says why, or the flow's own sentence does. */
export interface FortressAnswer {
  ok?: boolean;
  error?: string;
  /** The kit's refusal code for a join, which the flow words through `joinRefusal` where `error` is missing. */
  code?: string;
}

export interface PhraseAnswer {
  words?: string[];
  error?: string;
}

/** The new words, and the devices that were out of reach and still hold the old ones. */
export interface ChangeAnswer {
  words?: string[];
  left?: string[];
  error?: string;
}

/** Each step's answer. A step whose callback is missing does nothing, so the Instances tab and the pairing settings each pass their own. */
export interface FortressHandlers {
  onJoin?: (words: string[]) => Promise<FortressAnswer>;
  onLeave?: () => Promise<FortressAnswer>;
  onRemove?: (id: string) => Promise<FortressAnswer>;
  /** `password` is set where `phrasePassword` asks for it first. */
  onShowPhrase?: (password?: string) => Promise<PhraseAnswer>;
  onChangePhrase?: () => Promise<ChangeAnswer>;
}

export interface FortressFlowOptions extends FortressHandlers {
  /** Said when a callback throws or refuses without a reason. */
  failed: string;
  /** The sentence for a join refused by the kit's code, `joinRefusalText` in the frameworks. */
  joinRefusal?: (code: string) => string;
  /** The phrase opens the fortress to anyone, so an app with a password asks for it before showing the words. */
  phrasePassword?: boolean;
}

export type FortressWindow =
  | { kind: "join"; words: string[]; focus: number }
  | { kind: "joined" }
  | { kind: "leave" }
  | { kind: "remove"; id: string; device: string }
  | { kind: "removed"; device: string }
  | { kind: "phrase"; step: "password" | "words"; password: string; words: string[] }
  | { kind: "change" }
  | { kind: "changed"; words: string[]; left: string[] };

/** The buttons that send something, by their `data-fortress` hook. */
export type FortressButton = "join" | "leave" | "remove" | "unlock" | "show" | "change";

export interface FortressState {
  window: FortressWindow | null;
  busy: FortressButton | null;
  error: string | null;
  /** The last refused button. `count` grows with every refusal, so the same one twice shakes twice. */
  refusal: { button: FortressButton; count: number } | null;
}

export interface FortressFlow {
  state(): FortressState;
  subscribe(listener: () => void): () => void;
  openJoin(): void;
  enter(at: number, typed: string): void;
  join(): Promise<void>;
  openLeave(): void;
  leave(): Promise<void>;
  openRemove(id: string, device: string): void;
  remove(): Promise<void>;
  openPhrase(): Promise<void>;
  setPassword(password: string): void;
  unlock(): Promise<void>;
  openChange(): void;
  change(): Promise<void>;
  /** Closes the window in front, unless it is waiting for an answer. */
  close(): void;
}

const START: FortressState = { window: null, busy: null, error: null, refusal: null };

/**
 * The flow behind the fortress's windows. `options` is read at every step, so
 * a framework hands in its current props rather than the ones it started with.
 */
export function createFortressFlow(options: () => FortressFlowOptions): FortressFlow {
  let state = START;
  const listeners = new Set<() => void>();
  const update = (change: Partial<FortressState>) => {
    state = { ...state, ...change };
    listeners.forEach((fn) => fn());
  };
  const open = (window: FortressWindow) => update({ window, error: null, refusal: null });
  const refuse = (button: FortressButton, error: string) =>
    update({ error, refusal: { button, count: (state.refusal?.count ?? 0) + 1 } });

  async function run<T extends { error?: string }>(button: FortressButton, ask: () => Promise<T>, done: (answer: T) => boolean) {
    if (state.busy) return;
    update({ busy: button, error: null });
    let answer: T | null = null;
    try {
      answer = await ask();
    } catch {
      answer = null;
    }
    update({ busy: null });
    if (!answer || !done(answer)) refuse(button, answer?.error ?? options().failed);
  }

  const shut = (a: FortressAnswer) => {
    if (a.ok) update(START);
    return !!a.ok;
  };

  return {
    state: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    openJoin: () => open({ kind: "join", words: Array<string>(PHRASE_LENGTH).fill(""), focus: 0 }),
    enter(at, typed) {
      const w = state.window;
      if (w?.kind !== "join") return;
      update({ window: { ...w, ...enterWords(w.words, at, typed) } });
    },
    async join() {
      const w = state.window;
      const ask = options().onJoin;
      if (w?.kind !== "join" || !phraseReady(w.words) || !ask) return;
      const words = w.words.map((x) => x.trim().toLowerCase());
      const answer = async () => {
        const a = await ask(words);
        const say = options().joinRefusal;
        return a.ok || a.error || !a.code || !say ? a : { ...a, error: say(a.code) };
      };
      await run("join", answer, (a) => {
        if (a.ok) open({ kind: "joined" });
        return !!a.ok;
      });
    },
    openLeave: () => open({ kind: "leave" }),
    async leave() {
      const ask = options().onLeave;
      if (state.window?.kind === "leave" && ask) await run("leave", () => ask(), shut);
    },
    openRemove: (id, device) => open({ kind: "remove", id, device }),
    async remove() {
      const w = state.window;
      const ask = options().onRemove;
      if (w?.kind !== "remove" || !ask) return;
      // Until the phrase changes the fortress takes no new app, so where the
      // phrase can change here, that is the next question.
      await run("remove", () => ask(w.id), (a) => {
        if (a.ok && options().onChangePhrase) open({ kind: "removed", device: w.device });
        else if (a.ok) update(START);
        return !!a.ok;
      });
    },
    async openPhrase() {
      const { phrasePassword, onShowPhrase } = options();
      if (!onShowPhrase) return;
      if (phrasePassword) return open({ kind: "phrase", step: "password", password: "", words: [] });
      await run("show", () => onShowPhrase(), (a) => {
        if (a.words) open({ kind: "phrase", step: "words", password: "", words: a.words });
        return !!a.words;
      });
    },
    setPassword(password) {
      const w = state.window;
      if (w?.kind === "phrase") update({ window: { ...w, password } });
    },
    async unlock() {
      const w = state.window;
      const ask = options().onShowPhrase;
      if (w?.kind !== "phrase" || w.step !== "password" || w.password === "" || !ask) return;
      await run("unlock", () => ask(w.password), (a) => {
        if (a.words) open({ kind: "phrase", step: "words", password: "", words: a.words });
        return !!a.words;
      });
    },
    openChange: () => open({ kind: "change" }),
    async change() {
      const ask = options().onChangePhrase;
      const kind = state.window?.kind;
      if ((kind !== "change" && kind !== "removed") || !ask) return;
      await run("change", () => ask(), (a) => {
        if (a.words) open({ kind: "changed", words: a.words, left: a.left ?? [] });
        return !!a.words;
      });
    },
    close() {
      if (!state.busy) update(START);
    },
  };
}
