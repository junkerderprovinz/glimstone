import { useState } from "react";
import { Button, IconButton, Sheet } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function SheetBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Details" labelKey={null} onClick={() => setOpen(true)} />
      <Sheet
        open={open}
        title="Nightly backup"
        text={{ cancel: "Cancel", close: "Close" }}
        actions={[{ label: "Run now", labelKey: null, primary: true }]}
        onClose={() => setOpen(false)}
      >
        <p style={{ margin: 0 }}>Runs at three in the morning and keeps the last fourteen copies.</p>
        <div>
          <IconButton tip="Copy the path" glyph={<Glyph name="IconCopy" />} />
        </div>
      </Sheet>
    </>
  );
}
