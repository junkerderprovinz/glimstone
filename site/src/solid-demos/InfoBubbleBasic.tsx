import { createSignal } from "solid-js";
import { InfoBubble, Toggle } from "@glimstone/solid";

export default function InfoBubbleBasic() {
  const [on, setOn] = createSignal(true);
  return (
    <span style={{ display: "inline-flex", "align-items": "center", gap: "8px" }}>
      <Toggle label="Verify after each run" checked={on()} onChange={setOn} />
      <InfoBubble tip="Reads every file back from the target and compares it with the source. Takes about as long as the backup itself." />
    </span>
  );
}
