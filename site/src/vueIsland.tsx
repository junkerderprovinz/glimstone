import { useEffect, useId, useRef } from "react";
import { createApp, type Component } from "vue";
import "./vue/glyph";

/**
 * Mounts a Vue component inside the React page, as an app of its own. Vue
 * counts useId() per app, so each island takes a prefix of its own, or two
 * selects on one page would share their ids.
 */
export function VueIsland({ component }: { component: Component }) {
  const host = useRef<HTMLDivElement>(null);
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, "");
  useEffect(() => {
    const app = createApp(component);
    app.config.idPrefix = `v${prefix}`;
    app.mount(host.current!);
    return () => app.unmount();
  }, [component, prefix]);
  return <div ref={host} style={{ display: "contents" }} />;
}
