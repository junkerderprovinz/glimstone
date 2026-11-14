import { IconCheck } from "./glyphs.tsx";

// The round mark on a row picked for an action on many (rule 39). It is a
// picture: the row says it is picked, with aria-selected.

export interface RowMarkProps {
  on?: boolean;
  class?: string;
}

export function RowMark(props: RowMarkProps) {
  const classes = () => ["glim-rowmark", props.on && "glim-rowmark--on", props.class].filter(Boolean).join(" ");
  return (
    <span data-glim="RowMark" class={classes()} aria-hidden="true">
      <IconCheck />
    </span>
  );
}
