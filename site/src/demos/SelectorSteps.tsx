import { useState } from "react";
import { Selector } from "@glimstone/react";

const LEVELS = [
  { id: 1, label: "Fast", attrs: { "data-level": "1" } },
  { id: 5, label: "Even", attrs: { "data-level": "5" } },
  { id: 9, label: "Small", attrs: { "data-level": "9" } },
];

export default function SelectorSteps() {
  const [level, setLevel] = useState(5);
  const [presses, setPresses] = useState(0);
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start", width: "100%" }}>
      <Selector
        label="Compression"
        items={LEVELS}
        value={level}
        onChange={setLevel}
        onPress={() => setPresses((n) => n + 1)}
        activation="manual"
        size="sm"
        inline
      />
      <output className="glim-num">
        Value {JSON.stringify(level)}, pressed {presses}
      </output>
    </div>
  );
}
