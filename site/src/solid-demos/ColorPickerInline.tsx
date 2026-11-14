import { createSignal } from "solid-js";
import { ColorPicker } from "@glimstone/solid";

export default function ColorPickerInline() {
  const [applied, setApplied] = createSignal("#fcc419");
  const [live, setLive] = createSignal(applied());
  return (
    <div style={{ display: "flex", gap: "24px", "align-items": "flex-start", "flex-wrap": "wrap" }}>
      <ColorPicker value={applied()} onInput={setLive} onApply={setApplied} />
      <p style={{ margin: 0 }}>
        Live <code>{live()}</code>
        <br />
        Applied <code>{applied()}</code>
      </p>
    </div>
  );
}
