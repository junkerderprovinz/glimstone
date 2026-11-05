import { useState } from "react";
import { IconButton } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function IconButtonBasic() {
  const [pressed, setPressed] = useState(0);
  const [pinned, setPinned] = useState(false);
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <div data-row style={{ display: "flex", gap: 2 }}>
        <IconButton tip="Copy the path" glyph={<Glyph name="IconCopy" />} data-hook="copy" onClick={() => setPressed((n) => n + 1)} />
        <IconButton tip="Move up" glyph={<Glyph name="IconMoveUp" />} absent />
        <IconButton tip="Delete" glyph={<Glyph name="IconTrash" />} disabled onClick={() => setPressed((n) => n + 1)} />
        <IconButton tip="Pin" glyph={<Glyph name="IconPencil" />} pressed={pinned} onClick={() => setPinned(!pinned)} />
        <IconButton tip="Open the manual" glyph={<Glyph name="IconBook" />} href="#/guide/palette" />
      </div>
      <output>Pressed {pressed}</output>
    </div>
  );
}
