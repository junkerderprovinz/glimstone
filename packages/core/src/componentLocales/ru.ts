import type { ComponentWords } from "../componentWords.ts";

export const ru: ComponentWords = {
  pagination: {
    label: "Страницы",
    previous: "Предыдущая страница",
    next: "Следующая страница",
    page: "Страница {page} из {pages}",
  },
  pinInput: { cell: "Символ {index} из {length}" },
  tagsInput: {
    remove: "Удалить {tag}",
    added: "{tag}: добавлено",
    selected: "{tag}: выбрано. Backspace или Delete удаляет",
    removed: "{tag}: удалено",
  },
  steps: { back: "Назад", next: "Далее", finish: "Завершить" },
  splitter: { resize: "Изменить размер" },
  fileUpload: {
    drop: "Перетащите файлы сюда или выберите их",
    remove: "Удалить {name}",
    refused: {
      TOO_MANY_FILES: "{name}: на один файл больше, чем можно",
      FILE_INVALID_TYPE: "{name}: такой тип файла здесь не принимается",
      FILE_TOO_LARGE: "{name}: файл слишком большой",
      FILE_TOO_SMALL: "{name}: файл слишком маленький",
      FILE_INVALID: "{name}: файл не читается",
      FILE_EXISTS: "{name} уже есть в списке",
    },
  },
  datePicker: {
    placeholder: "Без даты",
    calendar: "Календарь",
    previous: { day: "Предыдущий месяц", month: "Предыдущий год", year: "Предыдущие годы" },
    next: { day: "Следующий месяц", month: "Следующий год", year: "Следующие годы" },
    zoomOut: "Выбрать месяц или год",
  },
  rating: {
    star: {
      one: "{value} из {count} звезды",
      few: "{value} из {count} звёзд",
      many: "{value} из {count} звёзд",
      other: "{value} из {count} звезды",
    },
  },
  timer: {
    start: "Запустить",
    pause: "Приостановить",
    resume: "Продолжить",
    reset: "Сбросить",
    hours: { one: "{count} час", few: "{count} часа", many: "{count} часов", other: "{count} часа" },
    minutes: { one: "{count} минута", few: "{count} минуты", many: "{count} минут", other: "{count} минуты" },
    seconds: { one: "{count} секунда", few: "{count} секунды", many: "{count} секунд", other: "{count} секунды" },
  },
  carousel: {
    previous: "Предыдущий слайд",
    next: "Следующий слайд",
    slide: "{index} из {count}",
    goTo: "Слайд {index}",
  },
  marquee: { pause: "Приостановить", resume: "Продолжить" },
  tour: { back: "Назад", next: "Далее", close: "Закрыть", progress: "{step} из {steps}" },
  floatingPanel: { minimize: "Свернуть", maximize: "Развернуть", restore: "Восстановить", close: "Закрыть" },
  signaturePad: { area: "Подпись", clear: "Очистить" },
};
