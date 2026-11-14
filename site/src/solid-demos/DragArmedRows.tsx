import { createSignal, For } from "solid-js";
import { dropIndex } from "@glimstone/core";
import { useDragArmed } from "@glimstone/solid";

const DOWNLOADS = ["debian-13.iso", "podcast-episode-212.mp3", "photos-2026.zip", "firmware-v4.bin", "dataset.tar.gz"];

export default function DragArmedRows() {
  let list!: HTMLDivElement;
  const [order, setOrder] = createSignal(DOWNLOADS);
  const [held, setHeld] = createSignal<string | null>(null);
  const [shift, setShift] = createSignal(0);
  let start = 0;
  useDragArmed(() => list, () => held() !== null);

  const press = (e: PointerEvent & { currentTarget: HTMLDivElement }, name: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start = e.clientY;
    setHeld(name);
  };
  const move = (e: PointerEvent) => {
    if (held() !== null) setShift(e.clientY - start);
  };
  const cancel = () => {
    setHeld(null);
    setShift(0);
  };
  const drop = () => {
    const name = held();
    if (name === null) return;
    const boxes = [...list.children].map((r) => {
      const row = r as HTMLElement;
      return { left: row.offsetLeft, top: row.offsetTop, width: row.offsetWidth, height: row.offsetHeight };
    });
    const at = order().indexOf(name);
    const from = boxes[at]!;
    const next = order().filter((n) => n !== name);
    next.splice(dropIndex({ ...from, top: from.top + shift() }, from, boxes.filter((_, i) => i !== at)), 0, name);
    setOrder(next);
    cancel();
  };

  return (
    // Rows as wide as the list tremble with the row wiggle, which tilts them far less.
    <div ref={list} role="list" aria-label="Downloads" class="demo-drag-rows glim-drag-rows">
      <For each={order()}>
        {(name) => (
          <div
            role="listitem"
            class={`demo-drag-row${held() === name ? " glim-drag-lift" : ""}`}
            style={held() === name ? { translate: `0 ${shift()}px` } : undefined}
            onPointerDown={(e) => press(e, name)}
            onPointerMove={move}
            onPointerUp={drop}
            onPointerCancel={cancel}
          >
            {name}
          </div>
        )}
      </For>
    </div>
  );
}
