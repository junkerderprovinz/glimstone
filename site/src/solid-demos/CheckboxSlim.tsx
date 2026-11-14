import { createSignal, For } from "solid-js";
import { Checkbox } from "@glimstone/solid";

const files = ["thumbs.db", "desktop.ini", "old-cache.tmp"];

export default function CheckboxSlim() {
  const [picked, setPicked] = createSignal(new Set(["thumbs.db"]));
  const flip = (name: string, on: boolean) => {
    const next = new Set(picked());
    if (on) next.add(name);
    else next.delete(name);
    setPicked(next);
  };
  return (
    <div style={{ display: "grid", gap: "2px", width: "280px", "font-size": "13px" }}>
      <For each={files}>
        {(name) => (
          <span class="demo-dense-row">
            <Checkbox slim label={name} checked={picked().has(name)} onChange={(on) => flip(name, on)} />
            {name}
          </span>
        )}
      </For>
    </div>
  );
}
