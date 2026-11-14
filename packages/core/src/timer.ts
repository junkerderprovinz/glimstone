// The words of a Timer. Zag's timer machine counts up or down and keeps the
// time while it is paused; an app passes the words of its buttons and of the
// figure a screen reader hears.

export interface TimerText {
  start: string;
  pause: string;
  resume: string;
  reset: string;
  /** How the time reads to a screen reader, such as "1 hour, 4 minutes, 30 seconds". */
  spoken: (hours: number, minutes: number, seconds: number) => string;
}

const unit = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const TIMER_TEXT: TimerText = {
  start: "Start",
  pause: "Pause",
  resume: "Resume",
  reset: "Reset",
  spoken: (hours, minutes, seconds) =>
    [hours && unit(hours, "hour", "hours"), minutes && unit(minutes, "minute", "minutes"), unit(seconds, "second", "seconds")].filter(Boolean).join(", "),
};
