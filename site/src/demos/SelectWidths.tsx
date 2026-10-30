import { useState } from "react";
import { Select, type SelectWidth } from "@gs/react/Select";

const KEEP = [
  { value: "d", label: "Days" },
  { value: "m", label: "Months" },
  { value: "x", label: "Until somebody removes them" },
];

// Each row is a settings row: the name at the start, the select at the end.
function Row({ width, room }: { width: SelectWidth; room: number }) {
  const [value, setValue] = useState("d");
  return (
    <div data-width={width} style={{ display: "flex", alignItems: "center", gap: 12, width: room }}>
      <span style={{ flex: "none", width: 64, color: "var(--carbon-text-sub)" }}>{width}</span>
      <Select label={`Keep backups, ${width}`} hideLabel width={width} options={KEEP} value={value} onChange={setValue} />
    </div>
  );
}

export default function SelectWidths() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Row width="fill" room={360} />
      <Row width="steady" room={360} />
      <Row width="squeeze" room={200} />
      <Row width="hug" room={360} />
    </div>
  );
}
