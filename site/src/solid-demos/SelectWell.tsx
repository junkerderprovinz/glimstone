import { createSignal } from "solid-js";
import { SubCard, TextField } from "@glimstone/solid";
import { Select } from "@glimstone/solid/Select";

const KEEP = [
  { value: "week", label: "One week" },
  { value: "month", label: "One month" },
];

export default function SelectWell() {
  const [a, setA] = createSignal("week");
  const [b, setB] = createSignal("month");
  return (
    <div style={{ display: "grid", gap: "12px", width: "320px" }}>
      <div data-well class="glim-well" style={{ display: "grid", gap: "8px", padding: "12px" }}>
        <TextField label="Name in a well" />
        <Select label="Keep in a well" hideLabel options={KEEP} value={a()} onChange={setA} />
      </div>
      <SubCard title="In a sub-card">
        <div style={{ display: "grid", gap: "8px" }}>
          <TextField label="Name in a sub-card" />
          <Select label="Keep in a sub-card" hideLabel options={KEEP} value={b()} onChange={setB} />
        </div>
      </SubCard>
    </div>
  );
}
