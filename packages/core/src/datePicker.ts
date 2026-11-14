// The parts of a DatePicker Zag's date-picker machine leaves to the page: the
// words, the day as the trigger shows it, and the language the calendar is
// drawn in. The machine walks the calendar, takes the keys and places the
// panel. A date travels as an ISO day, "2026-11-14", so an app never handles
// the machine's own date objects.

export type DateView = "day" | "month" | "year";

export interface DatePickerText {
  /** What the trigger shows while no day is chosen. */
  placeholder: string;
  /** The name of the panel that opens. */
  calendar: string;
  previous: Record<DateView, string>;
  next: Record<DateView, string>;
  /** The name of the button in the panel's head that steps out to months or years. */
  zoomOut: string;
}

export const DATE_PICKER_TEXT: DatePickerText = {
  placeholder: "No date",
  calendar: "Calendar",
  previous: { day: "Previous month", month: "Previous year", year: "Previous years" },
  next: { day: "Next month", month: "Next year", year: "Next years" },
  zoomOut: "Choose a month or a year",
};

/** The language the page is in, which the calendar is drawn in unless the app names another. */
export function pageLocale(): string {
  return (typeof document !== "undefined" && document.documentElement.lang) || "en";
}

/**
 * An ISO day as the trigger shows it, such as "14 Nov 2026" or "14.11.2026". The
 * day is read as a calendar day, so no time zone moves it to the day before.
 */
export function formatDay(iso: string, locale: string): string {
  const [year, month, day] = iso.split("-").map(Number) as [number, number, number];
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}
