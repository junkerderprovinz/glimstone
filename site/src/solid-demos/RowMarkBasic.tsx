import { createSignal, For } from "solid-js";
import { RowMark } from "@glimstone/solid";

const FILES = ["holiday.mkv", "notes.txt", "backup.tar"];

export default function RowMarkBasic() {
  const [picked, setPicked] = createSignal(new Set(["holiday.mkv"]));
  const flip = (name: string) => {
    const next = new Set(picked());
    if (!next.delete(name)) next.add(name);
    setPicked(next);
  };
  return (
    <div role="listbox" aria-multiselectable="true" aria-label="Files" style={{ display: "grid", gap: "2px", width: "280px", "font-size": "13px" }}>
      <For each={FILES}>
        {(name) => (
          <div role="option" aria-selected={picked().has(name)} class="demo-dense-row" onClick={() => flip(name)}>
            <RowMark on={picked().has(name)} />
            {name}
          </div>
        )}
      </For>
    </div>
  );
}
