import { useRef, useState } from "react";
import { DropdownListbox } from "@gs/react/DropdownListbox";

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"];

export default function DropdownSelect() {
  const [open, setOpen] = useState(false);
  const [zone, setZone] = useState(ZONES[0]);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="field"
        style={{ minWidth: 220, textAlign: "start", cursor: "pointer" }}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {zone}
      </button>
      <DropdownListbox open={open} onClose={() => setOpen(false)} triggerRef={trigger} label="Time zone">
        {ZONES.map((z) => (
          <button
            key={z}
            type="button"
            role="option"
            aria-selected={z === zone}
            className="block w-full px-3 py-2 text-start text-sm text-carbon-text hover:bg-carbon-hover aria-selected:font-semibold"
            onClick={() => {
              setZone(z);
              setOpen(false);
            }}
          >
            {z}
          </button>
        ))}
      </DropdownListbox>
    </>
  );
}
