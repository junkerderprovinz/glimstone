import { createSignal } from "solid-js";
import { Button } from "@glimstone/solid";
import { Tour } from "@glimstone/solid/Tour";

export default function TourFirstStart() {
  const [open, setOpen] = createSignal(false);
  let add: HTMLDivElement | undefined;
  let search: HTMLDivElement | undefined;
  const steps = [
    { id: "add", target: () => add ?? null, title: "Add a backup", description: "Everything starts here: pick what to back up and where it goes." },
    { id: "search", target: () => search ?? null, title: "Find a file", description: "Search every backup at once, by name or by folder." },
    { id: "end", title: "That is all", description: "The rest is on the Help page whenever it is needed." },
  ];
  return (
    <div style={{ display: "flex", gap: "12px", "align-items": "center", "flex-wrap": "wrap" }}>
      <div ref={add} style={{ padding: "8px" }}>
        Add
      </div>
      <div ref={search} style={{ padding: "8px" }}>
        Search
      </div>
      <Button label="Start the tour" labelKey={null} onClick={() => setOpen(true)} />
      <Tour steps={steps} open={open()} onOpenChange={setOpen} />
    </div>
  );
}
