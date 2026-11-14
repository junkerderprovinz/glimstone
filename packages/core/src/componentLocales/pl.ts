import type { ComponentWords } from "../componentWords.ts";

export const pl: ComponentWords = {
  pagination: {
    label: "Strony",
    previous: "Poprzednia strona",
    next: "Następna strona",
    page: "Strona {page} z {pages}",
  },
  pinInput: { cell: "Znak {index} z {length}" },
  tagsInput: {
    remove: "Usuń {tag}",
    added: "Dodano {tag}",
    selected: "Wybrano {tag}. Backspace lub Delete go usuwa",
    removed: "Usunięto {tag}",
  },
  steps: { back: "Wstecz", next: "Dalej", finish: "Zakończ" },
  splitter: { resize: "Zmień rozmiar" },
  fileUpload: {
    drop: "Upuść tu pliki albo je wybierz",
    remove: "Usuń {name}",
    refused: {
      TOO_MANY_FILES: "{name} to o jeden plik za dużo",
      FILE_INVALID_TYPE: "{name} nie jest rodzajem pliku, który tu pasuje",
      FILE_TOO_LARGE: "{name} jest za duży",
      FILE_TOO_SMALL: "{name} jest za mały",
      FILE_INVALID: "Nie można odczytać {name}",
      FILE_EXISTS: "{name} jest już na liście",
    },
  },
  datePicker: {
    placeholder: "Brak daty",
    calendar: "Kalendarz",
    previous: { day: "Poprzedni miesiąc", month: "Poprzedni rok", year: "Wcześniejsze lata" },
    next: { day: "Następny miesiąc", month: "Następny rok", year: "Późniejsze lata" },
    zoomOut: "Wybierz miesiąc lub rok",
  },
  rating: {
    star: {
      one: "{value} z {count} gwiazdki",
      few: "{value} z {count} gwiazdek",
      many: "{value} z {count} gwiazdek",
      other: "{value} z {count} gwiazdki",
    },
  },
  timer: {
    start: "Uruchom",
    pause: "Wstrzymaj",
    resume: "Wznów",
    reset: "Wyzeruj",
    hours: { one: "{count} godzina", few: "{count} godziny", many: "{count} godzin", other: "{count} godziny" },
    minutes: { one: "{count} minuta", few: "{count} minuty", many: "{count} minut", other: "{count} minuty" },
    seconds: { one: "{count} sekunda", few: "{count} sekundy", many: "{count} sekund", other: "{count} sekundy" },
  },
  carousel: { previous: "Poprzedni slajd", next: "Następny slajd", slide: "{index} z {count}", goTo: "Slajd {index}" },
  marquee: { pause: "Wstrzymaj", resume: "Wznów" },
  tour: { back: "Wstecz", next: "Dalej", close: "Zamknij", progress: "{step} z {steps}" },
  floatingPanel: { minimize: "Minimalizuj", maximize: "Maksymalizuj", restore: "Przywróć", close: "Zamknij" },
  signaturePad: { area: "Podpis", clear: "Wyczyść" },
};
