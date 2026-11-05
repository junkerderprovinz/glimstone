import { Card, Toggle } from "@glimstone/react";
import { useState } from "react";

export default function CardTitleSlot() {
  const [nightly, setNightly] = useState(true);
  return (
    <div style={{ width: "100%", maxWidth: 420, paddingTop: 12 }}>
      <Card
        drawn={
          <>
            Schedule <span data-dot aria-hidden="true">●</span>
          </>
        }
      >
        <Toggle label="Run every night" checked={nightly} onChange={setNightly} />
      </Card>
    </div>
  );
}
