import { useState } from "react";
import { MultiSelect } from "@glimstone/react/MultiSelect";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => ({ value: d.toLowerCase(), label: d }));

export default function MultiSelectShort() {
  const [days, setDays] = useState<string[]>([]);
  return (
    <div style={{ width: 320 }}>
      <MultiSelect label="Days" options={DAYS} value={days} onChange={setDays} placeholder="Pick days" />
    </div>
  );
}
