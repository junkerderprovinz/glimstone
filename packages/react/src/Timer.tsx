import { useId } from "react";
import * as timer from "@zag-js/timer";
import { normalizeProps, useMachine } from "@zag-js/react";
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

export function Timer({ countdown = false, startMs = 0, targetMs, autoStart = false, onComplete, text }: TimerProps) {
  const words = { ...TIMER_TEXT, ...text };
  const service = useMachine(timer.machine, { id: useId(), countdown, startMs, targetMs, autoStart, interval: 250, onComplete });
  const api = timer.connect(service, normalizeProps);
  const { hours, minutes, seconds } = api.time;
  return (
    <div data-glim="Timer" {...api.getRootProps()} className="glim-timer">
      <div {...api.getAreaProps()} role="timer" aria-label={words.spoken(hours, minutes, seconds)} data-running={api.running ? "" : undefined} className="glim-timer-figure glim-num">
        <span {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</span>
        <span {...api.getSeparatorProps()}>:</span>
        <span {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</span>
        <span {...api.getSeparatorProps()}>:</span>
        <span {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</span>
      </div>
      <div {...api.getControlProps()} className="glim-timer-control">
        {api.running ? (
          <Button label={words.pause} labelKey={null} glyph={<IconPause />} onClick={api.pause} />
        ) : api.paused ? (
          <Button label={words.resume} labelKey={null} glyph={<IconPlay />} onClick={api.resume} />
        ) : (
          <Button label={words.start} labelKey={null} glyph={<IconPlay />} onClick={api.start} />
        )}
        <Button label={words.reset} labelKey={null} glyph={<IconResetArrow />} onClick={api.reset} />
      </div>
    </div>
  );
}
