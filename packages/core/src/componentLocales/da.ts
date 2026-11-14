import type { ComponentWords } from "../componentWords.ts";

export const da: ComponentWords = {
  pagination: { label: "Sider", previous: "Forrige side", next: "Næste side", page: "Side {page} af {pages}" },
  pinInput: { cell: "Tegn {index} af {length}" },
  tagsInput: {
    remove: "Fjern {tag}",
    added: "{tag} tilføjet",
    selected: "{tag} valgt. Tilbage eller Delete fjerner det",
    removed: "{tag} fjernet",
  },
  steps: { back: "Tilbage", next: "Næste", finish: "Afslut" },
  splitter: { resize: "Tilpas størrelse" },
  fileUpload: {
    drop: "Slip filer her, eller vælg dem",
    remove: "Fjern {name}",
    refused: {
      TOO_MANY_FILES: "{name} er én fil for meget",
      FILE_INVALID_TYPE: "{name} er ikke en filtype, der tages imod her",
      FILE_TOO_LARGE: "{name} er for stor",
      FILE_TOO_SMALL: "{name} er for lille",
      FILE_INVALID: "{name} kan ikke læses",
      FILE_EXISTS: "{name} er allerede på listen",
    },
  },
  datePicker: {
    placeholder: "Ingen dato",
    calendar: "Kalender",
    previous: { day: "Forrige måned", month: "Forrige år", year: "Tidligere år" },
    next: { day: "Næste måned", month: "Næste år", year: "Senere år" },
    zoomOut: "Vælg en måned eller et år",
  },
  rating: { star: { one: "{value} af {count} stjerne", other: "{value} af {count} stjerner" } },
  timer: {
    start: "Start",
    pause: "Pause",
    resume: "Fortsæt",
    reset: "Nulstil",
    hours: { one: "{count} time", other: "{count} timer" },
    minutes: { one: "{count} minut", other: "{count} minutter" },
    seconds: { one: "{count} sekund", other: "{count} sekunder" },
  },
  carousel: { previous: "Forrige dias", next: "Næste dias", slide: "{index} af {count}", goTo: "Dias {index}" },
  marquee: { pause: "Pause", resume: "Fortsæt" },
  tour: { back: "Tilbage", next: "Næste", close: "Luk", progress: "{step} af {steps}" },
  floatingPanel: { minimize: "Minimer", maximize: "Maksimer", restore: "Gendan", close: "Luk" },
  signaturePad: { area: "Underskrift", clear: "Ryd" },
};
