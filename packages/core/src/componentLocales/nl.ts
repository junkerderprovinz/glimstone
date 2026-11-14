import type { ComponentWords } from "../componentWords.ts";

export const nl: ComponentWords = {
  pagination: {
    label: "Pagina's",
    previous: "Vorige pagina",
    next: "Volgende pagina",
    page: "Pagina {page} van {pages}",
  },
  pinInput: { cell: "Teken {index} van {length}" },
  tagsInput: {
    remove: "{tag} verwijderen",
    added: "{tag} toegevoegd",
    selected: "{tag} gekozen. Backspace of Delete verwijdert het",
    removed: "{tag} verwijderd",
  },
  steps: { back: "Terug", next: "Volgende", finish: "Voltooien" },
  splitter: { resize: "Grootte wijzigen" },
  fileUpload: {
    drop: "Zet bestanden hier neer of kies ze",
    remove: "{name} verwijderen",
    refused: {
      TOO_MANY_FILES: "{name} is één bestand te veel",
      FILE_INVALID_TYPE: "{name} is geen soort bestand dat hier past",
      FILE_TOO_LARGE: "{name} is te groot",
      FILE_TOO_SMALL: "{name} is te klein",
      FILE_INVALID: "{name} kan niet worden gelezen",
      FILE_EXISTS: "{name} staat al in de lijst",
    },
  },
  datePicker: {
    placeholder: "Geen datum",
    calendar: "Kalender",
    previous: { day: "Vorige maand", month: "Vorig jaar", year: "Vorige jaren" },
    next: { day: "Volgende maand", month: "Volgend jaar", year: "Volgende jaren" },
    zoomOut: "Een maand of een jaar kiezen",
  },
  rating: { star: { one: "{value} van {count} ster", other: "{value} van {count} sterren" } },
  timer: {
    start: "Starten",
    pause: "Pauzeren",
    resume: "Hervatten",
    reset: "Herstellen",
    hours: { one: "{count} uur", other: "{count} uur" },
    minutes: { one: "{count} minuut", other: "{count} minuten" },
    seconds: { one: "{count} seconde", other: "{count} seconden" },
  },
  carousel: { previous: "Vorige dia", next: "Volgende dia", slide: "{index} van {count}", goTo: "Dia {index}" },
  marquee: { pause: "Pauzeren", resume: "Hervatten" },
  tour: { back: "Terug", next: "Volgende", close: "Sluiten", progress: "{step} van {steps}" },
  floatingPanel: { minimize: "Minimaliseren", maximize: "Maximaliseren", restore: "Herstellen", close: "Sluiten" },
  signaturePad: { area: "Handtekening", clear: "Wissen" },
};
