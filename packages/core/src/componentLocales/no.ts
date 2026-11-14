import type { ComponentWords } from "../componentWords.ts";

export const no: ComponentWords = {
  pagination: { label: "Sider", previous: "Forrige side", next: "Neste side", page: "Side {page} av {pages}" },
  pinInput: { cell: "Tegn {index} av {length}" },
  tagsInput: {
    remove: "Fjern {tag}",
    added: "{tag} lagt til",
    selected: "{tag} valgt. Tilbake eller Delete fjerner det",
    removed: "{tag} fjernet",
  },
  steps: { back: "Tilbake", next: "Neste", finish: "Fullfør" },
  splitter: { resize: "Endre størrelse" },
  fileUpload: {
    drop: "Slipp filer her eller velg dem",
    remove: "Fjern {name}",
    refused: {
      TOO_MANY_FILES: "{name} er én fil for mye",
      FILE_INVALID_TYPE: "{name} er ikke en filtype som tas imot her",
      FILE_TOO_LARGE: "{name} er for stor",
      FILE_TOO_SMALL: "{name} er for liten",
      FILE_INVALID: "{name} kan ikke leses",
      FILE_EXISTS: "{name} står allerede i listen",
    },
  },
  datePicker: {
    placeholder: "Ingen dato",
    calendar: "Kalender",
    previous: { day: "Forrige måned", month: "Forrige år", year: "Tidligere år" },
    next: { day: "Neste måned", month: "Neste år", year: "Senere år" },
    zoomOut: "Velg en måned eller et år",
  },
  rating: { star: { one: "{value} av {count} stjerne", other: "{value} av {count} stjerner" } },
  timer: {
    start: "Start",
    pause: "Pause",
    resume: "Fortsett",
    reset: "Tilbakestill",
    hours: { one: "{count} time", other: "{count} timer" },
    minutes: { one: "{count} minutt", other: "{count} minutter" },
    seconds: { one: "{count} sekund", other: "{count} sekunder" },
  },
  carousel: {
    previous: "Forrige lysbilde",
    next: "Neste lysbilde",
    slide: "{index} av {count}",
    goTo: "Lysbilde {index}",
  },
  marquee: { pause: "Pause", resume: "Fortsett" },
  tour: { back: "Tilbake", next: "Neste", close: "Lukk", progress: "{step} av {steps}" },
  floatingPanel: { minimize: "Minimer", maximize: "Maksimer", restore: "Gjenopprett", close: "Lukk" },
  signaturePad: { area: "Signatur", clear: "Tøm" },
};
