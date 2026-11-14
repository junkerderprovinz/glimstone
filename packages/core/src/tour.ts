// The steps and words of a Tour. Zag's tour machine darkens the page around
// the part a step points at, places the step's card beside it and walks the
// steps; an app names each step's target and passes its own words.

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

export const TOUR_TEXT: TourText = {
  back: "Back",
  next: "Next",
  close: "Close",
  progress: (step, steps) => `${step} of ${steps}`,
};

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
