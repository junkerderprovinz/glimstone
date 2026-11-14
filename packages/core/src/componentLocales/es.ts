import type { ComponentWords } from "../componentWords.ts";

export const es: ComponentWords = {
  pagination: {
    label: "Páginas",
    previous: "Página anterior",
    next: "Página siguiente",
    page: "Página {page} de {pages}",
  },
  pinInput: { cell: "Carácter {index} de {length}" },
  tagsInput: {
    remove: "Quitar {tag}",
    added: "{tag} añadido",
    selected: "{tag} elegido. Retroceso o Supr lo quita",
    removed: "{tag} quitado",
  },
  steps: { back: "Atrás", next: "Siguiente", finish: "Terminar" },
  splitter: { resize: "Cambiar el tamaño" },
  fileUpload: {
    drop: "Suelta los archivos aquí o elígelos",
    remove: "Quitar {name}",
    refused: {
      TOO_MANY_FILES: "{name} es un archivo de más",
      FILE_INVALID_TYPE: "{name} no es un tipo de archivo que se acepte aquí",
      FILE_TOO_LARGE: "{name} es demasiado grande",
      FILE_TOO_SMALL: "{name} es demasiado pequeño",
      FILE_INVALID: "{name} no se puede leer",
      FILE_EXISTS: "{name} ya está en la lista",
    },
  },
  datePicker: {
    placeholder: "Sin fecha",
    calendar: "Calendario",
    previous: { day: "Mes anterior", month: "Año anterior", year: "Años anteriores" },
    next: { day: "Mes siguiente", month: "Año siguiente", year: "Años siguientes" },
    zoomOut: "Elegir un mes o un año",
  },
  rating: {
    star: {
      one: "{value} de {count} estrella",
      many: "{value} de {count} de estrellas",
      other: "{value} de {count} estrellas",
    },
  },
  timer: {
    start: "Iniciar",
    pause: "Pausar",
    resume: "Reanudar",
    reset: "Restablecer",
    hours: { one: "{count} hora", many: "{count} de horas", other: "{count} horas" },
    minutes: { one: "{count} minuto", many: "{count} de minutos", other: "{count} minutos" },
    seconds: { one: "{count} segundo", many: "{count} de segundos", other: "{count} segundos" },
  },
  carousel: {
    previous: "Diapositiva anterior",
    next: "Diapositiva siguiente",
    slide: "{index} de {count}",
    goTo: "Diapositiva {index}",
  },
  marquee: { pause: "Pausar", resume: "Reanudar" },
  tour: { back: "Atrás", next: "Siguiente", close: "Cerrar", progress: "{step} de {steps}" },
  floatingPanel: { minimize: "Minimizar", maximize: "Maximizar", restore: "Restaurar", close: "Cerrar" },
  signaturePad: { area: "Firma", clear: "Borrar" },
};
