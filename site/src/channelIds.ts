// The channels the picker demos offer, as an app passes the ones it can send
// to. An app that does not run on Unraid leaves out its notifications.
import type { NotifyProviderId } from "@glimstone/core/notifyProviders";

export const CHANNEL_IDS = [
  "apprise",
  "discord",
  "gotify",
  "healthchecks",
  "matrix",
  "ntfy",
  "shoutrrr",
  "slack",
  "smtp",
  "webhook",
] as const satisfies readonly NotifyProviderId[];
