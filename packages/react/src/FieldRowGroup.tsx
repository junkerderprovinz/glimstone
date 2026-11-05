import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { FieldRowGroupContext } from "./fieldName.ts";

// Rows that share one column for their names, as wide as the longest, so fields
// that grow start at one edge. The rows stand directly inside it.

export interface FieldRowGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** The FieldRows. */
  children: ReactNode;
  /** Rows side by side, each column lining up its own names. A `wide` row spans them all. */
  columns?: 1 | 2;
  className?: string;
}

export function FieldRowGroup({ children, columns, className, style, ...rest }: FieldRowGroupProps) {
  return (
    <FieldRowGroupContext.Provider value={true}>
      <div {...rest} style={columns ? ({ ...style, "--field-columns": columns } as CSSProperties) : style} className={className ? `glim-field-row-group ${className}` : "glim-field-row-group"}>
        {children}
      </div>
    </FieldRowGroupContext.Provider>
  );
}
