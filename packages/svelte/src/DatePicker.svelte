<script lang="ts" module>
  import type { DatePickerText } from "@glimstone/core";

  export type { DatePickerText, DateView } from "@glimstone/core";

  export interface DatePickerProps {
    label?: string;
    /** The day as "2026-11-14", or null for none, bound with `bind:value`. */
    value: string | null;
    onChange?: (value: string | null) => void;
    /** The first and the last day it offers, as "2026-11-14". */
    min?: string;
    max?: string;
    /** The language the calendar is drawn in; the page's by default. */
    locale?: string;
    disabled?: boolean;
    text?: Partial<DatePickerText>;
  }
</script>

<script lang="ts">
  import * as datePicker from "@zag-js/date-picker";
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { DATE_PICKER_TEXT, formatDay, pageDir, pageLocale, SELECT_POSITIONING, type DateView } from "@glimstone/core";
  import { useFieldName } from "./fieldName.js";
  import { IconBack, IconCalendar, IconForward } from "./glyphs.js";
  import { lift } from "./lift.js";
  import { usePortalHue } from "./portalHue.svelte.js";

  // A day picked from a calendar. The trigger is a field that shows the day and
  // takes no typing, like the time picker's ("The time picker"), and the
  // calendar opens beside it on the body, so no card clips it. The arrows walk
  // the days, Page Up and Page Down the months, and the head steps out to the
  // months and the years. Inside a FieldRow the row names it.
  let { label, value = $bindable(), onChange, min, max, locale, disabled = false, text }: DatePickerProps = $props();

  const name = useFieldName(() => label);
  const words = $derived({ ...DATE_PICKER_TEXT, ...text });
  const lang = $derived(locale ?? pageLocale());
  const shown = $derived(value ? formatDay(value, lang) : words.placeholder);
  const id = $props.id();
  const service = useMachine(datePicker.machine, () => ({
    id,
    dir: pageDir(),
    locale: lang,
    value: value ? [datePicker.parse(value)] : [],
    min: min ? datePicker.parse(min) : undefined,
    max: max ? datePicker.parse(max) : undefined,
    disabled,
    positioning: SELECT_POSITIONING,
    onValueChange: (d: { value: datePicker.DateValue[] }) => {
      value = d.value[0]?.toString() ?? null;
      onChange?.(value);
    },
    translations: {
      content: words.calendar,
      trigger: () => (name() ? `${name()}, ${shown}` : shown),
      prevTrigger: (view: DateView) => words.previous[view],
      nextTrigger: (view: DateView) => words.next[view],
      viewTrigger: () => words.zoomOut,
    },
  }));
  const api = $derived(datePicker.connect(service, normalizeProps));
  let trigger = $state<HTMLButtonElement | null>(null);
  const hue = usePortalHue(() => api.open, () => trigger);
  const months = $derived(api.getMonthsGrid({ columns: 4, format: "short" }));
  const years = $derived(api.getYearsGrid({ columns: 4 }));
</script>

<div data-glim="DatePicker" {...api.getRootProps()} class="glim-date">
  <label {...api.getLabelProps()} class={label === undefined ? "glim-sr-only" : "glim-field-label"}>{name()}</label>
  <div {...api.getControlProps()} class="glim-date-control">
    <button {...api.getTriggerProps()} bind:this={trigger} class="glim-input glim-date-trigger">
      <span class={value ? "glim-date-value" : "glim-date-value glim-date-value--empty"}>{shown}</span>
      {@render IconCalendar()}
    </button>
  </div>
  <div {@attach lift} {...mergeProps(api.getPositionerProps(), { style: hue.style })} class={`glim-date-positioner ${hue.className}`.trim()}>
    <div {...api.getContentProps()} class="glim-date-panel">
      <div {...api.getViewProps({ view: "day" })} hidden={api.view !== "day"}>
        <div {...api.getViewControlProps({ view: "day" })} class="glim-date-head">
          <button {...api.getPrevTriggerProps({ view: "day" })} class="glim-date-step">{@render IconBack()}</button>
          <button {...api.getViewTriggerProps({ view: "day" })} class="glim-date-title">{api.visibleRangeText.start}</button>
          <button {...api.getNextTriggerProps({ view: "day" })} class="glim-date-step">{@render IconForward()}</button>
        </div>
        <table {...api.getTableProps({ view: "day" })} class="glim-date-grid">
          <thead {...api.getTableHeadProps({ view: "day" })}>
            <tr {...api.getTableRowProps({ view: "day" })}>
              {#each api.weekDays as day, i (i)}
                <th scope="col" aria-label={day.long} class="glim-date-weekday">{day.narrow}</th>
              {/each}
            </tr>
          </thead>
          <tbody {...api.getTableBodyProps({ view: "day" })}>
            {#each api.weeks as week, i (i)}
              <tr {...api.getTableRowProps({ view: "day" })}>
                {#each week as day, j (j)}
                  <td {...api.getDayTableCellProps({ value: day })}>
                    <div {...api.getDayTableCellTriggerProps({ value: day })} class="glim-date-cell glim-num">{day.day}</div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div {...api.getViewProps({ view: "month" })} hidden={api.view !== "month"}>
        <div {...api.getViewControlProps({ view: "month" })} class="glim-date-head">
          <button {...api.getPrevTriggerProps({ view: "month" })} class="glim-date-step">{@render IconBack()}</button>
          <button {...api.getViewTriggerProps({ view: "month" })} class="glim-date-title">{api.visibleRange.start.year}</button>
          <button {...api.getNextTriggerProps({ view: "month" })} class="glim-date-step">{@render IconForward()}</button>
        </div>
        <table {...api.getTableProps({ view: "month", columns: 4 })} class="glim-date-grid">
          <tbody {...api.getTableBodyProps({ view: "month" })}>
            {#each months as row, i (i)}
              <tr {...api.getTableRowProps()}>
                {#each row as month, j (j)}
                  <td {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
                    <div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })} class="glim-date-cell glim-date-cell--wide">{month.label}</div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div {...api.getViewProps({ view: "year" })} hidden={api.view !== "year"}>
        <div {...api.getViewControlProps({ view: "year" })} class="glim-date-head">
          <button {...api.getPrevTriggerProps({ view: "year" })} class="glim-date-step">{@render IconBack()}</button>
          <span class="glim-date-title glim-num">{`${api.getDecade().start} - ${api.getDecade().end}`}</span>
          <button {...api.getNextTriggerProps({ view: "year" })} class="glim-date-step">{@render IconForward()}</button>
        </div>
        <table {...api.getTableProps({ view: "year", columns: 4 })} class="glim-date-grid">
          <tbody {...api.getTableBodyProps({ view: "year" })}>
            {#each years as row, i (i)}
              <tr {...api.getTableRowProps({ view: "year" })}>
                {#each row as year, j (j)}
                  <td {...api.getYearTableCellProps({ ...year, columns: 4 })}>
                    <div {...api.getYearTableCellTriggerProps({ ...year, columns: 4 })} class="glim-date-cell glim-date-cell--wide glim-num">{year.label}</div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
