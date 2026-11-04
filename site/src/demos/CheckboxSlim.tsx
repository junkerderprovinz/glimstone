import { useState } from "react";
import { Checkbox } from "@glimstone/react";

const files = ["thumbs.db", "desktop.ini", "old-cache.tmp"];

export default function CheckboxSlim() {
  const [picked, setPicked] = useState(new Set(["thumbs.db"]));
  const flip = (name: string, on: boolean) => {
    const next = new Set(picked);
    if (on) next.add(name);
    else next.delete(name);
    setPicked(next);
  };
  return (
    <div style={{ display: "grid", gap: 2, width: 280, fontSize: 13 }}>
      {files.map((name) => (
        <span key={name} className="demo-dense-row">
          <Checkbox slim label={name} checked={picked.has(name)} onChange={(on) => flip(name, on)} />
          {name}
        </span>
      ))}
    </div>
  );
}
