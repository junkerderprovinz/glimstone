import { useState } from "react";
import { IconButton } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function IconButtonBasic() {
  const [pressed, setPressed] = useState(0);
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <div style={{ display: "flex", gap: 2 }}>
        <IconButton tip="Copy the path" glyph={<Glyph name="IconCopy" />} data-hook="copy" onClick={() => setPressed((n) => n + 1)} />
        <span className="glim-icon-btn-gap" />
        <IconButton tip="Delete" glyph={<Glyph name="IconTrash" />} disabled onClick={() => setPressed((n) => n + 1)} />
      </div>
      <output>Pressed {pressed}</output>
    </div>
  );
}
