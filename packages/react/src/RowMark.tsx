import { IconCheck } from "./glyphs.tsx";

// The round mark on a row picked for an action on many (rule 39). It is a
// picture: the row says it is picked, with aria-selected.

export interface RowMarkProps {
  on?: boolean;
  className?: string;
}

export function RowMark({ on, className }: RowMarkProps) {
  const classes = ["glim-rowmark", on && "glim-rowmark--on", className].filter(Boolean).join(" ");
  return (
    <span data-glim="RowMark" className={classes} aria-hidden="true">
      <IconCheck />
    </span>
  );
}
