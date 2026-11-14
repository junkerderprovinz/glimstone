import type { ComponentWords } from "../componentWords.ts";

export const ca: ComponentWords = {
  pagination: { label: "Pàgines", previous: "Pàgina anterior", next: "Pàgina següent", page: "Pàgina {page} de {pages}" },
  pinInput: { cell: "Caràcter {index} de {length}" },
  tagsInput: {
    remove: "Treu {tag}",
    added: "{tag} afegit",
    selected: "{tag} triat. Retrocés o Supr el treu",
    removed: "{tag} tret",
  },
  steps: { back: "Enrere", next: "Següent", finish: "Acaba" },
  splitter: { resize: "Canvia la mida" },
  fileUpload: {
    drop: "Deixa anar els fitxers aquí o tria'ls",
    remove: "Treu {name}",
    refused: {
      TOO_MANY_FILES: "{name} és un fitxer de més",
      FILE_INVALID_TYPE: "{name} no és un tipus de fitxer que s'accepti aquí",
      FILE_TOO_LARGE: "{name} és massa gran",
      FILE_TOO_SMALL: "{name} és massa petit",
      FILE_INVALID: "{name} no es pot llegir",
      FILE_EXISTS: "{name} ja és a la llista",
    },
  },
  datePicker: {
    placeholder: "Sense data",
    calendar: "Calendari",
    previous: { day: "Mes anterior", month: "Any anterior", year: "Anys anteriors" },
    next: { day: "Mes següent", month: "Any següent", year: "Anys següents" },
    zoomOut: "Tria un mes o un any",
  },
  rating: {
    star: {
      one: "{value} de {count} estrella",
      many: "{value} de {count} d'estrelles",
      other: "{value} de {count} estrelles",
    },
  },
  timer: {
    start: "Inicia",
    pause: "Pausa",
    resume: "Reprèn",
    reset: "Restableix",
    hours: { one: "{count} hora", many: "{count} d'hores", other: "{count} hores" },
    minutes: { one: "{count} minut", many: "{count} de minuts", other: "{count} minuts" },
    seconds: { one: "{count} segon", many: "{count} de segons", other: "{count} segons" },
  },
  carousel: {
    previous: "Diapositiva anterior",
    next: "Diapositiva següent",
    slide: "{index} de {count}",
    goTo: "Diapositiva {index}",
  },
  marquee: { pause: "Pausa", resume: "Reprèn" },
  tour: { back: "Enrere", next: "Següent", close: "Tanca", progress: "{step} de {steps}" },
  floatingPanel: { minimize: "Minimitza", maximize: "Maximitza", restore: "Restaura", close: "Tanca" },
  signaturePad: { area: "Signatura", clear: "Esborra" },
};
