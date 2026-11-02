import { useState } from "react";
import { NumberField } from "@glimstone/react";

const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, width: "100%", maxWidth: 360 };

export default function NumberFieldBasic() {
  const [keep, setKeep] = useState<number | "">(7);
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 360 }}>
      <label style={row}>
        <span>Snapshots to keep</span>
        <NumberField
          min={1}
          max={30}
          value={keep}
          onChange={(e) => setKeep(e.target.value === "" ? "" : e.target.valueAsNumber)}
        />
      </label>
      <p style={{ margin: 0, color: "var(--carbon-text-sub)", fontSize: 13 }}>Keeps {keep} snapshots.</p>
    </div>
  );
}
