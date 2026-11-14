import { useState } from "react";
import { PinInput } from "@glimstone/react/PinInput";

export default function PinInputCode() {
  const [code, setCode] = useState("");
  const [done, setDone] = useState("");
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <PinInput label="Code from the app" value={code} onChange={setCode} onComplete={setDone} />
      <span className="glim-num">{done ? `Checking ${done}` : "Waiting for six digits"}</span>
    </div>
  );
}
