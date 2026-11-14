<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { StepsItem, StepsText } from "@glimstone/core";

  export type { StepsItem, StepsText } from "@glimstone/core";

  export interface StepsProps<T extends StepsItem> {
    items: readonly T[];
    /** The step in force, counted from 0, bound with `bind:step`. Left out, it keeps its own. */
    step?: number;
    onStepChange?: (step: number) => void;
    /** Only Back and Next move, so no step is skipped. */
    linear?: boolean;
    /** The forward button of the last step. */
    onFinish?: () => void;
    /** Draws a step's content. */
    content: Snippet<[T, number]>;
    text?: Partial<StepsText>;
  }
</script>

<script lang="ts" generics="T extends StepsItem">
  import * as steps from "@zag-js/steps";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { STEPS_TEXT, pageDir, stepsKeyTarget } from "@glimstone/core";
  import Button from "./Button.svelte";
  import { IconBack, IconCheck, IconForward } from "./glyphs.js";

  // A task walked in named steps, such as setting up a storage location: the row
  // of steps on top, the step in force below, Back and Next in its foot. The
  // step in force takes the accent, a finished one a tick.
  let { items, step = $bindable(), onStepChange, linear = false, onFinish, content, text }: StepsProps<T> = $props();

  const words = $derived({ ...STEPS_TEXT, ...text });
  const id = $props.id();
  const service = useMachine(steps.machine, () => ({
    id,
    dir: pageDir(),
    count: items.length,
    step: step ?? 0,
    linear,
    onStepChange: (d: { step: number }) => {
      step = d.step;
      onStepChange?.(d.step);
    },
  }));
  const api = $derived(steps.connect(service, normalizeProps));
  const last = $derived(api.value === items.length - 1);

  function move(index: number, e: KeyboardEvent) {
    const target = stepsKeyTarget(e.key, index, items.length, pageDir());
    if (target === null) return;
    e.preventDefault();
    document.getElementById(api.getItemState({ index: target }).triggerId)?.focus();
  }
</script>

<div data-glim="Steps" {...api.getRootProps()} class="glim-steps">
  <div {...api.getListProps()} class="glim-steps-list">
    {#each items as item, index (index)}
      <div {...api.getItemProps({ index })} class="glim-steps-item">
        <button
          {...api.getTriggerProps({ index })}
          tabindex={index === api.value ? 0 : -1}
          onkeydown={(e) => move(index, e)}
          class="glim-steps-trigger"
        >
          <span {...api.getIndicatorProps({ index })} class="glim-steps-indicator glim-num">
            {#if api.getItemState({ index }).completed}{@render IconCheck()}{:else}{index + 1}{/if}
          </span>
          <span class="glim-steps-title">{item.title}</span>
        </button>
        {#if index < items.length - 1}
          <div {...api.getSeparatorProps({ index })} class="glim-steps-separator"></div>
        {/if}
      </div>
    {/each}
  </div>
  {#each items as item, index (index)}
    <div {...api.getContentProps({ index })} class="glim-steps-content">{@render content(item, index)}</div>
  {/each}
  <div class="glim-steps-foot">
    <Button label={words.back} labelKey={null} glyph={IconBack} disabled={!api.hasPrevStep} onClick={() => api.goToPrevStep()} />
    {#if last}
      <Button label={words.finish} labelKey={null} glyph={IconCheck} onClick={() => onFinish?.()} />
    {:else}
      <Button label={words.next} labelKey={null} glyph={IconForward} onClick={() => api.goToNextStep()} />
    {/if}
  </div>
</div>
