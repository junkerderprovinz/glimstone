import { useEffect, useRef } from "react";
import "../../../packages/core/vanilla/fortress-card.css";
import "../../../packages/core/vanilla/fortress-card.js";

declare global {
  interface Window {
    GlimFortressCard: { mount: (el: HTMLElement, adapter: unknown, opts: unknown) => { destroy: () => void } };
  }
}

// Only this frame is React; the card inside is drawn by plain DOM code, the
// adapter answers from memory as a plugin's server would.
const members = [
  { id: "m-bravo", app: "bravo", name: "Bravo", device: "Atlas", form: "container", version: "4.2.0", online: true },
  { id: "m-delta", app: "delta", name: "Delta", device: "Atlas", form: "plugin", version: "1.0.0", online: true, relay: true },
];

// A line of the app's own, as a plugin keeps one for what its own work does while it is out.
const hints = [{ text: "Alpha keeps its own keys only. If the fortress has a new phrase, enter it here.", tone: "quiet", action: { label: "Enter phrase again", join: true } }];

export default function FortressVanilla() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let state: Record<string, unknown> = { joined: false };
    const later = <T,>(v: T) => new Promise<T>((done) => setTimeout(() => done(v), 120));
    const adapter = {
      load: () => later(state),
      join: (words: string[]) =>
        words[0] === "wrong" ? Promise.reject({ code: "phrase" }) : later((state = { joined: true, device: "Atlas", members, removed: [], hints })),
      leave: () => later((state = { joined: false })),
      remove: (id: string) => {
        const gone = members.find((m) => m.id === id)!;
        state = { ...state, members: (state.members as typeof members).filter((m) => m.id !== id), removed: [gone] };
        return later(state);
      },
      status: () =>
        later({
          report: { state: "ok", needsYou: [], work: [{ title: "Checking images", progress: 0.4 }], next: [{ title: "Next check", at: "04:00" }] },
          log: [{ at: "20:10", level: "info", text: "Checked 14 containers" }],
        }),
    };
    const card = window.GlimFortressCard.mount(box.current!, adapter, { lang: "en", app: { id: "demo-alpha", name: "Alpha" } });
    return () => {
      card.destroy();
      localStorage.removeItem("glim-fortress-others-demo-alpha");
    };
  }, []);
  return <div ref={box} style={{ maxWidth: 760 }} />;
}
