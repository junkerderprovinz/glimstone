import { useState } from "react";
import { Button } from "@glimstone/react";
import { FloatingPanel } from "@glimstone/react/FloatingPanel";

export default function FloatingPanelLog() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button label="Show the transfer log" labelKey={null} onClick={() => setOpen(true)} />
      <FloatingPanel title="Transfer log" open={open} onOpenChange={setOpen}>
        <p style={{ margin: 0 }}>04:10 Copied 2,113 files to the cellar.</p>
        <p style={{ margin: 0 }}>04:14 Checked every file against its sum.</p>
      </FloatingPanel>
    </div>
  );
}
