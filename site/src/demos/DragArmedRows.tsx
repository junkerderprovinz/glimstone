import { useRef, useState, type PointerEvent } from "react";
import { dropIndex } from "@glimstone/core";
import { useDragArmed } from "@glimstone/react";

const DOWNLOADS = ["debian-13.iso", "podcast-episode-212.mp3", "photos-2026.zip", "firmware-v4.bin", "dataset.tar.gz"];

export default function DragArmedRows() {
  const list = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(DOWNLOADS);
  const [held, setHeld] = useState<string | null>(null);
  const [shift, setShift] = useState(0);
  const start = useRef(0);
  useDragArmed(list, held !== null);

  const press = (e: PointerEvent<HTMLDivElement>, name: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = e.clientY;
    setHeld(name);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (held !== null) setShift(e.clientY - start.current);
  };
  const cancel = () => {
    setHeld(null);
    setShift(0);
  };
  const drop = () => {
    if (held === null) return;
    const boxes = [...list.current!.children].map((r) => {
      const row = r as HTMLElement;
      return { left: row.offsetLeft, top: row.offsetTop, width: row.offsetWidth, height: row.offsetHeight };
    });
    const at = order.indexOf(held);
    const from = boxes[at];
    const next = order.filter((n) => n !== held);
    next.splice(dropIndex({ ...from, top: from.top + shift }, from, boxes.filter((_, i) => i !== at)), 0, held);
    setOrder(next);
    cancel();
  };

  return (
    // Rows as wide as the list tremble with the row wiggle, which tilts them far less.
    <div ref={list} role="list" aria-label="Downloads" className="demo-drag-rows glim-drag-rows">
      {order.map((name) => (
        <div
          key={name}
          role="listitem"
          className={`demo-drag-row${held === name ? " glim-drag-lift" : ""}`}
          style={held === name ? { translate: `0 ${shift}px` } : undefined}
          onPointerDown={(e) => press(e, name)}
          onPointerMove={move}
          onPointerUp={drop}
          onPointerCancel={cancel}
        >
          {name}
        </div>
      ))}
    </div>
  );
}
