import type { ComponentWords } from "../componentWords.ts";

export const ro: ComponentWords = {
  pagination: {
    label: "Pagini",
    previous: "Pagina anterioară",
    next: "Pagina următoare",
    page: "Pagina {page} din {pages}",
  },
  pinInput: { cell: "Caracterul {index} din {length}" },
  tagsInput: {
    remove: "Elimină {tag}",
    added: "{tag}: adăugat",
    selected: "{tag}: ales. Backspace sau Delete îl elimină",
    removed: "{tag}: eliminat",
  },
  steps: { back: "Înapoi", next: "Înainte", finish: "Finalizează" },
  splitter: { resize: "Redimensionează" },
  fileUpload: {
    drop: "Plasează fișierele aici sau alege-le",
    remove: "Elimină {name}",
    refused: {
      TOO_MANY_FILES: "{name} este un fișier în plus",
      FILE_INVALID_TYPE: "{name} nu este un tip de fișier acceptat aici",
      FILE_TOO_LARGE: "{name} este prea mare",
      FILE_TOO_SMALL: "{name} este prea mic",
      FILE_INVALID: "{name} nu poate fi citit",
      FILE_EXISTS: "{name} este deja în listă",
    },
  },
  datePicker: {
    placeholder: "Fără dată",
    calendar: "Calendar",
    previous: { day: "Luna anterioară", month: "Anul anterior", year: "Anii anteriori" },
    next: { day: "Luna următoare", month: "Anul următor", year: "Anii următori" },
    zoomOut: "Alege o lună sau un an",
  },
  rating: {
    star: {
      one: "{value} din {count} stea",
      few: "{value} din {count} stele",
      other: "{value} din {count} de stele",
    },
  },
  timer: {
    start: "Pornește",
    pause: "Pauză",
    resume: "Continuă",
    reset: "Resetează",
    hours: { one: "{count} oră", few: "{count} ore", other: "{count} de ore" },
    minutes: { one: "{count} minut", few: "{count} minute", other: "{count} de minute" },
    seconds: { one: "{count} secundă", few: "{count} secunde", other: "{count} de secunde" },
  },
  carousel: {
    previous: "Diapozitivul anterior",
    next: "Diapozitivul următor",
    slide: "{index} din {count}",
    goTo: "Diapozitivul {index}",
  },
  marquee: { pause: "Pauză", resume: "Continuă" },
  tour: { back: "Înapoi", next: "Înainte", close: "Închide", progress: "{step} din {steps}" },
  floatingPanel: { minimize: "Minimizează", maximize: "Maximizează", restore: "Restaurează", close: "Închide" },
  signaturePad: { area: "Semnătură", clear: "Șterge" },
};
