import { useState } from "react";
import { Button, Window } from "@glimstone/react";
import { Glyph } from "../glyph";

const TEXT = { cancel: "Cancel", close: "Close" };
const stay = () => false as const;

export default function WindowBusyFoot() {
  const [open, setOpen] = useState<"compare" | "unsaved" | null>(null);
  const shut = () => setOpen(null);
  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        <Button label="Compare" labelKey={null} onClick={() => setOpen("compare")} />
        <Button label="Unsaved" labelKey={null} onClick={() => setOpen("unsaved")} />
      </div>
      {open === "compare" && (
        <Window
          title="Compare two folders"
          text={TEXT}
          start="12 differences"
          actions={[
            { label: "Sync left to right", labelKey: null, glyph: <Glyph name="IconApply" />, onClick: stay },
            { label: "Sync right to left", labelKey: null, glyph: <Glyph name="IconApply" />, onClick: stay },
            { label: "Close", labelKey: "common.close", glyph: <Glyph name="IconClose" />, primary: true, wayOut: true },
          ]}
          onClose={shut}
        >
          <p style={{ margin: 0 }}>Both sides were read just now.</p>
        </Window>
      )}
      {open === "unsaved" && (
        <Window
          title="Unsaved changes"
          text={TEXT}
          actions={[
            { label: "Keep", labelKey: null, glyph: <Glyph name="IconApply" />, wayOut: true },
            { label: "Save a copy", labelKey: null, glyph: <Glyph name="IconCopy" />, onClick: stay },
            { label: "Don't save", labelKey: null, glyph: <Glyph name="IconClose" />, onClick: stay },
            { label: "Save and close", labelKey: null, glyph: <Glyph name="IconApply" />, primary: true },
          ]}
          onClose={shut}
        >
          <p style={{ margin: 0 }}>The file has changes that are not saved.</p>
        </Window>
      )}
    </>
  );
}
