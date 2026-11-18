// The channels of the picker demos, from the notification catalog, with the
// words an app adds of its own: a hint per tile, and a tooltip on the webhook,
// which takes anything and stands last. Each framework's demo draws the glyphs
// for email and webhooks its own way.
import { catalogPicker, type PickerText } from "@glimstone/core";
import { NOTIFY_PROVIDERS, type NotifyProviderId } from "@glimstone/core/notifyProviders";
import { CHANNEL_IDS } from "./channelIds";

const TITLES = { service: "Services", standard: "Email and webhooks" };

export const CHANNEL_TEXT: PickerText = {
  search: "Search services",
  none: "Nothing matches “{query}”. A webhook reaches almost anything.",
  clear: "Clear the search",
  close: "Close",
  cancel: "Cancel",
  back: "Back",
};

const OWN: Partial<Record<NotifyProviderId, { hint?: string; tip?: string; last?: boolean }>> = {
  apprise: { hint: "Hands each message to an Apprise server, which passes it on to the services it knows." },
  discord: { hint: "Posts each message into a channel through its webhook." },
  gotify: { hint: "Pushes each message to a Gotify server of your own." },
  healthchecks: { hint: "Pings a check after every run, so a run that never happens raises the alarm." },
  matrix: { hint: "Sends each message into a room, as the account whose token you give." },
  ntfy: { hint: "Publishes each message to a topic, on ntfy.sh or a server of your own." },
  shoutrrr: { hint: "Reaches dozens of services through one address each." },
  slack: { hint: "Posts each message into a channel through its incoming webhook." },
  smtp: { hint: "Sends each message as an email through your own mail server." },
  webhook: { tip: "Any address that takes a request", last: true },
};

/** The picker's tiles and groups, with the framework's own glyph for email and webhooks. */
export function channelPicker<M>(glyph: (name: string) => M) {
  return catalogPicker(NOTIFY_PROVIDERS, {
    ids: CHANNEL_IDS,
    titles: TITLES,
    glyph: (entry) => glyph(entry.glyph ?? "IconLink"),
    lang: "en",
    own: (entry) => OWN[entry.id],
  });
}

/** What the form demo's test answers: an address on https is reached, after a moment. */
export const testAddress = (address: string) =>
  new Promise<boolean>((done) => setTimeout(() => done(address.startsWith("https://")), 400));

const NAMES = new Map(NOTIFY_PROVIDERS.entries.map((e) => [e.id as string, e.name]));

export const labelOf = (id: string) => NAMES.get(id) ?? id;

/** The channels picked so far, by name, for the line beside the demo's button. */
export const pickedLine = (picked: string[]) => (picked.length ? `Added: ${picked.map(labelOf).join(", ")}` : "No channel yet");
