import { useState } from "react";
import { Button, Popover, TextField } from "@glimstone/react";

export default function PopoverBasic() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button ref={setAnchor} label="Filter" labelKey="filter" onClick={() => setOpen((o) => !o)} aria-expanded={open} />
      <Popover open={open} anchor={anchor} label="Filter the list" onClose={() => setOpen(false)}>
        <div style={{ display: "grid", gap: 12 }}>
          <TextField label="Name contains" width="medium" />
          <Button label="Apply" labelKey={null} tone="accent" onClick={() => setOpen(false)} />
        </div>
      </Popover>
    </>
  );
}
