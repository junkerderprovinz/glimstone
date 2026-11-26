import { useState } from "react";
import { FieldRow, TimePicker, TimeRangePicker } from "@glimstone/react";

export default function TimePickerHours() {
  const [start, setStart] = useState<string | null>("02:30");
  const [quiet, setQuiet] = useState<[string | null, string | null]>(["22:00", "07:00"]);
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 420 }}>
      <FieldRow label="Backup starts at">
        <TimePicker value={start} onChange={setStart} minuteStep={15} />
      </FieldRow>
      <FieldRow label="Quiet hours">
        <TimeRangePicker value={quiet} onChange={setQuiet} />
      </FieldRow>
      <span className="glim-num" data-hook="start">
        {start ? `Runs daily at ${start}` : "No start time"}
      </span>
      <span className="glim-num" data-hook="quiet">
        {quiet[0] && quiet[1] ? `Quiet from ${quiet[0]} to ${quiet[1]}` : "No quiet hours"}
      </span>
    </div>
  );
}
