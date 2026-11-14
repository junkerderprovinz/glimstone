import type { ComponentWords } from "../componentWords.ts";

export const el: ComponentWords = {
  pagination: {
    label: "Σελίδες",
    previous: "Προηγούμενη σελίδα",
    next: "Επόμενη σελίδα",
    page: "Σελίδα {page} από {pages}",
  },
  pinInput: { cell: "Χαρακτήρας {index} από {length}" },
  tagsInput: {
    remove: "Αφαίρεση {tag}",
    added: "{tag}: προστέθηκε",
    selected: "{tag}: επιλέχθηκε. Το Backspace ή το Delete το αφαιρεί",
    removed: "{tag}: αφαιρέθηκε",
  },
  steps: { back: "Πίσω", next: "Επόμενο", finish: "Ολοκλήρωση" },
  splitter: { resize: "Αλλαγή μεγέθους" },
  fileUpload: {
    drop: "Αφήστε εδώ τα αρχεία ή επιλέξτε τα",
    remove: "Αφαίρεση {name}",
    refused: {
      TOO_MANY_FILES: "{name}: ένα αρχείο παραπάνω",
      FILE_INVALID_TYPE: "{name}: αυτό το είδος αρχείου δεν γίνεται δεκτό εδώ",
      FILE_TOO_LARGE: "{name}: πολύ μεγάλο",
      FILE_TOO_SMALL: "{name}: πολύ μικρό",
      FILE_INVALID: "{name}: δεν διαβάζεται",
      FILE_EXISTS: "{name}: υπάρχει ήδη στη λίστα",
    },
  },
  datePicker: {
    placeholder: "Χωρίς ημερομηνία",
    calendar: "Ημερολόγιο",
    previous: { day: "Προηγούμενος μήνας", month: "Προηγούμενο έτος", year: "Προηγούμενα έτη" },
    next: { day: "Επόμενος μήνας", month: "Επόμενο έτος", year: "Επόμενα έτη" },
    zoomOut: "Επιλογή μήνα ή έτους",
  },
  rating: { star: { one: "{value} από {count} αστέρι", other: "{value} από {count} αστέρια" } },
  timer: {
    start: "Έναρξη",
    pause: "Παύση",
    resume: "Συνέχεια",
    reset: "Επαναφορά",
    hours: { one: "{count} ώρα", other: "{count} ώρες" },
    minutes: { one: "{count} λεπτό", other: "{count} λεπτά" },
    seconds: { one: "{count} δευτερόλεπτο", other: "{count} δευτερόλεπτα" },
  },
  carousel: {
    previous: "Προηγούμενη διαφάνεια",
    next: "Επόμενη διαφάνεια",
    slide: "{index} από {count}",
    goTo: "Διαφάνεια {index}",
  },
  marquee: { pause: "Παύση", resume: "Συνέχεια" },
  tour: { back: "Πίσω", next: "Επόμενο", close: "Κλείσιμο", progress: "{step} από {steps}" },
  floatingPanel: { minimize: "Ελαχιστοποίηση", maximize: "Μεγιστοποίηση", restore: "Επαναφορά", close: "Κλείσιμο" },
  signaturePad: { area: "Υπογραφή", clear: "Καθαρισμός" },
};
