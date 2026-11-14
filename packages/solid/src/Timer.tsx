import { createMemo, createUniqueId, Match, mergeProps, Switch } from "solid-js";
import * as timer from "@zag-js/timer";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { TIMER_TEXT, type TimerText } from "@glimstone/core";
import { Button } from "./Button.tsx";
import { IconPause, IconPlay, IconResetArrow } from "./glyphs.tsx";

export type { TimerText } from "@glimstone/core";

// A clock that counts up from a start or down to zero, such as the time a
// test may run. The figure is data and runs left to right in every language,
// and it takes the accent's ink while it runs, the one moment it is activity.

export interface TimerProps {
  /** Counts down from startMs to zero rather than up. */
  countdown?: boolean;
  /** Where it starts, in milliseconds. */
  startMs?: number;
  /** Where a count up stops, in milliseconds. */
  targetMs?: number;
  autoStart?: boolean;
  /** Called once a countdown reaches zero or a count up its target. */
  onComplete?: () => void;
  text?: Partial<TimerText>;
}

export function Timer(raw: TimerProps) {
  const props = mergeProps({ countdown: false, startMs: 0, autoStart: false }, raw);
  const words = () => ({ ...TIMER_TEXT, ...props.text });
  const id = createUniqueId();
  const service = useMachine(timer.machine, () => ({
    id,
    countdown: props.countdown,
    startMs: props.startMs,
    targetMs: props.targetMs,
    autoStart: props.autoStart,
    interval: 250,
    onComplete: () => props.onComplete?.(),
  }));
  const api = createMemo(() => timer.connect(service, normalizeProps));
  const spoken = () => words().spoken(api().time.hours, api().time.minutes, api().time.seconds);
  return (
    <div data-glim="Timer" {...api().getRootProps()} class="glim-timer">
      <div {...api().getAreaProps()} role="timer" aria-label={spoken()} data-running={api().running ? "" : undefined} class="glim-timer-figure glim-num">
        <span {...api().getItemProps({ type: "hours" })}>{api().formattedTime.hours}</span>
        <span {...api().getSeparatorProps()}>:</span>
        <span {...api().getItemProps({ type: "minutes" })}>{api().formattedTime.minutes}</span>
        <span {...api().getSeparatorProps()}>:</span>
        <span {...api().getItemProps({ type: "seconds" })}>{api().formattedTime.seconds}</span>
      </div>
      <div {...api().getControlProps()} class="glim-timer-control">
        <Switch fallback={<Button label={words().start} labelKey={null} glyph={<IconPlay />} onClick={() => api().start()} />}>
          <Match when={api().running}>
            <Button label={words().pause} labelKey={null} glyph={<IconPause />} onClick={() => api().pause()} />
          </Match>
          <Match when={api().paused}>
            <Button label={words().resume} labelKey={null} glyph={<IconPlay />} onClick={() => api().resume()} />
          </Match>
        </Switch>
        <Button label={words().reset} labelKey={null} glyph={<IconResetArrow />} onClick={() => api().reset()} />
      </div>
    </div>
  );
}
