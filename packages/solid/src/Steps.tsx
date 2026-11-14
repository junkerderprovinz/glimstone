import { createMemo, createSignal, createUniqueId, For, mergeProps, Show, type JSX } from "solid-js";
import * as steps from "@zag-js/steps";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { STEPS_TEXT, pageDir, stepsKeyTarget, type StepsItem, type StepsText } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconBack, IconCheck, IconForward } from "./glyphs.tsx";

export type { StepsItem, StepsText } from "@glimstone/core";

// A task walked in named steps, such as setting up a storage location: the row
// of steps on top, the step in force below, Back and Next in its foot. The
// step in force takes the accent, a finished one a tick.

export interface StepsProps<T extends StepsItem> {
  items: readonly T[];
  /** The step in force, counted from 0. Left out, it keeps its own. */
  step?: number;
  onStepChange?: (step: number) => void;
  /** Only Back and Next move, so no step is skipped. */
  linear?: boolean;
  /** The forward button of the last step. */
  onFinish?: () => void;
  /** Draws a step's content. */
  content: (item: T, index: number) => JSX.Element;
  text?: Partial<StepsText>;
}

export function Steps<T extends StepsItem>(raw: StepsProps<T>) {
  const props = mergeProps({ linear: false }, raw);
  const words = () => ({ ...STEPS_TEXT, ...props.text });
  const id = createUniqueId();
  const [own, setOwn] = createSignal(0);
  const service = useMachine(steps.machine, () => ({
    id,
    dir: pageDir(),
    count: props.items.length,
    step: props.step ?? own(),
    linear: props.linear,
    onStepChange: (d: { step: number }) => {
      setOwn(d.step);
      props.onStepChange?.(d.step);
    },
  }));
  const api = createMemo(() => steps.connect(service, normalizeProps));
  const last = () => api().value === props.items.length - 1;
  const move = (index: number) => (e: KeyboardEvent) => {
    const target = stepsKeyTarget(e.key, index, props.items.length, pageDir());
    if (target === null) return;
    e.preventDefault();
    document.getElementById(api().getItemState({ index: target }).triggerId)?.focus();
  };
  return (
    <div data-glim="Steps" {...api().getRootProps()} class="glim-steps">
      <div {...api().getListProps()} class="glim-steps-list">
        <For each={props.items}>
          {(item, index) => (
            <div {...api().getItemProps({ index: index() })} class="glim-steps-item">
              <button
                {...api().getTriggerProps({ index: index() })}
                tabIndex={index() === api().value ? 0 : -1}
                onKeyDown={(e) => move(index())(e)}
                class="glim-steps-trigger"
              >
                <span {...api().getIndicatorProps({ index: index() })} class="glim-steps-indicator glim-num">
                  <Show when={api().getItemState({ index: index() }).completed} fallback={index() + 1}>
                    <IconCheck />
                  </Show>
                </span>
                <span class="glim-steps-title">{item.title}</span>
              </button>
              <Show when={index() < props.items.length - 1}>
                <div {...api().getSeparatorProps({ index: index() })} class="glim-steps-separator" />
              </Show>
            </div>
          )}
        </For>
      </div>
      <For each={props.items}>
        {(item, index) => (
          <div {...api().getContentProps({ index: index() })} class="glim-steps-content">
            {props.content(item, index())}
          </div>
        )}
      </For>
      <div class="glim-steps-foot">
        <Button label={words().back} labelKey={null} glyph={<IconBack />} disabled={!api().hasPrevStep} onClick={() => api().goToPrevStep()} />
        <Show
          when={last()}
          fallback={<Button label={words().next} labelKey={null} glyph={<IconForward />} onClick={() => api().goToNextStep()} />}
        >
          <Button label={words().finish} labelKey={null} glyph={<IconCheck />} onClick={() => props.onFinish?.()} />
        </Show>
      </div>
    </div>
  );
}
