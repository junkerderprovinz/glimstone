import { Pill, SubCard } from "@glimstone/react";

export default function PillWell() {
  return (
    <div style={{ display: "grid", gap: 12, width: 320 }}>
      <div data-plain style={{ display: "flex", gap: 6 }}>
        <Pill>2.4 GB</Pill>
        <Pill tone="ok">Settled</Pill>
      </div>
      <div data-well className="glim-well" style={{ display: "flex", gap: 6, padding: 12 }}>
        <Pill>2.4 GB</Pill>
        <Pill tone="ok">Settled</Pill>
      </div>
      <SubCard>
        <div style={{ display: "flex", gap: 6 }}>
          <Pill>2.4 GB</Pill>
          <Pill tone="fail">Failed</Pill>
        </div>
      </SubCard>
    </div>
  );
}
