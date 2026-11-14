import { createSignal } from "solid-js";
import { TagsInput } from "@glimstone/solid/TagsInput";

export default function TagsInputLabels() {
  const [labels, setLabels] = createSignal(["photos", "weekly"]);
  return (
    <div style={{ width: "min(26rem, 100%)", display: "grid", gap: "12px" }}>
      <TagsInput label="Labels" value={labels()} onChange={setLabels} placeholder="Add a label" />
      <span class="glim-num">{labels().length === 1 ? "1 label" : `${labels().length} labels`}</span>
    </div>
  );
}
