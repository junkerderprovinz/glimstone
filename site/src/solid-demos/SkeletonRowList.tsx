import { createSignal, For } from "solid-js";
import { Button, SkeletonRow } from "@glimstone/solid";

export default function SkeletonRowList() {
  const [round, setRound] = createSignal(0);
  return (
    <div style={{ display: "grid", gap: "12px", width: "100%", "max-width": "560px" }}>
      {/* Each round draws the rows anew, so their wait starts again. */}
      <For each={[round()]}>
        {() => (
          <div role="group" aria-label="Backups" aria-busy="true">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}
      </For>
      <Button label="Load again" labelKey="refresh" onClick={() => setRound((n) => n + 1)} />
    </div>
  );
}
