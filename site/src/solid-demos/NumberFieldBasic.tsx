import { createSignal } from "solid-js";
import { NumberField } from "@glimstone/solid";

const row = { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "16px", width: "100%", "max-width": "360px" };

export default function NumberFieldBasic() {
  const [keep, setKeep] = createSignal<number | "">(7);
  return (
    <div style={{ display: "grid", gap: "12px", width: "100%", "max-width": "360px" }}>
      <label style={row}>
        <span>Snapshots to keep</span>
        <NumberField
          min={1}
          max={30}
          value={keep()}
          onChange={(e) => setKeep(e.currentTarget.value === "" ? "" : e.currentTarget.valueAsNumber)}
        />
      </label>
      <p style={{ margin: 0, color: "var(--carbon-text-sub)", "font-size": "13px" }}>Keeps {keep()} snapshots.</p>
    </div>
  );
}
