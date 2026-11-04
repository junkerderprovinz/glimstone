import { useState } from "react";
import { ColorPicker } from "@glimstone/react";

export default function ColorPickerInline() {
  const [applied, setApplied] = useState("#fcc419");
  const [live, setLive] = useState(applied);
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
      <ColorPicker value={applied} onInput={setLive} onApply={setApplied} />
      <p style={{ margin: 0 }}>
        Live <code>{live}</code>
        <br />
        Applied <code>{applied}</code>
      </p>
    </div>
  );
}
