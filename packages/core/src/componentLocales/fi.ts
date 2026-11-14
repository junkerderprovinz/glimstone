import type { ComponentWords } from "../componentWords.ts";

export const fi: ComponentWords = {
  pagination: { label: "Sivut", previous: "Edellinen sivu", next: "Seuraava sivu", page: "Sivu {page}/{pages}" },
  pinInput: { cell: "Merkki {index}/{length}" },
  tagsInput: {
    remove: "Poista {tag}",
    added: "{tag} lisätty",
    selected: "{tag} valittu. Askelpalautin tai Delete poistaa sen",
    removed: "{tag} poistettu",
  },
  steps: { back: "Takaisin", next: "Seuraava", finish: "Valmis" },
  splitter: { resize: "Muuta kokoa" },
  fileUpload: {
    drop: "Pudota tiedostot tähän tai valitse ne",
    remove: "Poista {name}",
    refused: {
      TOO_MANY_FILES: "{name} on yksi tiedosto liikaa",
      FILE_INVALID_TYPE: "{name} ei ole tiedostotyyppi, joka käy tähän",
      FILE_TOO_LARGE: "{name} on liian suuri",
      FILE_TOO_SMALL: "{name} on liian pieni",
      FILE_INVALID: "Tiedostoa {name} ei voi lukea",
      FILE_EXISTS: "{name} on jo luettelossa",
    },
  },
  datePicker: {
    placeholder: "Ei päivämäärää",
    calendar: "Kalenteri",
    previous: { day: "Edellinen kuukausi", month: "Edellinen vuosi", year: "Edelliset vuodet" },
    next: { day: "Seuraava kuukausi", month: "Seuraava vuosi", year: "Seuraavat vuodet" },
    zoomOut: "Valitse kuukausi tai vuosi",
  },
  rating: { star: { one: "{value}/{count} tähti", other: "{value}/{count} tähteä" } },
  timer: {
    start: "Käynnistä",
    pause: "Keskeytä",
    resume: "Jatka",
    reset: "Nollaa",
    hours: { one: "{count} tunti", other: "{count} tuntia" },
    minutes: { one: "{count} minuutti", other: "{count} minuuttia" },
    seconds: { one: "{count} sekunti", other: "{count} sekuntia" },
  },
  carousel: { previous: "Edellinen dia", next: "Seuraava dia", slide: "{index}/{count}", goTo: "Dia {index}" },
  marquee: { pause: "Keskeytä", resume: "Jatka" },
  tour: { back: "Takaisin", next: "Seuraava", close: "Sulje", progress: "{step}/{steps}" },
  floatingPanel: { minimize: "Pienennä", maximize: "Suurenna", restore: "Palauta", close: "Sulje" },
  signaturePad: { area: "Allekirjoitus", clear: "Tyhjennä" },
};
