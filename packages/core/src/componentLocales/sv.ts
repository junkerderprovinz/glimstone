import type { ComponentWords } from "../componentWords.ts";

export const sv: ComponentWords = {
  pagination: { label: "Sidor", previous: "Föregående sida", next: "Nästa sida", page: "Sida {page} av {pages}" },
  pinInput: { cell: "Tecken {index} av {length}" },
  tagsInput: {
    remove: "Ta bort {tag}",
    added: "{tag} har lagts till",
    selected: "{tag} valt. Backsteg eller Delete tar bort det",
    removed: "{tag} har tagits bort",
  },
  steps: { back: "Tillbaka", next: "Nästa", finish: "Slutför" },
  splitter: { resize: "Ändra storlek" },
  fileUpload: {
    drop: "Släpp filer här eller välj dem",
    remove: "Ta bort {name}",
    refused: {
      TOO_MANY_FILES: "{name} är en fil för mycket",
      FILE_INVALID_TYPE: "{name} är inte en filtyp som tas emot här",
      FILE_TOO_LARGE: "{name} är för stor",
      FILE_TOO_SMALL: "{name} är för liten",
      FILE_INVALID: "{name} kan inte läsas",
      FILE_EXISTS: "{name} finns redan i listan",
    },
  },
  datePicker: {
    placeholder: "Inget datum",
    calendar: "Kalender",
    previous: { day: "Föregående månad", month: "Föregående år", year: "Tidigare år" },
    next: { day: "Nästa månad", month: "Nästa år", year: "Senare år" },
    zoomOut: "Välj en månad eller ett år",
  },
  rating: { star: { one: "{value} av {count} stjärna", other: "{value} av {count} stjärnor" } },
  timer: {
    start: "Starta",
    pause: "Pausa",
    resume: "Fortsätt",
    reset: "Återställ",
    hours: { one: "{count} timme", other: "{count} timmar" },
    minutes: { one: "{count} minut", other: "{count} minuter" },
    seconds: { one: "{count} sekund", other: "{count} sekunder" },
  },
  carousel: { previous: "Föregående bild", next: "Nästa bild", slide: "{index} av {count}", goTo: "Bild {index}" },
  marquee: { pause: "Pausa", resume: "Fortsätt" },
  tour: { back: "Tillbaka", next: "Nästa", close: "Stäng", progress: "{step} av {steps}" },
  floatingPanel: { minimize: "Minimera", maximize: "Maximera", restore: "Återställ", close: "Stäng" },
  signaturePad: { area: "Underskrift", clear: "Rensa" },
};
