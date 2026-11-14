import { useState } from "react";
import { Timer } from "@glimstone/react/Timer";

export default function TimerTest() {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <Timer countdown startMs={3_000} onComplete={() => setDone(true)} />
      <span>{done ? "Time is up" : "Three seconds for the test"}</span>
    </div>
  );
}
