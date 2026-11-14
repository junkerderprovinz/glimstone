import { createSignal, Show } from "solid-js";
import { Button, Window } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const TEXT = { cancel: "Cancel", close: "Close" };
const stay = () => false as const;

export default function WindowBusyFoot() {
  const [open, setOpen] = createSignal<"compare" | "unsaved" | null>(null);
  const shut = () => setOpen(null);
  return (
    <>
      <div style={{ display: "flex", gap: "8px" }}>
        <Button label="Compare" labelKey={null} onClick={() => setOpen("compare")} />
        <Button label="Unsaved" labelKey={null} onClick={() => setOpen("unsaved")} />
      </div>
      <Show when={open() === "compare"}>
        <Window
          title="Compare two folders"
          text={TEXT}
          start="12 differences"
          actions={[
            { label: "Sync left to right", labelKey: null, glyph: glyph("IconApply"), onClick: stay },
            { label: "Sync right to left", labelKey: null, glyph: glyph("IconApply"), onClick: stay },
            { label: "Close", labelKey: "common.close", glyph: glyph("IconClose"), primary: true, wayOut: true },
          ]}
          onClose={shut}
        >
          <p style={{ margin: 0 }}>Both sides were read just now.</p>
        </Window>
      </Show>
      <Show when={open() === "unsaved"}>
        <Window
          title="Unsaved changes"
          text={TEXT}
          actions={[
            { label: "Keep", labelKey: null, glyph: glyph("IconApply"), wayOut: true },
            { label: "Save a copy", labelKey: null, glyph: glyph("IconCopy"), onClick: stay },
            { label: "Don't save", labelKey: null, glyph: glyph("IconClose"), onClick: stay },
            { label: "Save and close", labelKey: null, glyph: glyph("IconApply"), primary: true },
          ]}
          onClose={shut}
        >
          <p style={{ margin: 0 }}>The file has changes that are not saved.</p>
        </Window>
      </Show>
    </>
  );
}
