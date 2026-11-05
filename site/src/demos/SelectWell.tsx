import { useState } from "react";
import { SubCard, TextField } from "@glimstone/react";
import { Select } from "@glimstone/react/Select";

const KEEP = [
  { value: "week", label: "One week" },
  { value: "month", label: "One month" },
];

export default function SelectWell() {
  const [a, setA] = useState("week");
  const [b, setB] = useState("month");
  return (
    <div style={{ display: "grid", gap: 12, width: 320 }}>
      <div data-well className="glim-well" style={{ display: "grid", gap: 8, padding: 12 }}>
        <TextField label="Name in a well" />
        <Select label="Keep in a well" hideLabel options={KEEP} value={a} onChange={setA} />
      </div>
      <SubCard title="In a sub-card">
        <div style={{ display: "grid", gap: 8 }}>
          <TextField label="Name in a sub-card" />
          <Select label="Keep in a sub-card" hideLabel options={KEEP} value={b} onChange={setB} />
        </div>
      </SubCard>
    </div>
  );
}
