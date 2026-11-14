import { createSignal } from "solid-js";
import { Button, Card, Toggle } from "@glimstone/solid";

export default function CardBasic() {
  const [nightly, setNightly] = createSignal(true);
  return (
    <div style={{ width: "100%", "max-width": "420px", "padding-top": "12px" }}>
      <Card title="Schedule" hint="When the backup runs on its own.">
        <div style={{ display: "grid", gap: "16px" }}>
          <Toggle label="Run every night" checked={nightly()} onChange={setNightly} />
          <div style={{ display: "flex", "justify-content": "flex-end" }}>
            <Button label="Save" labelKey="save" tone="accent" />
          </div>
        </div>
      </Card>
    </div>
  );
}
