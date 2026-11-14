import { createSignal } from "solid-js";
import { MenuBar, type MenuBarMenu } from "@glimstone/solid";
import { glyph } from "../solid/glyph";

export default function MenuBarDemo() {
  const [last, setLast] = createSignal("nothing yet");
  const [hidden, setHidden] = createSignal(false);
  const [layout, setLayout] = createSignal("Details");
  const run = (label: string) => () => setLast(label);
  const menus = (): MenuBarMenu[] => [
    {
      label: "File",
      id: "demo-bar-file",
      items: [
        { label: "New folder", glyph: glyph("IconFolderAdd"), shortcut: "F7", onSelect: run("New folder") },
        { label: "Upload", glyph: glyph("IconUpload"), onSelect: run("Upload") },
        "-",
        { label: "Delete", glyph: glyph("IconTrash"), shortcut: "Del", onSelect: run("Delete") },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Copy", glyph: glyph("IconCopy"), shortcut: "Ctrl+C", onSelect: run("Copy") },
        { label: "Paste", glyph: glyph("IconPaste"), shortcut: "Ctrl+V", onSelect: run("Paste") },
      ],
    },
    {
      label: "View",
      items: [
        {
          label: "Layout",
          glyph: glyph("IconTabApps"),
          sub: ["Details", "List", "Tiles"].map((l) => ({ label: l, checked: layout() === l, radio: true, onSelect: () => setLayout(l) })),
        },
        { label: "Show hidden files", checked: hidden(), onSelect: () => setHidden((h) => !h) },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Keyboard shortcuts", glyph: glyph("IconKeyboard"), shortcut: "F1", onSelect: run("Keyboard shortcuts") },
        { label: "About", glyph: glyph("IconInfo"), onSelect: run("About") },
      ],
    },
  ];
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <MenuBar label="Menu" menus={menus()} />
      <span data-last>
        Last choice: {last()}. Layout {layout()}.
      </span>
    </div>
  );
}
