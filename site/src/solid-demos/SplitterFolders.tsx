import { createSignal, For } from "solid-js";
import { Splitter } from "@glimstone/solid/Splitter";

const panels = [
  { id: "folders", minSize: 20, lines: ["Documents", "Photos", "Music"] },
  { id: "files", minSize: 30, lines: ["holiday.jpg", "harbour.jpg", "market.jpg"] },
];

export default function SplitterFolders() {
  const [size, setSize] = createSignal([35, 65]);
  return (
    <div style={{ display: "grid", gap: "12px", width: "min(36rem, 100%)" }}>
      <div class="glim-well" style={{ height: "160px", padding: "0" }}>
        <Splitter
          panels={panels}
          size={size()}
          onSizeChange={setSize}
          panel={(p) => (
            <ul style={{ margin: "0", padding: "12px", "list-style": "none" }}>
              <For each={p.lines}>{(line) => <li>{line}</li>}</For>
            </ul>
          )}
        />
      </div>
      <span class="glim-num">{`Folders ${Math.round(size()[0]!)} %, files ${Math.round(size()[1]!)} %`}</span>
    </div>
  );
}
