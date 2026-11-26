import { createSignal } from "solid-js";
import { FieldRow, TimePicker, TimeRangePicker } from "@glimstone/solid";

export default function TimePickerHours() {
  const [start, setStart] = createSignal<string | null>("02:30");
  const [quiet, setQuiet] = createSignal<[string | null, string | null]>(["22:00", "07:00"]);
  return (
    <div style={{ display: "grid", gap: "8px", width: "100%", "max-width": "420px" }}>
      <FieldRow label="Backup starts at">
        <TimePicker value={start()} onChange={setStart} minuteStep={15} />
      </FieldRow>
      <FieldRow label="Quiet hours">
        <TimeRangePicker value={quiet()} onChange={setQuiet} />
      </FieldRow>
      <span class="glim-num" data-hook="start">
        {start() ? `Runs daily at ${start()}` : "No start time"}
      </span>
      <span class="glim-num" data-hook="quiet">
        {quiet()[0] && quiet()[1] ? `Quiet from ${quiet()[0]} to ${quiet()[1]}` : "No quiet hours"}
      </span>
    </div>
  );
}
