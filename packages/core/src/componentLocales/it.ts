import type { ComponentWords } from "../componentWords.ts";

export const it: ComponentWords = {
  pagination: {
    label: "Pagine",
    previous: "Pagina precedente",
    next: "Pagina successiva",
    page: "Pagina {page} di {pages}",
  },
  pinInput: { cell: "Carattere {index} di {length}" },
  tagsInput: {
    remove: "Rimuovi {tag}",
    added: "{tag} aggiunto",
    selected: "{tag} scelto. Backspace o Canc lo rimuove",
    removed: "{tag} rimosso",
  },
  steps: { back: "Indietro", next: "Avanti", finish: "Fine" },
  splitter: { resize: "Ridimensiona" },
  fileUpload: {
    drop: "Trascina qui i file o sceglili",
    remove: "Rimuovi {name}",
    refused: {
      TOO_MANY_FILES: "{name} è un file di troppo",
      FILE_INVALID_TYPE: "{name} non è un tipo di file accettato qui",
      FILE_TOO_LARGE: "{name} è troppo grande",
      FILE_TOO_SMALL: "{name} è troppo piccolo",
      FILE_INVALID: "{name} non si può leggere",
      FILE_EXISTS: "{name} è già nell'elenco",
    },
  },
  datePicker: {
    placeholder: "Nessuna data",
    calendar: "Calendario",
    previous: { day: "Mese precedente", month: "Anno precedente", year: "Anni precedenti" },
    next: { day: "Mese successivo", month: "Anno successivo", year: "Anni successivi" },
    zoomOut: "Scegli un mese o un anno",
  },
  rating: {
    star: {
      one: "{value} su {count} stella",
      many: "{value} su {count} di stelle",
      other: "{value} su {count} stelle",
    },
  },
  timer: {
    start: "Avvia",
    pause: "Pausa",
    resume: "Riprendi",
    reset: "Azzera",
    hours: { one: "{count} ora", many: "{count} di ore", other: "{count} ore" },
    minutes: { one: "{count} minuto", many: "{count} di minuti", other: "{count} minuti" },
    seconds: { one: "{count} secondo", many: "{count} di secondi", other: "{count} secondi" },
  },
  carousel: {
    previous: "Diapositiva precedente",
    next: "Diapositiva successiva",
    slide: "{index} di {count}",
    goTo: "Diapositiva {index}",
  },
  marquee: { pause: "Pausa", resume: "Riprendi" },
  tour: { back: "Indietro", next: "Avanti", close: "Chiudi", progress: "{step} di {steps}" },
  floatingPanel: { minimize: "Riduci a icona", maximize: "Ingrandisci", restore: "Ripristina", close: "Chiudi" },
  signaturePad: { area: "Firma", clear: "Cancella" },
};
