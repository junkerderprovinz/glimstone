import { createSignal } from "solid-js";
import { MultiSelect } from "@glimstone/solid/MultiSelect";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => ({ value: d.toLowerCase(), label: d }));

export default function MultiSelectShort() {
  const [days, setDays] = createSignal<string[]>([]);
  return (
    <div style={{ width: "320px" }}>
      <MultiSelect label="Days" options={DAYS} value={days()} onChange={setDays} placeholder="Pick days" />
    </div>
  );
}
