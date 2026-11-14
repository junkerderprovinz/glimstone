import { createSignal } from "solid-js";
import { Select, type SelectWidth } from "@glimstone/solid/Select";

const KEEP = [
  { value: "d", label: "Days" },
  { value: "m", label: "Months" },
  { value: "x", label: "Until somebody removes them" },
];

// Each row is a settings row: the name at the start, the select at the end.
function Row(props: { width: SelectWidth; room: number }) {
  const [value, setValue] = createSignal("d");
  return (
    <div data-width={props.width} style={{ display: "flex", "align-items": "center", gap: "12px", width: `${props.room}px` }}>
      <span style={{ flex: "none", width: "64px", color: "var(--carbon-text-sub)" }}>{props.width}</span>
      <Select label={`Keep backups, ${props.width}`} hideLabel width={props.width} options={KEEP} value={value()} onChange={setValue} />
    </div>
  );
}

export default function SelectWidths() {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <Row width="fill" room={360} />
      <Row width="steady" room={360} />
      <Row width="squeeze" room={200} />
      <Row width="hug" room={360} />
    </div>
  );
}
