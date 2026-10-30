import { useEffect, useRef } from "react";
import { mountSelect } from "@gs/select";

const zone = (z: string) => ({ value: z, label: z });

// Only this frame is React; everything inside the box is mounted by plain DOM code.
export default function SelectVanilla() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const select = mountSelect(box.current!, {
      id: "vanilla-zone",
      label: "Time zone, no framework",
      value: "UTC",
      groups: [
        { options: [zone("UTC")] },
        { heading: "Europe", options: ["Europe/Berlin", "Europe/Vienna"].map(zone) },
        { heading: "Elsewhere", options: ["America/New_York", "Asia/Tokyo"].map(zone) },
      ],
    });
    return select.destroy;
  }, []);
  return <div ref={box} style={{ width: 260 }} />;
}
