// The words of a Marquee. Zag's marquee machine works out how many copies of
// the content fill the row and how long one pass takes; the motion engine
// decides whether it moves at all.

export interface MarqueeText {
  pause: string;
  resume: string;
}

export const MARQUEE_TEXT: MarqueeText = {
  pause: "Pause",
  resume: "Resume",
};
