// The parts of a Carousel Zag's carousel machine leaves to the page: the words
// and whether a move should glide. The machine scrolls smoothly unless it is
// told otherwise, so every move the page starts asks first whether the motion
// level or the system wants it still.

export interface CarouselText {
  previous: string;
  next: string;
  /** A slide's name, such as "3 of 8". */
  slide: (index: number, count: number) => string;
  /** The name of the dot that goes to a slide. */
  goTo: (index: number) => string;
}

export const CAROUSEL_TEXT: CarouselText = {
  previous: "Previous slide",
  next: "Next slide",
  slide: (index, count) => `${index} of ${count}`,
  goTo: (index) => `Slide ${index}`,
};

/** Whether a move should land at once: at the motion level off, or when the system asks for reduced motion. */
export function stillMotion(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
}
