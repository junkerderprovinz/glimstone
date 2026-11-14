import { useId, useRef } from "react";
import * as datePicker from "@zag-js/date-picker";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { DATE_PICKER_TEXT, formatDay, pageDir, pageLocale, portalTarget, SELECT_POSITIONING, type DatePickerText } from "@glimstone/core";
import { useFieldName } from "./fieldName.ts";
import { IconBack, IconCalendar, IconForward } from "./glyphs.tsx";
import { usePortalHue } from "./portalHue.ts";

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

export function DatePicker({ label, value, onChange, min, max, locale, disabled = false, text }: DatePickerProps) {
  const name = useFieldName(label);
  const words = { ...DATE_PICKER_TEXT, ...text };
  const lang = locale ?? pageLocale();
  const shown = value ? formatDay(value, lang) : words.placeholder;
  const service = useMachine(datePicker.machine, {
    id: useId(),
    dir: pageDir(),
    locale: lang,
    value: value ? [datePicker.parse(value)] : [],
    min: min ? datePicker.parse(min) : undefined,
    max: max ? datePicker.parse(max) : undefined,
    disabled,
    positioning: SELECT_POSITIONING,
    onValueChange: (d) => onChange(d.value[0]?.toString() ?? null),
    translations: {
      content: words.calendar,
      trigger: () => (name ? `${name}, ${shown}` : shown),
      prevTrigger: (view) => words.previous[view],
      nextTrigger: (view) => words.next[view],
      viewTrigger: () => words.zoomOut,
    },
  });
  const api = datePicker.connect(service, normalizeProps);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hue = usePortalHue(api.open, triggerRef);
  const positioner = api.getPositionerProps();
  const months = api.getMonthsGrid({ columns: 4, format: "short" });
  const years = api.getYearsGrid({ columns: 4 });
  return (
    <div data-glim="DatePicker" {...api.getRootProps()} className="glim-date">
      <label {...api.getLabelProps()} className={label === undefined ? "glim-sr-only" : "glim-field-label"}>
        {name}
      </label>
      <div {...api.getControlProps()} className="glim-date-control">
        <button {...api.getTriggerProps()} ref={triggerRef} className="glim-input glim-date-trigger">
          <span className={value ? "glim-date-value" : "glim-date-value glim-date-value--empty"}>{shown}</span>
          <IconCalendar />
        </button>
      </div>
      <Portal container={{ current: portalTarget() }}>
        <div {...positioner} style={{ ...positioner.style, ...hue.style }} className={`glim-date-positioner ${hue.className}`.trim()}>
          <div {...api.getContentProps()} className="glim-date-panel">
            <div {...api.getViewProps({ view: "day" })} hidden={api.view !== "day"}>
              <div {...api.getViewControlProps({ view: "day" })} className="glim-date-head">
                <button {...api.getPrevTriggerProps({ view: "day" })} className="glim-date-step">
                  <IconBack />
                </button>
                <button {...api.getViewTriggerProps({ view: "day" })} className="glim-date-title">
                  {api.visibleRangeText.start}
                </button>
                <button {...api.getNextTriggerProps({ view: "day" })} className="glim-date-step">
                  <IconForward />
                </button>
              </div>
              <table {...api.getTableProps({ view: "day" })} className="glim-date-grid">
                <thead {...api.getTableHeadProps({ view: "day" })}>
                  <tr {...api.getTableRowProps({ view: "day" })}>
                    {api.weekDays.map((day, i) => (
                      <th key={i} scope="col" aria-label={day.long} className="glim-date-weekday">
                        {day.narrow}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody {...api.getTableBodyProps({ view: "day" })}>
                  {api.weeks.map((week, i) => (
                    <tr key={i} {...api.getTableRowProps({ view: "day" })}>
                      {week.map((day, j) => (
                        <td key={j} {...api.getDayTableCellProps({ value: day })}>
                          <div {...api.getDayTableCellTriggerProps({ value: day })} className="glim-date-cell glim-num">
                            {day.day}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div {...api.getViewProps({ view: "month" })} hidden={api.view !== "month"}>
              <div {...api.getViewControlProps({ view: "month" })} className="glim-date-head">
                <button {...api.getPrevTriggerProps({ view: "month" })} className="glim-date-step">
                  <IconBack />
                </button>
                <button {...api.getViewTriggerProps({ view: "month" })} className="glim-date-title">
                  {api.visibleRange.start.year}
                </button>
                <button {...api.getNextTriggerProps({ view: "month" })} className="glim-date-step">
                  <IconForward />
                </button>
              </div>
              <table {...api.getTableProps({ view: "month", columns: 4 })} className="glim-date-grid">
                <tbody {...api.getTableBodyProps({ view: "month" })}>
                  {months.map((row, i) => (
                    <tr key={i} {...api.getTableRowProps()}>
                      {row.map((month, j) => (
                        <td key={j} {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
                          <div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })} className="glim-date-cell glim-date-cell--wide">
                            {month.label}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div {...api.getViewProps({ view: "year" })} hidden={api.view !== "year"}>
              <div {...api.getViewControlProps({ view: "year" })} className="glim-date-head">
                <button {...api.getPrevTriggerProps({ view: "year" })} className="glim-date-step">
                  <IconBack />
                </button>
                <span className="glim-date-title glim-num">{`${api.getDecade().start} - ${api.getDecade().end}`}</span>
                <button {...api.getNextTriggerProps({ view: "year" })} className="glim-date-step">
                  <IconForward />
                </button>
              </div>
              <table {...api.getTableProps({ view: "year", columns: 4 })} className="glim-date-grid">
                <tbody {...api.getTableBodyProps({ view: "year" })}>
                  {years.map((row, i) => (
                    <tr key={i} {...api.getTableRowProps({ view: "year" })}>
                      {row.map((year, j) => (
                        <td key={j} {...api.getYearTableCellProps({ ...year, columns: 4 })}>
                          <div {...api.getYearTableCellTriggerProps({ ...year, columns: 4 })} className="glim-date-cell glim-date-cell--wide glim-num">
                            {year.label}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  );
}
