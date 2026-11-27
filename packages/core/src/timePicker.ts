// A time of day typed or counted into segments, hours and minutes on the
// 24-hour clock, and a span of two such times in one field. A time travels as
// "08:30", so an app never handles the segments; a time with a segment still
// empty is no time at all. The segments are a flat list, hours at the even
// places and minutes at the odd ones, so one set of keys serves both forms.

import { en } from "./componentLocales/en.ts";

export interface TimePickerText {
  /** The accessible names of the two segments. */
  hour: string;
  minute: string;
  /** The names of the two halves of a span, and the word between them. */
  start: string;
  end: string;
  to: string;
}

export const TIME_PICKER_TEXT: TimePickerText = en.timePicker;

/** What an empty segment shows. */
export const TIME_EMPTY = "--";

/** A segment's value, or null while it is empty. */
export type TimeSegmentValue = number | null;

const limit = (at: number) => (at % 2 === 0 ? 24 : 60);

/** "08:30" as its two segments, or both empty for anything that is no time. */
export function parseTime(value: string | null | undefined): [TimeSegmentValue, TimeSegmentValue] {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!m) return [null, null];
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  return hour < 24 && minute < 60 ? [hour, minute] : [null, null];
}

/** The time as "08:30" once both segments hold a number, otherwise null. */
export function formatTime([hour, minute]: readonly TimeSegmentValue[]): string | null {
  if (hour === null || hour === undefined || minute === null || minute === undefined) return null;
  return `${pad(hour)}:${pad(minute)}`;
}

/** A span's start and end, each null while one of its segments is empty. */
export function timeRangeValue(values: readonly TimeSegmentValue[]): [string | null, string | null] {
  return [formatTime(values.slice(0, 2)), formatTime(values.slice(2, 4))];
}

/** A segment as it reads in the field, two digits or the empty mark. */
export function segmentText(value: TimeSegmentValue): string {
  return value === null ? TIME_EMPTY : pad(value);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The segment at `at` counted up or down by `step`, round the clock: past 59
 * minutes comes 0, before 0 hours comes 23. An empty segment starts from 0
 * going up and from the last step going down. Minutes land on the step's grid.
 */
export function stepSegment(value: TimeSegmentValue, at: number, delta: 1 | -1, step = 1): number {
  const top = limit(at);
  if (value === null) return delta > 0 ? 0 : top - step;
  const onGrid = delta > 0 ? Math.floor(value / step) * step + step : Math.ceil(value / step) * step - step;
  return ((onGrid % top) + top) % top;
}

export interface TypedDigit {
  value: number;
  /** The digits typed into the segment so far, kept for the next key. */
  buffer: string;
  /** The segment is full and the focus moves on. */
  done: boolean;
}

/**
 * A digit typed into the segment at `at`. The first digit stands alone and
 * waits for a second, unless no second could follow it, as a 3 in the hours.
 * A second digit that would run past the clock starts the segment over.
 */
export function typeDigit(at: number, buffer: string, digit: number): TypedDigit {
  const top = limit(at);
  if (buffer.length === 1) {
    const both = Number(buffer) * 10 + digit;
    if (both < top) return { value: both, buffer: "", done: true };
  }
  if (digit * 10 >= top) return { value: digit, buffer: "", done: true };
  return { value: digit, buffer: String(digit), done: false };
}

export interface TimeKeyResult {
  values: TimeSegmentValue[];
  /** The digits typed so far into the segment that keeps the focus. */
  buffer: string;
  /** The segment that has the focus after the key. */
  focus: number;
}

/**
 * What a key does in the segment at `at`: the arrows up and down count it,
 * sideways they move between the segments, Home and End go to its ends,
 * digits type it and move on once it is full, and Backspace empties it or, in
 * an empty one, steps back. A key it does not take gives null, for the page.
 */
export function timeKey(values: readonly TimeSegmentValue[], at: number, key: string, buffer: string, minuteStep = 1): TimeKeyResult | null {
  const step = at % 2 === 1 ? minuteStep : 1;
  const last = values.length - 1;
  const set = (value: TimeSegmentValue, focus = at, typed = ""): TimeKeyResult => ({
    values: values.map((v, i) => (i === at ? value : v)),
    buffer: typed,
    focus,
  });
  const move = (focus: number): TimeKeyResult => ({ values: [...values], buffer: "", focus: Math.min(last, Math.max(0, focus)) });
  const value = values[at] ?? null;
  if (/^\d$/.test(key)) {
    const digit = typeDigit(at, buffer, Number(key));
    return set(digit.value, digit.done ? Math.min(last, at + 1) : at, digit.buffer);
  }
  switch (key) {
    case "ArrowUp":
      return set(stepSegment(value, at, 1, step));
    case "ArrowDown":
      return set(stepSegment(value, at, -1, step));
    case "Home":
      return set(0);
    case "End":
      return set(limit(at) - step);
    case "ArrowRight":
      return move(at + 1);
    case "ArrowLeft":
      return move(at - 1);
    case ":":
    case ".":
      return at % 2 === 0 ? move(at + 1) : null;
    case "Backspace":
    case "Delete":
      return value === null ? move(at - 1) : set(null);
    default:
      return null;
  }
}
