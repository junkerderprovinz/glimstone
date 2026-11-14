import type { ComponentWords } from "../componentWords.ts";

export const uk: ComponentWords = {
  pagination: {
    label: "Сторінки",
    previous: "Попередня сторінка",
    next: "Наступна сторінка",
    page: "Сторінка {page} з {pages}",
  },
  pinInput: { cell: "Символ {index} з {length}" },
  tagsInput: {
    remove: "Вилучити {tag}",
    added: "{tag}: додано",
    selected: "{tag}: вибрано. Backspace або Delete вилучає",
    removed: "{tag}: вилучено",
  },
  steps: { back: "Назад", next: "Далі", finish: "Завершити" },
  splitter: { resize: "Змінити розмір" },
  fileUpload: {
    drop: "Перетягніть файли сюди або виберіть їх",
    remove: "Вилучити {name}",
    refused: {
      TOO_MANY_FILES: "{name}: на один файл більше, ніж можна",
      FILE_INVALID_TYPE: "{name}: такий тип файлу тут не приймається",
      FILE_TOO_LARGE: "{name}: файл завеликий",
      FILE_TOO_SMALL: "{name}: файл замалий",
      FILE_INVALID: "{name}: файл не читається",
      FILE_EXISTS: "{name} уже є у списку",
    },
  },
  datePicker: {
    placeholder: "Без дати",
    calendar: "Календар",
    previous: { day: "Попередній місяць", month: "Попередній рік", year: "Попередні роки" },
    next: { day: "Наступний місяць", month: "Наступний рік", year: "Наступні роки" },
    zoomOut: "Вибрати місяць або рік",
  },
  rating: {
    star: {
      one: "{value} з {count} зірки",
      few: "{value} з {count} зірок",
      many: "{value} з {count} зірок",
      other: "{value} з {count} зірки",
    },
  },
  timer: {
    start: "Запустити",
    pause: "Призупинити",
    resume: "Продовжити",
    reset: "Скинути",
    hours: { one: "{count} година", few: "{count} години", many: "{count} годин", other: "{count} години" },
    minutes: { one: "{count} хвилина", few: "{count} хвилини", many: "{count} хвилин", other: "{count} хвилини" },
    seconds: { one: "{count} секунда", few: "{count} секунди", many: "{count} секунд", other: "{count} секунди" },
  },
  carousel: {
    previous: "Попередній слайд",
    next: "Наступний слайд",
    slide: "{index} з {count}",
    goTo: "Слайд {index}",
  },
  marquee: { pause: "Призупинити", resume: "Продовжити" },
  tour: { back: "Назад", next: "Далі", close: "Закрити", progress: "{step} з {steps}" },
  floatingPanel: { minimize: "Згорнути", maximize: "Розгорнути", restore: "Відновити", close: "Закрити" },
  signaturePad: { area: "Підпис", clear: "Очистити" },
};
