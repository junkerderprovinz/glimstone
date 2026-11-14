import type { ComponentWords } from "../componentWords.ts";

export const de: ComponentWords = {
  pagination: { label: "Seiten", previous: "Vorige Seite", next: "Nächste Seite", page: "Seite {page} von {pages}" },
  pinInput: { cell: "Zeichen {index} von {length}" },
  tagsInput: {
    remove: "{tag} entfernen",
    added: "{tag} hinzugefügt",
    selected: "{tag} gewählt. Rücktaste oder Entf entfernt es",
    removed: "{tag} entfernt",
  },
  steps: { back: "Zurück", next: "Weiter", finish: "Abschließen" },
  splitter: { resize: "Größe ändern" },
  fileUpload: {
    drop: "Dateien hier ablegen oder auswählen",
    remove: "{name} entfernen",
    refused: {
      TOO_MANY_FILES: "{name} ist eine Datei zu viel",
      FILE_INVALID_TYPE: "{name} ist keine Art von Datei, die hier passt",
      FILE_TOO_LARGE: "{name} ist zu groß",
      FILE_TOO_SMALL: "{name} ist zu klein",
      FILE_INVALID: "{name} lässt sich nicht lesen",
      FILE_EXISTS: "{name} steht schon in der Liste",
    },
  },
  datePicker: {
    placeholder: "Kein Datum",
    calendar: "Kalender",
    previous: { day: "Voriger Monat", month: "Voriges Jahr", year: "Vorige Jahre" },
    next: { day: "Nächster Monat", month: "Nächstes Jahr", year: "Nächste Jahre" },
    zoomOut: "Monat oder Jahr wählen",
  },
  rating: { star: { one: "{value} von {count} Stern", other: "{value} von {count} Sternen" } },
  timer: {
    start: "Starten",
    pause: "Pausieren",
    resume: "Fortsetzen",
    reset: "Zurücksetzen",
    hours: { one: "{count} Stunde", other: "{count} Stunden" },
    minutes: { one: "{count} Minute", other: "{count} Minuten" },
    seconds: { one: "{count} Sekunde", other: "{count} Sekunden" },
  },
  carousel: { previous: "Vorige Folie", next: "Nächste Folie", slide: "{index} von {count}", goTo: "Folie {index}" },
  marquee: { pause: "Anhalten", resume: "Fortsetzen" },
  tour: { back: "Zurück", next: "Weiter", close: "Schließen", progress: "{step} von {steps}" },
  floatingPanel: { minimize: "Minimieren", maximize: "Maximieren", restore: "Wiederherstellen", close: "Schließen" },
  signaturePad: { area: "Unterschrift", clear: "Leeren" },
};
