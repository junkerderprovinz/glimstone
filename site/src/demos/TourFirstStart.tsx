import { useRef, useState } from "react";
import { Button } from "@glimstone/react";
import { Tour } from "@glimstone/react/Tour";

export default function TourFirstStart() {
  const [open, setOpen] = useState(false);
  const add = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLDivElement>(null);
  const steps = [
    { id: "add", target: () => add.current, title: "Add a backup", description: "Everything starts here: pick what to back up and where it goes." },
    { id: "search", target: () => search.current, title: "Find a file", description: "Search every backup at once, by name or by folder." },
    { id: "end", title: "That is all", description: "The rest is on the Help page whenever it is needed." },
  ];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <div ref={add} style={{ padding: 8 }}>
        Add
      </div>
      <div ref={search} style={{ padding: 8 }}>
        Search
      </div>
      <Button label="Start the tour" labelKey={null} onClick={() => setOpen(true)} />
      <Tour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  );
}
