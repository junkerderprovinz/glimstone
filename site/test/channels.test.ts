import { test } from "node:test";
import assert from "node:assert/strict";
import { NOTIFY_PROVIDERS } from "../../packages/core/src/notifyProviders.ts";
import { CHANNEL_IDS } from "../src/channelIds.ts";

test("every channel the picker demos offer is in the notification catalog", () => {
  const known = new Set<string>(NOTIFY_PROVIDERS.entries.map((e) => e.id));
  assert.deepEqual(CHANNEL_IDS.filter((id) => !known.has(id)), []);
  assert.equal(new Set(CHANNEL_IDS).size, CHANNEL_IDS.length);
});
