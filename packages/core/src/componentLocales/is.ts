import type { ComponentWords } from "../componentWords.ts";

export const is: ComponentWords = {
  pagination: { label: "Síður", previous: "Fyrri síða", next: "Næsta síða", page: "Síða {page} af {pages}" },
  pinInput: { cell: "Stafur {index} af {length}" },
  tagsInput: {
    remove: "Fjarlægja {tag}",
    added: "{tag} bætt við",
    selected: "{tag} valið. Bakklykill eða Delete fjarlægir það",
    removed: "{tag} fjarlægt",
  },
  steps: { back: "Til baka", next: "Áfram", finish: "Ljúka" },
  splitter: { resize: "Breyta stærð" },
  fileUpload: {
    drop: "Slepptu skrám hér eða veldu þær",
    remove: "Fjarlægja {name}",
    refused: {
      TOO_MANY_FILES: "{name} er einni skrá of mikið",
      FILE_INVALID_TYPE: "{name} er ekki skráartegund sem er tekin hér",
      FILE_TOO_LARGE: "{name} er of stór",
      FILE_TOO_SMALL: "{name} er of lítil",
      FILE_INVALID: "Ekki er hægt að lesa {name}",
      FILE_EXISTS: "{name} er þegar á listanum",
    },
  },
  datePicker: {
    placeholder: "Engin dagsetning",
    calendar: "Dagatal",
    previous: { day: "Fyrri mánuður", month: "Fyrra ár", year: "Fyrri ár" },
    next: { day: "Næsti mánuður", month: "Næsta ár", year: "Næstu ár" },
    zoomOut: "Veldu mánuð eða ár",
  },
  rating: { star: { one: "{value} af {count} stjörnu", other: "{value} af {count} stjörnum" } },
  timer: {
    start: "Ræsa",
    pause: "Gera hlé",
    resume: "Halda áfram",
    reset: "Endurstilla",
    hours: { one: "{count} klukkustund", other: "{count} klukkustundir" },
    minutes: { one: "{count} mínúta", other: "{count} mínútur" },
    seconds: { one: "{count} sekúnda", other: "{count} sekúndur" },
  },
  carousel: { previous: "Fyrri glæra", next: "Næsta glæra", slide: "{index} af {count}", goTo: "Glæra {index}" },
  marquee: { pause: "Gera hlé", resume: "Halda áfram" },
  tour: { back: "Til baka", next: "Áfram", close: "Loka", progress: "{step} af {steps}" },
  floatingPanel: { minimize: "Lágmarka", maximize: "Hámarka", restore: "Endurheimta", close: "Loka" },
  signaturePad: { area: "Undirskrift", clear: "Hreinsa" },
};
