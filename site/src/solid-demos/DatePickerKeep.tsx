import { createSignal } from "solid-js";
import { DatePicker } from "@glimstone/solid/DatePicker";

export default function DatePickerKeep() {
  const [day, setDay] = createSignal<string | null>("2026-11-20");
  return (
    <div style={{ display: "grid", gap: "12px", "justify-items": "start" }}>
      <DatePicker label="Keep until" value={day()} onChange={setDay} min="2026-11-05" max="2027-03-31" locale="en-GB" />
      <span class="glim-num">{day() ? `Kept until ${day()}` : "Kept for good"}</span>
    </div>
  );
}
