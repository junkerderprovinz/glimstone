import { test } from "node:test";
import assert from "node:assert/strict";
import { exportedNames as reactNames, reactComponents } from "./exports.ts";
import { drift, exportedNames, reactSurface, solidComponents, solidSurface, svelteComponents, svelteSurface } from "./frameworks.ts";

// An app moves from React to Solid or Svelte by changing its imports and the
// framework's own spelling, so each package offers React's names and every
// component takes React's props with React's defaults.

const sorted = (names: Iterable<string>) => [...names].sort();
const missing = (from: Set<string>, to: Set<string>) => sorted([...from].filter((n) => !to.has(n)));
const react = reactNames("react");
const twins = {
  Solid: { names: exportedNames("solid"), components: solidComponents(), surface: solidSurface },
  Svelte: { names: exportedNames("svelte"), components: svelteComponents(), surface: svelteSurface },
};

for (const [framework, twin] of Object.entries(twins)) {
  test(`${framework} exports the same components, hooks and helpers as React`, () => {
    assert.deepEqual(
      { [`notIn${framework}`]: missing(react.values, twin.names.values), notInReact: missing(twin.names.values, react.values) },
      { [`notIn${framework}`]: [], notInReact: [] },
    );
  });

  // In Svelte a component's props type comes from its .svelte file, beside it.
  test(`${framework} exports the same types as React`, () => {
    const ours = new Set([...twin.names.types].filter((n) => !n.endsWith("Props")));
    const theirs = new Set([...react.types].filter((n) => !n.endsWith("Props")));
    assert.deepEqual({ [`notIn${framework}`]: missing(theirs, ours), notInReact: missing(ours, theirs) }, { [`notIn${framework}`]: [], notInReact: [] });
  });

  for (const [name, file] of reactComponents()) {
    test(`${name} takes the same props in React and ${framework}`, () => {
      const at = twin.components.get(name);
      assert.ok(at, `${name} has no ${framework} twin`);
      assert.deepEqual(drift(reactSurface(name, file), twin.surface(name, at), framework), []);
    });
  }
}
