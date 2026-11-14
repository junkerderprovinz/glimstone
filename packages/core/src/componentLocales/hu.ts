import type { ComponentWords } from "../componentWords.ts";

export const hu: ComponentWords = {
  pagination: {
    label: "Oldalak",
    previous: "Előző oldal",
    next: "Következő oldal",
    page: "{page}. oldal a {pages} közül",
  },
  pinInput: { cell: "{index}. karakter a {length} közül" },
  tagsInput: {
    remove: "{tag} eltávolítása",
    added: "{tag} hozzáadva",
    selected: "{tag} kiválasztva. A Backspace vagy a Delete eltávolítja",
    removed: "{tag} eltávolítva",
  },
  steps: { back: "Vissza", next: "Tovább", finish: "Befejezés" },
  splitter: { resize: "Átméretezés" },
  fileUpload: {
    drop: "Húzza ide a fájlokat, vagy válassza ki őket",
    remove: "{name} eltávolítása",
    refused: {
      TOO_MANY_FILES: "{name} eggyel több fájl a megengedettnél",
      FILE_INVALID_TYPE: "{name} nem olyan fájltípus, amelyet itt elfogadunk",
      FILE_TOO_LARGE: "{name} túl nagy",
      FILE_TOO_SMALL: "{name} túl kicsi",
      FILE_INVALID: "{name} nem olvasható",
      FILE_EXISTS: "{name} már szerepel a listán",
    },
  },
  datePicker: {
    placeholder: "Nincs dátum",
    calendar: "Naptár",
    previous: { day: "Előző hónap", month: "Előző év", year: "Korábbi évek" },
    next: { day: "Következő hónap", month: "Következő év", year: "Későbbi évek" },
    zoomOut: "Hónap vagy év kiválasztása",
  },
  rating: { star: { one: "{value}/{count} csillag", other: "{value}/{count} csillag" } },
  timer: {
    start: "Indítás",
    pause: "Szünet",
    resume: "Folytatás",
    reset: "Visszaállítás",
    hours: { one: "{count} óra", other: "{count} óra" },
    minutes: { one: "{count} perc", other: "{count} perc" },
    seconds: { one: "{count} másodperc", other: "{count} másodperc" },
  },
  carousel: { previous: "Előző dia", next: "Következő dia", slide: "{index}/{count}", goTo: "{index}. dia" },
  marquee: { pause: "Szünet", resume: "Folytatás" },
  tour: { back: "Vissza", next: "Tovább", close: "Bezárás", progress: "{step}/{steps}" },
  floatingPanel: { minimize: "Kis méret", maximize: "Teljes méret", restore: "Eredeti méret", close: "Bezárás" },
  signaturePad: { area: "Aláírás", clear: "Törlés" },
};
