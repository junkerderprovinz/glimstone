import type { ComponentWords } from "../componentWords.ts";

export const gl: ComponentWords = {
  pagination: {
    label: "Páxinas",
    previous: "Páxina anterior",
    next: "Páxina seguinte",
    page: "Páxina {page} de {pages}",
  },
  pinInput: { cell: "Carácter {index} de {length}" },
  tagsInput: {
    remove: "Quitar {tag}",
    added: "{tag} engadido",
    selected: "{tag} escollido. Retroceso ou Supr quítao",
    removed: "{tag} quitado",
  },
  steps: { back: "Atrás", next: "Seguinte", finish: "Rematar" },
  splitter: { resize: "Cambiar o tamaño" },
  fileUpload: {
    drop: "Solta aquí os ficheiros ou escólleos",
    remove: "Quitar {name}",
    refused: {
      TOO_MANY_FILES: "{name} é un ficheiro de máis",
      FILE_INVALID_TYPE: "{name} non é un tipo de ficheiro que se acepte aquí",
      FILE_TOO_LARGE: "{name} é grande de máis",
      FILE_TOO_SMALL: "{name} é pequeno de máis",
      FILE_INVALID: "{name} non se pode ler",
      FILE_EXISTS: "{name} xa está na lista",
    },
  },
  datePicker: {
    placeholder: "Sen data",
    calendar: "Calendario",
    previous: { day: "Mes anterior", month: "Ano anterior", year: "Anos anteriores" },
    next: { day: "Mes seguinte", month: "Ano seguinte", year: "Anos seguintes" },
    zoomOut: "Escoller un mes ou un ano",
  },
  rating: { star: { one: "{value} de {count} estrela", other: "{value} de {count} estrelas" } },
  timer: {
    start: "Iniciar",
    pause: "Pausar",
    resume: "Continuar",
    reset: "Restablecer",
    hours: { one: "{count} hora", other: "{count} horas" },
    minutes: { one: "{count} minuto", other: "{count} minutos" },
    seconds: { one: "{count} segundo", other: "{count} segundos" },
  },
  carousel: {
    previous: "Diapositiva anterior",
    next: "Diapositiva seguinte",
    slide: "{index} de {count}",
    goTo: "Diapositiva {index}",
  },
  marquee: { pause: "Pausar", resume: "Continuar" },
  tour: { back: "Atrás", next: "Seguinte", close: "Pechar", progress: "{step} de {steps}" },
  floatingPanel: { minimize: "Minimizar", maximize: "Maximizar", restore: "Restaurar", close: "Pechar" },
  signaturePad: { area: "Sinatura", clear: "Borrar" },
};
