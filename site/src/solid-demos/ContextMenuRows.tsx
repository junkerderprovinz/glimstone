import { createSignal, For, Show } from "solid-js";
import { Button, ContextMenu, type MenuEntry } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

const FILES = ["holiday.mkv", "notes.pdf", "budget.ods"];

export default function ContextMenuRows() {
  const [at, setAt] = createSignal<{ x: number; y: number; opener?: HTMLElement } | null>(null);
  const [last, setLast] = createSignal("nothing yet");
  const [hidden, setHidden] = createSignal(false);
  const [sort, setSort] = createSignal("Name");
  const [kind, setKind] = createSignal(true);
  let more!: HTMLButtonElement;

  const items = (): MenuEntry[] => [
    { label: "Open", glyph: glyph("IconFolderOpen"), shortcut: "Enter", onSelect: () => setLast("Open") },
    { label: "Rename", glyph: glyph("IconPencil"), shortcut: "F2", onSelect: () => setLast("Rename") },
    { label: "Paste", glyph: glyph("IconPaste"), disabled: true },
    "-",
    "-",
    {
      label: "Sort by",
      subId: "demo-sort-menu",
      glyph: glyph("IconSort"),
      sub: ["Name", "Size", "Modified"].map((s) => ({ label: s, checked: sort() === s, radio: true, onSelect: () => setSort(s) })),
    },
    {
      label: "Group",
      glyph: glyph("IconFiles"),
      sub: [{ label: "By kind", checked: kind(), onSelect: () => setKind((k) => !k) }],
    },
    { label: "Show hidden files", checked: hidden(), onSelect: () => setHidden((h) => !h) },
    { label: "Select the same kind", glyph: glyph("IconSelectAll"), count: 3, onSelect: () => setLast("Select the same kind") },
    { label: "Red label", color: "var(--status-fail-solid)", onSelect: () => setLast("Red label") },
    "-",
    { head: "Bookmarks", edit: { tip: "Edit bookmarks", onSelect: () => setLast("Edit bookmarks") } },
    { label: "Downloads", glyph: glyph("IconFolder"), onSelect: () => setLast("Downloads") },
    "-",
  ];

  const openAt = (e: MouseEvent) => {
    e.preventDefault();
    setAt({ x: e.clientX, y: e.clientY });
  };
  return (
    <div style={{ display: "grid", gap: "12px", width: "100%" }}>
      <div onContextMenu={openAt} style={{ display: "grid", gap: "2px" }} aria-label="Files" role="list">
        <For each={FILES}>
          {(f) => (
            <div role="listitem" class="glim-well" style={{ padding: "6px 10px" }}>
              {f}
            </div>
          )}
        </For>
      </div>
      <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
        <Button
          ref={more}
          label="More"
          labelKey="more"
          onClick={() => {
            const r = more.getBoundingClientRect();
            setAt(at() ? null : { x: r.left, y: r.bottom + 6, opener: more });
          }}
        />
        <span data-last>
          Last choice: {last()}. Sorted by {sort()}. Hidden files {hidden() ? "shown" : "hidden"}.
        </span>
      </div>
      <Show when={at()}>
        {(point) => (
          <ContextMenu id="demo-file-menu" x={point().x} y={point().y} items={items()} label="File" opener={point().opener} onClose={() => setAt(null)} />
        )}
      </Show>
    </div>
  );
}
