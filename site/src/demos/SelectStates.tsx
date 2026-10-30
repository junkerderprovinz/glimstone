import { useState } from "react";
import { Select } from "@gs/react/Select";

const BACKENDS = [
  { value: "auto", label: "Automatic" },
  { value: "rd", label: "Real-Debrid" },
  { value: "ad", label: "AllDebrid" },
];

// A pick goes to the server, which takes a moment and refuses AllDebrid.
export default function SelectStates() {
  const [shown, setShown] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refused, setRefused] = useState(0);

  function pick(next: string) {
    const before = shown;
    setShown(next);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (next === "ad") {
        setShown(before);
        setRefused((n) => n + 1);
      }
    }, 900);
  }

  return (
    <div style={{ display: "grid", gap: 16, width: 260 }}>
      <Select
        label="Backend"
        placeholder="Mixed"
        tip="Which service fetches the selected links"
        options={BACKENDS}
        value={shown}
        onChange={pick}
        busy={busy}
        shake={refused}
      />
      <Select label="Interface" options={[{ value: "eth0", label: "eth0" }]} value="eth0" onChange={() => {}} disabled />
    </div>
  );
}
