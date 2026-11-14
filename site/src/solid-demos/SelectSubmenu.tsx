import { createSignal } from "solid-js";
import { Select } from "@glimstone/solid/Select";

const zone = (z: string) => ({ value: z, label: z.split("/").pop()!.replace("_", " ") });

export default function SelectSubmenu() {
  const [value, setValue] = createSignal("Europe/Vienna");
  return (
    <div style={{ width: "260px" }}>
      <Select
        label="Server time zone"
        value={value()}
        onChange={setValue}
        groups={[
          { entries: [{ value: "UTC", label: "UTC" }] },
          {
            heading: "By region",
            entries: [
              { label: "Europe", options: ["Europe/Berlin", "Europe/Lisbon", "Europe/Vienna"].map(zone) },
              { label: "America", options: ["America/Chicago", "America/Los_Angeles", "America/New_York"].map(zone) },
              { label: "Asia", options: ["Asia/Kolkata", "Asia/Tokyo"].map(zone) },
            ],
          },
        ]}
      />
    </div>
  );
}
