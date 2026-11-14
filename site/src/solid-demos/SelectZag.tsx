import { createSignal } from "solid-js";
import { Select } from "@glimstone/solid/Select";

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"].map((z) => ({ value: z, label: z }));

export default function SelectZag() {
  const [zone, setZone] = createSignal("Europe/Vienna");
  return (
    <div style={{ width: "260px" }}>
      <Select label="Time zone" options={ZONES} value={zone()} onChange={setZone} />
    </div>
  );
}
