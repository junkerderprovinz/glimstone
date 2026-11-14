import { createSignal } from "solid-js";
import { Tree, type TreeNode } from "@glimstone/solid";
import { Glyph } from "../solid/glyph";

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

export default function TreeBasic() {
  const [chosen, setChosen] = createSignal<string | null>("/mnt/user");
  const [acted, setActed] = createSignal("nothing");
  const [asked, setAsked] = createSignal(0);
  const load = async (id: string | null): Promise<TreeNode[]> => {
    setAsked((n) => n + 1);
    return (FOLDERS[id ?? ""] ?? []).map((f) => {
      const path = `${id ?? ""}/${f.name}`;
      return {
        id: path,
        label: f.name,
        hasChildren: f.kids,
        glyph: <Glyph name="IconFolder" />,
        openGlyph: <Glyph name="IconFolderOpen" />,
        attrs: { "data-pick": path },
      };
    });
  };
  return (
    <div style={{ display: "grid", gap: "8px", width: "300px" }}>
      <div class="glim-well" style={{ padding: "8px", "min-height": "200px" }}>
        <Tree label="Folders" load={load} defaultOpen={["/mnt"]} value={chosen()} onChange={setChosen} onActivate={setActed} />
      </div>
      <output>
        Acted on {acted()}, {asked()} lists asked for
      </output>
    </div>
  );
}
