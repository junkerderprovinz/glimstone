<script lang="ts">
  import { MenuBar, type MenuBarMenu } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  let last = $state("nothing yet");
  let hidden = $state(false);
  let layout = $state("Details");
  const run = (label: string) => () => (last = label);

  const menus: MenuBarMenu[] = $derived([
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
          sub: ["Details", "List", "Tiles"].map((l) => ({ label: l, checked: layout === l, radio: true, onSelect: () => (layout = l) })),
        },
        { label: "Show hidden files", checked: hidden, onSelect: () => (hidden = !hidden) },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Keyboard shortcuts", glyph: glyph("IconKeyboard"), shortcut: "F1", onSelect: run("Keyboard shortcuts") },
        { label: "About", glyph: glyph("IconInfo"), onSelect: run("About") },
      ],
    },
  ]);
</script>

<div style="display: grid; gap: 12px">
  <MenuBar label="Menu" {menus} />
  <span data-last>Last choice: {last}. Layout {layout}.</span>
</div>
