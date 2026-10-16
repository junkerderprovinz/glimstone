import { useState } from "react";
import { Toggle } from "@gs/react/Toggle";

export default function ToggleBasic() {
  const [quiet, setQuiet] = useState(true);
  const [sound, setSound] = useState(false);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Toggle label="Quiet notifications" checked={quiet} onChange={setQuiet} />
      <Toggle label="Play a sound" checked={sound} onChange={setSound} disabled={!quiet} />
    </div>
  );
}
