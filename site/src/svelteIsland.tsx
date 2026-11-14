import { useEffect, useRef } from "react";
import { mount, unmount, type Component } from "svelte";

/** Mounts a Svelte component inside the React page, as an app of its own. */
export function SvelteIsland({ component }: { component: Component }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const app = mount(component, { target: host.current! });
    return () => void unmount(app);
  }, [component]);
  return <div ref={host} style={{ display: "contents" }} />;
}
