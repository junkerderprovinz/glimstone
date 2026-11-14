import type { ComponentWords } from "../componentWords.ts";

export const lv: ComponentWords = {
  pagination: { label: "Lapas", previous: "Iepriekšējā lapa", next: "Nākamā lapa", page: "Lapa {page} no {pages}" },
  pinInput: { cell: "Rakstzīme {index} no {length}" },
  tagsInput: {
    remove: "Noņemt {tag}",
    added: "{tag}: pievienots",
    selected: "{tag}: izvēlēts. Backspace vai Delete to noņem",
    removed: "{tag}: noņemts",
  },
  steps: { back: "Atpakaļ", next: "Tālāk", finish: "Pabeigt" },
  splitter: { resize: "Mainīt izmēru" },
  fileUpload: {
    drop: "Nometiet failus šeit vai izvēlieties tos",
    remove: "Noņemt {name}",
    refused: {
      TOO_MANY_FILES: "{name} ir viens fails par daudz",
      FILE_INVALID_TYPE: "{name} nav faila veids, ko šeit pieņem",
      FILE_TOO_LARGE: "{name} ir par lielu",
      FILE_TOO_SMALL: "{name} ir par mazu",
      FILE_INVALID: "{name} nevar nolasīt",
      FILE_EXISTS: "{name} jau ir sarakstā",
    },
  },
  datePicker: {
    placeholder: "Nav datuma",
    calendar: "Kalendārs",
    previous: { day: "Iepriekšējais mēnesis", month: "Iepriekšējais gads", year: "Iepriekšējie gadi" },
    next: { day: "Nākamais mēnesis", month: "Nākamais gads", year: "Nākamie gadi" },
    zoomOut: "Izvēlēties mēnesi vai gadu",
  },
  rating: {
    star: {
      zero: "{value} no {count} zvaigznēm",
      one: "{value} no {count} zvaigznes",
      other: "{value} no {count} zvaigznēm",
    },
  },
  timer: {
    start: "Sākt",
    pause: "Pauzēt",
    resume: "Turpināt",
    reset: "Atiestatīt",
    hours: { zero: "{count} stundu", one: "{count} stunda", other: "{count} stundas" },
    minutes: { zero: "{count} minūšu", one: "{count} minūte", other: "{count} minūtes" },
    seconds: { zero: "{count} sekunžu", one: "{count} sekunde", other: "{count} sekundes" },
  },
  carousel: {
    previous: "Iepriekšējais slaids",
    next: "Nākamais slaids",
    slide: "{index} no {count}",
    goTo: "Slaids {index}",
  },
  marquee: { pause: "Pauzēt", resume: "Turpināt" },
  tour: { back: "Atpakaļ", next: "Tālāk", close: "Aizvērt", progress: "{step} no {steps}" },
  floatingPanel: { minimize: "Minimizēt", maximize: "Maksimizēt", restore: "Atjaunot", close: "Aizvērt" },
  signaturePad: { area: "Paraksts", clear: "Notīrīt" },
};
