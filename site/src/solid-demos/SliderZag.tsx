import { createSignal } from "solid-js";
import { Slider } from "@glimstone/solid/Slider";

export default function SliderZag() {
  const [days, setDays] = createSignal(30);
  return (
    <div style={{ width: "min(22rem, 100%)" }}>
      <Slider label="Keep backups for" value={days()} onChange={setDays} min={1} max={365} format={(d) => (d === 1 ? "1 day" : `${d} days`)} />
    </div>
  );
}
