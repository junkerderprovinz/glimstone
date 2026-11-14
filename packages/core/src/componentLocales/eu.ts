import type { ComponentWords } from "../componentWords.ts";

export const eu: ComponentWords = {
  pagination: { label: "Orriak", previous: "Aurreko orria", next: "Hurrengo orria", page: "{page}/{pages}. orria" },
  pinInput: { cell: "{index}/{length}. karakterea" },
  tagsInput: {
    remove: "Kendu {tag}",
    added: "{tag} gehitu da",
    selected: "{tag} aukeratu da. Atzera-teklak edo Delete-k kentzen du",
    removed: "{tag} kendu da",
  },
  steps: { back: "Atzera", next: "Hurrengoa", finish: "Amaitu" },
  splitter: { resize: "Aldatu tamaina" },
  fileUpload: {
    drop: "Jaregin fitxategiak hemen edo aukeratu",
    remove: "Kendu {name}",
    refused: {
      TOO_MANY_FILES: "{name} fitxategi bat gehiegi da",
      FILE_INVALID_TYPE: "{name} ez da hemen onartzen den fitxategi mota",
      FILE_TOO_LARGE: "{name} handiegia da",
      FILE_TOO_SMALL: "{name} txikiegia da",
      FILE_INVALID: "Ezin da {name} irakurri",
      FILE_EXISTS: "{name} zerrendan dago jada",
    },
  },
  datePicker: {
    placeholder: "Datarik ez",
    calendar: "Egutegia",
    previous: { day: "Aurreko hilabetea", month: "Aurreko urtea", year: "Aurreko urteak" },
    next: { day: "Hurrengo hilabetea", month: "Hurrengo urtea", year: "Hurrengo urteak" },
    zoomOut: "Aukeratu hilabete bat edo urte bat",
  },
  rating: { star: { one: "{value}/{count} izar", other: "{value}/{count} izar" } },
  timer: {
    start: "Hasi",
    pause: "Pausatu",
    resume: "Jarraitu",
    reset: "Berrezarri",
    hours: { one: "{count} ordu", other: "{count} ordu" },
    minutes: { one: "{count} minutu", other: "{count} minutu" },
    seconds: { one: "{count} segundo", other: "{count} segundo" },
  },
  carousel: {
    previous: "Aurreko diapositiba",
    next: "Hurrengo diapositiba",
    slide: "{index}/{count}",
    goTo: "{index}. diapositiba",
  },
  marquee: { pause: "Pausatu", resume: "Jarraitu" },
  tour: { back: "Atzera", next: "Hurrengoa", close: "Itxi", progress: "{step}/{steps}" },
  floatingPanel: { minimize: "Minimizatu", maximize: "Maximizatu", restore: "Leheneratu", close: "Itxi" },
  signaturePad: { area: "Sinadura", clear: "Garbitu" },
};
