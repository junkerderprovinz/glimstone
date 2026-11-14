import { createMemo, createSignal, createUniqueId, For, mergeProps, type JSX } from "solid-js";
import * as datePicker from "@zag-js/date-picker";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { DATE_PICKER_TEXT, formatDay, pageDir, pageLocale, SELECT_POSITIONING, type DatePickerText, type DateView } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";
import { IconBack, IconCalendar, IconForward } from "./glyphs.tsx";
import { Lift } from "./Lift.tsx";
import { usePortalHue } from "./portalHue.ts";
import { css } from "./style.ts";

export type { DatePickerText, DateView } from "@glimstone/core";

// A day picked from a calendar. The trigger is a field that shows the day and
// takes no typing, like the time picker's ("The time picker"), and the
// calendar opens beside it on the body, so no card clips it. The arrows walk
// the days, Page Up and Page Down the months, and the head steps out to the
// months and the years. Inside a FieldRow the row names it.

export interface DatePickerProps {
  label?: string;
  /** The day as "2026-11-14", or null for none. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** The first and the last day it offers, as "2026-11-14". */
  min?: string;
  max?: string;
  /** The language the calendar is drawn in; the page's by default. */
  locale?: string;
  disabled?: boolean;
  text?: Partial<DatePickerText>;
}

export function DatePicker(raw: DatePickerProps) {
  const props = mergeProps({ disabled: false }, raw);
  const id = createUniqueId();
  const name = useFieldName(() => props.label);
  const words = () => ({ ...DATE_PICKER_TEXT, ...props.text });
  const lang = () => props.locale ?? pageLocale();
  const shown = () => (props.value ? formatDay(props.value, lang()) : words().placeholder);
  const service = useMachine(datePicker.machine, () => ({
    id,
    dir: pageDir(),
    locale: lang(),
    value: props.value ? [datePicker.parse(props.value)] : [],
    min: props.min ? datePicker.parse(props.min) : undefined,
    max: props.max ? datePicker.parse(props.max) : undefined,
    disabled: props.disabled,
    positioning: SELECT_POSITIONING,
    onValueChange: (d: { value: datePicker.DateValue[] }) => props.onChange(d.value[0]?.toString() ?? null),
    translations: {
      content: words().calendar,
      trigger: () => (name() ? `${name()}, ${shown()}` : shown()),
      prevTrigger: (view: DateView) => words().previous[view],
      nextTrigger: (view: DateView) => words().next[view],
      viewTrigger: () => words().zoomOut,
    },
  }));
  const api = createMemo(() => datePicker.connect(service, normalizeProps));
  const [trigger, setTrigger] = createSignal<HTMLButtonElement>();
  const hue = usePortalHue(() => api().open, trigger);
  const positioner = () => api().getPositionerProps();
  const months = () => api().getMonthsGrid({ columns: 4, format: "short" });
  const years = () => api().getYearsGrid({ columns: 4 });
  return (
    <div data-glim="DatePicker" {...api().getRootProps()} class="glim-date">
      <label {...api().getLabelProps()} class={props.label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name()}
      </label>
      <div {...api().getControlProps()} class="glim-date-control">
        <button {...api().getTriggerProps()} ref={setTrigger} class="glim-input glim-date-trigger">
          <span class={props.value ? "glim-date-value" : "glim-date-value glim-date-value--empty"}>{shown()}</span>
          <IconCalendar />
        </button>
      </div>
      <Lift>
        <div
          {...positioner()}
          style={{ ...(positioner().style as JSX.CSSProperties), ...css(hue.style()) }}
          class={`glim-date-positioner ${hue.className()}`.trim()}
        >
          <div {...api().getContentProps()} class="glim-date-panel">
            <div {...api().getViewProps({ view: "day" })} hidden={api().view !== "day"}>
              <div {...api().getViewControlProps({ view: "day" })} class="glim-date-head">
                <button {...api().getPrevTriggerProps({ view: "day" })} class="glim-date-step">
                  <IconBack />
                </button>
                <button {...api().getViewTriggerProps({ view: "day" })} class="glim-date-title">
                  {api().visibleRangeText.start}
                </button>
                <button {...api().getNextTriggerProps({ view: "day" })} class="glim-date-step">
                  <IconForward />
                </button>
              </div>
              <table {...api().getTableProps({ view: "day" })} class="glim-date-grid">
                <thead {...api().getTableHeadProps({ view: "day" })}>
                  <tr {...api().getTableRowProps({ view: "day" })}>
                    <For each={api().weekDays}>
                      {(day) => (
                        <th scope="col" aria-label={day.long} class="glim-date-weekday">
                          {day.narrow}
                        </th>
                      )}
                    </For>
                  </tr>
                </thead>
                <tbody {...api().getTableBodyProps({ view: "day" })}>
                  <For each={api().weeks}>
                    {(week) => (
                      <tr {...api().getTableRowProps({ view: "day" })}>
                        <For each={week}>
                          {(day) => (
                            <td {...api().getDayTableCellProps({ value: day })}>
                              <div {...api().getDayTableCellTriggerProps({ value: day })} class="glim-date-cell glim-num">
                                {day.day}
                              </div>
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            <div {...api().getViewProps({ view: "month" })} hidden={api().view !== "month"}>
              <div {...api().getViewControlProps({ view: "month" })} class="glim-date-head">
                <button {...api().getPrevTriggerProps({ view: "month" })} class="glim-date-step">
                  <IconBack />
                </button>
                <button {...api().getViewTriggerProps({ view: "month" })} class="glim-date-title">
                  {api().visibleRange.start.year}
                </button>
                <button {...api().getNextTriggerProps({ view: "month" })} class="glim-date-step">
                  <IconForward />
                </button>
              </div>
              <table {...api().getTableProps({ view: "month", columns: 4 })} class="glim-date-grid">
                <tbody {...api().getTableBodyProps({ view: "month" })}>
                  <For each={months()}>
                    {(row) => (
                      <tr {...api().getTableRowProps()}>
                        <For each={row}>
                          {(month) => (
                            <td {...api().getMonthTableCellProps({ ...month, columns: 4 })}>
                              <div {...api().getMonthTableCellTriggerProps({ ...month, columns: 4 })} class="glim-date-cell glim-date-cell--wide">
                                {month.label}
                              </div>
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            <div {...api().getViewProps({ view: "year" })} hidden={api().view !== "year"}>
              <div {...api().getViewControlProps({ view: "year" })} class="glim-date-head">
                <button {...api().getPrevTriggerProps({ view: "year" })} class="glim-date-step">
                  <IconBack />
                </button>
                <span class="glim-date-title glim-num">{`${api().getDecade().start} - ${api().getDecade().end}`}</span>
                <button {...api().getNextTriggerProps({ view: "year" })} class="glim-date-step">
                  <IconForward />
                </button>
              </div>
              <table {...api().getTableProps({ view: "year", columns: 4 })} class="glim-date-grid">
                <tbody {...api().getTableBodyProps({ view: "year" })}>
                  <For each={years()}>
                    {(row) => (
                      <tr {...api().getTableRowProps({ view: "year" })}>
                        <For each={row}>
                          {(year) => (
                            <td {...api().getYearTableCellProps({ ...year, columns: 4 })}>
                              <div {...api().getYearTableCellTriggerProps({ ...year, columns: 4 })} class="glim-date-cell glim-date-cell--wide glim-num">
                                {year.label}
                              </div>
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Lift>
    </div>
  );
}
