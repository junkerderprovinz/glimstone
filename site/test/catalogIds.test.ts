import { test } from "node:test";
import assert from "node:assert/strict";
import { MCP_PROVIDERS } from "../../packages/core/src/mcpProviders.ts";
import { REGISTRY_PROVIDERS } from "../../packages/core/src/registryProviders.ts";
import { MCP_IDS } from "../src/mcpIds.ts";
import { REGISTRY_IDS } from "../src/registryIds.ts";

for (const [name, catalog, ids] of [
  ["MCP client", MCP_PROVIDERS, MCP_IDS],
  ["registry", REGISTRY_PROVIDERS, REGISTRY_IDS],
] as const) {
  test(`every ${name} the picker demos offer is in its catalog`, () => {
    const known = new Set<string>(catalog.entries.map((e) => e.id));
    assert.deepEqual(ids.filter((id) => !known.has(id)), []);
    assert.equal(new Set(ids).size, ids.length);
  });
}
