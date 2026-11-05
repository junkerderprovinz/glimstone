import type { HTMLAttributes, ReactNode } from "react";
import { FieldRowGroupContext } from "./fieldName.ts";

// Rows that share one column for their names, as wide as the longest, so fields
// that grow start at one edge. The rows stand directly inside it.

export interface FieldRowGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** The FieldRows. */
  children: ReactNode;
  className?: string;
}

export function FieldRowGroup({ children, className, ...rest }: FieldRowGroupProps) {
  return (
    <FieldRowGroupContext.Provider value={true}>
      <div {...rest} className={className ? `glim-field-row-group ${className}` : "glim-field-row-group"}>
        {children}
      </div>
    </FieldRowGroupContext.Provider>
  );
}
