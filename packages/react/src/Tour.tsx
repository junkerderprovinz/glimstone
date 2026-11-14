import { useEffect, useId } from "react";
import * as tour from "@zag-js/tour";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { TOUR_TEXT, pageDir, portalTarget, tourSteps, type TourStep, type TourText } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { IconBack, IconCheck, IconForward } from "./glyphs.tsx";

export type { TourStep, TourText } from "@glimstone/core";

// A short walk through a screen, one step a part of it, such as the first
// start of a new page. The page behind is darkened and blurred like the page
// behind a window, with the part the step points at left clear, and the step
// is a small window beside it: its title in the notch, Back and Next in its foot.

export interface TourProps {
  steps: readonly TourStep[];
  /** Turning it on starts the tour at its first step. It turns off once the tour ends. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text?: Partial<TourText>;
}

export function Tour({ steps, open, onOpenChange, text }: TourProps) {
  const words = { ...TOUR_TEXT, ...text };
  const service = useMachine(tour.machine, {
    id: useId(),
    dir: pageDir(),
    steps: tourSteps(steps),
    onStatusChange: (d) => {
      if (d.status === "dismissed" || d.status === "completed" || d.status === "skipped") {
        onOpenChange(false);
      }
    },
  });
  const api = tour.connect(service, normalizeProps);
  // The machine ends a tour through its close trigger. Next on the last step
  // would only stay where it is.
  const end = () => (api.getCloseTriggerProps().onClick as () => void)();
  useEffect(() => {
    if (open && !api.open) api.start();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Portal container={{ current: portalTarget() }}>
      {api.open && api.step && (
        <div data-glim="Tour" className="glim-tour-layer">
          <div {...api.getBackdropProps()} className="glim-tour-backdrop" />
          <div {...api.getSpotlightProps()} className="glim-tour-spotlight" />
          <div {...api.getPositionerProps()} className="glim-tour-positioner">
            <div {...api.getContentProps()} className="glim-tour">
              <h2 {...api.getTitleProps()} className="glim-panel-heading">
                <Badge tone="heading" size="heading" wrap>
                  {api.step.title}
                </Badge>
              </h2>
              <p {...api.getDescriptionProps()} className="glim-tour-text">
                {api.step.description}
              </p>
              <div className="glim-tour-foot">
                <span {...api.getProgressTextProps()} className="glim-tour-progress glim-num">
                  {words.progress(api.stepIndex + 1, api.totalSteps)}
                </span>
                <Button label={words.back} labelKey={null} glyph={<IconBack />} disabled={!api.hasPrevStep} onClick={api.prev} />
                {api.lastStep ? (
                  <Button label={words.close} labelKey={null} glyph={<IconCheck />} tone="accent" onClick={end} />
                ) : (
                  <Button label={words.next} labelKey={null} glyph={<IconForward />} tone="accent" onClick={api.next} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Portal>
  );
}
