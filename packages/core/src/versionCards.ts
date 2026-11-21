// The logic behind the Version and Components cards of the Info tile ("The
// Info tile and the About card" in design-language.md): what the update state
// says, which one action it offers, and the order the components stand in.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill } from "./fortressText.ts";
import { releaseTag, shownVersion, type VersionRow } from "./infoTile.ts";
import { GLIMSTONE_REPO, GLIMSTONE_VERSION } from "./version.ts";

/**
 * How an app gets a new version, which decides the one action the Version
 * card offers once there is one: `install` fetches it and restarts the app,
 * `guide` opens the instructions for a container, which cannot replace itself,
 * `plugins` leads to the host's plugin page, and `store` leaves it to the
 * store the app came from, so the card checks nothing.
 */
export type UpdateRoute = "install" | "guide" | "plugins" | "store";

/** Where the app's updates stand. The app finds out; the card only shows it. */
export type UpdateState =
  | { kind: "current"; checkedAt?: Date }
  | { kind: "checking" }
  | { kind: "available"; version: string }
  | { kind: "downloading"; percent: number }
  | { kind: "ready"; version: string }
  | { kind: "failed"; reason?: string }
  | { kind: "store"; store: string };

export type UpdateTone = "neutral" | "ok" | "warn" | "fail";

export interface VersionCardText {
  title: string;
  /** May carry "{app}", which the card fills with the app's name. */
  hint: string;
  whatsNew: string;
  /** A count in the language's digits, for "What's new · 5". */
  count: (n: number) => string;
  check: string;
  checking: string;
  current: string;
  checked: (at: Date, now?: Date) => string;
  available: (version: string) => string;
  failed: string;
  downloading: (percent: number) => string;
  ready: (version: string) => string;
  update: string;
  restart: (version: string) => string;
  guide: string;
  plugins: string;
  store: (store: string) => string;
  auto: string;
  autoHint: string;
  autoCheck: string;
  autoCheckHint: string;
  unreleased: (version: string) => string;
}

export interface ComponentsCardText {
  title: string;
  hint: string;
  auto: string;
  autoHint: string;
  update: string;
  /** The sub-line under the design language's row. */
  design: string;
  /** The sub-line under the installer's row, for a desktop build. */
  installer: string;
  unreleased: (version: string) => string;
}

/** A time before now in the language's words: "3 minutes ago", "yesterday". */
export function timeAgo(at: Date, lang: string, now: Date = new Date()): string {
  const seconds = Math.round((at.getTime() - now.getTime()) / 1000);
  const format = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", Infinity],
  ];
  let value = seconds;
  for (const [unit, size] of steps) {
    if (Math.abs(value) < size) return format.format(unit === "second" ? 0 : value, unit);
    value = Math.round(value / size);
  }
  return format.format(value, "day");
}

/** The Version card's words from a language's table, its numbers in that language's digits. */
export function versionCardText(w: ComponentWords["versionCard"], lang: string): VersionCardText {
  return {
    title: w.title,
    hint: w.hint,
    whatsNew: w.whatsNew,
    count: (n) => n.toLocaleString(lang),
    check: w.check,
    checking: w.checking,
    current: w.current,
    checked: (at, now) => fill(w.checked, { when: timeAgo(at, lang, now) }),
    available: (version) => fill(w.available, { version }),
    failed: w.failed,
    downloading: (percent) => fill(w.downloading, { percent: (percent / 100).toLocaleString(lang, { style: "percent" }) }),
    ready: (version) => fill(w.ready, { version }),
    update: w.update,
    restart: (version) => fill(w.restart, { version }),
    guide: w.guide,
    plugins: w.plugins,
    store: (store) => fill(w.store, { store }),
    auto: w.auto,
    autoHint: w.autoHint,
    autoCheck: w.autoCheck,
    autoCheckHint: w.autoCheckHint,
    unreleased: (version) => fill(w.unreleased, { version }),
  };
}

export function componentsCardText(w: ComponentWords["componentsCard"]): ComponentsCardText {
  return { ...w, unreleased: (version) => fill(w.unreleased, { version }) };
}

export const VERSION_CARD_TEXT: VersionCardText = versionCardText(en.versionCard, "en");
export const COMPONENTS_CARD_TEXT: ComponentsCardText = componentsCardText(en.componentsCard);

/** Puts the app's name where a sentence says "{app}". */
export function withApp(sentence: string, app: string): string {
  return fill(sentence, { app });
}

/**
 * The line under the app's version: what the state says, in which tone, and a
 * quieter note after it. A line that names a new version also comes split
 * around it, so the card can make that number the link to its release.
 */
export function updateLine(
  state: UpdateState,
  text: VersionCardText,
  now?: Date,
): { line: string; tone: UpdateTone; note?: string; version?: { number: string; before: string; after: string } } {
  switch (state.kind) {
    case "current":
      return { line: text.current, tone: "ok", note: state.checkedAt && text.checked(state.checkedAt, now) };
    case "checking":
      return { line: text.checking, tone: "neutral" };
    case "available":
      return around(text.available(state.version), state.version, "warn");
    case "downloading":
      return { line: text.downloading(state.percent), tone: "neutral" };
    case "ready":
      return around(text.ready(state.version), state.version, "ok");
    case "failed":
      return { line: text.failed, tone: "fail", note: state.reason };
    case "store":
      return { line: text.store(state.store), tone: "neutral" };
  }
}

function around(line: string, number: string, tone: UpdateTone) {
  const at = line.indexOf(number);
  if (at < 0) return { line, tone };
  return { line, tone, version: { number, before: line.slice(0, at), after: line.slice(at + number.length) } };
}

export type UpdateActionKind = "update" | "restart" | "guide" | "plugins";

/**
 * The one button the Version card shows, or null. There is only something to
 * press once a new version is there, and what it does follows the route.
 */
export function updateAction(route: UpdateRoute, state: UpdateState, text: VersionCardText): { kind: UpdateActionKind; label: string; labelKey: string } | null {
  if (state.kind === "ready" && route === "install") return { kind: "restart", label: text.restart(state.version), labelKey: "version.restart" };
  if (state.kind !== "available") return null;
  switch (route) {
    case "install":
      return { kind: "update", label: text.update, labelKey: "version.update" };
    case "guide":
      return { kind: "guide", label: text.guide, labelKey: "version.guide" };
    case "plugins":
      return { kind: "plugins", label: text.plugins, labelKey: "version.plugins" };
    case "store":
      return null;
  }
}

/** Whether "Check for updates" can be pressed: never for a store app, and not while one runs. */
export function canCheck(route: UpdateRoute, state: UpdateState): boolean {
  return route !== "store" && state.kind !== "checking" && state.kind !== "downloading";
}

/** The switch under the state: an app that installs updates itself, or one that only looks for them. */
export function autoSwitch(route: UpdateRoute, text: VersionCardText): { label: string; hint: string } | null {
  if (route === "install") return { label: text.auto, hint: text.autoHint };
  if (route === "guide") return { label: text.autoCheck, hint: text.autoCheckHint };
  return null;
}

/** "What's new · 5" while something is unseen, the bare word once nothing is. */
export function whatsNewLabel(text: VersionCardText, unseen = 0): string {
  return unseen > 0 ? `${text.whatsNew} · ${text.count(unseen)}` : text.whatsNew;
}

/**
 * What a row in the Components card is: one of the app's own parts (an engine,
 * a server), a program it brings along, the design language, or the installer
 * of a desktop build. The card sorts by it.
 */
export type ComponentKind = "part" | "tool" | "design" | "installer";

export interface ComponentRow extends VersionRow {
  kind?: ComponentKind;
  /** Where the newest release is told about, for a project that publishes no
   *  releases in its repository, such as a download page. */
  releasePage?: string;
  /** A short state at the row's end, such as "Updated" or "Missing". */
  status?: string;
  tone?: UpdateTone;
  /** One thing to do on this row, such as fetching a missing program. */
  action?: { label: string; labelKey: string; onClick: () => void };
}

const KIND_ORDER: ComponentKind[] = ["part", "tool", "design", "installer"];

/**
 * The rows in the card's fixed order: the app's own parts as the app lists
 * them, then the programs it brings along by name, then the design language,
 * then the installer.
 */
export function componentRows(rows: ComponentRow[]): ComponentRow[] {
  const rank = (r: ComponentRow) => KIND_ORDER.indexOf(r.kind ?? "tool");
  return rows
    .map((row, at) => ({ row, at }))
    .sort((a, b) => {
      const byKind = rank(a.row) - rank(b.row);
      if (byKind) return byKind;
      if ((a.row.kind ?? "tool") === "tool") return a.row.name.localeCompare(b.row.name, "en", { sensitivity: "base" });
      return a.at - b.at;
    })
    .map(({ row }) => row);
}

/** The design language's row, read from the package that ships it, so it is never typed in. */
export function designRow(text: ComponentsCardText): ComponentRow {
  return { name: "GlimStone", sub: text.design, version: GLIMSTONE_VERSION, repoUrl: GLIMSTONE_REPO, kind: "design" };
}

/**
 * The number and where it leads. Every version opens the newest release of its
 * project, so a number never leads to a page a folded patch tag has taken
 * away. A number with dots, such as "26.01" or "2.9.4", is a release; a build
 * stamp such as "dev" is one only where no repository says otherwise.
 */
export function numberLink(row: VersionRow & { releasePage?: string }): { shown: string; released: boolean; href?: string } {
  const shown = shownVersion(row.version);
  if (row.releasePage) return { shown, released: true, href: row.releasePage };
  if (!row.repoUrl) return { shown, released: true };
  const released = /^v\d+(\.\d+)+$/.test(releaseTag(row.version));
  return released ? { shown, released, href: `${row.repoUrl}/releases/latest` } : { shown, released };
}
