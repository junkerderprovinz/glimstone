import { createSignal } from "solid-js";
import { Button, IconButton, Sheet } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

export default function SheetBasic() {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <Button label="Details" labelKey={null} onClick={() => setOpen(true)} />
      <Sheet
        open={open()}
        title="Nightly backup"
        text={{ cancel: "Cancel", close: "Close" }}
        actions={[{ label: "Run now", labelKey: null, primary: true }]}
        onClose={() => setOpen(false)}
      >
        <p style={{ margin: 0 }}>Runs at three in the morning and keeps the last fourteen copies.</p>
        <div>
          <IconButton tip="Copy the path" glyph={glyph("IconCopy")} />
        </div>
      </Sheet>
    </>
  );
}
