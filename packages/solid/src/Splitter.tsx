import { createMemo, createUniqueId, For, mergeProps, Show, type JSX } from "solid-js";
import * as splitter from "@zag-js/splitter";
import { normalizeProps, useMachine } from "@zag-js/solid";
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
  panel: (panel: T) => JSX.Element;
  text?: Partial<SplitterText>;
}

export function Splitter<T extends SplitterPanel>(raw: SplitterProps<T>) {
  const props = mergeProps({ orientation: "horizontal" } as const, raw);
  const words = () => ({ ...SPLITTER_TEXT, ...props.text });
  const id = createUniqueId();
  const service = useMachine(splitter.machine, () => ({
    id,
    dir: pageDir(),
    orientation: props.orientation,
    panels: props.panels.map(({ id, minSize, maxSize, collapsible }) => ({ id, minSize, maxSize, collapsible })),
    size: props.size,
    onResize: (d: { size: number[] }) => props.onSizeChange(d.size),
  }));
  const api = createMemo(() => splitter.connect(service, normalizeProps));
  const handle = (index: number) => {
    const next = props.panels[index + 1];
    return next && splitterHandleId(props.panels[index]!, next);
  };
  return (
    <div data-glim="Splitter" {...api().getRootProps()} class="glim-splitter">
      <For each={props.panels}>
        {(p, index) => (
          <>
            <div {...api().getPanelProps({ id: p.id })} class="glim-splitter-panel">
              {props.panel(p)}
            </div>
            <Show when={handle(index())}>
              {(id) => (
                <div {...api().getResizeTriggerProps({ id: id() })} aria-label={words().resize} class="glim-splitter-handle">
                  <span {...api().getResizeTriggerIndicator({ id: id() })} class="glim-splitter-grip" />
                </div>
              )}
            </Show>
          </>
        )}
      </For>
    </div>
  );
}
