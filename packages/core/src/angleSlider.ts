// An AngleSlider snaps every 15 degrees unless it is given a finer step, and
// its dial carries a tick at each snap.

/** The angles an AngleSlider marks on its dial by default, one every 15 degrees of a turn. */
export const ANGLE_MARKS: number[] = Array.from({ length: 24 }, (_, i) => i * 15);
