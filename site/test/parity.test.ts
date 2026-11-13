import { test } from "node:test";
import assert from "node:assert/strict";
import { exportedNames, reactComponents, vueComponents } from "./exports.ts";
import { drift, reactSurface, vueSurface } from "./surface.ts";

// An app moves from one framework to the other by changing its imports and
// nothing else, so both packages offer the same names and every component
// takes the same props, with the same defaults, events and slots.

const sorted = (names: Iterable<string>) => [...names].sort();
const missing = (from: Set<string>, to: Set<string>) => sorted([...from].filter((n) => !to.has(n)));

test("both packages export the same components, hooks and helpers", () => {
  const react = exportedNames("react").values;
  const vue = exportedNames("vue").values;
  assert.deepEqual({ notInVue: missing(react, vue), notInReact: missing(vue, react) }, { notInVue: [], notInReact: [] });
});

// A React component's props interface is how React names a props type; in Vue
// the component itself carries it.
test("both packages export the same types", () => {
  const react = new Set([...exportedNames("react").types].filter((n) => !n.endsWith("Props")));
  const vue = new Set([...exportedNames("vue").types].filter((n) => !n.endsWith("Props")));
  assert.deepEqual({ notInVue: missing(react, vue), notInReact: missing(vue, react) }, { notInVue: [], notInReact: [] });
});

const vue = vueComponents();
for (const [name, file] of reactComponents()) {
  test(`${name} takes the same props, events and slots in React and Vue`, () => {
    const twin = vue.get(name);
    assert.ok(twin, `${name} has no Vue twin`);
    assert.deepEqual(drift(reactSurface(name, file), vueSurface(twin)), []);
  });
}
