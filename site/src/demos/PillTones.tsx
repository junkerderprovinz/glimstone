import { Pill } from "@glimstone/react";

export default function PillTones() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Pill className="glim-num">4.2 GB</Pill>
      <Pill tone="state">Running</Pill>
      <Pill tone="ok">Done</Pill>
      <Pill tone="warn">Waiting</Pill>
      <Pill tone="fail">Failed</Pill>
    </div>
  );
}
