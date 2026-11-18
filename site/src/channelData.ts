// The channels of the picker demos: the notification services whose marks the
// core carries, and email and webhooks, which belong to nobody and wear the
// app's own glyphs. Each framework's demo adds those two glyphs its own way.
import { SERVICE_MARKS, type ServiceMarkId } from "@glimstone/core/serviceMarks";
import type { PickGroup, PickerText } from "@glimstone/core";

export const CHANNEL_GROUPS: PickGroup[] = [
  { id: "services", title: "Services" },
  { id: "standards", title: "Email and webhooks" },
];

export const CHANNEL_TEXT: PickerText = {
  search: "Search services",
  none: "Nothing matches “{query}”. A webhook reaches almost anything.",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

const SERVICES: { id: ServiceMarkId; label: string; hint: string; terms?: string[] }[] = [
  { id: "apprise", label: "Apprise", hint: "Hands each message to an Apprise server, which passes it on to the services it knows." },
  { id: "discord", label: "Discord", hint: "Posts each message into a channel through its webhook." },
  { id: "gotify", label: "Gotify", hint: "Pushes each message to a Gotify server of your own." },
  { id: "healthchecks", label: "Healthchecks.io", hint: "Pings a check after every run, so a run that never happens raises the alarm." },
  { id: "matrix", label: "Matrix", hint: "Sends each message into a room, as the account whose token you give." },
  { id: "ntfy", label: "ntfy", hint: "Publishes each message to a topic, on ntfy.sh or a server of your own." },
  {
    id: "shoutrrr",
    label: "Shoutrrr",
    hint: "Reaches dozens of services through one address each.",
    terms: ["Telegram", "Pushover", "Teams", "Mattermost", "Rocket.Chat", "Pushbullet", "Zulip", "Signal", "Google Chat"],
  },
  { id: "slack", label: "Slack", hint: "Posts each message into a channel through its incoming webhook." },
];

/** The channels, with the framework's own glyphs for email and webhooks. */
export function channelItems<M>(mail: M, link: M) {
  return [
    ...SERVICES.map((s) => ({ ...s, group: "services", mark: SERVICE_MARKS[s.id] })),
    { id: "smtp", label: "Email", group: "standards", hint: "Sends each message as an email through your own mail server.", terms: ["mail"], mark: mail },
    { id: "webhook", label: "Webhook", group: "standards", hint: "Sends each message to any address that takes a request.", last: true, mark: link },
  ];
}

export const labelOf = (id: string) => LABELS.get(id) ?? id;

const LABELS = new Map<string, string>([...SERVICES.map((s) => [s.id, s.label] as const), ["smtp", "Email"], ["webhook", "Webhook"]]);

/** The channels picked so far, by name, for the line beside the demo's button. */
export const pickedLine = (picked: string[]) => (picked.length ? `Added: ${picked.map(labelOf).join(", ")}` : "No channel yet");
