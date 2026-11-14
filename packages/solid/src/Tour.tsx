import { createEffect, createMemo, createUniqueId, on, Show } from "solid-js";
import * as tour from "@zag-js/tour";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { TOUR_TEXT, pageDir, tourSteps, type TourStep, type TourText } from "@glimstone/core";
import { Badge } from "./Badge.tsx";
import { Button } from "./Button.tsx";
import { IconBack, IconCheck, IconForward } from "./glyphs.tsx";
import { Lift } from "./Lift.tsx";

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

export function Tour(props: TourProps) {
  const words = () => ({ ...TOUR_TEXT, ...props.text });
  const id = createUniqueId();
  const service = useMachine(tour.machine, () => ({
    id,
    dir: pageDir(),
    steps: tourSteps(props.steps),
    onStatusChange: (d: { status: string }) => {
      if (d.status === "dismissed" || d.status === "completed" || d.status === "skipped") {
        props.onOpenChange(false);
      }
    },
  }));
  const api = createMemo(() => tour.connect(service, normalizeProps));
  // The machine ends a tour through its close trigger. Next on the last step
  // would only stay where it is.
  const end = () => (api().getCloseTriggerProps().onClick as () => void)();
  createEffect(on(() => props.open, (open) => open && !api().open && api().start()));
  return (
    <Show when={api().open && api().step}>
      {(step) => (
        <Lift>
          <div data-glim="Tour" class="glim-tour-layer">
            <div {...api().getBackdropProps()} class="glim-tour-backdrop" />
            <div {...api().getSpotlightProps()} class="glim-tour-spotlight" />
            <div {...api().getPositionerProps()} class="glim-tour-positioner">
              <div {...api().getContentProps()} class="glim-tour">
                <h2 {...api().getTitleProps()} class="glim-panel-heading">
                  <Badge tone="heading" size="heading" wrap>
                    {step().title}
                  </Badge>
                </h2>
                <p {...api().getDescriptionProps()} class="glim-tour-text">
                  {step().description}
                </p>
                <div class="glim-tour-foot">
                  <span {...api().getProgressTextProps()} class="glim-tour-progress glim-num">
                    {words().progress(api().stepIndex + 1, api().totalSteps)}
                  </span>
                  <Button label={words().back} labelKey={null} glyph={<IconBack />} disabled={!api().hasPrevStep} onClick={() => api().prev()} />
                  <Show
                    when={api().lastStep}
                    fallback={<Button label={words().next} labelKey={null} glyph={<IconForward />} tone="accent" onClick={() => api().next()} />}
                  >
                    <Button label={words().close} labelKey={null} glyph={<IconCheck />} tone="accent" onClick={end} />
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </Lift>
      )}
    </Show>
  );
}
