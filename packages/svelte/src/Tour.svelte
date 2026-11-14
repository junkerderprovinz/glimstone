<script lang="ts" module>
  import type { TourStep, TourText } from "@glimstone/core";

  export type { TourStep, TourText } from "@glimstone/core";

  export interface TourProps {
    steps: readonly TourStep[];
    /** Bound with `bind:open`. Turning it on starts the tour at its first step. It turns off once the tour ends. */
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    text?: Partial<TourText>;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import * as tour from "@zag-js/tour";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { TOUR_TEXT, pageDir, tourSteps } from "@glimstone/core";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import { IconBack, IconCheck, IconForward } from "./glyphs.js";
  import { lift } from "./lift.js";

  // A short walk through a screen, one step a part of it, such as the first
  // start of a new page. The page behind is darkened and blurred like the page
  // behind a window, with the part the step points at left clear, and the step
  // is a small window beside it: its title in the notch, Back and Next in its foot.
  let { steps, open = $bindable(), onOpenChange, text }: TourProps = $props();

  const words = $derived({ ...TOUR_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(tour.machine, () => ({
    id,
    dir: pageDir(),
    steps: tourSteps(steps),
    onStatusChange: (d: { status: string }) => {
      if (d.status === "dismissed" || d.status === "completed" || d.status === "skipped") {
        open = false;
        onOpenChange?.(false);
      }
    },
  }));
  const api = $derived(tour.connect(service, normalizeProps));
  // The machine ends a tour through its close trigger. Next on the last step
  // would only stay where it is.
  const end = () => (api.getCloseTriggerProps() as { onclick: () => void }).onclick();
  $effect(() => {
    if (open) untrack(() => !api.open && api.start());
  });
</script>

{#if api.open && api.step}
  <div {@attach lift} data-glim="Tour" class="glim-tour-layer">
    <div {...api.getBackdropProps()} class="glim-tour-backdrop"></div>
    <div {...api.getSpotlightProps()} class="glim-tour-spotlight"></div>
    <div {...api.getPositionerProps()} class="glim-tour-positioner">
      <div {...api.getContentProps()} class="glim-tour">
        <h2 {...api.getTitleProps()} class="glim-panel-heading">
          <Badge tone="heading" size="heading" wrap>{api.step.title}</Badge>
        </h2>
        <p {...api.getDescriptionProps()} class="glim-tour-text">{api.step.description}</p>
        <div class="glim-tour-foot">
          <span {...api.getProgressTextProps()} class="glim-tour-progress glim-num">{words.progress(api.stepIndex + 1, api.totalSteps)}</span>
          <Button label={words.back} labelKey={null} glyph={IconBack} disabled={!api.hasPrevStep} onClick={() => api.prev()} />
          {#if api.lastStep}
            <Button label={words.close} labelKey={null} glyph={IconCheck} tone="accent" onClick={end} />
          {:else}
            <Button label={words.next} labelKey={null} glyph={IconForward} tone="accent" onClick={() => api.next()} />
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
