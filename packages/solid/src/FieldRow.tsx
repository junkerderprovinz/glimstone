import { children, Show, splitProps, useContext, type JSX } from "solid-js";
import { pressRowControl, type PillTone } from "@glimstone/core";
import { FieldRowContext, FieldRowGroupContext } from "./fieldName.ts";
import { InfoBubble } from "./InfoBubble.tsx";
import { Pill } from "./Pill.tsx";

// One labelled row of a card or a window (rule 35): the name at its start and
// the control at its end, which takes its accessible name from `label`.

export interface FieldRowProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "class"> {
  /** The row's name, and the accessible name of the control in it. */
  label: string;
  /** Draws the words in other markup, such as a quiet "optional". The name stays `label`. */
  drawn?: JSX.Element;
  /** What the row does, drawn as an "(i)" beside the name. */
  hint?: string;
  /** A row with only a value to show holds it as a pill. */
  value?: string | number;
  /** The pill's tone. */
  tone?: PillTone;
  /** In a FieldRowGroup with columns, spans all of them. */
  wide?: boolean;
  /** The control. */
  children?: JSX.Element;
  class?: string;
}

export function FieldRow(props: FieldRowProps) {
  const [own, rest] = splitProps(props, ["label", "drawn", "hint", "value", "tone", "wide", "children", "class"]);
  const inGroup = useContext(FieldRowGroupContext);
  let row!: HTMLDivElement;
  return (
    <FieldRowContext.Provider value={() => own.label}>
      {(() => {
        // Resolved inside the provider, so a control finds the row's name.
        const given = children(() => own.children);
        const control = () =>
          given() ?? (
            <Show when={own.value !== undefined}>
              <Pill class="glim-num" tone={own.tone}>
                {own.value}
              </Pill>
            </Show>
          );
        return (
          <div data-glim="FieldRow" {...rest} ref={row} class={["glim-field-row", own.wide && "glim-field-row--wide", own.class].filter(Boolean).join(" ")}>
            <span class="glim-field-row-name">
              <span class="glim-field-row-label" onClick={() => pressRowControl(row)}>
                {own.drawn ?? own.label}
              </span>
              <Show when={own.hint}>{(hint) => <InfoBubble tip={hint()} />}</Show>
            </span>
            {inGroup ? <span class="glim-field-row-controls">{control()}</span> : control()}
          </div>
        );
      })()}
    </FieldRowContext.Provider>
  );
}
