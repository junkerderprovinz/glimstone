import { createEffect, createSignal, Show } from "solid-js";
import { Button, Window } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const TEXT = { cancel: "Cancel", close: "Close" };

export default function WindowHooks() {
  const [open, setOpen] = createSignal(false);
  const [width, setWidth] = createSignal(0);
  let card: HTMLDivElement | undefined;
  createEffect(() => {
    if (open()) setWidth(card!.offsetWidth);
  });
  return (
    <>
      <Button label="Move files" labelKey={null} glyph={glyph("IconFolder")} onClick={() => setOpen(true)} />
      <Show when={open()}>
        <Window
          ref={card}
          title="Move files"
          drawn={
            <>
              Move files <span data-count>1,204</span>
            </>
          }
          text={TEXT}
          start="1,204 files from /mnt/user/media to /mnt/user/archive, about 38 GB, and both panels stay usable while they move"
          actions={[
            { label: "Move all 1,204 files to the archive", labelKey: null, glyph: glyph("IconFolder"), primary: true, attrs: { "data-action": "move" } },
          ]}
          onClose={() => setOpen(false)}
        >
          <p style={{ margin: 0 }}>{width()} px wide</p>
        </Window>
      </Show>
    </>
  );
}
