import { useRef, useState, type MouseEvent } from "react";
import { Button, ContextMenu, type MenuEntry } from "@glimstone/react";
import { Glyph } from "../glyph";

const FILES = ["holiday.mkv", "notes.pdf", "budget.ods"];

export default function ContextMenuRows() {
  const [at, setAt] = useState<{ x: number; y: number; opener?: HTMLElement } | null>(null);
  const [last, setLast] = useState("nothing yet");
  const [hidden, setHidden] = useState(false);
  const [sort, setSort] = useState("Name");
  const [kind, setKind] = useState(true);
  const more = useRef<HTMLButtonElement>(null);

  const items: MenuEntry[] = [
    { label: "Open", glyph: <Glyph name="IconFolderOpen" />, shortcut: "Enter", onSelect: () => setLast("Open") },
    { label: "Rename", glyph: <Glyph name="IconPencil" />, shortcut: "F2", onSelect: () => setLast("Rename") },
    { label: "Paste", glyph: <Glyph name="IconPaste" />, disabled: true },
    "-",
    "-",
    {
      label: "Sort by",
      subId: "demo-sort-menu",
      glyph: <Glyph name="IconSort" />,
      sub: ["Name", "Size", "Modified"].map((s) => ({ label: s, checked: sort === s, radio: true, onSelect: () => setSort(s) })),
    },
    {
      label: "Group",
      glyph: <Glyph name="IconFiles" />,
      sub: [{ label: "By kind", checked: kind, onSelect: () => setKind((k) => !k) }],
    },
    { label: "Show hidden files", checked: hidden, onSelect: () => setHidden((h) => !h) },
    { label: "Select the same kind", glyph: <Glyph name="IconSelectAll" />, count: 3, onSelect: () => setLast("Select the same kind") },
    { label: "Red label", color: "var(--status-fail-solid)", onSelect: () => setLast("Red label") },
    "-",
    { head: "Bookmarks", edit: { tip: "Edit bookmarks", onSelect: () => setLast("Edit bookmarks") } },
    { label: "Downloads", glyph: <Glyph name="IconFolder" />, onSelect: () => setLast("Downloads") },
    "-",
  ];

  const openAt = (e: MouseEvent) => {
    e.preventDefault();
    setAt({ x: e.clientX, y: e.clientY });
  };
  return (
    <div style={{ display: "grid", gap: 12, width: "100%" }}>
      <div onContextMenu={openAt} style={{ display: "grid", gap: 2 }} aria-label="Files" role="list">
        {FILES.map((f) => (
          <div key={f} role="listitem" className="glim-well" style={{ padding: "6px 10px" }}>
            {f}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button
          ref={more}
          label="More"
          labelKey="more"
          onClick={() => {
            const r = more.current!.getBoundingClientRect();
            setAt(at ? null : { x: r.left, y: r.bottom + 6, opener: more.current! });
          }}
        />
        <span data-last>
          Last choice: {last}. Sorted by {sort}. Hidden files {hidden ? "shown" : "hidden"}.
        </span>
      </div>
      {at && (
        <ContextMenu id="demo-file-menu" x={at.x} y={at.y} items={items} label="File" opener={at.opener} onClose={() => setAt(null)} />
      )}
    </div>
  );
}
