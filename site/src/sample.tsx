import { useState } from "react";
import { Card } from "@gs/react/Card";
import { Button } from "@gs/react/Button";
import { Badge } from "@gs/react/Badge";
import { Toggle } from "@gs/react/Toggle";

/** A small slice of an app, so an engine page shows what a setting does to real controls. */
export function SampleSurface() {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: "grid", gap: 28, width: "100%", maxWidth: 460, paddingTop: 12 }}>
      <Card title="Backups" hint="Every job that writes to a target." hueIndex={0}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span className="text-sm text-carbon-text">Nightly appdata</span>
            <Badge tone="ok">Settled</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span className="text-sm text-carbon-text">Photos to the cloud</span>
            <Badge tone="active">Running</Badge>
          </div>
          <Toggle label="Verify after each run" checked={on} onChange={setOn} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button label="Edit" labelKey="edit" />
            <Button label="Back up now" labelKey="backup" tone="accent" />
          </div>
        </div>
      </Card>
      <Card title="Targets" hueIndex={1}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button label="Add" labelKey="add" tone="accent" />
          <Button label="Refresh" labelKey="refresh" />
        </div>
      </Card>
    </div>
  );
}
