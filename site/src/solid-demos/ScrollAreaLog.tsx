import { For } from "solid-js";
import { ScrollArea } from "@glimstone/solid/ScrollArea";

const lines = Array.from({ length: 30 }, (_, i) => `04:${String(10 + i).padStart(2, "0")}  Copied folder ${i + 1} of 30`);

export default function ScrollAreaLog() {
  return (
    <div class="glim-well" style={{ width: "min(30rem, 100%)", padding: "0" }}>
      <ScrollArea label="Backup log" maxHeight="10rem">
        <div class="glim-num" style={{ padding: "12px", display: "grid", gap: "4px" }}>
          <For each={lines}>{(line) => <span>{line}</span>}</For>
        </div>
      </ScrollArea>
    </div>
  );
}
