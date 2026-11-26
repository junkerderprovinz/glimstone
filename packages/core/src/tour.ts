// The steps and words of a Tour. Zag's tour machine darkens the page around
// the part a step points at, places the step's card beside it and walks the
// steps; an app names each step's target and passes its own words.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill } from "./fortressText.ts";

export interface TourStep {
  id: string;
  /** The part the step points at: a CSS selector, or a function that finds it. A step without one stands in the middle of the page. */
  target?: string | (() => HTMLElement | null);
  title: string;
  description: string;
}

export interface TourText {
  back: string;
  next: string;
  /** The forward button of the last step, which ends the tour. */
  close: string;
  /** Where the tour stands, such as "2 of 4". */
  progress: (step: number, steps: number) => string;
}

/** The words of a Tour from a language's table, its counts in that language's digits. */
export function tourText(w: ComponentWords["tour"], lang: string): TourText {
  return {
    back: w.back,
    next: w.next,
    close: w.close,
    progress: (step, steps) => fill(w.progress, { step: step.toLocaleString(lang), steps: steps.toLocaleString(lang) }),
  };
}

export const TOUR_TEXT: TourText = tourText(en.tour, "en");

/** The steps in the form the machine takes them, each target found when its step comes. */
export function tourSteps(steps: readonly TourStep[]) {
  return steps.map(({ id, target, title, description }) => ({
    id,
    type: target ? ("tooltip" as const) : ("dialog" as const),
    target: typeof target === "string" ? () => document.querySelector<HTMLElement>(target) : target,
    title,
    description,
  }));
}

/** How far the spotlight's ring stands off the step's target, in px. */
export const TOUR_SPOTLIGHT_GAP = 6;

/** The spotlight's corner for a target with corners of `targetRadius` px: grown by the gap, so the ring keeps it all round. */
export function tourSpotlightRadius(targetRadius: number): number {
  return targetRadius + TOUR_SPOTLIGHT_GAP;
}

/** The corner of a step's target as the page draws it, 0 for a step without one. */
export function tourTargetRadius(step: TourStep | undefined): number {
  const target = typeof step?.target === "string" ? document.querySelector<HTMLElement>(step.target) : step?.target?.();
  return target ? parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0 : 0;
}

/** The machine's spotlight settings for the step at `index`. */
export function tourSpotlight(steps: readonly TourStep[], index: number) {
  return {
    spotlightOffset: { x: TOUR_SPOTLIGHT_GAP, y: TOUR_SPOTLIGHT_GAP },
    spotlightRadius: tourSpotlightRadius(tourTargetRadius(steps[index])),
  };
}

/** The progress dots of a tour: one per step, the current one marked. */
export function tourDots(steps: number, index: number): boolean[] {
  return Array.from({ length: steps }, (_, i) => i === index);
}
