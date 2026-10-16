import { useState } from "react";
import { Select } from "@gs/react/Select";

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"].map((z) => ({ value: z, label: z }));

export default function SelectZag() {
  const [zone, setZone] = useState("Europe/Vienna");
  return (
    <div style={{ width: 260 }}>
      <Select label="Time zone" options={ZONES} value={zone} onChange={setZone} />
    </div>
  );
}
