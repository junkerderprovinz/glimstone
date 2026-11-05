import { useState } from "react";
import { Button, Card, NumberField, SubCard, TextField } from "@glimstone/react";

const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 };

export default function SubCardBasic() {
  const [days, setDays] = useState<number | "">(14);
  return (
    <div style={{ width: "100%", maxWidth: 440, paddingTop: 12 }}>
      <Card title="Snapshots">
        <SubCard title="Retention" hint="Older snapshots are removed after each run.">
          <label style={row}>
            <span>Days to keep</span>
            <NumberField
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(e.target.value === "" ? "" : e.target.valueAsNumber)}
            />
          </label>
        </SubCard>
        <SubCard>
          <TextField label="A note" placeholder="A group needs no title" />
        </SubCard>
        <SubCard title="Commands">
          <div style={{ ...row, justifyContent: "flex-end" }}>
            <Button label="Copy command" labelKey="copy" tone="subtle" />
          </div>
        </SubCard>
      </Card>
    </div>
  );
}
