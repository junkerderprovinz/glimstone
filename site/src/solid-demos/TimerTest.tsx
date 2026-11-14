import { createSignal } from "solid-js";
import { Timer } from "@glimstone/solid/Timer";

export default function TimerTest() {
  const [done, setDone] = createSignal(false);
  return (
    <div style={{ display: "grid", gap: "12px", "justify-items": "start" }}>
      <Timer countdown startMs={3_000} onComplete={() => setDone(true)} />
      <span>{done() ? "Time is up" : "Three seconds for the test"}</span>
    </div>
  );
}
