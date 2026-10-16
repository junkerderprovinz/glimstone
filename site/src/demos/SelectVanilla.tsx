import { useEffect, useRef } from "react";
import { mountSelect } from "@gs/select";

const ZONES = ["Europe/Vienna", "Europe/Berlin", "America/New_York", "Asia/Tokyo", "UTC"].map((z) => ({ value: z, label: z }));

// Only this frame is React; everything inside the box is mounted by plain DOM code.
export default function SelectVanilla() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const select = mountSelect(box.current!, { id: "vanilla-zone", label: "Time zone, no framework", options: ZONES, value: "UTC" });
    return select.destroy;
  }, []);
  return <div ref={box} style={{ width: 260 }} />;
}
