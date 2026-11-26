// An AngleSlider snaps every 15 degrees unless it is given a finer step, and
// its dial carries a tick at each snap.

/** The angles an AngleSlider marks on its dial by default, one every 15 degrees of a turn. */
export const ANGLE_MARKS: number[] = Array.from({ length: 24 }, (_, i) => i * 15);

/** Where Home and End turn an AngleSlider: to 0, or to its last step before a
 *  full turn. Undefined for any other key. */
export function angleKeyTarget(key: string, step: number): number | undefined {
  if (key === "Home") return 0;
  if (key === "End") return (Math.ceil(360 / step) - 1) * step;
  return undefined;
}
