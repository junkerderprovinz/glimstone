// A made-up household for the fortress demos: five placeholder apps on four
// devices. The words that open its fortress are TWELVE, and the password that
// shows them is "letmein".
import {
  fortressTextEn,
  memberName,
  type ChangeAnswer,
  type FortressAnswer,
  type FortressApp,
  type FortressLogLine,
  type FortressPermission,
  type FortressStatusReport,
  type PhraseAnswer,
} from "@glimstone/core";

function mark(letter: string, fill: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${fill}"/><text x="32" y="43" font-family="sans-serif" font-size="30" font-weight="700" text-anchor="middle" fill="#161616">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const TWELVE = "oak lamp tower harbour maple lantern bridge kettle cloud saddle feather lance";

export const HOME = { id: "alpha", name: "Alpha", logo: mark("A", "#FCC419") };

export const APPS: FortressApp[] = [
  {
    id: "bravo",
    name: "Bravo",
    logo: mark("B", "#1D99F3"),
    instances: [
      { id: "b1", device: "Atlas", deviceKind: "server", form: "container", version: "2.7.5", address: "192.168.1.40:8749", presence: "connected", needs: "A captcha waits", open: { href: "#bravo" } },
      { id: "b2", device: "Studio", deviceKind: "pc", form: "extension", version: "2.7.5", presence: "checking" },
      { id: "b3", device: "Pocket", deviceKind: "phone", form: "android", version: "2.7.5", presence: "connected", relay: true },
    ],
  },
  {
    id: "charlie",
    name: "Charlie",
    logo: mark("C", "#6FDC8C"),
    instances: [
      { id: "c1", device: "Studio", deviceKind: "pc", form: "desktop", version: "2.6.2", presence: "connected", open: {} },
      { id: "c2", device: "Pocket", deviceKind: "phone", form: "android", version: "2.6.2", presence: "away", lastSeen: "07:40" },
    ],
  },
  {
    id: "delta",
    name: "Delta",
    logo: mark("D", "#BE95FF"),
    instances: [{ id: "d1", device: "Atlas", deviceKind: "server", form: "plugin", version: "3.7.5", presence: "connected", needs: "2 updates wait", open: { href: "#delta", host: "Unraid" } }],
  },
  {
    id: "echo",
    name: "Echo",
    logo: mark("E", "#3DDBD9"),
    instances: [{ id: "e1", device: "Wanderer", deviceKind: "laptop", form: "desktop", version: "1.4.1", presence: "away", lastSeen: "yesterday" }],
  },
];

export const PERMISSIONS: FortressPermission[] = [
  { id: "delta-alpha", from: "delta", to: ["alpha"], on: true, title: "Delta may ask Alpha for a backup before an update", detail: "Alpha backs up the container, then the update runs." },
  { id: "alpha-bravo-charlie", from: "alpha", to: ["bravo", "charlie"], on: true, title: "Alpha may back up Bravo and Charlie", detail: "Settings and history, every night at 03:00." },
  { id: "bravo-charlie", from: "bravo", to: ["charlie"], on: false, title: "Bravo may start Charlie's jobs", detail: "A finished download starts the matching job." },
  { id: "echo-charlie", from: "echo", to: ["charlie"], on: true, title: "Echo may put files into a Charlie folder", detail: "This one refuses to switch, to show the shake." },
];

const wait = () => new Promise((done) => setTimeout(done, 300));

/** Answers like an app would, and says what it did through `said`. */
export function household(said: (what: string) => void, permissions: () => FortressPermission[], setPermissions: (p: FortressPermission[]) => void) {
  return {
    async onJoin(words: string[]): Promise<FortressAnswer> {
      await wait();
      if (words.join(" ") !== TWELVE) return { error: "These words open no fortress. Check them and try again." };
      said("Joined");
      return { ok: true };
    },
    async onLeave(): Promise<FortressAnswer> {
      await wait();
      said("Left");
      return { ok: true };
    },
    async onRemove(id: string): Promise<FortressAnswer> {
      await wait();
      said(`Removed ${id}`);
      return { ok: true };
    },
    async onShowPhrase(password?: string): Promise<PhraseAnswer> {
      await wait();
      return password === "letmein" ? { words: TWELVE.split(" ") } : { error: "That password is not right." };
    },
    async onChangePhrase(): Promise<ChangeAnswer> {
      await wait();
      said("Changed");
      return { words: TWELVE.split(" ").reverse(), left: ["Wanderer"] };
    },
    async onPermission(id: string, on: boolean): Promise<FortressAnswer> {
      await wait();
      if (id === "echo-charlie") return { error: "Echo is away" };
      setPermissions(permissions().map((p) => (p.id === id ? { ...p, on } : p)));
      return { ok: true };
    },
  };
}

/** The answers the Instances tab takes. Leaving belongs to the pairing settings; the phrase changes here only right after a removal. */
export function instancesTab({ onLeave, ...rest }: ReturnType<typeof household>) {
  return rest;
}

// Pocket is one of Alpha's own instances, the others are instances of other apps.
function nameOf(id: string): string {
  for (const app of APPS) {
    const instance = app.instances.find((i) => i.id === id);
    if (instance) return memberName(fortressTextEn, app, instance);
  }
  return id === "pocket" ? "Pocket" : id;
}

/** Keeps who was removed since the phrase last changed, as an app would, for the line under the switch. */
export function remembering(answers: ReturnType<typeof instancesTab>, removed: () => string[], setRemoved: (names: string[]) => void) {
  return {
    ...answers,
    async onRemove(id: string): Promise<FortressAnswer> {
      const answer = await answers.onRemove(id);
      if (answer.ok) setRemoved([...removed(), nameOf(id)]);
      return answer;
    },
    async onChangePhrase(): Promise<ChangeAnswer> {
      const answer = await answers.onChangePhrase();
      if (answer.words) setRemoved([]);
      return answer;
    },
  };
}

// Opening from anywhere: two members that both claim to be Bravo on Atlas,
// a plugin that opens its status, an app that refuses until it has a password,
// and a phone that has nothing to open.
export const OPEN_APPS: FortressApp[] = [
  {
    id: "bravo",
    name: "Bravo",
    logo: mark("B", "#1D99F3"),
    instances: [
      { id: "b1", device: "Atlas", deviceKind: "server", form: "container", version: "2.7.5", presence: "connected", open: {}, doubt: true, print: "91c0" },
      { id: "b9", device: "Atlas", deviceKind: "server", form: "container", version: "2.7.5", presence: "connected", relay: true, open: {}, doubt: true, print: "0b13" },
      { id: "b3", device: "Pocket", deviceKind: "phone", form: "android", version: "2.7.5", presence: "connected", relay: true },
    ],
  },
  {
    id: "delta",
    name: "Delta",
    logo: mark("D", "#BE95FF"),
    instances: [{ id: "d1", device: "Atlas", deviceKind: "server", form: "plugin", version: "3.7.5", presence: "connected", open: {} }],
  },
  {
    id: "echo",
    name: "Echo",
    logo: mark("E", "#3DDBD9"),
    instances: [{ id: "e1", device: "Wanderer", deviceKind: "laptop", form: "container", version: "1.4.1", presence: "connected", relay: true, open: {} }],
  },
];

export const STATUS_REPORT: FortressStatusReport = {
  state: "warning",
  needsYou: [
    { severity: "warn", text: "2 updates wait" },
    { severity: "info", text: "A new disk was found" },
  ],
  work: [
    { title: "Checking disk 3", progress: 0.4 },
    { title: "Reading the share list" },
  ],
  next: [{ title: "Parity check", at: "Sunday 03:00" }],
};

/** Twelve lines, newest first, of which the window shows ten. */
export const STATUS_LOG: FortressLogLine[] = Array.from({ length: 12 }, (_, i) => ({
  at: `07:${String(59 - i * 4).padStart(2, "0")}`,
  level: i === 1 ? "error" : i === 4 ? "warn" : "info",
  text: i === 1 ? "Disk 3 answered slowly" : i === 4 ? "Update check took long" : `Checked the shares, round ${12 - i}`,
}));
