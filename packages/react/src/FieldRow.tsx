import { useContext, useRef, type HTMLAttributes, type ReactNode } from "react";
import { pressRowControl, type PillTone } from "@glimstone/core";
import { FieldRowContext, FieldRowGroupContext } from "./fieldName.ts";
import { InfoBubble } from "./InfoBubble.tsx";
import { Pill } from "./Pill.tsx";

// One labelled row of a card or a window (rule 35): the name at its start and
// the control at its end, which takes its accessible name from `label`.

export interface FieldRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The row's name, and the accessible name of the control in it. */
  label: string;
  /** Draws the words in other markup, such as a quiet "optional". The name stays `label`. */
  drawn?: ReactNode;
  /** What the row does, drawn as an "(i)" beside the name. */
  hint?: string;
  /** A row with only a value to show holds it as a pill. */
  value?: string | number;
  /** The pill's tone. */
  tone?: PillTone;
  /** The control. */
  children?: ReactNode;
  className?: string;
}

export function FieldRow({ label, drawn, hint, value, tone, children, className, ...rest }: FieldRowProps) {
  const row = useRef<HTMLDivElement>(null);
  const inGroup = useContext(FieldRowGroupContext);
  const control =
    children ??
    (value !== undefined && (
      <Pill className="glim-num" tone={tone}>
        {value}
      </Pill>
    ));
  return (
    <FieldRowContext.Provider value={label}>
      <div {...rest} ref={row} className={className ? `glim-field-row ${className}` : "glim-field-row"}>
        <span className="glim-field-row-name">
          <span className="glim-field-row-label" onClick={() => pressRowControl(row.current!)}>
            {drawn ?? label}
          </span>
          {hint && <InfoBubble tip={hint} />}
        </span>
        {inGroup ? <span className="glim-field-row-controls">{control}</span> : control}
      </div>
    </FieldRowContext.Provider>
  );
}
