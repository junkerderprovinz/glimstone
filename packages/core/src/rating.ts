// The words of a Rating. Zag's rating-group machine draws the stars as a
// radio group, takes the arrow keys and the pointer's half steps; an app
// passes the words a star is read with.

export interface RatingText {
  /** How a star is read, such as "3 of 5 stars". */
  star: (value: number, count: number) => string;
}

export const RATING_TEXT: RatingText = {
  star: (value, count) => `${value} of ${count} ${count === 1 ? "star" : "stars"}`,
};
