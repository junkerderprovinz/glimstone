import type { ComponentWords } from "../componentWords.ts";

export const et: ComponentWords = {
  pagination: { label: "Lehed", previous: "Eelmine leht", next: "Järgmine leht", page: "Leht {page}/{pages}" },
  pinInput: { cell: "Märk {index}/{length}" },
  tagsInput: {
    remove: "Eemalda {tag}",
    added: "{tag} lisatud",
    selected: "{tag} valitud. Tagasisamm või Delete eemaldab selle",
    removed: "{tag} eemaldatud",
  },
  steps: { back: "Tagasi", next: "Edasi", finish: "Lõpeta" },
  splitter: { resize: "Muuda suurust" },
  fileUpload: {
    drop: "Lohista failid siia või vali need",
    remove: "Eemalda {name}",
    refused: {
      TOO_MANY_FILES: "{name} on üks fail liiga palju",
      FILE_INVALID_TYPE: "{name} ei ole failitüüp, mida siin võetakse",
      FILE_TOO_LARGE: "{name} on liiga suur",
      FILE_TOO_SMALL: "{name} on liiga väike",
      FILE_INVALID: "Faili {name} ei saa lugeda",
      FILE_EXISTS: "{name} on juba loendis",
    },
  },
  datePicker: {
    placeholder: "Kuupäev puudub",
    calendar: "Kalender",
    previous: { day: "Eelmine kuu", month: "Eelmine aasta", year: "Eelmised aastad" },
    next: { day: "Järgmine kuu", month: "Järgmine aasta", year: "Järgmised aastad" },
    zoomOut: "Vali kuu või aasta",
  },
  rating: { star: { one: "{value}/{count} tärn", other: "{value}/{count} tärni" } },
  timer: {
    start: "Käivita",
    pause: "Peata",
    resume: "Jätka",
    reset: "Lähtesta",
    hours: { one: "{count} tund", other: "{count} tundi" },
    minutes: { one: "{count} minut", other: "{count} minutit" },
    seconds: { one: "{count} sekund", other: "{count} sekundit" },
  },
  carousel: { previous: "Eelmine slaid", next: "Järgmine slaid", slide: "{index}/{count}", goTo: "Slaid {index}" },
  marquee: { pause: "Peata", resume: "Jätka" },
  tour: { back: "Tagasi", next: "Edasi", close: "Sulge", progress: "{step}/{steps}" },
  floatingPanel: { minimize: "Minimeeri", maximize: "Maksimeeri", restore: "Taasta", close: "Sulge" },
  signaturePad: { area: "Allkiri", clear: "Tühjenda" },
};
