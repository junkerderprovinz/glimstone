// A made-up app for the notification demos: an ntfy topic with a token, a
// Discord webhook whose test the far end turns down, mail that is switched
// off with its host still missing and Unraid's own notifications, on although
// this app runs elsewhere.
// Every demo gets its own channels, so the frameworks side by side never
// share a change. A save takes what the kit would take: an enabled channel
// needs its address, and an address starts with http:// or https://.
import { NOTIFY_REDACTED, notifyCardTextEn, type NotifyApi, type NotifyChannel, type NotifyConfig, type NotifyProblem } from "@glimstone/core";
import { NOTIFY_PROVIDERS } from "@glimstone/core/notifyProviders";

export { NOTIFY_PROVIDERS };

export const NOTIFY_TEXT = notifyCardTextEn;

export const NOTIFY_APP = "Bravo";

export const NOTIFY_EVENTS = [
  { id: "upload", label: "A file request got an upload" },
  { id: "storage", label: "Storage is almost full" },
  { id: "update", label: "An update is ready" },
];

export const NOTIFY_CHECKS = [{ id: "nightly", label: "Nightly clean-up" }];

export const NOTIFY_ELSEWHERE = { unraid: "Bravo runs in a container on Atlas, which is no Unraid server, so nothing reaches Unraid." };

const CHANNELS: NotifyChannel[] = [
  { id: "ntfy", kind: "ntfy", enabled: true, on: "failure", ntfy: { url: "https://ntfy.sh/bravo-alerts", token: NOTIFY_REDACTED } },
  { id: "discord", kind: "discord", name: "Team chat", enabled: true, on: "always", events: ["upload"], discord: { url: "https://discord.com/api/webhooks/1234/********" } },
  { id: "smtp", kind: "smtp", enabled: false, on: "failure", smtp: { host: "", port: 587, username: "bravo", password: NOTIFY_REDACTED, from: "bravo@example.com", to: "me@example.com", tls: "starttls" } },
  { id: "unraid", kind: "unraid", enabled: true, on: "failure" },
];

const URLS: Partial<Record<NotifyChannel["kind"], string[]>> = {
  ntfy: ["ntfy.url"],
  gotify: ["gotify.url"],
  discord: ["discord.url"],
  slack: ["slack.url"],
  matrix: ["matrix.homeserver"],
  apprise: ["apprise.url"],
  webhook: ["webhook.url"],
  healthchecks: ["healthchecks.url"],
};

function problems(config: NotifyConfig): NotifyProblem[] {
  return config.channels.flatMap((c, index) => {
    if (!c.enabled) return [];
    const at = (path: string) => path.split(".").reduce<unknown>((v, k) => (v as Record<string, unknown> | undefined)?.[k], c) as string | undefined;
    const fields = c.kind === "smtp" ? ["smtp.host", "smtp.from", "smtp.to"] : (URLS[c.kind] ?? []);
    return fields.flatMap((field): NotifyProblem[] => {
      const value = at(field)?.trim() ?? "";
      if (value === "") return [{ index, channel: c.id, field, code: "missing_field" }];
      if (field.endsWith("url") || field.endsWith("homeserver")) {
        if (!/^https?:\/\/[^/]/.test(value)) return [{ index, channel: c.id, field, code: "bad_url" }];
      }
      return [];
    });
  });
}

const wait = () => new Promise((done) => setTimeout(done, 120));

/** The calls of a made-up app, over channels of the demo's own. */
export function demoNotify(): NotifyApi {
  let stored: NotifyConfig = { channels: structuredClone(CHANNELS), digest: "daily" };
  return {
    load: async () => structuredClone(stored),
    save: async (config) => {
      await wait();
      const found = problems(config);
      if (found.length > 0) return { ok: false, problems: found };
      stored = structuredClone(config);
      return { ok: true };
    },
    test: async (channel) => {
      await wait();
      if (channel.kind === "discord") return { ok: false, code: "auth" };
      if (channel.kind === "unraid") return { ok: false, message: NOTIFY_ELSEWHERE.unraid };
      return { ok: true };
    },
  };
}
