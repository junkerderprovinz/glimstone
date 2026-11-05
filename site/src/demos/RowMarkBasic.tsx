import { useState } from "react";
import { RowMark } from "@glimstone/react";

const FILES = ["holiday.mkv", "notes.txt", "backup.tar"];

export default function RowMarkBasic() {
  const [picked, setPicked] = useState(new Set(["holiday.mkv"]));
  const flip = (name: string) => {
    const next = new Set(picked);
    if (!next.delete(name)) next.add(name);
    setPicked(next);
  };
  return (
    <div role="listbox" aria-multiselectable="true" aria-label="Files" style={{ display: "grid", gap: 2, width: 280, fontSize: 13 }}>
      {FILES.map((name) => (
        <div key={name} role="option" aria-selected={picked.has(name)} className="demo-dense-row" onClick={() => flip(name)}>
          <RowMark on={picked.has(name)} />
          {name}
        </div>
      ))}
    </div>
  );
}
