import { createSignal, For } from "solid-js";
import { BusyRing, Button } from "@glimstone/solid";

export default function BusyRingSizes() {
  const [waiting, setWaiting] = createSignal(0);
  return (
    <div style={{ display: "flex", "flex-wrap": "wrap", "align-items": "center", gap: "24px" }}>
      <BusyRing size="small" delay={0} />
      <BusyRing label="Loading backups" delay={0} />
      <BusyRing size="large" delay={0} />
      <Button label="Saving" labelKey="save" tone="accent" busy />
      <Button label="Wait" labelKey={null} onClick={() => setWaiting((n) => n + 1)} />
      {/* Each press draws a new ring, so its wait starts again. */}
      <For each={waiting() > 0 ? [waiting()] : []}>{() => <BusyRing label="Waiting" />}</For>
    </div>
  );
}
