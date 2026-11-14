import type { ComponentWords } from "../componentWords.ts";

export const en: ComponentWords = {
  pagination: { label: "Pages", previous: "Previous page", next: "Next page", page: "Page {page} of {pages}" },
  pinInput: { cell: "Character {index} of {length}" },
  tagsInput: {
    remove: "Remove {tag}",
    added: "{tag} added",
    selected: "{tag} picked. Press Backspace or Delete to remove it",
    removed: "{tag} removed",
  },
  steps: { back: "Back", next: "Next", finish: "Finish" },
  splitter: { resize: "Resize" },
  fileUpload: {
    drop: "Drop files here or choose them",
    remove: "Remove {name}",
    refused: {
      TOO_MANY_FILES: "{name} is one file too many",
      FILE_INVALID_TYPE: "{name} is not a kind of file this takes",
      FILE_TOO_LARGE: "{name} is too large",
      FILE_TOO_SMALL: "{name} is too small",
      FILE_INVALID: "{name} cannot be read",
      FILE_EXISTS: "{name} is already in the list",
    },
  },
  datePicker: {
    placeholder: "No date",
    calendar: "Calendar",
    previous: { day: "Previous month", month: "Previous year", year: "Previous years" },
    next: { day: "Next month", month: "Next year", year: "Next years" },
    zoomOut: "Choose a month or a year",
  },
  rating: { star: { one: "{value} of {count} star", other: "{value} of {count} stars" } },
  timer: {
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    hours: { one: "{count} hour", other: "{count} hours" },
    minutes: { one: "{count} minute", other: "{count} minutes" },
    seconds: { one: "{count} second", other: "{count} seconds" },
  },
  carousel: { previous: "Previous slide", next: "Next slide", slide: "{index} of {count}", goTo: "Slide {index}" },
  marquee: { pause: "Pause", resume: "Resume" },
  tour: { back: "Back", next: "Next", close: "Close", progress: "{step} of {steps}" },
  floatingPanel: { minimize: "Minimise", maximize: "Maximise", restore: "Restore", close: "Close" },
  signaturePad: { area: "Signature", clear: "Clear" },
};
