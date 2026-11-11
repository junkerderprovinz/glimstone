import type { ReactNode } from "react";

// A key or a key combination as it is written on the keys, such as "Ctrl+K".
// The words are the app's, so a German app writes "Strg".

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd data-glim="Kbd" className={className ? `glim-kbd ${className}` : "glim-kbd"}>{children}</kbd>;
}
