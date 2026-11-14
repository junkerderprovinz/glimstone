import { useState } from "react";
import { TagsInput } from "@glimstone/react/TagsInput";

export default function TagsInputLabels() {
  const [labels, setLabels] = useState(["photos", "weekly"]);
  return (
    <div style={{ width: "min(26rem, 100%)", display: "grid", gap: 12 }}>
      <TagsInput label="Labels" value={labels} onChange={setLabels} placeholder="Add a label" />
      <span className="glim-num">{labels.length === 1 ? "1 label" : `${labels.length} labels`}</span>
    </div>
  );
}
