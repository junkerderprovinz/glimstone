import { useState } from "react";
import { Tree, type TreeNode } from "@glimstone/react";
import { Glyph } from "../glyph";

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
  const [chosen, setChosen] = useState<string | null>("/mnt/user");
  const [acted, setActed] = useState("nothing");
  const [asked, setAsked] = useState(0);
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
    <div style={{ display: "grid", gap: 8, width: 300 }}>
      <div className="glim-well" style={{ padding: 8, minHeight: 200 }}>
        <Tree label="Folders" load={load} defaultOpen={["/mnt"]} value={chosen} onChange={setChosen} onActivate={setActed} />
      </div>
      <output>
        Acted on {acted}, {asked} lists asked for
      </output>
    </div>
  );
}
