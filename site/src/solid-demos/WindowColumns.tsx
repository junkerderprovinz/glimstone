import { createSignal, For, Show } from "solid-js";
import { Button, Checkbox, Window } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const COLUMNS = ["Name", "Size", "Modified", "Kind", "Owner"];
const TEXT = { cancel: "Cancel", close: "Close" };

export default function WindowColumns() {
  const [open, setOpen] = createSignal(false);
  const [about, setAbout] = createSignal(false);
  const [shown, setShown] = createSignal(["Name", "Size", "Modified"]);
  const [query, setQuery] = createSignal("");
  const flip = (c: string) => setShown((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  return (
    <>
      <Button label="Choose columns" labelKey="settings" onClick={() => setOpen(true)} />
      <Show when={open()}>
        <Window
          title="Columns"
          size="wide"
          text={TEXT}
          start="Drag a column's header to move it"
          actions={[
            {
              label: "Reset",
              labelKey: "reset",
              // The reset shows in the boxes, so the window stays for a second look.
              onClick: () => {
                setShown(["Name", "Size", "Modified"]);
                return false;
              },
            },
            { label: "Apply", labelKey: null, glyph: glyph("IconApply"), primary: true },
          ]}
          onClose={() => setOpen(false)}
        >
          <input
            class="field"
            type="search"
            placeholder="Find a column"
            aria-label="Find a column"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
          />
          <div style={{ display: "flex", "flex-wrap": "wrap", gap: "4px" }}>
            <For each={COLUMNS.filter((c) => c.toLowerCase().includes(query().toLowerCase()))}>
              {(c) => <Checkbox label={c} checked={shown().includes(c)} disabled={c === "Name"} onChange={() => flip(c)} />}
            </For>
          </div>
          <div>
            <Button label="About columns" labelKey={null} tone="subtle" onClick={() => setAbout(true)} />
          </div>
        </Window>
      </Show>
      <Show when={about()}>
        <Window title="About columns" text={TEXT} actions={[{ label: "Got it", labelKey: "confirm", wayOut: true }]} onClose={() => setAbout(false)}>
          <p style={{ margin: 0 }}>Each panel keeps its own columns, and the name always stays.</p>
        </Window>
      </Show>
    </>
  );
}
