import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import {
  TIME_PICKER_TEXT,
  formatTime,
  parseTime,
  segmentText,
  timeKey,
  timeRangeValue,
  type TimePickerText,
  type TimeSegmentValue,
} from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";

export type { TimePickerText } from "@glimstone/core";

// A time of day in one field of two segments, hours and minutes, and a span
// of two times in one field. Each segment is a spin button: the arrows count
// it round the clock, digits type it and move on once it is full, Backspace
// empties it. A time is data, so the segments run left to right in every
// language. Inside a FieldRow the row names it.

export interface TimePickerProps {
  label?: string;
  /** The time as "08:30", or null while a segment is empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** How far an arrow moves the minutes. */
  minuteStep?: number;
  /** The name the time is sent under in a form. */
  name?: string;
  disabled?: boolean;
  /** The segments' names. English where left out. */
  text?: Partial<TimePickerText>;
  className?: string;
}

export interface TimeRangePickerProps {
  label?: string;
  /** The start and the end as "08:00", each null while one of its segments is empty. */
  value: [string | null, string | null];
  onChange: (value: [string | null, string | null]) => void;
  /** How far an arrow moves the minutes. */
  minuteStep?: number;
  disabled?: boolean;
  /** The segments' names, the halves' and the word between them. English where left out. */
  text?: Partial<TimePickerText>;
  className?: string;
}

type SharedProps = Omit<TimePickerProps, "value" | "onChange" | "name">;

export function TimePicker({ value, onChange, name, ...shared }: TimePickerProps) {
  const [values, setValues] = useSegments([value]);
  return (
    <TimeShell
      {...shared}
      data-glim="TimePicker"
      values={values}
      onValues={(next) => {
        setValues(next);
        const time = formatTime(next);
        if (time !== value) onChange(time);
      }}
    >
      {name && <input type="hidden" name={name} value={formatTime(values) ?? ""} />}
    </TimeShell>
  );
}

export function TimeRangePicker({ value, onChange, ...shared }: TimeRangePickerProps) {
  const [values, setValues] = useSegments(value);
  return (
    <TimeShell
      {...shared}
      data-glim="TimeRangePicker"
      values={values}
      onValues={(next) => {
        setValues(next);
        const span = timeRangeValue(next);
        if (span[0] !== value[0] || span[1] !== value[1]) onChange(span);
      }}
    />
  );
}

/**
 * The segments of one or two times. A time from the app replaces its
 * segments, and so does a null that clears a whole time, but a half-typed
 * time the app only knows as null stays.
 */
function useSegments(times: (string | null)[]) {
  const [values, setValues] = useState<TimeSegmentValue[]>(() => times.flatMap(parseTime));
  const key = times.join("|");
  useEffect(() => {
    setValues((now) =>
      times.flatMap((time, i) => {
        const half = now.slice(i * 2, i * 2 + 2);
        return time === null && formatTime(half) === null ? half : parseTime(time);
      }),
    );
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return [values, setValues] as const;
}

function TimeShell({
  "data-glim": glim,
  label,
  values,
  onValues,
  minuteStep = 1,
  disabled = false,
  text,
  className,
  children,
}: SharedProps & { "data-glim": string; values: TimeSegmentValue[]; onValues: (values: TimeSegmentValue[]) => void; children?: ReactNode }) {
  const fieldName = useFieldName(label);
  const words = { ...TIME_PICKER_TEXT, ...text };
  const typed = useRef("");
  const segments = useRef<(HTMLSpanElement | null)[]>([]);
  const range = values.length > 2;

  function focus(at: number) {
    typed.current = "";
    segments.current[at]?.focus();
  }

  function onKeyDown(at: number, e: KeyboardEvent<HTMLSpanElement>) {
    if (disabled) return;
    const result = timeKey(values, at, e.key, typed.current, minuteStep);
    if (!result) return;
    e.preventDefault();
    if (result.values.some((v, i) => v !== values[i])) onValues(result.values);
    if (result.focus !== at) focus(result.focus);
    else typed.current = result.buffer;
  }

  // A press beside the segments lands on the first empty one, as on a text field's padding.
  function onMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (disabled || (e.target as HTMLElement).closest(".glim-time-seg")) return;
    e.preventDefault();
    const empty = values.indexOf(null);
    focus(empty < 0 ? 0 : empty);
  }

  const segment = (at: number) => (
    <span
      ref={(el) => {
        segments.current[at] = el;
      }}
      role="spinbutton"
      tabIndex={disabled ? -1 : 0}
      aria-label={at % 2 === 0 ? words.hour : words.minute}
      aria-valuemin={0}
      aria-valuemax={at % 2 === 0 ? 23 : 59}
      aria-valuenow={values[at] ?? undefined}
      aria-valuetext={values[at] === null ? undefined : segmentText(values[at]!)}
      aria-disabled={disabled || undefined}
      data-empty={values[at] === null ? "" : undefined}
      className="glim-time-seg"
      onKeyDown={(e) => onKeyDown(at, e)}
      onFocus={() => {
        typed.current = "";
      }}
    >
      {segmentText(values[at]!)}
    </span>
  );

  const time = (first: number) => (
    <>
      {segment(first)}
      <span className="glim-time-colon" aria-hidden="true">
        :
      </span>
      {segment(first + 1)}
    </>
  );

  return (
    <div
      data-glim={glim}
      role="group"
      aria-label={fieldName}
      data-disabled={disabled ? "" : undefined}
      className={["glim-time", className].filter(Boolean).join(" ")}
      onMouseDown={onMouseDown}
    >
      {range
        ? [0, 2].map((first) => (
            <Fragment key={first}>
              {first > 0 && (
                <span className="glim-time-to" aria-hidden="true">
                  {words.to}
                </span>
              )}
              <span role="group" aria-label={first === 0 ? words.start : words.end} className="glim-time-half">
                {time(first)}
              </span>
            </Fragment>
          ))
        : time(0)}
      {children}
    </div>
  );
}
