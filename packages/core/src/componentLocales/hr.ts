import type { ComponentWords } from "../componentWords.ts";

export const hr: ComponentWords = {
  pagination: {
    label: "Stranice",
    previous: "Prethodna stranica",
    next: "Sljedeća stranica",
    page: "Stranica {page} od {pages}",
  },
  pinInput: { cell: "Znak {index} od {length}" },
  tagsInput: {
    remove: "Ukloni {tag}",
    added: "{tag}: dodano",
    selected: "{tag}: odabrano. Backspace ili Delete ga uklanja",
    removed: "{tag}: uklonjeno",
  },
  steps: { back: "Natrag", next: "Dalje", finish: "Završi" },
  splitter: { resize: "Promijeni veličinu" },
  fileUpload: {
    drop: "Ispustite datoteke ovdje ili ih odaberite",
    remove: "Ukloni {name}",
    refused: {
      TOO_MANY_FILES: "{name} je jedna datoteka viška",
      FILE_INVALID_TYPE: "{name} nije vrsta datoteke koja se ovdje prima",
      FILE_TOO_LARGE: "{name} je prevelika",
      FILE_TOO_SMALL: "{name} je premala",
      FILE_INVALID: "{name} se ne može pročitati",
      FILE_EXISTS: "{name} je već na popisu",
    },
  },
  datePicker: {
    placeholder: "Bez datuma",
    calendar: "Kalendar",
    previous: { day: "Prethodni mjesec", month: "Prethodna godina", year: "Prethodne godine" },
    next: { day: "Sljedeći mjesec", month: "Sljedeća godina", year: "Sljedeće godine" },
    zoomOut: "Odaberite mjesec ili godinu",
  },
  rating: {
    star: {
      one: "{value} od {count} zvjezdice",
      few: "{value} od {count} zvjezdice",
      other: "{value} od {count} zvjezdica",
    },
  },
  timer: {
    start: "Pokreni",
    pause: "Pauziraj",
    resume: "Nastavi",
    reset: "Poništi",
    hours: { one: "{count} sat", few: "{count} sata", other: "{count} sati" },
    minutes: { one: "{count} minuta", few: "{count} minute", other: "{count} minuta" },
    seconds: { one: "{count} sekunda", few: "{count} sekunde", other: "{count} sekundi" },
  },
  carousel: { previous: "Prethodni slajd", next: "Sljedeći slajd", slide: "{index} od {count}", goTo: "Slajd {index}" },
  marquee: { pause: "Pauziraj", resume: "Nastavi" },
  tour: { back: "Natrag", next: "Dalje", close: "Zatvori", progress: "{step} od {steps}" },
  floatingPanel: { minimize: "Smanji", maximize: "Povećaj", restore: "Vrati", close: "Zatvori" },
  signaturePad: { area: "Potpis", clear: "Očisti" },
};
