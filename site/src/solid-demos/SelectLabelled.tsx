import { createSignal } from "solid-js";
import { Button } from "@glimstone/solid";
import { Select } from "@glimstone/solid/Select";

const PLACES = [
  "/mnt/user/backups",
  "/mnt/user/backups/appdata/weekly/containers",
  "/mnt/disks/offsite-archive/vault/snapshots/2026",
].map((p) => ({ value: p, label: p }));

// A settings row whose name is a <label> of its own, outside the select.
export default function SelectLabelled() {
  const [place, setPlace] = createSignal(PLACES[1]!.value);
  let trigger!: HTMLButtonElement;
  return (
    <div style={{ display: "grid", gap: "12px", width: "320px" }}>
      <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
        <label for="backup-destination-solid" style={{ flex: "none", width: "88px" }}>
          Destination
        </label>
        <Select
          id="backup-destination-solid"
          ref={trigger}
          label="Destination"
          hideLabel
          wrap
          options={PLACES}
          value={place()}
          onChange={setPlace}
        />
      </div>
      <Button label="Choose the destination" labelKey={null} onClick={() => trigger.focus()} />
    </div>
  );
}
