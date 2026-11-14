import { createSignal, Show } from "solid-js";
import { FieldRow, PathField, Tree, Window, type TreeNode } from "@glimstone/solid";
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
  const [path, setPath] = createSignal("/mnt/user/media");
  const [picked, setPicked] = createSignal("");
  const [asked, setAsked] = createSignal<{ chosen: string; answer: (path: string | null) => void } | null>(null);
  const finish = (answer: string | null) => {
    asked()!.answer(answer);
    setAsked(null);
  };
  return (
    <div style={{ display: "grid", gap: "8px", width: "100%", "max-width": "560px" }}>
      <FieldRow label="Target">
        <PathField
          value={path()}
          onChange={setPath}
          onPicked={(p) => setPicked(`Picked ${p}`)}
          pick={(current) => new Promise((answer) => setAsked({ chosen: current, answer }))}
          text={{ pick: "Choose a folder" }}
          data-hook="target"
          buttonAttrs={{ "data-pick-for": "target" }}
        />
      </FieldRow>
      <div style={{ width: "340px" }}>
        <FieldRow label="Half">
          <PathField value={path()} onChange={setPath} pick={() => null} />
        </FieldRow>
      </div>
      <FieldRow label="Short">
        <PathField value={path()} onChange={setPath} pick={() => null} width="medium" />
      </FieldRow>
      <output>{picked()}</output>
      <Show when={asked()}>
        {(open) => (
          <Window
            title="Choose a folder"
            text={TEXT}
            actions={[{ label: "Choose", labelKey: null, glyph: <Glyph name="IconCheck" />, primary: true, onClick: () => finish(open().chosen) }]}
            onClose={() => finish(null)}
          >
            <div class="glim-well" style={{ padding: "8px" }}>
              <Tree
                label="Folders"
                load={load}
                defaultOpen={parents(open().chosen)}
                value={open().chosen}
                onChange={(chosen) => setAsked({ ...open(), chosen })}
                onActivate={finish}
              />
            </div>
          </Window>
        )}
      </Show>
    </div>
  );
}
