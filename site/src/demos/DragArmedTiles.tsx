import { useRef, useState, type PointerEvent } from "react";
import { useDragArmed } from "@glimstone/react";

const APPS = ["Mail", "Photos", "Music", "Notes", "Maps", "Files"];

export default function DragArmedTiles() {
  const list = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(APPS);
  const [held, setHeld] = useState<string | null>(null);
  const [shift, setShift] = useState<{ x: number; y: number } | null>(null);
  const start = useRef({ x: 0, y: 0 });
  useDragArmed(list, held !== null);

  const press = (e: PointerEvent<HTMLDivElement>, name: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setHeld(name);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (held !== null) setShift({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const drop = (e: PointerEvent<HTMLDivElement>) => {
    if (held === null) return;
    const target = [...list.current!.children].findIndex((tile, i) => {
      const r = tile.getBoundingClientRect();
      return order[i] !== held && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (target >= 0) {
      const next = order.filter((n) => n !== held);
      next.splice(target, 0, held);
      setOrder(next);
    }
    setHeld(null);
    setShift(null);
  };

  return (
    // The list rewrites its own class once the tile moves, which is what the hook has to survive.
    <div ref={list} role="list" aria-label="Apps" className={`demo-drag-tiles${shift ? " is-moving" : ""}`}>
      {order.map((name) => (
        <div
          key={name}
          role="listitem"
          className={`demo-drag-tile${held === name ? " glim-drag-lift" : ""}`}
          style={held === name && shift ? { translate: `${shift.x}px ${shift.y}px` } : undefined}
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
      ))}
    </div>
  );
}
