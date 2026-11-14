import { createSignal } from "solid-js";
import { Card, Toggle } from "@glimstone/solid";

export default function CardTitleSlot() {
  const [nightly, setNightly] = createSignal(true);
  return (
    <div style={{ width: "100%", "max-width": "420px", "padding-top": "12px" }}>
      <Card
        drawn={
          <>
            Schedule <span data-dot aria-hidden="true">●</span>
          </>
        }
      >
        <Toggle label="Run every night" checked={nightly()} onChange={setNightly} />
      </Card>
    </div>
  );
}
