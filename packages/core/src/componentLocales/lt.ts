import type { ComponentWords } from "../componentWords.ts";

export const lt: ComponentWords = {
  pagination: {
    label: "Puslapiai",
    previous: "Ankstesnis puslapis",
    next: "Kitas puslapis",
    page: "Puslapis {page} iš {pages}",
  },
  pinInput: { cell: "Ženklas {index} iš {length}" },
  tagsInput: {
    remove: "Pašalinti {tag}",
    added: "{tag}: pridėta",
    selected: "{tag}: pasirinkta. Backspace arba Delete pašalina",
    removed: "{tag}: pašalinta",
  },
  steps: { back: "Atgal", next: "Toliau", finish: "Baigti" },
  splitter: { resize: "Keisti dydį" },
  fileUpload: {
    drop: "Numeskite failus čia arba juos pasirinkite",
    remove: "Pašalinti {name}",
    refused: {
      TOO_MANY_FILES: "{name}: vienu failu per daug",
      FILE_INVALID_TYPE: "{name}: tokios rūšies failas čia nepriimamas",
      FILE_TOO_LARGE: "{name}: failas per didelis",
      FILE_TOO_SMALL: "{name}: failas per mažas",
      FILE_INVALID: "{name}: failo nepavyksta perskaityti",
      FILE_EXISTS: "{name} jau yra sąraše",
    },
  },
  datePicker: {
    placeholder: "Be datos",
    calendar: "Kalendorius",
    previous: { day: "Ankstesnis mėnuo", month: "Ankstesni metai", year: "Ankstesnis dešimtmetis" },
    next: { day: "Kitas mėnuo", month: "Kiti metai", year: "Kitas dešimtmetis" },
    zoomOut: "Pasirinkti mėnesį arba metus",
  },
  rating: {
    star: {
      one: "{value} iš {count} žvaigždutės",
      few: "{value} iš {count} žvaigždučių",
      other: "{value} iš {count} žvaigždučių",
    },
  },
  timer: {
    start: "Pradėti",
    pause: "Pristabdyti",
    resume: "Tęsti",
    reset: "Atstatyti",
    hours: { one: "{count} valanda", few: "{count} valandos", other: "{count} valandų" },
    minutes: { one: "{count} minutė", few: "{count} minutės", other: "{count} minučių" },
    seconds: { one: "{count} sekundė", few: "{count} sekundės", other: "{count} sekundžių" },
  },
  carousel: {
    previous: "Ankstesnė skaidrė",
    next: "Kita skaidrė",
    slide: "{index} iš {count}",
    goTo: "Skaidrė {index}",
  },
  marquee: { pause: "Pristabdyti", resume: "Tęsti" },
  tour: { back: "Atgal", next: "Toliau", close: "Uždaryti", progress: "{step} iš {steps}" },
  floatingPanel: { minimize: "Sumažinti", maximize: "Padidinti", restore: "Atkurti", close: "Uždaryti" },
  signaturePad: { area: "Parašas", clear: "Išvalyti" },
};
