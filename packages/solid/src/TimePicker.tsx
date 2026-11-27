import { createEffect, createSignal, For, on, Show, type JSX } from "solid-js";
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
  class?: string;
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
  class?: string;
}

type SharedProps = Omit<TimePickerProps, "value" | "onChange" | "name">;

export function TimePicker(props: TimePickerProps) {
  const [values, setValues] = useSegments(() => [props.value]);
  return (
    <TimeShell
      {...props}
      data-glim="TimePicker"
      values={values()}
      onValues={(next) => {
        setValues(next);
        const time = formatTime(next);
        if (time !== props.value) props.onChange(time);
      }}
    >
      <Show when={props.name}>{(name) => <input type="hidden" name={name()} value={formatTime(values()) ?? ""} />}</Show>
    </TimeShell>
  );
}

export function TimeRangePicker(props: TimeRangePickerProps) {
  const [values, setValues] = useSegments(() => props.value);
  return (
    <TimeShell
      {...props}
      data-glim="TimeRangePicker"
      values={values()}
      onValues={(next) => {
        setValues(next);
        const span = timeRangeValue(next);
        if (span[0] !== props.value[0] || span[1] !== props.value[1]) props.onChange(span);
      }}
    />
  );
}

/**
 * The segments of one or two times. A time from the app replaces its
 * segments, and so does a null that clears a whole time, but a half-typed
 * time the app only knows as null stays.
 */
function useSegments(times: () => (string | null)[]) {
  const [values, setValues] = createSignal<TimeSegmentValue[]>(times().flatMap(parseTime));
  createEffect(
    on(
      () => times().join("|"),
      () =>
        setValues((now) =>
          times().flatMap((time, i) => {
            const half = now.slice(i * 2, i * 2 + 2);
            return time === null && formatTime(half) === null ? half : parseTime(time);
          }),
        ),
      { defer: true },
    ),
  );
  return [values, setValues] as const;
}

function TimeShell(props: SharedProps & { "data-glim": string; values: TimeSegmentValue[]; onValues: (values: TimeSegmentValue[]) => void; children?: JSX.Element }) {
  const fieldName = useFieldName(() => props.label);
  const words = () => ({ ...TIME_PICKER_TEXT, ...props.text });
  const segments: HTMLSpanElement[] = [];
  const range = () => props.values.length > 2;
  let typed = "";

  function focus(at: number) {
    typed = "";
    segments[at]?.focus();
  }

  function onKeyDown(at: number, e: KeyboardEvent) {
    if (props.disabled) return;
    const result = timeKey(props.values, at, e.key, typed, props.minuteStep ?? 1);
    if (!result) return;
    e.preventDefault();
    if (result.values.some((v, i) => v !== props.values[i])) props.onValues(result.values);
    if (result.focus !== at) focus(result.focus);
    else typed = result.buffer;
  }

  // A press beside the segments lands on the first empty one, as on a text field's padding.
  function onMouseDown(e: MouseEvent) {
    if (props.disabled || (e.target as HTMLElement).closest(".glim-time-seg")) return;
    e.preventDefault();
    const empty = props.values.indexOf(null);
    focus(empty < 0 ? 0 : empty);
  }

  const segment = (at: number) => (
    <span
      ref={(el) => (segments[at] = el)}
      role="spinbutton"
      tabIndex={props.disabled ? -1 : 0}
      aria-label={at % 2 === 0 ? words().hour : words().minute}
      aria-valuemin={0}
      aria-valuemax={at % 2 === 0 ? 23 : 59}
      aria-valuenow={props.values[at] ?? undefined}
      aria-valuetext={props.values[at] === null ? undefined : segmentText(props.values[at]!)}
      aria-disabled={props.disabled || undefined}
      data-empty={props.values[at] === null ? "" : undefined}
      class="glim-time-seg"
      onKeyDown={(e) => onKeyDown(at, e)}
      onFocus={() => (typed = "")}
    >
      {segmentText(props.values[at]!)}
    </span>
  );

  const time = (first: number) => (
    <>
      {segment(first)}
      <span class="glim-time-colon" aria-hidden="true">
        :
      </span>
      {segment(first + 1)}
    </>
  );

  return (
    <div
      data-glim={props["data-glim"]}
      role="group"
      aria-label={fieldName()}
      data-disabled={props.disabled ? "" : undefined}
      class={["glim-time", props.class].filter(Boolean).join(" ")}
      onMouseDown={onMouseDown}
    >
      <Show when={range()} fallback={time(0)}>
        <For each={[0, 2]}>
          {(first) => (
            <>
              <Show when={first > 0}>
                <span class="glim-time-to" aria-hidden="true">
                  {words().to}
                </span>
              </Show>
              <span role="group" aria-label={first === 0 ? words().start : words().end} class="glim-time-half">
                {time(first)}
              </span>
            </>
          )}
        </For>
      </Show>
      {props.children}
    </div>
  );
}
