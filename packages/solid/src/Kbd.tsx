import type { JSX } from "solid-js";

// A key or a key combination as it is written on the keys, such as "Ctrl+K".
// The words are the app's, so a German app writes "Strg".

export function Kbd(props: { children: JSX.Element; class?: string }) {
  return (
    <kbd data-glim="Kbd" class={props.class ? `glim-kbd ${props.class}` : "glim-kbd"}>
      {props.children}
    </kbd>
  );
}
