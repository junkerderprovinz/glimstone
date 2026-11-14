import { createMemo, createUniqueId, For, mergeProps, Show, type JSX } from "solid-js";
import * as floatingPanel from "@zag-js/floating-panel";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { FLOATING_PANEL_TEXT, pageDir, type FloatingPanelText, type PanelSize } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { IconClose, IconWindowMaximise, IconWindowMinimise, IconWindowRestore } from "./glyphs.tsx";
import { Lift } from "./Lift.tsx";

export type { FloatingPanelText, PanelSize } from "@glimstone/core";

// A window that stays open beside the work, such as a transfer log, and that
// somebody moves by its head and sizes by its edges. It is a window like any
// other (rule 15): the same surface and radius, its title in the notch and its
// way out in the foot, at the float step since nothing behind it is darkened.

export interface FloatingPanelProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The size it opens at. */
  defaultSize?: PanelSize;
  resizable?: boolean;
  children: JSX.Element;
  text?: Partial<FloatingPanelText>;
}

const AXES = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;

export function FloatingPanel(raw: FloatingPanelProps) {
  const props = mergeProps({ defaultSize: { width: 360, height: 280 }, resizable: true }, raw);
  const words = () => ({ ...FLOATING_PANEL_TEXT, ...props.text });
  const id = createUniqueId();
  const service = useMachine(floatingPanel.machine, () => ({
    id,
    dir: pageDir(),
    open: props.open,
    defaultSize: props.defaultSize,
    resizable: props.resizable,
    strategy: "fixed" as const,
    closeOnEscape: true,
    onOpenChange: (d: { open: boolean }) => props.onOpenChange(d.open),
    translations: { minimize: words().minimize, maximize: words().maximize, restore: words().restore },
  }));
  const api = createMemo(() => floatingPanel.connect(service, normalizeProps));
  return (
    <Lift>
      <div data-glim="FloatingPanel" class="glim-fpanel-layer">
        <div {...api().getPositionerProps()} class="glim-fpanel-positioner">
          <div {...api().getContentProps()} class="glim-fpanel">
            <div {...api().getDragTriggerProps()} class="glim-fpanel-drag">
              <div {...api().getHeaderProps()} class="glim-fpanel-head">
                <h2 {...api().getTitleProps()} class="glim-panel-heading">
                  <Badge tone="heading" size="heading" wrap>
                    {props.title}
                  </Badge>
                </h2>
                <div {...api().getControlProps()} class="glim-fpanel-control">
                  <button {...api().getStageTriggerProps({ stage: "minimized" })} class="glim-btn-bare glim-icon-btn">
                    <IconWindowMinimise />
                  </button>
                  <button {...api().getStageTriggerProps({ stage: "maximized" })} class="glim-btn-bare glim-icon-btn">
                    <IconWindowMaximise />
                  </button>
                  <button {...api().getStageTriggerProps({ stage: "default" })} class="glim-btn-bare glim-icon-btn">
                    <IconWindowRestore />
                  </button>
                </div>
              </div>
            </div>
            <div {...api().getBodyProps()} class="glim-fpanel-body">
              {props.children}
            </div>
            <div class="glim-fpanel-foot">
              <Button label={words().close} labelKey={null} glyph={<IconClose />} onClick={() => api().setOpen(false)} />
            </div>
            <Show when={props.resizable}>
              <For each={AXES}>{(axis) => <div {...api().getResizeTriggerProps({ axis })} class="glim-fpanel-edge" />}</For>
            </Show>
          </div>
        </div>
      </div>
    </Lift>
  );
}
