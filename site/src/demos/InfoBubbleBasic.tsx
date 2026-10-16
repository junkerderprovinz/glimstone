import { useState } from "react";
import { InfoBubble } from "@gs/react/InfoBubble";
import { Toggle } from "@gs/react/Toggle";

export default function InfoBubbleBasic() {
  const [on, setOn] = useState(true);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Toggle label="Verify after each run" checked={on} onChange={setOn} />
      <InfoBubble tip="Reads every file back from the target and compares it with the source. Takes about as long as the backup itself." />
    </span>
  );
}
