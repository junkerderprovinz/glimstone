import { test } from "node:test";
import assert from "node:assert/strict";
import { VPN_PROVIDERS } from "../../packages/core/src/vpnProviders.ts";
import { VPN_LAST } from "../src/vpnIds.ts";

test("every VPN tile the picker demo words itself is in the VPN catalog", () => {
  const known = new Set<string>(VPN_PROVIDERS.entries.map((e) => e.id));
  assert.deepEqual(VPN_LAST.filter((id) => !known.has(id)), []);
});
