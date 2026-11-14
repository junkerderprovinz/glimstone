import type { ComponentWords } from "../componentWords.ts";

export const bg: ComponentWords = {
  pagination: {
    label: "Страници",
    previous: "Предишна страница",
    next: "Следваща страница",
    page: "Страница {page} от {pages}",
  },
  pinInput: { cell: "Знак {index} от {length}" },
  tagsInput: {
    remove: "Премахване на {tag}",
    added: "{tag}: добавено",
    selected: "{tag}: избрано. Backspace или Delete го премахва",
    removed: "{tag}: премахнато",
  },
  steps: { back: "Назад", next: "Напред", finish: "Готово" },
  splitter: { resize: "Промяна на размера" },
  fileUpload: {
    drop: "Пуснете файлове тук или ги изберете",
    remove: "Премахване на {name}",
    refused: {
      TOO_MANY_FILES: "{name} е един файл в повече",
      FILE_INVALID_TYPE: "{name} не е вид файл, който се приема тук",
      FILE_TOO_LARGE: "{name} е твърде голям",
      FILE_TOO_SMALL: "{name} е твърде малък",
      FILE_INVALID: "{name} не може да се прочете",
      FILE_EXISTS: "{name} вече е в списъка",
    },
  },
  datePicker: {
    placeholder: "Без дата",
    calendar: "Календар",
    previous: { day: "Предишен месец", month: "Предишна година", year: "Предишни години" },
    next: { day: "Следващ месец", month: "Следваща година", year: "Следващи години" },
    zoomOut: "Изберете месец или година",
  },
  rating: { star: { one: "{value} от {count} звезда", other: "{value} от {count} звезди" } },
  timer: {
    start: "Старт",
    pause: "Пауза",
    resume: "Продължаване",
    reset: "Нулиране",
    hours: { one: "{count} час", other: "{count} часа" },
    minutes: { one: "{count} минута", other: "{count} минути" },
    seconds: { one: "{count} секунда", other: "{count} секунди" },
  },
  carousel: { previous: "Предишен слайд", next: "Следващ слайд", slide: "{index} от {count}", goTo: "Слайд {index}" },
  marquee: { pause: "Пауза", resume: "Продължаване" },
  tour: { back: "Назад", next: "Напред", close: "Затваряне", progress: "{step} от {steps}" },
  floatingPanel: { minimize: "Минимизиране", maximize: "Максимизиране", restore: "Възстановяване", close: "Затваряне" },
  signaturePad: { area: "Подпис", clear: "Изчистване" },
};
