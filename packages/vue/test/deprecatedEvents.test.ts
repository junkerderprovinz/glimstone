import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEPRECATED, warnDeprecated } from "../../core/src/deprecated.ts";
import { relayDeprecated } from "../src/deprecatedEvents.ts";

const TOAST = { mouseEnter: "enter", mouseLeave: "leave", focus: "focusin", blur: "focusout" };

function warnings(run: () => void): string[] {
  const seen: string[] = [];
  const warn = console.warn;
  console.warn = (message: string) => seen.push(message);
  try {
    run();
  } finally {
    console.warn = warn;
  }
  return seen;
}

test("an old toast event name still hears the event its new name fires", () => {
  const heard: string[] = [];
  const props = {
    onEnter: (id: string) => heard.push(`enter ${id}`),
    onLeave: (id: string) => heard.push(`leave ${id}`),
    onFocusin: (id: string) => heard.push(`focusin ${id}`),
    onFocusout: (id: string) => heard.push(`focusout ${id}`),
  };
  const relay = relayDeprecated("ToastViewport", TOAST, props, () => {});
  for (const event of Object.keys(TOAST)) relay(event, "t1");
  assert.deepEqual(heard, ["enter t1", "leave t1", "focusin t1", "focusout t1"]);
});

test("a page that listens to an old name is warned once, one that does not is not", () => {
  const props = { onEnter: () => {} };
  const once = warnings(() => {
    relayDeprecated("ToastViewport", TOAST, props, warnDeprecated);
    relayDeprecated("ToastViewport", TOAST, props, warnDeprecated);
  });
  assert.equal(once.length, 1);
  assert.match(once[0]!, /ToastViewport enter is deprecated since GlimStone 4\.5\.0 and goes in 5\.0\.0\. Listen to `mouse-enter`/);
  assert.deepEqual(warnings(() => relayDeprecated("ToastViewport", TOAST, {}, warnDeprecated)), []);
});

// The stack has to emit each new name and pass the same event on, so both
// listeners hear it until the old names go.
test("the toast stack fires the new and the old name of every event", () => {
  const sfc = readFileSync(join(import.meta.dirname, "..", "src", "ToastViewport.vue"), "utf8");
  assert.match(sfc, /relayDeprecated\("ToastViewport", \{ mouseEnter: "enter", mouseLeave: "leave", focus: "focusin", blur: "focusout" \}, props, warnDeprecated\)/);
  for (const [now, old] of Object.entries(TOAST)) {
    assert.ok(DEPRECATED[`ToastViewport ${old}`], old);
    assert.match(sfc, new RegExp(`emit\\("${now}", id\\);\\n  relay\\("${now}", id\\);`), now);
  }
});
