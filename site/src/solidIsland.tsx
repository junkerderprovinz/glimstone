import { useEffect, useRef } from "react";
import { render } from "solid-js/web";

/** Mounts a Solid component inside the React page, as a root of its own. */
export function SolidIsland({ component }: { component: () => unknown }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => render(component as () => never, host.current!), [component]);
  return <div ref={host} style={{ display: "contents" }} />;
}
