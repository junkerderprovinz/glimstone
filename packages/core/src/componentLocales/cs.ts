import type { ComponentWords } from "../componentWords.ts";

export const cs: ComponentWords = {
  pagination: {
    label: "Stránky",
    previous: "Předchozí stránka",
    next: "Další stránka",
    page: "Stránka {page} z {pages}",
  },
  pinInput: { cell: "Znak {index} z {length}" },
  tagsInput: {
    remove: "Odebrat {tag}",
    added: "{tag} přidáno",
    selected: "{tag} vybráno. Backspace nebo Delete ho odebere",
    removed: "{tag} odebráno",
  },
  steps: { back: "Zpět", next: "Další", finish: "Dokončit" },
  splitter: { resize: "Změnit velikost" },
  fileUpload: {
    drop: "Přetáhněte sem soubory nebo je vyberte",
    remove: "Odebrat {name}",
    refused: {
      TOO_MANY_FILES: "{name} je o jeden soubor navíc",
      FILE_INVALID_TYPE: "{name} není druh souboru, který se sem hodí",
      FILE_TOO_LARGE: "{name} je příliš velký",
      FILE_TOO_SMALL: "{name} je příliš malý",
      FILE_INVALID: "{name} nelze přečíst",
      FILE_EXISTS: "{name} už je v seznamu",
    },
  },
  datePicker: {
    placeholder: "Bez data",
    calendar: "Kalendář",
    previous: { day: "Předchozí měsíc", month: "Předchozí rok", year: "Předchozí roky" },
    next: { day: "Další měsíc", month: "Další rok", year: "Další roky" },
    zoomOut: "Vybrat měsíc nebo rok",
  },
  rating: {
    star: { one: "{value} z {count} hvězdy", few: "{value} z {count} hvězd", other: "{value} z {count} hvězd" },
  },
  timer: {
    start: "Spustit",
    pause: "Pozastavit",
    resume: "Pokračovat",
    reset: "Vynulovat",
    hours: { one: "{count} hodina", few: "{count} hodiny", other: "{count} hodin" },
    minutes: { one: "{count} minuta", few: "{count} minuty", other: "{count} minut" },
    seconds: { one: "{count} sekunda", few: "{count} sekundy", other: "{count} sekund" },
  },
  carousel: { previous: "Předchozí snímek", next: "Další snímek", slide: "{index} z {count}", goTo: "Snímek {index}" },
  marquee: { pause: "Pozastavit", resume: "Pokračovat" },
  tour: { back: "Zpět", next: "Další", close: "Zavřít", progress: "{step} z {steps}" },
  floatingPanel: { minimize: "Minimalizovat", maximize: "Maximalizovat", restore: "Obnovit", close: "Zavřít" },
  signaturePad: { area: "Podpis", clear: "Vymazat" },
};
