import { useState } from "react";
import { BusyRing, Button } from "@glimstone/react";

export default function BusyRingSizes() {
  const [waiting, setWaiting] = useState(0);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
      <BusyRing size="small" delay={0} />
      <BusyRing label="Loading backups" delay={0} />
      <BusyRing size="large" delay={0} />
      <Button label="Saving" labelKey="save" tone="accent" busy />
      <Button label="Wait" labelKey={null} onClick={() => setWaiting((n) => n + 1)} />
      {waiting > 0 && <BusyRing key={waiting} label="Waiting" />}
    </div>
  );
}
