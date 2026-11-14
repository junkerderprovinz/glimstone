import { createSignal, For } from "solid-js";
import { DropdownListbox } from "@glimstone/solid";

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"];

export default function DropdownSelect() {
  const [open, setOpen] = createSignal(false);
  const [zone, setZone] = createSignal(ZONES[0]!);
  const [trigger, setTrigger] = createSignal<HTMLButtonElement>();
  return (
    <>
      <button
        ref={setTrigger}
        type="button"
        class="field"
        style={{ "min-width": "220px", "text-align": "start", cursor: "pointer" }}
        aria-haspopup="listbox"
        aria-expanded={open()}
        onClick={() => setOpen((o) => !o)}
      >
        {zone()}
      </button>
      <DropdownListbox open={open()} onClose={() => setOpen(false)} triggerRef={trigger()} label="Time zone">
        <For each={ZONES}>
          {(z) => (
            <button
              type="button"
              role="option"
              aria-selected={z === zone()}
              class="block w-full px-3 py-2 text-start text-sm text-carbon-text hover:bg-carbon-hover aria-selected:font-semibold"
              onClick={() => {
                setZone(z);
                setOpen(false);
              }}
            >
              {z}
            </button>
          )}
        </For>
      </DropdownListbox>
    </>
  );
}
