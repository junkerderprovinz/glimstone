import type { ComponentWords } from "../componentWords.ts";

export const pt: ComponentWords = {
  pagination: {
    label: "Páginas",
    previous: "Página anterior",
    next: "Página seguinte",
    page: "Página {page} de {pages}",
  },
  pinInput: { cell: "Carácter {index} de {length}" },
  tagsInput: {
    remove: "Remover {tag}",
    added: "{tag} adicionado",
    selected: "{tag} escolhido. Retrocesso ou Delete remove-o",
    removed: "{tag} removido",
  },
  steps: { back: "Voltar", next: "Seguinte", finish: "Concluir" },
  splitter: { resize: "Redimensionar" },
  fileUpload: {
    drop: "Largue aqui os ficheiros ou escolha-os",
    remove: "Remover {name}",
    refused: {
      TOO_MANY_FILES: "{name} é um ficheiro a mais",
      FILE_INVALID_TYPE: "{name} não é um tipo de ficheiro aceite aqui",
      FILE_TOO_LARGE: "{name} é demasiado grande",
      FILE_TOO_SMALL: "{name} é demasiado pequeno",
      FILE_INVALID: "{name} não pode ser lido",
      FILE_EXISTS: "{name} já está na lista",
    },
  },
  datePicker: {
    placeholder: "Sem data",
    calendar: "Calendário",
    previous: { day: "Mês anterior", month: "Ano anterior", year: "Anos anteriores" },
    next: { day: "Mês seguinte", month: "Ano seguinte", year: "Anos seguintes" },
    zoomOut: "Escolher um mês ou um ano",
  },
  rating: {
    star: {
      one: "{value} de {count} estrela",
      many: "{value} de {count} de estrelas",
      other: "{value} de {count} estrelas",
    },
  },
  timer: {
    start: "Iniciar",
    pause: "Pausar",
    resume: "Retomar",
    reset: "Repor",
    hours: { one: "{count} hora", many: "{count} de horas", other: "{count} horas" },
    minutes: { one: "{count} minuto", many: "{count} de minutos", other: "{count} minutos" },
    seconds: { one: "{count} segundo", many: "{count} de segundos", other: "{count} segundos" },
  },
  carousel: {
    previous: "Diapositivo anterior",
    next: "Diapositivo seguinte",
    slide: "{index} de {count}",
    goTo: "Diapositivo {index}",
  },
  marquee: { pause: "Pausar", resume: "Retomar" },
  tour: { back: "Voltar", next: "Seguinte", close: "Fechar", progress: "{step} de {steps}" },
  floatingPanel: { minimize: "Minimizar", maximize: "Maximizar", restore: "Restaurar", close: "Fechar" },
  signaturePad: { area: "Assinatura", clear: "Limpar" },
};
