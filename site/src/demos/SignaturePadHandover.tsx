import { useState } from "react";
import { SignaturePad } from "@glimstone/react/SignaturePad";

export default function SignaturePadHandover() {
  const [strokes, setStrokes] = useState<string[]>([]);
  return (
    <div style={{ width: "min(26rem, 100%)", display: "grid", gap: 12 }}>
      <SignaturePad label="Signed for the handover" value={strokes} onChange={setStrokes} />
      <span>{strokes.length === 0 ? "Not signed yet" : `Signed in ${strokes.length} ${strokes.length === 1 ? "stroke" : "strokes"}`}</span>
    </div>
  );
}
