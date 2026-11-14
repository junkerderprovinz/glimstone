import { createSignal } from "solid-js";
import { PinInput } from "@glimstone/solid/PinInput";

export default function PinInputCode() {
  const [code, setCode] = createSignal("");
  const [done, setDone] = createSignal("");
  return (
    <div style={{ display: "grid", gap: "12px", "justify-items": "start" }}>
      <PinInput label="Code from the app" value={code()} onChange={setCode} onComplete={setDone} />
      <span class="glim-num">{done() ? `Checking ${done()}` : "Waiting for six digits"}</span>
    </div>
  );
}
