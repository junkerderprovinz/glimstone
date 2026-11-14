// The words of a Timer. Zag's timer machine counts up or down and keeps the
// time while it is paused; an app passes the words of its buttons and of the
// figure a screen reader hears.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { plural } from "./fortressText.ts";

export interface TimerText {
  start: string;
  pause: string;
  resume: string;
  reset: string;
  /** How the time reads to a screen reader, such as "1 hour, 4 minutes, 30 seconds". */
  spoken: (hours: number, minutes: number, seconds: number) => string;
}

/** The words of a Timer from a language's table, its counts in that language's digits. */
export function timerText(w: ComponentWords["timer"], lang: string): TimerText {
  return {
    start: w.start,
    pause: w.pause,
    resume: w.resume,
    reset: w.reset,
    spoken: (hours, minutes, seconds) =>
      new Intl.ListFormat(lang, { type: "unit", style: "long" }).format(
        [hours && plural(lang, w.hours, hours), minutes && plural(lang, w.minutes, minutes), plural(lang, w.seconds, seconds)].filter(
          (part): part is string => !!part,
        ),
      ),
  };
}

export const TIMER_TEXT: TimerText = timerText(en.timer, "en");
