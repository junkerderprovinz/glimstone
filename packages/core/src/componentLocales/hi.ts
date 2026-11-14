import type { ComponentWords } from "../componentWords.ts";

export const hi: ComponentWords = {
  pagination: { label: "पेज", previous: "पिछला पेज", next: "अगला पेज", page: "{pages} में से पेज {page}" },
  pinInput: { cell: "{length} में से अक्षर {index}" },
  tagsInput: {
    remove: "{tag} हटाएँ",
    added: "{tag} जोड़ा गया",
    selected: "{tag} चुना गया. Backspace या Delete इसे हटाता है",
    removed: "{tag} हटाया गया",
  },
  steps: { back: "पीछे", next: "आगे", finish: "पूरा करें" },
  splitter: { resize: "आकार बदलें" },
  fileUpload: {
    drop: "फ़ाइलें यहाँ छोड़ें या चुनें",
    remove: "{name} हटाएँ",
    refused: {
      TOO_MANY_FILES: "{name} एक फ़ाइल ज़्यादा है",
      FILE_INVALID_TYPE: "{name} उस तरह की फ़ाइल नहीं है जो यहाँ ली जाती है",
      FILE_TOO_LARGE: "{name} बहुत बड़ी है",
      FILE_TOO_SMALL: "{name} बहुत छोटी है",
      FILE_INVALID: "{name} पढ़ी नहीं जा सकती",
      FILE_EXISTS: "{name} पहले से सूची में है",
    },
  },
  datePicker: {
    placeholder: "कोई तारीख नहीं",
    calendar: "कैलेंडर",
    previous: { day: "पिछला महीना", month: "पिछला साल", year: "पिछले साल" },
    next: { day: "अगला महीना", month: "अगला साल", year: "अगले साल" },
    zoomOut: "महीना या साल चुनें",
  },
  rating: { star: { one: "{count} में से {value} स्टार", other: "{count} में से {value} स्टार" } },
  timer: {
    start: "शुरू करें",
    pause: "रोकें",
    resume: "फिर शुरू करें",
    reset: "रीसेट करें",
    hours: { one: "{count} घंटा", other: "{count} घंटे" },
    minutes: { one: "{count} मिनट", other: "{count} मिनट" },
    seconds: { one: "{count} सेकंड", other: "{count} सेकंड" },
  },
  carousel: { previous: "पिछली स्लाइड", next: "अगली स्लाइड", slide: "{count} में से {index}", goTo: "स्लाइड {index}" },
  marquee: { pause: "रोकें", resume: "फिर शुरू करें" },
  tour: { back: "पीछे", next: "आगे", close: "बंद करें", progress: "{steps} में से {step}" },
  floatingPanel: { minimize: "छोटा करें", maximize: "बड़ा करें", restore: "पहले जैसा करें", close: "बंद करें" },
  signaturePad: { area: "हस्ताक्षर", clear: "साफ़ करें" },
};
