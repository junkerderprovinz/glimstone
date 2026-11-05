import { useState } from "react";
import { MenuBar, type MenuBarMenu } from "@glimstone/react";
import { Glyph } from "../glyph";

export default function MenuBarDemo() {
  const [last, setLast] = useState("nothing yet");
  const [hidden, setHidden] = useState(false);
  const [layout, setLayout] = useState("Details");
  const run = (label: string) => () => setLast(label);
  const menus: MenuBarMenu[] = [
    {
      label: "File",
      id: "demo-bar-file",
      items: [
        { label: "New folder", glyph: <Glyph name="IconFolderAdd" />, shortcut: "F7", onSelect: run("New folder") },
        { label: "Upload", glyph: <Glyph name="IconUpload" />, onSelect: run("Upload") },
        "-",
        { label: "Delete", glyph: <Glyph name="IconTrash" />, shortcut: "Del", onSelect: run("Delete") },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Copy", glyph: <Glyph name="IconCopy" />, shortcut: "Ctrl+C", onSelect: run("Copy") },
        { label: "Paste", glyph: <Glyph name="IconPaste" />, shortcut: "Ctrl+V", onSelect: run("Paste") },
      ],
    },
    {
      label: "View",
      items: [
        {
          label: "Layout",
          glyph: <Glyph name="IconTabApps" />,
          sub: ["Details", "List", "Tiles"].map((l) => ({ label: l, checked: layout === l, radio: true, onSelect: () => setLayout(l) })),
        },
        { label: "Show hidden files", checked: hidden, onSelect: () => setHidden((h) => !h) },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Keyboard shortcuts", glyph: <Glyph name="IconKeyboard" />, shortcut: "F1", onSelect: run("Keyboard shortcuts") },
        { label: "About", glyph: <Glyph name="IconInfo" />, onSelect: run("About") },
      ],
    },
  ];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MenuBar label="Menu" menus={menus} />
      <span data-last>
        Last choice: {last}. Layout {layout}.
      </span>
    </div>
  );
}
