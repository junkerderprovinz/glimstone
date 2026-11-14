import type { ComponentWords } from "../componentWords.ts";

export const fa: ComponentWords = {
  pagination: { label: "صفحه‌ها", previous: "صفحهٔ قبلی", next: "صفحهٔ بعدی", page: "صفحهٔ {page} از {pages}" },
  pinInput: { cell: "نویسهٔ {index} از {length}" },
  tagsInput: {
    remove: "حذف {tag}",
    added: "{tag} افزوده شد",
    selected: "{tag} انتخاب شد. Backspace یا Delete آن را حذف می‌کند",
    removed: "{tag} حذف شد",
  },
  steps: { back: "قبلی", next: "بعدی", finish: "پایان" },
  splitter: { resize: "تغییر اندازه" },
  fileUpload: {
    drop: "پرونده‌ها را اینجا رها کنید یا انتخابشان کنید",
    remove: "حذف {name}",
    refused: {
      TOO_MANY_FILES: "{name} یک پرونده بیش از حد است",
      FILE_INVALID_TYPE: "{name} از نوع پرونده‌هایی نیست که اینجا پذیرفته می‌شود",
      FILE_TOO_LARGE: "{name} بیش از حد بزرگ است",
      FILE_TOO_SMALL: "{name} بیش از حد کوچک است",
      FILE_INVALID: "{name} خوانده نمی‌شود",
      FILE_EXISTS: "{name} از قبل در فهرست است",
    },
  },
  datePicker: {
    placeholder: "بدون تاریخ",
    calendar: "تقویم",
    previous: { day: "ماه قبل", month: "سال قبل", year: "سال‌های قبل" },
    next: { day: "ماه بعد", month: "سال بعد", year: "سال‌های بعد" },
    zoomOut: "انتخاب ماه یا سال",
  },
  rating: { star: { one: "{value} از {count} ستاره", other: "{value} از {count} ستاره" } },
  timer: {
    start: "شروع",
    pause: "مکث",
    resume: "ادامه",
    reset: "بازنشانی",
    hours: { one: "{count} ساعت", other: "{count} ساعت" },
    minutes: { one: "{count} دقیقه", other: "{count} دقیقه" },
    seconds: { one: "{count} ثانیه", other: "{count} ثانیه" },
  },
  carousel: { previous: "اسلاید قبلی", next: "اسلاید بعدی", slide: "{index} از {count}", goTo: "اسلاید {index}" },
  marquee: { pause: "مکث", resume: "ادامه" },
  tour: { back: "قبلی", next: "بعدی", close: "بستن", progress: "{step} از {steps}" },
  floatingPanel: { minimize: "کوچک کردن", maximize: "بزرگ کردن", restore: "بازگردانی", close: "بستن" },
  signaturePad: { area: "امضا", clear: "پاک کردن" },
};
