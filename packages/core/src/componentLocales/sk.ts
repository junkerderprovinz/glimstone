import type { ComponentWords } from "../componentWords.ts";

export const sk: ComponentWords = {
  pagination: {
    label: "Stránky",
    previous: "Predchádzajúca stránka",
    next: "Ďalšia stránka",
    page: "Stránka {page} z {pages}",
  },
  pinInput: { cell: "Znak {index} z {length}" },
  tagsInput: {
    remove: "Odstrániť {tag}",
    added: "{tag} pridané",
    selected: "{tag} vybrané. Backspace alebo Delete ho odstráni",
    removed: "{tag} odstránené",
  },
  steps: { back: "Späť", next: "Ďalej", finish: "Dokončiť" },
  splitter: { resize: "Zmeniť veľkosť" },
  fileUpload: {
    drop: "Pretiahnite sem súbory alebo ich vyberte",
    remove: "Odstrániť {name}",
    refused: {
      TOO_MANY_FILES: "{name} je o jeden súbor navyše",
      FILE_INVALID_TYPE: "{name} nie je druh súboru, ktorý sem patrí",
      FILE_TOO_LARGE: "{name} je príliš veľký",
      FILE_TOO_SMALL: "{name} je príliš malý",
      FILE_INVALID: "{name} sa nedá prečítať",
      FILE_EXISTS: "{name} už je v zozname",
    },
  },
  datePicker: {
    placeholder: "Bez dátumu",
    calendar: "Kalendár",
    previous: { day: "Predchádzajúci mesiac", month: "Predchádzajúci rok", year: "Predchádzajúce roky" },
    next: { day: "Ďalší mesiac", month: "Ďalší rok", year: "Ďalšie roky" },
    zoomOut: "Vybrať mesiac alebo rok",
  },
  rating: {
    star: { one: "{value} z {count} hviezdy", few: "{value} z {count} hviezd", other: "{value} z {count} hviezd" },
  },
  timer: {
    start: "Spustiť",
    pause: "Pozastaviť",
    resume: "Pokračovať",
    reset: "Vynulovať",
    hours: { one: "{count} hodina", few: "{count} hodiny", other: "{count} hodín" },
    minutes: { one: "{count} minúta", few: "{count} minúty", other: "{count} minút" },
    seconds: { one: "{count} sekunda", few: "{count} sekundy", other: "{count} sekúnd" },
  },
  carousel: {
    previous: "Predchádzajúca snímka",
    next: "Ďalšia snímka",
    slide: "{index} z {count}",
    goTo: "Snímka {index}",
  },
  marquee: { pause: "Pozastaviť", resume: "Pokračovať" },
  tour: { back: "Späť", next: "Ďalej", close: "Zavrieť", progress: "{step} z {steps}" },
  floatingPanel: { minimize: "Minimalizovať", maximize: "Maximalizovať", restore: "Obnoviť", close: "Zavrieť" },
  signaturePad: { area: "Podpis", clear: "Vymazať" },
};
