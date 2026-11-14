import { useId, type ReactNode } from "react";
import * as floatingPanel from "@zag-js/floating-panel";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { FLOATING_PANEL_TEXT, pageDir, portalTarget, type FloatingPanelText, type PanelSize } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { IconClose, IconWindowMaximise, IconWindowMinimise, IconWindowRestore } from "./glyphs.tsx";

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
  children: ReactNode;
  text?: Partial<FloatingPanelText>;
}

const AXES = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;

export function FloatingPanel({ title, open, onOpenChange, defaultSize = { width: 360, height: 280 }, resizable = true, children, text }: FloatingPanelProps) {
  const words = { ...FLOATING_PANEL_TEXT, ...text };
  const service = useMachine(floatingPanel.machine, {
    id: useId(),
    dir: pageDir(),
    open,
    defaultSize,
    resizable,
    strategy: "fixed",
    closeOnEscape: true,
    onOpenChange: (d) => onOpenChange(d.open),
    translations: { minimize: words.minimize, maximize: words.maximize, restore: words.restore },
  });
  const api = floatingPanel.connect(service, normalizeProps);
  return (
    <Portal container={{ current: portalTarget() }}>
      <div data-glim="FloatingPanel" className="glim-fpanel-layer">
        <div {...api.getPositionerProps()} className="glim-fpanel-positioner">
          <div {...api.getContentProps()} className="glim-fpanel">
            <div {...api.getDragTriggerProps()} className="glim-fpanel-drag">
              <div {...api.getHeaderProps()} className="glim-fpanel-head">
                <h2 {...api.getTitleProps()} className="glim-panel-heading">
                  <Badge tone="heading" size="heading" wrap>
                    {title}
                  </Badge>
                </h2>
                <div {...api.getControlProps()} className="glim-fpanel-control">
                  <button {...api.getStageTriggerProps({ stage: "minimized" })} className="glim-btn-bare glim-icon-btn">
                    <IconWindowMinimise />
                  </button>
                  <button {...api.getStageTriggerProps({ stage: "maximized" })} className="glim-btn-bare glim-icon-btn">
                    <IconWindowMaximise />
                  </button>
                  <button {...api.getStageTriggerProps({ stage: "default" })} className="glim-btn-bare glim-icon-btn">
                    <IconWindowRestore />
                  </button>
                </div>
              </div>
            </div>
            <div {...api.getBodyProps()} className="glim-fpanel-body">
              {children}
            </div>
            <div className="glim-fpanel-foot">
              <Button label={words.close} labelKey={null} glyph={<IconClose />} onClick={() => api.setOpen(false)} />
            </div>
            {resizable && AXES.map((axis) => <div key={axis} {...api.getResizeTriggerProps({ axis })} className="glim-fpanel-edge" />)}
          </div>
        </div>
      </div>
    </Portal>
  );
}
