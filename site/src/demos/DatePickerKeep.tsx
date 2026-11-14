import { useState } from "react";
import { DatePicker } from "@glimstone/react/DatePicker";

export default function DatePickerKeep() {
  const [day, setDay] = useState<string | null>("2026-11-20");
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <DatePicker label="Keep until" value={day} onChange={setDay} min="2026-11-05" max="2027-03-31" locale="en-GB" />
      <span className="glim-num">{day ? `Kept until ${day}` : "Kept for good"}</span>
    </div>
  );
}
