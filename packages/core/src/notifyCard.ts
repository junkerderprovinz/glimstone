// The notification card's flow without a framework ("The notification card"
// in the design language): an app's channels as the kit's notify package
// stores them, each a row with its switch, its test, Edit and Remove, the
// catalog's picker to add one and the form of each kind. The app hands in
// three calls, so the card never names an app or a route of its own.

import { catalogPicker, type Catalog } from "./catalog.ts";
import type { ConnectionTest } from "./connectionRow.ts";
import { fill } from "./fortressText.ts";
import type { NotifyGroup } from "./notifyProviders.ts";
import type { PickGroup, PickItem, TileMark } from "./picker.ts";
import { shake } from "./selectModel.ts";
import type { ToastSeverity } from "./toastEngine.ts";

/** The services the kit delivers to, in its own spelling. */
export type NotifyKind = "unraid" | "ntfy" | "gotify" | "discord" | "slack" | "matrix" | "smtp" | "apprise" | "webhook" | "healthchecks";

export const NOTIFY_KINDS: readonly NotifyKind[] = ["unraid", "ntfy", "gotify", "discord", "slack", "matrix", "smtp", "apprise", "webhook", "healthchecks"];

/** Which events a channel carries by their severity. Empty means `failure`. */
export type NotifyOn = "never" | "failure" | "always";

/** What the kit sends in place of a stored secret, and takes back as the secret unchanged. */
export const NOTIFY_REDACTED = "********";

/** One stored channel, the kit's `notify.Channel`. Only the block named by `kind` is read, and an Unraid channel has none. */
export interface NotifyChannel {
  id: string;
  kind: NotifyKind;
  name?: string;
  enabled: boolean;
  on?: NotifyOn | "";
  /** The event kinds the channel carries. Empty means every kind. */
  events?: string[];
  attempts?: number;
  timeoutSeconds?: number;
  webhook?: { url: string; method?: string; headers?: Record<string, string>; body?: string };
  discord?: { url: string };
  slack?: { url: string };
  gotify?: { url: string; token?: string; priorityFailure?: number; prioritySuccess?: number };
  ntfy?: { url: string; token?: string };
  matrix?: { homeserver: string; room: string; token: string };
  smtp?: { host: string; port?: number; username?: string; password?: string; from: string; to: string; tls?: string };
  apprise?: { url: string; urls?: string[]; tags?: string };
  /** `byKey` gives an event key a check of its own in place of `url`. */
  healthchecks?: { url?: string; byKey?: Record<string, string> };
}

/** The channels, and whatever else the app keeps beside them, which the card sends back as it came. */
export interface NotifyConfig {
  channels: NotifyChannel[];
  [field: string]: unknown;
}

/** One reason the kit refused a channel: `index` into the channels sent, `field` the path inside it, such as `gotify.url`. */
export interface NotifyProblem {
  index: number;
  channel?: string;
  field?: string;
  code: string;
}

/** How a save came back: taken, refused with the kit's problems, or failed with the app's own words. */
export type NotifySaveAnswer = { ok: true } | { ok: false; problems?: NotifyProblem[]; message?: string };

/** How a test came back: delivered, or not, with the kit's result code or the app's own words. */
export type NotifyTestAnswer = { ok: true } | { ok: false; code?: string; message?: string };

/** The three calls the app makes for the card. `load` answers the config with every secret as `NOTIFY_REDACTED`. */
export interface NotifyApi {
  load(): Promise<NotifyConfig>;
  save(config: NotifyConfig): Promise<NotifySaveAnswer>;
  test(channel: NotifyChannel): Promise<NotifyTestAnswer>;
}

/** An event kind or a check key the app offers, by its id and its name in the app's language. */
export interface NotifyChoice {
  id: string;
  label: string;
}

export type NotifyProblemWord = "missingField" | "badUrl" | "badTemplate" | "badHeader" | "badPriority" | "badPort" | "other";
export type NotifyResultWord =
  | "reach"
  | "tls"
  | "timeout"
  | "auth"
  | "notFound"
  | "redirect"
  | "rejected"
  | "rateLimited"
  | "server"
  | "script"
  | "noStarttls"
  | "invalid"
  | "canceled";

/** The card's words, translated: `notifyCardText(lang)`. `{app}`, `{name}` and `{list}` are filled in. */
export interface NotifyCardText {
  title: string;
  hint: string;
  /** In place of the rows while there is no channel. */
  empty: string;
  add: string;
  search: string;
  noMatch: string;
  /** The button that empties the picker's search. */
  clear: string;
  groups: Record<NotifyGroup, string>;
  /** Email's tile in the picker. */
  email: string;
  kinds: Record<NotifyKind, string>;
  /** The line at the top of a kind's form. */
  kindHints: Partial<Record<NotifyKind, string>>;
  on: string;
  onNever: string;
  onFailure: string;
  onAlways: string;
  /** A row's quiet line while its switch is off. */
  off: string;
  /** The badge of a channel that is on where its kind cannot send. */
  idle: string;
  noAddress: string;
  test: string;
  /** What a passed test says, and a failed one the card has no sentence for. */
  sent: string;
  notSent: string;
  edit: string;
  editTitle: string;
  remove: string;
  removeQuestion: string;
  cancel: string;
  close: string;
  back: string;
  save: string;
  saved: string;
  failed: string;
  /** The line in place of the rows when the load failed, so nothing saves over the stored channels. */
  notLoaded: string;
  /** The reveal eye's name while a secret is hidden, and once it shows. */
  show: string;
  hide: string;
  name: string;
  events: string;
  eventsHint: string;
  /** The (i) of the ping URL while the app offers checks of their own. */
  checksHint: string;
  secretKept: string;
  secretAgain: string;
  tlsNone: string;
  /** The (i) of a webhook's body, with the placeholders as `{list}`. */
  bodyHint: string;
  fields: {
    webhookUrl: string;
    method: string;
    headers: string;
    headerName: string;
    headerValue: string;
    headerAdd: string;
    headerRemove: string;
    body: string;
    ntfyUrl: string;
    ntfyToken: string;
    gotifyUrl: string;
    gotifyToken: string;
    priorityFailure: string;
    prioritySuccess: string;
    matrixHomeserver: string;
    matrixToken: string;
    matrixRoom: string;
    smtpHost: string;
    smtpPort: string;
    smtpTls: string;
    smtpUser: string;
    smtpPass: string;
    smtpFrom: string;
    smtpTo: string;
    appriseUrl: string;
    appriseTags: string;
    appriseUrls: string;
    appriseUrlsHint: string;
    pingUrl: string;
  };
  problems: Record<NotifyProblemWord, string>;
  results: Record<NotifyResultWord, string>;
}

/** The label keys behind the card's buttons and tiles, which pick their glyphs (see Button). */
export interface NotifyCardLabelKeys {
  add: string;
  test: string;
  edit: string;
  remove: string;
  save: string;
  /** The tile of email, and of a webhook. */
  email: string;
  webhook: string;
}

export const NOTIFY_CARD_KEYS: NotifyCardLabelKeys = {
  add: "add",
  test: "test",
  edit: "edit",
  remove: "delete",
  save: "save",
  email: "mail",
  webhook: "link",
};

/** The JSON a new webhook posts. */
export const NOTIFY_WEBHOOK_BODY = '{"title":"%%title%%","message":"%%body%%","ok":%%ok%%}';

/** The names a webhook's address, headers and body may hold as %%name%%. */
export const NOTIFY_PLACEHOLDERS = ["event", "severity", "ok", "title", "body", "link", "key", "time", "source", "importance"];

/** A new channel of `kind`, on, with an id no channel in `taken` has. */
export function newNotifyChannel(kind: NotifyKind, taken: readonly NotifyChannel[]): NotifyChannel {
  const c: NotifyChannel = { id: freeId(kind, taken), kind, enabled: true, on: kind === "healthchecks" ? "always" : "failure" };
  switch (kind) {
    case "webhook":
      c.webhook = { url: "", method: "POST", headers: { "Content-Type": "application/json" }, body: NOTIFY_WEBHOOK_BODY };
      break;
    case "discord":
      c.discord = { url: "" };
      break;
    case "slack":
      c.slack = { url: "" };
      break;
    case "gotify":
      c.gotify = { url: "", token: "", priorityFailure: 8, prioritySuccess: 5 };
      break;
    case "ntfy":
      c.ntfy = { url: "", token: "" };
      break;
    case "matrix":
      c.matrix = { homeserver: "", room: "", token: "" };
      break;
    case "smtp":
      c.smtp = { host: "", port: 587, username: "", password: "", from: "", to: "", tls: "starttls" };
      break;
    case "apprise":
      c.apprise = { url: "", tags: "" };
      break;
    case "healthchecks":
      c.healthchecks = { url: "", byKey: {} };
      break;
  }
  return c;
}

function freeId(kind: NotifyKind, taken: readonly NotifyChannel[]): string {
  const ids = new Set(taken.map((c) => c.id));
  if (!ids.has(kind)) return kind;
  let n = 2;
  while (ids.has(`${kind}-${n}`)) n++;
  return `${kind}-${n}`;
}

/** Where a channel sends, as its row names it, or "" while that is not filled in. Unraid sends to the server it runs on. */
export function notifyTarget(c: NotifyChannel): string {
  switch (c.kind) {
    case "matrix":
      return [c.matrix?.room, c.matrix?.homeserver]
        .map((s) => s?.trim())
        .filter(Boolean)
        .join(", ");
    case "smtp":
      return c.smtp?.to.trim() ?? "";
    case "apprise":
      return (c.apprise?.url.trim() || c.apprise?.urls?.find((u) => u.trim() !== "")?.trim()) ?? "";
    case "unraid":
      return "";
    default:
      return c[c.kind]?.url?.trim() ?? "";
  }
}

/** A channel's name on its row: its own, or its kind's. */
export function notifyChannelName(text: NotifyCardText, c: Pick<NotifyChannel, "name" | "kind">): string {
  return c.name?.trim() || text.kinds[c.kind];
}

/** The catalog's mark of a kind, or `null` for email and a webhook, which wear the app's glyph. */
export function notifyMark(providers: Catalog, kind: NotifyKind): TileMark | null {
  return providers.entries.find((e) => e.id === kind)?.mark ?? null;
}

/** The label key of the glyph a kind without a mark wears. */
export function notifyGlyphKey(kind: NotifyKind, keys: NotifyCardLabelKeys): string {
  return kind === "smtp" ? keys.email : keys.webhook;
}

/** The picker's tiles for the kinds an app offers: the services by their marks, then email and the webhook, last. `M` is the framework's kind of glyph. */
export function notifyPicker<M>(
  providers: Catalog,
  text: NotifyCardText,
  lang: string,
  kinds: readonly NotifyKind[],
  glyph: (kind: NotifyKind) => M,
): { items: PickItem<M>[]; groups: PickGroup[] } {
  return catalogPicker(providers, {
    ids: kinds,
    titles: Object.fromEntries(providers.groups.map((g) => [g, text.groups[g as NotifyGroup] ?? g])),
    glyph: (entry) => glyph(entry.id as NotifyKind),
    lang,
    own: (entry) => {
      if (entry.id === "smtp") return { label: text.email };
      if (entry.id === "webhook") return { label: text.kinds.webhook };
      return undefined;
    },
  });
}

/** A secret and the fields that name where it goes. The kit gives a stored secret back only to the place it was saved for. */
interface SecretPlace {
  secret: (c: NotifyChannel) => string | undefined;
  places: (c: NotifyChannel) => unknown[];
  /** `c` with the places of `prev`, so a moved address waits for its secret. */
  hold: (c: NotifyChannel, prev: NotifyChannel) => NotifyChannel;
}

const SECRET_PLACES: Partial<Record<NotifyKind, SecretPlace>> = {
  gotify: {
    secret: (c) => c.gotify?.token,
    places: (c) => [c.gotify?.url],
    hold: (c, prev) => ({ ...c, gotify: { ...c.gotify!, url: prev.gotify!.url } }),
  },
  ntfy: {
    secret: (c) => c.ntfy?.token,
    places: (c) => [c.ntfy?.url],
    hold: (c, prev) => ({ ...c, ntfy: { ...c.ntfy!, url: prev.ntfy!.url } }),
  },
  matrix: {
    secret: (c) => c.matrix?.token,
    places: (c) => [c.matrix?.homeserver],
    hold: (c, prev) => ({ ...c, matrix: { ...c.matrix!, homeserver: prev.matrix!.homeserver } }),
  },
  smtp: {
    secret: (c) => c.smtp?.password,
    places: (c) => [c.smtp?.host, c.smtp?.port, c.smtp?.username],
    hold: (c, prev) => ({ ...c, smtp: { ...c.smtp!, host: prev.smtp!.host, port: prev.smtp!.port, username: prev.smtp!.username } }),
  },
  webhook: {
    // Any header kept from before ties the address down.
    secret: (c) => (Object.values(c.webhook?.headers ?? {}).includes(NOTIFY_REDACTED) ? NOTIFY_REDACTED : ""),
    places: (c) => [c.webhook?.url.trim()],
    hold: (c, prev) => ({ ...c, webhook: { ...c.webhook!, url: prev.webhook!.url } }),
  },
};

/** The paths of the fields that hold a secret, which the kit never hands back. */
export const NOTIFY_SECRET_PATHS = ["gotify.token", "ntfy.token", "matrix.token", "smtp.password"];

/** The channel as the kit last took it, matched by id and kind. */
export function savedChannel(c: NotifyChannel, saved: readonly NotifyChannel[]): NotifyChannel | undefined {
  return saved.find((p) => p.id === c.id && p.kind === c.kind);
}

/** Whether the kit holds the channel's secret. */
export function notifyHasSecret(c: NotifyChannel, saved: readonly NotifyChannel[]): boolean {
  const prev = savedChannel(c, saved);
  const s = SECRET_PLACES[c.kind];
  return !!prev && !!s && !!s.secret(prev);
}

/** Whether `c` points somewhere new while its secret is still the stored one, which the kit would drop. */
export function notifyWaitsForSecret(c: NotifyChannel, saved: readonly NotifyChannel[]): boolean {
  const prev = savedChannel(c, saved);
  const s = SECRET_PLACES[c.kind];
  if (!prev || !s || s.secret(c) !== NOTIFY_REDACTED || !s.secret(prev)) return false;
  return JSON.stringify(s.places(c)) !== JSON.stringify(s.places(prev));
}

/** A channel as the card sends it: a moved address that waits for its secret goes out as it was, and rows left blank stay out. */
export function notifyOutgoingChannel(c: NotifyChannel, saved: readonly NotifyChannel[]): NotifyChannel {
  let out = c;
  if (notifyWaitsForSecret(c, saved)) out = SECRET_PLACES[c.kind]!.hold(c, savedChannel(c, saved)!);
  if (out.healthchecks?.byKey) {
    const byKey = Object.fromEntries(Object.entries(out.healthchecks.byKey).filter(([, u]) => u.trim() !== ""));
    out = { ...out, healthchecks: { ...out.healthchecks, byKey } };
  }
  if (out.apprise?.urls) {
    const urls = out.apprise.urls.map((u) => u.trim()).filter((u) => u !== "");
    const apprise = { ...out.apprise };
    if (urls.length > 0) apprise.urls = urls;
    else delete apprise.urls;
    out = { ...out, apprise };
  }
  return out;
}

/** The config as the card sends it, every channel through `notifyOutgoingChannel`. */
export function notifyOutgoing(config: NotifyConfig, saved: readonly NotifyChannel[]): NotifyConfig {
  return { ...config, channels: config.channels.map((c) => notifyOutgoingChannel(c, saved)) };
}

/** A refusal tied to one channel. `field` is the path inside it, empty for the channel as a whole. */
export interface NotifyPlacedProblem {
  channel: string;
  field: string;
  code: string;
}

/** Puts each problem on the channel it was about. */
export function placeNotifyProblems(sent: NotifyConfig, problems: readonly NotifyProblem[]): NotifyPlacedProblem[] {
  return problems.map((p) => ({ channel: sent.channels[p.index]?.id ?? p.channel ?? "", field: p.field ?? "", code: p.code }));
}

const PROBLEM_WORD: Record<string, NotifyProblemWord> = {
  missing_field: "missingField",
  bad_url: "badUrl",
  bad_template: "badTemplate",
  bad_header: "badHeader",
  bad_priority: "badPriority",
  bad_port: "badPort",
};

/** The sentence for one of the kit's problem codes. */
export function notifyProblemText(text: NotifyCardText, code: string): string {
  return text.problems[PROBLEM_WORD[code] ?? "other"];
}

const RESULT_WORD: Record<string, NotifyResultWord> = {
  dns: "reach",
  refused: "reach",
  network: "reach",
  tls: "tls",
  timeout: "timeout",
  auth: "auth",
  not_found: "notFound",
  redirect: "redirect",
  rejected: "rejected",
  rate_limited: "rateLimited",
  server: "server",
  script: "script",
  no_starttls: "noStarttls",
  invalid: "invalid",
  canceled: "canceled",
};

/** Why a test did not go through: the app's own words, the sentence for the kit's code, or just that it was not sent. */
export function notifyResultText(text: NotifyCardText, app: string, answer: { code?: string; message?: string }): string {
  if (answer.message) return answer.message;
  const word = answer.code ? RESULT_WORD[answer.code] : undefined;
  return fill(word ? text.results[word] : text.notSent, { app });
}

/** A row's quiet line: how its last test went, else where it sends and when, or that it is off. */
export function notifyRowStatus(text: NotifyCardText, c: NotifyChannel, test: ConnectionTest | undefined): string {
  if (test?.title && !test.busy) return test.title;
  if (!c.enabled) return text.off;
  const on = c.on || "failure";
  return on === "never" ? text.onNever : on === "always" ? text.onAlways : text.onFailure;
}

function under(field: string, path: string): boolean {
  return field === path || field.startsWith(path + ".");
}

/** A webhook header as one row of the form. A row without a name stays in the form only, since a header needs one. */
export interface NotifyHeaderRow {
  name: string;
  value: string;
}

/** How a field of the form is drawn. */
export type NotifyFieldControl = "text" | "secret" | "number" | "select" | "area" | "segments" | "checks" | "headers";

/** One row of a channel's form, ready to draw. */
export interface NotifyField {
  /** The path inside the channel, which `set` takes and the kit's problems name. */
  path: string;
  label: string;
  control: NotifyFieldControl;
  /** The value as the control shows it. A stored secret shows empty. */
  value: string;
  /** The (i) beside the label. */
  hint?: string;
  /** The quiet line under a secret, while the kit holds it. */
  note?: string;
  mono?: boolean;
  placeholder?: string;
  /** The choices of a select or a strip of segments, and the boxes of `checks`, each ticked or not. */
  options?: { value: string; label: string; checked?: boolean }[];
  /** Why the kit refused the value, as the line under the field. */
  error?: string;
}

/** What the form draws above and in its rows. */
export interface NotifyForm {
  kind: NotifyKind;
  /** The kind's line at the top of the form. */
  hint?: string;
  /** Why the kind sends nothing here, from the app. */
  unavailable?: string;
  /** The problems that belong to no field. */
  loose: string[];
  fields: NotifyField[];
  headers: NotifyHeaderRow[];
}

const PRIORITIES = Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: String(i) }));

/** The form of the channel in `s.draft`, as every framework draws it. */
export function notifyForm(s: NotifyCardState, o: Pick<NotifyCardOptions, "text" | "app" | "events" | "checks" | "unavailable">): NotifyForm | null {
  const c = s.draft;
  if (!c) return null;
  const { text } = o;
  const f = text.fields;
  const saved = s.channels;
  const errors = (path: string) => {
    const lines = s.problems.filter((p) => under(p.field, path)).map((p) => notifyProblemText(text, p.code));
    return lines.length > 0 ? lines.join(" ") : undefined;
  };
  const block = (path: string) => {
    const [b, k] = path.split(".");
    return (c as unknown as Record<string, Record<string, unknown> | undefined>)[b!]?.[k!];
  };
  const field = (path: string, label: string, control: NotifyFieldControl, more: Partial<NotifyField> = {}): NotifyField => {
    const raw = block(path);
    const value = raw === undefined || raw === null ? "" : String(raw);
    const out: NotifyField = { path, label, control, value, ...more };
    const error = errors(path);
    if (error) out.error = error;
    return out;
  };
  const url = (path: string, label: string, placeholder: string, more: Partial<NotifyField> = {}) => field(path, label, "text", { mono: true, placeholder, ...more });
  const secret = (path: string, label: string) => {
    const kept = block(path) === NOTIFY_REDACTED;
    const out = field(path, label, "secret");
    if (kept) {
      out.value = "";
      out.note = notifyWaitsForSecret(c, saved) ? text.secretAgain : text.secretKept;
    }
    return out;
  };

  const fields: NotifyField[] = [];
  if (c.kind !== "healthchecks") {
    fields.push({
      path: "on",
      label: text.on,
      control: "segments",
      value: c.on || "failure",
      options: [
        { value: "never", label: text.onNever },
        { value: "failure", label: text.onFailure },
        { value: "always", label: text.onAlways },
      ],
      ...(errors("on") ? { error: errors("on") } : {}),
    });
    if (o.events.length > 0) {
      const chosen = c.events ?? [];
      fields.push({
        path: "events",
        label: text.events,
        control: "checks",
        value: "",
        hint: fill(text.eventsHint, { app: o.app }),
        options: o.events.map((e) => ({ value: e.id, label: e.label, checked: chosen.length === 0 || chosen.includes(e.id) })),
      });
    }
  }
  fields.push({ path: "name", label: text.name, control: "text", value: c.name ?? "", placeholder: text.kinds[c.kind] });

  switch (c.kind) {
    case "discord":
      fields.push(url("discord.url", f.webhookUrl, "https://discord.com/api/webhooks/..."));
      break;
    case "slack":
      fields.push(url("slack.url", f.webhookUrl, "https://hooks.slack.com/services/..."));
      break;
    case "ntfy":
      fields.push(url("ntfy.url", f.ntfyUrl, "https://ntfy.sh/my-topic"), secret("ntfy.token", f.ntfyToken));
      break;
    case "gotify":
      fields.push(
        url("gotify.url", f.gotifyUrl, "https://gotify.example.com"),
        secret("gotify.token", f.gotifyToken),
        field("gotify.priorityFailure", f.priorityFailure, "select", { options: PRIORITIES }),
        field("gotify.prioritySuccess", f.prioritySuccess, "select", { options: PRIORITIES }),
      );
      break;
    case "matrix":
      fields.push(
        url("matrix.homeserver", f.matrixHomeserver, "https://matrix.org"),
        secret("matrix.token", f.matrixToken),
        url("matrix.room", f.matrixRoom, "!abcdef:matrix.org"),
      );
      break;
    case "smtp": {
      const port = field("smtp.port", f.smtpPort, "number", { placeholder: "587" });
      if (port.value === "0") port.value = "";
      fields.push(
        url("smtp.host", f.smtpHost, "smtp.example.com"),
        port,
        field("smtp.tls", f.smtpTls, "select", {
          value: c.smtp?.tls || "starttls",
          options: [
            { value: "starttls", label: "STARTTLS" },
            { value: "tls", label: "TLS" },
            { value: "none", label: text.tlsNone },
          ],
        }),
        field("smtp.username", f.smtpUser, "text"),
        secret("smtp.password", f.smtpPass),
        url("smtp.from", f.smtpFrom, "notify@example.com"),
        url("smtp.to", f.smtpTo, "admin@example.com"),
      );
      break;
    }
    case "apprise":
      fields.push(
        url("apprise.url", f.appriseUrl, "http://apprise:8000/notify/apps"),
        field("apprise.tags", f.appriseTags, "text", { placeholder: "alerts,homelab" }),
        field("apprise.urls", f.appriseUrls, "area", { value: (c.apprise?.urls ?? []).join("\n"), mono: true, hint: f.appriseUrlsHint, placeholder: "tgram://bottoken/ChatID" }),
      );
      break;
    case "webhook":
      fields.push(
        url("webhook.url", f.webhookUrl, "https://hooks.example.com/in"),
        field("webhook.method", f.method, "select", {
          value: (c.webhook?.method || "POST").toUpperCase(),
          options: ["GET", "POST", "PUT"].map((m) => ({ value: m, label: m })),
        }),
        field("webhook.headers", f.headers, "headers", {
          ...(Object.values(c.webhook?.headers ?? {}).includes(NOTIFY_REDACTED)
            ? { note: notifyWaitsForSecret(c, saved) ? text.secretAgain : text.secretKept }
            : {}),
        }),
        field("webhook.body", f.body, "area", { mono: true, hint: fill(text.bodyHint, { list: NOTIFY_PLACEHOLDERS.map((p) => `%%${p}%%`).join(", ") }) }),
      );
      break;
    case "healthchecks": {
      fields.push(url("healthchecks.url", f.pingUrl, "https://hc-ping.com/your-uuid", o.checks.length > 0 ? { hint: text.checksHint } : {}));
      for (const check of o.checks) {
        const path = `healthchecks.byKey.${check.id}`;
        const out: NotifyField = { path, label: check.label, control: "text", value: c.healthchecks?.byKey?.[check.id] ?? "", mono: true, placeholder: "https://hc-ping.com/your-uuid" };
        const error = errors(path);
        if (error) out.error = error;
        fields.push(out);
      }
      break;
    }
    case "unraid":
      break;
  }

  const hint = text.kindHints[c.kind];
  const form: NotifyForm = {
    kind: c.kind,
    loose: s.problems.filter((p) => !fields.some((x) => under(p.field, x.path))).map((p) => notifyProblemText(text, p.code)),
    fields,
    headers: s.headers,
  };
  if (hint) form.hint = fill(hint, { app: o.app });
  const away = o.unavailable[c.kind];
  if (away) form.unavailable = away;
  return form;
}

export type NotifyCardWindow = { kind: "pick" } | { kind: "form"; adding: boolean };

export interface NotifyCardState {
  /** The channels came in. Until then nothing saves, since a save replaces every stored channel. */
  loaded: boolean;
  loadFailed: boolean;
  /** The channels as the kit last took them. */
  channels: NotifyChannel[];
  window: NotifyCardWindow | null;
  /** The channel in the open form. */
  draft: NotifyChannel | null;
  /** The draft's webhook headers, row by row. */
  headers: NotifyHeaderRow[];
  /** The kit's refusals of the draft, by field. */
  problems: { field: string; code: string }[];
  /** The test of the draft, and of each row by the channel's id. */
  formTest: ConnectionTest | undefined;
  rowTests: Record<string, ConnectionTest>;
  /** The `data-notify` hook of the control whose work runs. */
  busy: string | null;
  /** The control that shakes, by its `data-notify` hook. `count` grows with every refusal. */
  refusal: { hook: string; count: number } | null;
  /** What the last try in the form came to, as the line under it. */
  said: { ok: boolean; message: string } | null;
}

export interface NotifyCardOptions {
  api: NotifyApi;
  text: NotifyCardText;
  /** The app's name, for the sentences that say it. */
  app: string;
  lang: string;
  /** The notification catalog, `NOTIFY_PROVIDERS`, which gives the picker its tiles and each row its mark. */
  providers: Catalog;
  /** The kinds the picker offers. */
  kinds: readonly NotifyKind[];
  /** The event kinds the app sends, which a channel can choose among. None leaves the choice out. */
  events: readonly NotifyChoice[];
  /** The keys a Healthchecks channel can give a check of their own, such as a job. */
  checks: readonly NotifyChoice[];
  /** Kinds that send nothing where the app runs, with the sentence that says why. */
  unavailable: Partial<Record<NotifyKind, string>>;
  notify?: (message: string, severity: ToastSeverity) => void;
}

export interface NotifyCardFlow {
  state(): NotifyCardState;
  subscribe(listener: () => void): () => void;
  /** Reads the channels. Returns the stop. */
  start(): () => void;
  /** Opens the picker. */
  pick(): void;
  /** Starts a new channel of the picked kind in the picker's form. */
  choose(kind: string): void;
  edit(id: string): void;
  close(): void;
  /** Sets a field of the draft by its path, as `NotifyField.path` names it. */
  set(path: string, value: string): void;
  /** Ticks an event kind on or off. The last ticked one stays. */
  setEvent(id: string, on: boolean): void;
  setHeader(index: number, part: keyof NotifyHeaderRow, value: string): void;
  addHeader(): void;
  removeHeader(index: number): void;
  /** Sends the draft as it stands, saved or not. */
  test(): Promise<void>;
  save(): Promise<void>;
  testRow(id: string): Promise<void>;
  setEnabled(id: string, on: boolean): Promise<void>;
  /** Takes a channel away, once the person confirmed `notifyRemoval`. */
  remove(id: string): Promise<void>;
}

/** The question before a channel goes. */
export function notifyRemoval(text: NotifyCardText, c: NotifyChannel): { message: string; confirm: string } {
  return { message: fill(text.removeQuestion, { name: notifyChannelName(text, c) }), confirm: text.remove };
}

/** Puts the shake on the refused control, wherever its window stands. */
export function showNotifyRefusal(refusal: { hook: string } | null): () => void {
  if (!refusal) return () => {};
  const el = document.querySelector<HTMLElement>(`[data-notify="${refusal.hook}"]`);
  return el ? shake(el) : () => {};
}

const START: NotifyCardState = {
  loaded: false,
  loadFailed: false,
  channels: [],
  window: null,
  draft: null,
  headers: [],
  problems: [],
  formTest: undefined,
  rowTests: {},
  busy: null,
  refusal: null,
  said: null,
};

const toRows = (headers: Record<string, string> | undefined): NotifyHeaderRow[] => Object.entries(headers ?? {}).map(([name, value]) => ({ name, value }));

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * The flow behind one card. `options` is read at every step, so a framework
 * hands in its current props rather than the ones the card was made with.
 */
export function createNotifyCardFlow(options: () => NotifyCardOptions): NotifyCardFlow {
  let state = START;
  let config: NotifyConfig = { channels: [] };
  let stopped = false;
  const listeners = new Set<() => void>();
  const update = (change: Partial<NotifyCardState>) => {
    state = { ...state, ...change };
    listeners.forEach((fn) => fn());
  };
  const text = () => options().text;
  const notify = (message: string, severity: ToastSeverity) => options().notify?.(message, severity);
  const refuse = (hook: string) => ({ refusal: { hook, count: (state.refusal?.count ?? 0) + 1 } });

  function open(draft: NotifyChannel, adding: boolean, problems: NotifyCardState["problems"] = []) {
    update({ window: { kind: "form", adding }, draft, headers: toRows(draft.webhook?.headers), problems, formTest: undefined, said: null });
  }

  function editDraft(change: (c: NotifyChannel) => NotifyChannel, path: string) {
    if (!state.draft) return;
    update({ draft: change(state.draft), problems: state.problems.filter((p) => !under(p.field, path) && !under(path, p.field)), formTest: undefined, said: null });
  }

  // Sends the channels and answers whether the kit took them. Problems come back placed.
  async function send(channels: NotifyChannel[]): Promise<{ ok: true; sent: NotifyConfig } | { ok: false; problems: NotifyPlacedProblem[]; message?: string }> {
    const sent = notifyOutgoing({ ...config, channels }, config.channels);
    let answer: NotifySaveAnswer;
    try {
      answer = await options().api.save(sent);
    } catch (e) {
      return { ok: false, problems: [], message: e instanceof Error && e.message ? e.message : undefined };
    }
    if (answer.ok) {
      config = sent;
      update({ channels: sent.channels });
      return { ok: true, sent };
    }
    return { ok: false, problems: placeNotifyProblems(sent, answer.problems ?? []), message: answer.message };
  }

  async function run(hook: string, work: () => Promise<void>) {
    if (state.busy) return;
    update({ busy: hook });
    try {
      await work();
    } finally {
      update({ busy: null });
    }
  }

  async function test(c: NotifyChannel): Promise<ConnectionTest> {
    const o = options();
    let answer: NotifyTestAnswer;
    try {
      answer = await o.api.test(notifyOutgoingChannel(c, config.channels));
    } catch (e) {
      answer = { ok: false, message: e instanceof Error && e.message ? e.message : undefined };
    }
    if (answer.ok) return { tone: "ok", title: o.text.sent };
    return { tone: "danger", title: notifyResultText(o.text, o.app, answer) };
  }

  const flow: NotifyCardFlow = {
    state: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      stopped = false;
      options()
        .api.load()
        .then((got) => {
          if (stopped) return;
          config = { ...got, channels: got.channels ?? [] };
          update({ loaded: true, loadFailed: false, channels: config.channels });
        })
        .catch(() => {
          if (!stopped) update({ loadFailed: true });
        });
      return () => {
        stopped = true;
      };
    },
    pick() {
      if (!state.loaded) return;
      update({ window: { kind: "pick" }, draft: null, headers: [], problems: [], formTest: undefined, said: null });
    },
    choose(kind) {
      if (!(NOTIFY_KINDS as readonly string[]).includes(kind)) return;
      open(newNotifyChannel(kind as NotifyKind, config.channels), true);
    },
    edit(id) {
      const c = config.channels.find((x) => x.id === id);
      if (c) open(clone(c), false);
    },
    close() {
      update({ window: null, draft: null, headers: [], problems: [], formTest: undefined, said: null });
    },
    set(path, value) {
      editDraft((c) => {
        if (path === "name") return { ...c, name: value };
        if (path === "on") return { ...c, on: value as NotifyOn };
        if (path.startsWith("healthchecks.byKey.")) {
          const key = path.slice("healthchecks.byKey.".length);
          const byKey = { ...c.healthchecks?.byKey };
          if (value === "") delete byKey[key];
          else byKey[key] = value;
          return { ...c, healthchecks: { ...c.healthchecks, byKey } };
        }
        const [b, k] = path.split(".") as [keyof NotifyChannel, string];
        let v: unknown = value;
        if (path === "apprise.urls") v = value.split("\n");
        else if (path === "smtp.port") v = Number(value) || 0;
        else if (path === "gotify.priorityFailure" || path === "gotify.prioritySuccess") v = Number(value);
        else if (NOTIFY_SECRET_PATHS.includes(path) && value === "" && notifyHasSecret(c, config.channels)) v = NOTIFY_REDACTED;
        return { ...c, [b]: { ...(c[b] as object), [k]: v } };
      }, path);
    },
    setEvent(id, on) {
      const all = options().events.map((e) => e.id);
      const chosen = state.draft?.events?.length ? state.draft.events : all;
      const next = all.filter((e) => (e === id ? on : chosen.includes(e)));
      if (next.length === 0) {
        update(refuse("events"));
        return;
      }
      editDraft((c) => {
        const out = { ...c };
        if (next.length === all.length) delete out.events;
        else out.events = next;
        return out;
      }, "events");
    },
    setHeader(index, part, value) {
      const rows = state.headers.map((r, i) => (i === index ? { ...r, [part]: value } : r));
      const stored = Object.keys(savedChannel(state.draft!, config.channels)?.webhook?.headers ?? {});
      const fixed = rows.map((r, i) => (i === index && part === "value" && value === "" && stored.includes(r.name) ? { ...r, value: NOTIFY_REDACTED } : r));
      update({ headers: fixed });
      const headers = Object.fromEntries(fixed.filter((r) => r.name.trim() !== "").map((r) => [r.name.trim(), r.value]));
      editDraft((c) => ({ ...c, webhook: { ...c.webhook!, headers } }), "webhook.headers");
    },
    addHeader() {
      update({ headers: [...state.headers, { name: "", value: "" }] });
    },
    removeHeader(index) {
      const rows = state.headers.filter((_, i) => i !== index);
      update({ headers: rows });
      const headers = Object.fromEntries(rows.filter((r) => r.name.trim() !== "").map((r) => [r.name.trim(), r.value]));
      editDraft((c) => ({ ...c, webhook: { ...c.webhook!, headers } }), "webhook.headers");
    },
    async test() {
      const draft = state.draft;
      if (!draft) return;
      update({ formTest: { busy: true }, said: null });
      const result = await test(draft);
      if (state.draft !== draft) return;
      update({ formTest: result, said: result.tone === "danger" ? { ok: false, message: result.title ?? "" } : null });
    },
    async save() {
      const draft = state.draft;
      const w = state.window;
      if (!draft || w?.kind !== "form") return;
      if (!state.loaded) {
        notify(text().notLoaded, "fail");
        update(refuse("save"));
        return;
      }
      await run("save", async () => {
        const channels = w.adding ? [...config.channels, draft] : config.channels.map((c) => (c.id === draft.id ? draft : c));
        const before = savedChannel(draft, config.channels);
        if (before && JSON.stringify(notifyOutgoingChannel(draft, config.channels)) === JSON.stringify(before)) {
          flow.close();
          return;
        }
        const r = await send(channels);
        if (r.ok) {
          flow.close();
          notify(text().saved, "success");
          return;
        }
        const mine = r.problems.filter((p) => p.channel === draft.id).map(({ field, code }) => ({ field, code }));
        const others = r.problems.filter((p) => p.channel !== draft.id);
        const message = others.length > 0 ? notifyProblemText(text(), others[0]!.code) : mine.length === 0 ? (r.message ?? text().failed) : null;
        update({ problems: mine, said: message ? { ok: false, message } : null, ...refuse("save") });
      });
    },
    async testRow(id) {
      const c = config.channels.find((x) => x.id === id);
      if (!c) return;
      update({ rowTests: { ...state.rowTests, [id]: { busy: true } } });
      const result = await test(c);
      update({ rowTests: { ...state.rowTests, [id]: result } });
    },
    async setEnabled(id, on) {
      const c = config.channels.find((x) => x.id === id);
      if (!c || c.enabled === on) return;
      const hook = `switch-${id}`;
      await run(hook, async () => {
        const before = config.channels;
        update({ channels: before.map((x) => (x.id === id ? { ...x, enabled: on } : x)) });
        const r = await send(before.map((x) => (x.id === id ? { ...x, enabled: on } : x)));
        if (r.ok) {
          notify(text().saved, "success");
          return;
        }
        update({ channels: before });
        const mine = r.problems.filter((p) => p.channel === id).map(({ field, code }) => ({ field, code }));
        if (mine.length > 0) {
          open({ ...clone(c), enabled: on }, false, mine);
          return;
        }
        notify(r.problems.length > 0 ? notifyProblemText(text(), r.problems[0]!.code) : (r.message ?? text().failed), "fail");
        update(refuse(hook));
      });
    },
    async remove(id) {
      const hook = `remove-${id}`;
      await run(hook, async () => {
        const r = await send(config.channels.filter((x) => x.id !== id));
        if (r.ok) {
          const { [id]: _, ...rest } = state.rowTests;
          update({ rowTests: rest });
          notify(text().saved, "success");
          return;
        }
        notify(r.problems.length > 0 ? notifyProblemText(text(), r.problems[0]!.code) : (r.message ?? text().failed), "fail");
        update(refuse(hook));
      });
    },
  };
  return flow;
}

/** One row of the card, ready to draw. `mark` is `null` for email and a webhook, which wear the app's glyph. */
export interface NotifyRowView {
  id: string;
  name: string;
  kind: NotifyKind;
  mark: TileMark | null;
  /** Where it sends and when, or how its last test went. */
  meta: string;
  /** On where its kind cannot send. */
  idle: boolean;
  enabled: boolean;
}

/** Every row as the card draws it. */
export function notifyRows(s: NotifyCardState, o: Pick<NotifyCardOptions, "text" | "providers" | "unavailable">): NotifyRowView[] {
  return s.channels.map((c) => ({
    id: c.id,
    name: notifyChannelName(o.text, c),
    kind: c.kind,
    mark: notifyMark(o.providers, c.kind),
    meta: [notifyTarget(c) || (c.kind === "unraid" ? "" : o.text.noAddress), notifyRowStatus(o.text, c, s.rowTests[c.id])].filter(Boolean).join(" · "),
    idle: c.enabled && !!o.unavailable[c.kind],
    enabled: c.enabled,
  }));
}
