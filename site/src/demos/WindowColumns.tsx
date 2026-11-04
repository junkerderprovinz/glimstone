import { useState } from "react";
import { Button, Checkbox, Window } from "@glimstone/react";
import { Glyph } from "../glyph";

const COLUMNS = ["Name", "Size", "Modified", "Kind", "Owner"];
const TEXT = { cancel: "Cancel", close: "Close" };

export default function WindowColumns() {
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const [shown, setShown] = useState(["Name", "Size", "Modified"]);
  const [query, setQuery] = useState("");
  const flip = (c: string) => setShown((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  return (
    <>
      <Button label="Choose columns" labelKey="settings" onClick={() => setOpen(true)} />
      {open && (
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
            { label: "Apply", labelKey: null, glyph: <Glyph name="IconApply" />, primary: true },
          ]}
          onClose={() => setOpen(false)}
        >
          <input className="field" type="search" placeholder="Find a column" aria-label="Find a column" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {COLUMNS.filter((c) => c.toLowerCase().includes(query.toLowerCase())).map((c) => (
              <Checkbox key={c} label={c} checked={shown.includes(c)} disabled={c === "Name"} onChange={() => flip(c)} />
            ))}
          </div>
          <div>
            <Button label="About columns" labelKey={null} tone="subtle" onClick={() => setAbout(true)} />
          </div>
        </Window>
      )}
      {about && (
        <Window
          title="About columns"
          text={TEXT}
          actions={[{ label: "Got it", labelKey: "confirm", wayOut: true }]}
          onClose={() => setAbout(false)}
        >
          <p style={{ margin: 0 }}>Each panel keeps its own columns, and the name always stays.</p>
        </Window>
      )}
    </>
  );
}
