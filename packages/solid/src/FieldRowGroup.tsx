import { splitProps, type JSX } from "solid-js";
import { FieldRowGroupContext } from "./fieldName.ts";

// Rows that share one column for their names, as wide as the longest, so fields
// that grow start at one edge. The rows stand directly inside it.

export interface FieldRowGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style"> {
  /** The FieldRows. */
  children: JSX.Element;
  /** Rows side by side, each column lining up its own names. A `wide` row spans them all. */
  columns?: 1 | 2;
  class?: string;
  style?: JSX.CSSProperties;
}

export function FieldRowGroup(props: FieldRowGroupProps) {
  const [own, rest] = splitProps(props, ["children", "columns", "class", "style"]);
  return (
    <FieldRowGroupContext.Provider value={true}>
      <div
        data-glim="FieldRowGroup"
        {...rest}
        style={own.columns ? { ...own.style, "--field-columns": String(own.columns) } : own.style}
        class={own.class ? `glim-field-row-group ${own.class}` : "glim-field-row-group"}
      >
        {own.children}
      </div>
    </FieldRowGroupContext.Provider>
  );
}
