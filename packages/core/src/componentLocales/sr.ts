import type { ComponentWords } from "../componentWords.ts";

export const sr: ComponentWords = {
  pagination: {
    label: "Странице",
    previous: "Претходна страница",
    next: "Следећа страница",
    page: "Страница {page} од {pages}",
  },
  pinInput: { cell: "Знак {index} од {length}" },
  tagsInput: {
    remove: "Уклони {tag}",
    added: "{tag}: додато",
    selected: "{tag}: изабрано. Backspace или Delete га уклања",
    removed: "{tag}: уклоњено",
  },
  steps: { back: "Назад", next: "Даље", finish: "Заврши" },
  splitter: { resize: "Промени величину" },
  fileUpload: {
    drop: "Превуците датотеке овде или их изаберите",
    remove: "Уклони {name}",
    refused: {
      TOO_MANY_FILES: "{name} је једна датотека вишка",
      FILE_INVALID_TYPE: "{name} није врста датотеке која се овде прима",
      FILE_TOO_LARGE: "{name} је превелика",
      FILE_TOO_SMALL: "{name} је премала",
      FILE_INVALID: "{name} не може да се прочита",
      FILE_EXISTS: "{name} је већ на листи",
    },
  },
  datePicker: {
    placeholder: "Без датума",
    calendar: "Календар",
    previous: { day: "Претходни месец", month: "Претходна година", year: "Претходне године" },
    next: { day: "Следећи месец", month: "Следећа година", year: "Следеће године" },
    zoomOut: "Изаберите месец или годину",
  },
  rating: {
    star: {
      one: "{value} од {count} звездице",
      few: "{value} од {count} звездице",
      other: "{value} од {count} звездица",
    },
  },
  timer: {
    start: "Покрени",
    pause: "Паузирај",
    resume: "Настави",
    reset: "Ресетуј",
    hours: { one: "{count} сат", few: "{count} сата", other: "{count} сати" },
    minutes: { one: "{count} минут", few: "{count} минута", other: "{count} минута" },
    seconds: { one: "{count} секунда", few: "{count} секунде", other: "{count} секунди" },
  },
  carousel: { previous: "Претходни слајд", next: "Следећи слајд", slide: "{index} од {count}", goTo: "Слајд {index}" },
  marquee: { pause: "Паузирај", resume: "Настави" },
  tour: { back: "Назад", next: "Даље", close: "Затвори", progress: "{step} од {steps}" },
  floatingPanel: { minimize: "Умањи", maximize: "Увећај", restore: "Врати", close: "Затвори" },
  signaturePad: { area: "Потпис", clear: "Обриши" },
};
