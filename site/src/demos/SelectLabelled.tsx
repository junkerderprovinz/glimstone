import { useRef, useState } from "react";
import { Select } from "@gs/react/Select";

const PLACES = [
  "/mnt/user/backups",
  "/mnt/user/backups/appdata/weekly/containers",
  "/mnt/disks/offsite-archive/vault/snapshots/2026",
].map((p) => ({ value: p, label: p }));

// A settings row whose name is a <label> of its own, outside the select.
export default function SelectLabelled() {
  const [place, setPlace] = useState(PLACES[1].value);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div style={{ display: "grid", gap: 12, width: 320 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label htmlFor="backup-destination" style={{ flex: "none", width: 88 }}>
          Destination
        </label>
        <Select
          id="backup-destination"
          ref={trigger}
          label="Destination"
          hideLabel
          wrap
          options={PLACES}
          value={place}
          onChange={setPlace}
        />
      </div>
      <button type="button" className="field" onClick={() => trigger.current?.focus()}>
        Choose the destination
      </button>
    </div>
  );
}
