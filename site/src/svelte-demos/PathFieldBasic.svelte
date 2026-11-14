<script lang="ts">
  import { FieldRow, PathField, Tree, Window, type TreeNode } from "@glimstone/svelte";
  import { glyph } from "../svelte/glyph";

  const FOLDERS: Record<string, { name: string; kids: boolean }[]> = {
    "": [
      { name: "mnt", kids: true },
      { name: "boot", kids: false },
    ],
    "/mnt": [
      { name: "user", kids: true },
      { name: "disk1", kids: false },
    ],
    "/mnt/user": [
      { name: "media", kids: false },
      { name: "archive", kids: false },
    ],
  };

  const TEXT = { cancel: "Cancel", close: "Close" };

  async function load(id: string | null): Promise<TreeNode[]> {
    return (FOLDERS[id ?? ""] ?? []).map((f) => ({
      id: `${id ?? ""}/${f.name}`,
      label: f.name,
      hasChildren: f.kids,
      glyph: glyph("IconFolder"),
      openGlyph: glyph("IconFolderOpen"),
    }));
  }

  const parents = (path: string) => path.split("/").filter(Boolean).map((_, i, all) => `/${all.slice(0, i + 1).join("/")}`);

  let path = $state("/mnt/user/media");
  let picked = $state("");
  let asked = $state<{ chosen: string; answer: (path: string | null) => void } | null>(null);

  function finish(answer: string | null) {
    asked!.answer(answer);
    asked = null;
  }
</script>

<div style="display: grid; gap: 8px; width: 100%; max-width: 560px">
  <FieldRow label="Target">
    <PathField
      bind:value={path}
      onPicked={(p) => (picked = `Picked ${p}`)}
      pick={(current) => new Promise((answer) => (asked = { chosen: current, answer }))}
      text={{ pick: "Choose a folder" }}
      data-hook="target"
      buttonAttrs={{ "data-pick-for": "target" }}
    />
  </FieldRow>
  <div style="width: 340px">
    <FieldRow label="Half">
      <PathField bind:value={path} pick={() => null} />
    </FieldRow>
  </div>
  <FieldRow label="Short">
    <PathField bind:value={path} pick={() => null} width="medium" />
  </FieldRow>
  <output>{picked}</output>
  {#if asked}
    <Window
      title="Choose a folder"
      text={TEXT}
      actions={[{ label: "Choose", labelKey: null, glyph: glyph("IconCheck"), primary: true, onClick: () => finish(asked!.chosen) }]}
      onClose={() => finish(null)}
    >
      <div class="glim-well" style="padding: 8px">
        <Tree label="Folders" {load} defaultOpen={parents(asked.chosen)} bind:value={asked.chosen} onActivate={finish} />
      </div>
    </Window>
  {/if}
</div>
