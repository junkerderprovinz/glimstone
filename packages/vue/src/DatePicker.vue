<script setup lang="ts">
import { computed, ref, useId } from "vue";
import * as datePicker from "@zag-js/date-picker";
import { normalizeProps, useMachine } from "@zag-js/vue";
import { DATE_PICKER_TEXT, formatDay, pageDir, pageLocale, portalTarget, SELECT_POSITIONING, type DatePickerText, type DateView } from "@glimstone/core";
import { useFieldName } from "./fieldName";
import { IconBack, IconCalendar, IconForward } from "./glyphs";
import { usePortalHue } from "./selectParts";

// A day picked from a calendar, bound with v-model as "2026-11-14" or null.
// The trigger is a field that shows the day and takes no typing, like the time
// picker's ("The time picker"), and the calendar opens beside it on the body,
// so no card clips it. The arrows walk the days, Page Up and Page Down the
// months, and the head steps out to the months and the years. Inside a
// FieldRow the row names it.
const props = withDefaults(
  defineProps<{
    label?: string;
    /** The first and the last day it offers, as "2026-11-14". */
    min?: string;
    max?: string;
    /** The language the calendar is drawn in; the page's by default. */
    locale?: string;
    disabled?: boolean;
    text?: Partial<DatePickerText>;
  }>(),
  { disabled: false },
);
const value = defineModel<string | null>({ required: true });

const name = useFieldName(() => props.label);
const words = computed(() => ({ ...DATE_PICKER_TEXT, ...props.text }));
const lang = computed(() => props.locale ?? pageLocale());
const shown = computed(() => (value.value ? formatDay(value.value, lang.value) : words.value.placeholder));
const id = useId();
const service = useMachine(
  datePicker.machine,
  computed(() => ({
    id,
    dir: pageDir(),
    locale: lang.value,
    value: value.value ? [datePicker.parse(value.value)] : [],
    min: props.min ? datePicker.parse(props.min) : undefined,
    max: props.max ? datePicker.parse(props.max) : undefined,
    disabled: props.disabled,
    positioning: SELECT_POSITIONING,
    onValueChange: (d: { value: datePicker.DateValue[] }) => (value.value = d.value[0]?.toString() ?? null),
    translations: {
      content: words.value.calendar,
      trigger: () => (name.value ? `${name.value}, ${shown.value}` : shown.value),
      prevTrigger: (view: DateView) => words.value.previous[view],
      nextTrigger: (view: DateView) => words.value.next[view],
      viewTrigger: () => words.value.zoomOut,
    },
  })),
);
const api = computed(() => datePicker.connect(service, normalizeProps));
const triggerRef = ref<HTMLElement | null>(null);
const hue = usePortalHue(() => api.value.open, triggerRef);
const months = computed(() => api.value.getMonthsGrid({ columns: 4, format: "short" }));
const years = computed(() => api.value.getYearsGrid({ columns: 4 }));
</script>

<template>
  <div data-glim="DatePicker" v-bind="api.getRootProps()" class="glim-date">
    <label v-bind="api.getLabelProps()" :class="label === undefined ? 'glim-sr-only' : 'glim-field-label'">{{ name }}</label>
    <div v-bind="api.getControlProps()" class="glim-date-control">
      <button ref="triggerRef" v-bind="api.getTriggerProps()" class="glim-input glim-date-trigger">
        <span :class="value ? 'glim-date-value' : 'glim-date-value glim-date-value--empty'">{{ shown }}</span>
        <IconCalendar />
      </button>
    </div>
    <Teleport :to="portalTarget()">
      <div v-bind="api.getPositionerProps()" :style="hue.style.value" :class="['glim-date-positioner', hue.className.value]">
        <div v-bind="api.getContentProps()" class="glim-date-panel">
          <div v-bind="api.getViewProps({ view: 'day' })" :hidden="api.view !== 'day'">
            <div v-bind="api.getViewControlProps({ view: 'day' })" class="glim-date-head">
              <button v-bind="api.getPrevTriggerProps({ view: 'day' })" class="glim-date-step"><IconBack /></button>
              <button v-bind="api.getViewTriggerProps({ view: 'day' })" class="glim-date-title">{{ api.visibleRangeText.start }}</button>
              <button v-bind="api.getNextTriggerProps({ view: 'day' })" class="glim-date-step"><IconForward /></button>
            </div>
            <table v-bind="api.getTableProps({ view: 'day' })" class="glim-date-grid">
              <thead v-bind="api.getTableHeadProps({ view: 'day' })">
                <tr v-bind="api.getTableRowProps({ view: 'day' })">
                  <th v-for="(day, i) in api.weekDays" :key="i" scope="col" :aria-label="day.long" class="glim-date-weekday">{{ day.narrow }}</th>
                </tr>
              </thead>
              <tbody v-bind="api.getTableBodyProps({ view: 'day' })">
                <tr v-for="(week, i) in api.weeks" :key="i" v-bind="api.getTableRowProps({ view: 'day' })">
                  <td v-for="(day, j) in week" :key="j" v-bind="api.getDayTableCellProps({ value: day })">
                    <div v-bind="api.getDayTableCellTriggerProps({ value: day })" class="glim-date-cell glim-num">{{ day.day }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-bind="api.getViewProps({ view: 'month' })" :hidden="api.view !== 'month'">
            <div v-bind="api.getViewControlProps({ view: 'month' })" class="glim-date-head">
              <button v-bind="api.getPrevTriggerProps({ view: 'month' })" class="glim-date-step"><IconBack /></button>
              <button v-bind="api.getViewTriggerProps({ view: 'month' })" class="glim-date-title">{{ api.visibleRange.start.year }}</button>
              <button v-bind="api.getNextTriggerProps({ view: 'month' })" class="glim-date-step"><IconForward /></button>
            </div>
            <table v-bind="api.getTableProps({ view: 'month', columns: 4 })" class="glim-date-grid">
              <tbody v-bind="api.getTableBodyProps({ view: 'month' })">
                <tr v-for="(row, i) in months" :key="i" v-bind="api.getTableRowProps()">
                  <td v-for="(month, j) in row" :key="j" v-bind="api.getMonthTableCellProps({ ...month, columns: 4 })">
                    <div v-bind="api.getMonthTableCellTriggerProps({ ...month, columns: 4 })" class="glim-date-cell glim-date-cell--wide">{{ month.label }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-bind="api.getViewProps({ view: 'year' })" :hidden="api.view !== 'year'">
            <div v-bind="api.getViewControlProps({ view: 'year' })" class="glim-date-head">
              <button v-bind="api.getPrevTriggerProps({ view: 'year' })" class="glim-date-step"><IconBack /></button>
              <span class="glim-date-title glim-num">{{ `${api.getDecade().start} - ${api.getDecade().end}` }}</span>
              <button v-bind="api.getNextTriggerProps({ view: 'year' })" class="glim-date-step"><IconForward /></button>
            </div>
            <table v-bind="api.getTableProps({ view: 'year', columns: 4 })" class="glim-date-grid">
              <tbody v-bind="api.getTableBodyProps({ view: 'year' })">
                <tr v-for="(row, i) in years" :key="i" v-bind="api.getTableRowProps({ view: 'year' })">
                  <td v-for="(year, j) in row" :key="j" v-bind="api.getYearTableCellProps({ ...year, columns: 4 })">
                    <div v-bind="api.getYearTableCellTriggerProps({ ...year, columns: 4 })" class="glim-date-cell glim-date-cell--wide glim-num">{{ year.label }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
