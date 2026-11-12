import { useState } from "react";
import { Button, SkeletonRow } from "@glimstone/react";

export default function SkeletonRowList() {
  const [round, setRound] = useState(0);
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 560 }}>
      <div role="group" aria-label="Backups" aria-busy="true" key={round}>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
      <Button label="Load again" labelKey="refresh" onClick={() => setRound((n) => n + 1)} />
    </div>
  );
}
