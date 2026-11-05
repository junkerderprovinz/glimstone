import { useState } from "react";
import { FieldRow, PathField, Tree, Window, type TreeNode } from "@glimstone/react";
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

const TEXT = { cancel: "Cancel", close: "Close" };

async function load(id: string | null): Promise<TreeNode[]> {
  return (FOLDERS[id ?? ""] ?? []).map((f) => ({
    id: `${id ?? ""}/${f.name}`,
    label: f.name,
    hasChildren: f.kids,
    glyph: <Glyph name="IconFolder" />,
    openGlyph: <Glyph name="IconFolderOpen" />,
  }));
}

const parents = (path: string) => path.split("/").filter(Boolean).map((_, i, all) => `/${all.slice(0, i + 1).join("/")}`);

export default function PathFieldBasic() {
  const [path, setPath] = useState("/mnt/user/media");
  const [picked, setPicked] = useState("");
  const [asked, setAsked] = useState<{ chosen: string; answer: (path: string | null) => void } | null>(null);
  const finish = (answer: string | null) => {
    asked!.answer(answer);
    setAsked(null);
  };
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 560 }}>
      <FieldRow label="Target">
        <PathField
          value={path}
          onChange={setPath}
          onPicked={(p) => setPicked(`Picked ${p}`)}
          pick={(current) => new Promise((answer) => setAsked({ chosen: current, answer }))}
          text={{ pick: "Choose a folder" }}
          data-hook="target"
          buttonAttrs={{ "data-pick-for": "target" }}
        />
      </FieldRow>
      <div style={{ width: 340 }}>
        <FieldRow label="Half">
          <PathField value={path} onChange={setPath} pick={() => null} />
        </FieldRow>
      </div>
      <FieldRow label="Short">
        <PathField value={path} onChange={setPath} pick={() => null} width="medium" />
      </FieldRow>
      <output>{picked}</output>
      {asked && (
        <Window
          title="Choose a folder"
          text={TEXT}
          actions={[{ label: "Choose", labelKey: null, glyph: <Glyph name="IconCheck" />, primary: true, onClick: () => finish(asked.chosen) }]}
          onClose={() => finish(null)}
        >
          <div className="glim-well" style={{ padding: 8 }}>
            <Tree
              label="Folders"
              load={load}
              defaultOpen={parents(asked.chosen)}
              value={asked.chosen}
              onChange={(chosen) => setAsked({ ...asked, chosen })}
              onActivate={finish}
            />
          </div>
        </Window>
      )}
    </div>
  );
}
