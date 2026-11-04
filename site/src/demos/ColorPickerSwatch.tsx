import { useState } from "react";
import { Button, ColorPicker, Window } from "@glimstone/react";

function Swatch({ label }: { label: string }) {
  const [colour, setColour] = useState<{ hex: string; name: string | null }>({ hex: "#1b6b73", name: "Petrol" });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <span className="demo-swatch-row">
      <button
        type="button"
        aria-label={label}
        className="demo-swatch"
        style={{ backgroundColor: colour.hex }}
        onClick={(e) => setAnchor(anchor ? null : e.currentTarget)}
      />
      <span data-applied>
        {colour.name} {colour.hex}
      </span>
      {anchor && (
        <ColorPicker
          value={colour.hex}
          anchor={anchor}
          onApply={(hex, name) => setColour({ hex, name })}
          onClose={() => setAnchor(null)}
        />
      )}
    </span>
  );
}

export default function ColorPickerSwatch() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Swatch label="Label colour" />
      <Button label="Open in a window" labelKey={null} onClick={() => setOpen(true)} />
      {open && (
        <Window title="Label" text={{ cancel: "Cancel", close: "Close" }} onClose={() => setOpen(false)}>
          <Swatch label="Label colour in the window" />
        </Window>
      )}
    </div>
  );
}
