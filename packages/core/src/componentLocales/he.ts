import type { ComponentWords } from "../componentWords.ts";

export const he: ComponentWords = {
  pagination: { label: "עמודים", previous: "העמוד הקודם", next: "העמוד הבא", page: "עמוד {page} מתוך {pages}" },
  pinInput: { cell: "תו {index} מתוך {length}" },
  tagsInput: {
    remove: "הסרת {tag}",
    added: "{tag} נוסף",
    selected: "{tag} נבחר. Backspace או Delete מסירים אותו",
    removed: "{tag} הוסר",
  },
  steps: { back: "הקודם", next: "הבא", finish: "סיום" },
  splitter: { resize: "שינוי גודל" },
  fileUpload: {
    drop: "אפשר לשחרר כאן קבצים או לבחור אותם",
    remove: "הסרת {name}",
    refused: {
      TOO_MANY_FILES: "{name} הוא קובץ אחד יותר מדי",
      FILE_INVALID_TYPE: "{name} אינו סוג קובץ שמתקבל כאן",
      FILE_TOO_LARGE: "{name} גדול מדי",
      FILE_TOO_SMALL: "{name} קטן מדי",
      FILE_INVALID: "אי אפשר לקרוא את {name}",
      FILE_EXISTS: "{name} כבר ברשימה",
    },
  },
  datePicker: {
    placeholder: "ללא תאריך",
    calendar: "לוח שנה",
    previous: { day: "החודש הקודם", month: "השנה הקודמת", year: "השנים הקודמות" },
    next: { day: "החודש הבא", month: "השנה הבאה", year: "השנים הבאות" },
    zoomOut: "בחירת חודש או שנה",
  },
  rating: {
    star: {
      one: "{value} מתוך {count} כוכב",
      two: "{value} מתוך {count} כוכבים",
      other: "{value} מתוך {count} כוכבים",
    },
  },
  timer: {
    start: "התחלה",
    pause: "השהיה",
    resume: "המשך",
    reset: "איפוס",
    hours: { one: "{count} שעה", two: "{count} שעות", other: "{count} שעות" },
    minutes: { one: "{count} דקה", two: "{count} דקות", other: "{count} דקות" },
    seconds: { one: "{count} שנייה", two: "{count} שניות", other: "{count} שניות" },
  },
  carousel: { previous: "השקופית הקודמת", next: "השקופית הבאה", slide: "{index} מתוך {count}", goTo: "שקופית {index}" },
  marquee: { pause: "השהיה", resume: "המשך" },
  tour: { back: "הקודם", next: "הבא", close: "סגירה", progress: "{step} מתוך {steps}" },
  floatingPanel: { minimize: "מזעור", maximize: "הגדלה", restore: "שחזור", close: "סגירה" },
  signaturePad: { area: "חתימה", clear: "ניקוי" },
};
