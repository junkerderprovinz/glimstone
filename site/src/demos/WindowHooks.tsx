import { useLayoutEffect, useRef, useState } from "react";
import { Button, Window } from "@glimstone/react";
import { Glyph } from "../glyph";

const TEXT = { cancel: "Cancel", close: "Close" };

export default function WindowHooks() {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (open) setWidth(card.current!.offsetWidth);
  }, [open]);
  return (
    <>
      <Button label="Move files" labelKey={null} glyph={<Glyph name="IconFolder" />} onClick={() => setOpen(true)} />
      {open && (
        <Window
          ref={card}
          title="Move files"
          text={TEXT}
          start="1,204 files from /mnt/user/media to /mnt/user/archive, about 38 GB, and both panels stay usable while they move"
          actions={[{ label: "Move all 1,204 files to the archive", labelKey: null, glyph: <Glyph name="IconFolder" />, primary: true, attrs: { "data-action": "move" } }]}
          onClose={() => setOpen(false)}
        >
          <p style={{ margin: 0 }}>{width} px wide</p>
        </Window>
      )}
    </>
  );
}
