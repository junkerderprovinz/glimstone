import type { ComponentWords } from "../componentWords.ts";

export const sl: ComponentWords = {
  pagination: { label: "Strani", previous: "Prejšnja stran", next: "Naslednja stran", page: "Stran {page} od {pages}" },
  pinInput: { cell: "Znak {index} od {length}" },
  tagsInput: {
    remove: "Odstrani {tag}",
    added: "{tag}: dodano",
    selected: "{tag}: izbrano. Vračalka ali Delete ga odstrani",
    removed: "{tag}: odstranjeno",
  },
  steps: { back: "Nazaj", next: "Naprej", finish: "Dokončaj" },
  splitter: { resize: "Spremeni velikost" },
  fileUpload: {
    drop: "Spustite datoteke sem ali jih izberite",
    remove: "Odstrani {name}",
    refused: {
      TOO_MANY_FILES: "{name} je ena datoteka preveč",
      FILE_INVALID_TYPE: "{name} ni vrsta datoteke, ki jo tukaj sprejmemo",
      FILE_TOO_LARGE: "{name} je prevelika",
      FILE_TOO_SMALL: "{name} je premajhna",
      FILE_INVALID: "{name} ni mogoče prebrati",
      FILE_EXISTS: "{name} je že na seznamu",
    },
  },
  datePicker: {
    placeholder: "Brez datuma",
    calendar: "Koledar",
    previous: { day: "Prejšnji mesec", month: "Prejšnje leto", year: "Prejšnja leta" },
    next: { day: "Naslednji mesec", month: "Naslednje leto", year: "Naslednja leta" },
    zoomOut: "Izberite mesec ali leto",
  },
  rating: {
    star: {
      one: "{value} od {count} zvezdice",
      two: "{value} od {count} zvezdic",
      few: "{value} od {count} zvezdic",
      other: "{value} od {count} zvezdic",
    },
  },
  timer: {
    start: "Začni",
    pause: "Začasno ustavi",
    resume: "Nadaljuj",
    reset: "Ponastavi",
    hours: { one: "{count} ura", two: "{count} uri", few: "{count} ure", other: "{count} ur" },
    minutes: { one: "{count} minuta", two: "{count} minuti", few: "{count} minute", other: "{count} minut" },
    seconds: { one: "{count} sekunda", two: "{count} sekundi", few: "{count} sekunde", other: "{count} sekund" },
  },
  carousel: {
    previous: "Prejšnji diapozitiv",
    next: "Naslednji diapozitiv",
    slide: "{index} od {count}",
    goTo: "Diapozitiv {index}",
  },
  marquee: { pause: "Začasno ustavi", resume: "Nadaljuj" },
  tour: { back: "Nazaj", next: "Naprej", close: "Zapri", progress: "{step} od {steps}" },
  floatingPanel: { minimize: "Pomanjšaj", maximize: "Povečaj", restore: "Obnovi", close: "Zapri" },
  signaturePad: { area: "Podpis", clear: "Počisti" },
};
