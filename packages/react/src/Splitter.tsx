import { Fragment, useId, type ReactNode } from "react";
import * as splitter from "@zag-js/splitter";
import { normalizeProps, useMachine } from "@zag-js/react";
import { SPLITTER_TEXT, pageDir, splitterHandleId, type SplitterPanel, type SplitterText } from "@glimstone/core";

export type { SplitterPanel, SplitterText } from "@glimstone/core";

// Two or more panels side by side, or one above the other, with a handle
// between each pair that drags or steps with the arrow keys. A hairline marks
// the seam and a grip on it lights with the accent once it is reached for.

export interface SplitterProps<T extends SplitterPanel> {
  panels: readonly T[];
  /** Each panel's share in percent, in the order of `panels`. */
  size: number[];
  onSizeChange: (size: number[]) => void;
  orientation?: "horizontal" | "vertical";
  /** Draws a panel's content. */
  panel: (panel: T) => ReactNode;
  text?: Partial<SplitterText>;
}

export function Splitter<T extends SplitterPanel>({ panels, size, onSizeChange, orientation = "horizontal", panel, text }: SplitterProps<T>) {
  const words = { ...SPLITTER_TEXT, ...text };
  const service = useMachine(splitter.machine, {
    id: useId(),
    dir: pageDir(),
    orientation,
    panels: panels.map(({ id, minSize, maxSize, collapsible }) => ({ id, minSize, maxSize, collapsible })),
    size,
    onResize: (d) => onSizeChange(d.size),
  });
  const api = splitter.connect(service, normalizeProps);
  return (
    <div data-glim="Splitter" {...api.getRootProps()} className="glim-splitter">
      {panels.map((p, index) => {
        const next = panels[index + 1];
        const handle = next && splitterHandleId(p, next);
        return (
          <Fragment key={p.id}>
            <div {...api.getPanelProps({ id: p.id })} className="glim-splitter-panel">
              {panel(p)}
            </div>
            {handle && (
              <div {...api.getResizeTriggerProps({ id: handle })} aria-label={words.resize} className="glim-splitter-handle">
                <span {...api.getResizeTriggerIndicator({ id: handle })} className="glim-splitter-grip" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
