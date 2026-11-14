import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import * as steps from "@zag-js/steps";
import { normalizeProps, useMachine } from "@zag-js/react";
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
  content: (item: T, index: number) => ReactNode;
  text?: Partial<StepsText>;
}

export function Steps<T extends StepsItem>({ items, step, onStepChange, linear = false, onFinish, content, text }: StepsProps<T>) {
  const words = { ...STEPS_TEXT, ...text };
  const [own, setOwn] = useState(0);
  const service = useMachine(steps.machine, {
    id: useId(),
    dir: pageDir(),
    count: items.length,
    step: step ?? own,
    linear,
    onStepChange: (d) => {
      setOwn(d.step);
      onStepChange?.(d.step);
    },
  });
  const api = steps.connect(service, normalizeProps);
  const last = api.value === items.length - 1;
  const move = (index: number) => (e: KeyboardEvent) => {
    const target = stepsKeyTarget(e.key, index, items.length, pageDir());
    if (target === null) return;
    e.preventDefault();
    document.getElementById(api.getItemState({ index: target }).triggerId)?.focus();
  };
  return (
    <div data-glim="Steps" {...api.getRootProps()} className="glim-steps">
      <div {...api.getListProps()} className="glim-steps-list">
        {items.map((item, index) => (
          <div key={index} {...api.getItemProps({ index })} className="glim-steps-item">
            <button {...api.getTriggerProps({ index })} tabIndex={index === api.value ? 0 : -1} onKeyDown={move(index)} className="glim-steps-trigger">
              <span {...api.getIndicatorProps({ index })} className="glim-steps-indicator glim-num">
                {api.getItemState({ index }).completed ? <IconCheck /> : index + 1}
              </span>
              <span className="glim-steps-title">{item.title}</span>
            </button>
            {index < items.length - 1 && <div {...api.getSeparatorProps({ index })} className="glim-steps-separator" />}
          </div>
        ))}
      </div>
      {items.map((item, index) => (
        <div key={index} {...api.getContentProps({ index })} className="glim-steps-content">
          {content(item, index)}
        </div>
      ))}
      <div className="glim-steps-foot">
        <Button label={words.back} labelKey={null} glyph={<IconBack />} disabled={!api.hasPrevStep} onClick={api.goToPrevStep} />
        {last ? (
          <Button label={words.finish} labelKey={null} glyph={<IconCheck />} onClick={onFinish} />
        ) : (
          <Button label={words.next} labelKey={null} glyph={<IconForward />} onClick={api.goToNextStep} />
        )}
      </div>
    </div>
  );
}
