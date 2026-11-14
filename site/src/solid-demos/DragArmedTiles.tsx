import { createSignal, For } from "solid-js";
import { dropIndex } from "@glimstone/core";
import { useDragArmed } from "@glimstone/solid";

const APPS = ["Mail", "Photos", "Music", "Notes", "Maps", "Files"];

export default function DragArmedTiles() {
  let list!: HTMLDivElement;
  const [order, setOrder] = createSignal(APPS);
  const [held, setHeld] = createSignal<string | null>(null);
  const [shift, setShift] = createSignal<{ x: number; y: number } | null>(null);
  let start = { x: 0, y: 0 };
  useDragArmed(() => list, () => held() !== null);

  const press = (e: PointerEvent & { currentTarget: HTMLDivElement }, name: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start = { x: e.clientX, y: e.clientY };
    setHeld(name);
  };
  const move = (e: PointerEvent) => {
    if (held() !== null) setShift({ x: e.clientX - start.x, y: e.clientY - start.y });
  };
  const drop = () => {
    const name = held();
    if (name === null) return;
    // Offsets leave out the lift's scale and translate, so each box is a tile's place.
    const boxes = [...list.children].map((t) => {
      const tile = t as HTMLElement;
      return { left: tile.offsetLeft, top: tile.offsetTop, width: tile.offsetWidth, height: tile.offsetHeight };
    });
    const at = order().indexOf(name);
    const from = boxes[at]!;
    const moved = { ...from, left: from.left + (shift()?.x ?? 0), top: from.top + (shift()?.y ?? 0) };
    const next = order().filter((n) => n !== name);
    next.splice(dropIndex(moved, from, boxes.filter((_, i) => i !== at), { axis: "grid" }), 0, name);
    setOrder(next);
    setHeld(null);
    setShift(null);
  };

  return (
    // The list rewrites its own class once the tile moves, which is what the hook has to survive.
    <div ref={list} role="list" aria-label="Apps" class={`demo-drag-tiles${shift() ? " is-moving" : ""}`}>
      <For each={order()}>
        {(name) => (
          <div
            role="listitem"
            class={`demo-drag-tile${held() === name ? " glim-drag-lift" : ""}`}
            style={held() === name && shift() ? { translate: `${shift()!.x}px ${shift()!.y}px` } : undefined}
            onPointerDown={(e) => press(e, name)}
            onPointerMove={move}
            onPointerUp={drop}
            onPointerCancel={() => {
              setHeld(null);
              setShift(null);
            }}
          >
            {name}
          </div>
        )}
      </For>
    </div>
  );
}
