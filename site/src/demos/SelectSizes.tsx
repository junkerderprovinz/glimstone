import { useState } from "react";
import { Select } from "@gs/react/Select";

const QUALITY = ["Auto", "1080p", "720p", "480p"].map((q) => ({ value: q, label: q }));
const SCOPE = [
  { value: "all", label: "Everywhere" },
  { value: "names", label: "Names" },
  { value: "hosts", label: "Hosts" },
];

export default function SelectSizes() {
  const [quality, setQuality] = useState("1080p");
  const [scope, setScope] = useState("all");
  return (
    <div style={{ display: "grid", gap: 16, width: 360 }}>
      {/* A list row: the name, then a picker that has no label of its own. */}
      <div data-size="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ flex: 1, minWidth: 0 }}>Concert recording.mkv</span>
        <Select label="Quality" hideLabel tip="Quality" size="row" options={QUALITY} value={quality} onChange={setQuality} />
      </div>
      {/* A search field with its scope inside it, at its end. */}
      <div data-size="inset" className="field" style={{ display: "flex", alignItems: "center", gap: 8, paddingInlineEnd: 4 }}>
        <input aria-label="Search" placeholder="Search" style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", color: "inherit", font: "inherit", outline: "none" }} />
        <Select label="Search in" hideLabel size="inset" options={SCOPE} value={scope} onChange={setScope} />
      </div>
    </div>
  );
}
