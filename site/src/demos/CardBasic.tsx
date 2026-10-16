import { useState } from "react";
import { Card } from "@gs/react/Card";
import { Toggle } from "@gs/react/Toggle";
import { Button } from "@gs/react/Button";

export default function CardBasic() {
  const [nightly, setNightly] = useState(true);
  return (
    <div style={{ width: "100%", maxWidth: 420, paddingTop: 12 }}>
      <Card title="Schedule" hint="When the backup runs on its own.">
        <div style={{ display: "grid", gap: 16 }}>
          <Toggle label="Run every night" checked={nightly} onChange={setNightly} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button label="Save" labelKey="save" tone="accent" />
          </div>
        </div>
      </Card>
    </div>
  );
}
