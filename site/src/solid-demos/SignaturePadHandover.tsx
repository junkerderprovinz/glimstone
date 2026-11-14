import { createSignal } from "solid-js";
import { SignaturePad } from "@glimstone/solid/SignaturePad";

export default function SignaturePadHandover() {
  const [strokes, setStrokes] = createSignal<string[]>([]);
  return (
    <div style={{ width: "min(26rem, 100%)", display: "grid", gap: "12px" }}>
      <SignaturePad label="Signed for the handover" value={strokes()} onChange={setStrokes} />
      <span>{strokes().length === 0 ? "Not signed yet" : `Signed in ${strokes().length} ${strokes().length === 1 ? "stroke" : "strokes"}`}</span>
    </div>
  );
}
