import { useState } from "react";
import { Checkbox } from "@glimstone/react";

export default function CheckboxBasic() {
  const [again, setAgain] = useState(false);
  const [write, setWrite] = useState(true);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Checkbox label="Don't show again" checked={again} onChange={setAgain} />
      <Checkbox label="Name, always shown" checked disabled onChange={() => {}} />
      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
        Owner writes
        <Checkbox label="The owner may write" hideLabel checked={write} onChange={setWrite} />
      </span>
    </div>
  );
}
