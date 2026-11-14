import type { ComponentWords } from "../componentWords.ts";

export const ms: ComponentWords = {
  pagination: {
    label: "Halaman",
    previous: "Halaman sebelumnya",
    next: "Halaman seterusnya",
    page: "Halaman {page} daripada {pages}",
  },
  pinInput: { cell: "Aksara {index} daripada {length}" },
  tagsInput: {
    remove: "Buang {tag}",
    added: "{tag} ditambah",
    selected: "{tag} dipilih. Backspace atau Delete membuangnya",
    removed: "{tag} dibuang",
  },
  steps: { back: "Kembali", next: "Seterusnya", finish: "Selesai" },
  splitter: { resize: "Ubah saiz" },
  fileUpload: {
    drop: "Lepaskan fail di sini atau pilih fail",
    remove: "Buang {name}",
    refused: {
      TOO_MANY_FILES: "{name} terlebih satu fail",
      FILE_INVALID_TYPE: "{name} bukan jenis fail yang diterima di sini",
      FILE_TOO_LARGE: "{name} terlalu besar",
      FILE_TOO_SMALL: "{name} terlalu kecil",
      FILE_INVALID: "{name} tidak dapat dibaca",
      FILE_EXISTS: "{name} sudah ada dalam senarai",
    },
  },
  datePicker: {
    placeholder: "Tiada tarikh",
    calendar: "Kalendar",
    previous: { day: "Bulan sebelumnya", month: "Tahun sebelumnya", year: "Tahun-tahun sebelumnya" },
    next: { day: "Bulan seterusnya", month: "Tahun seterusnya", year: "Tahun-tahun seterusnya" },
    zoomOut: "Pilih bulan atau tahun",
  },
  rating: { star: { other: "{value} daripada {count} bintang" } },
  timer: {
    start: "Mula",
    pause: "Jeda",
    resume: "Sambung",
    reset: "Set semula",
    hours: { other: "{count} jam" },
    minutes: { other: "{count} minit" },
    seconds: { other: "{count} saat" },
  },
  carousel: {
    previous: "Slaid sebelumnya",
    next: "Slaid seterusnya",
    slide: "{index} daripada {count}",
    goTo: "Slaid {index}",
  },
  marquee: { pause: "Jeda", resume: "Sambung" },
  tour: { back: "Kembali", next: "Seterusnya", close: "Tutup", progress: "{step} daripada {steps}" },
  floatingPanel: { minimize: "Kecilkan", maximize: "Besarkan", restore: "Pulihkan", close: "Tutup" },
  signaturePad: { area: "Tandatangan", clear: "Kosongkan" },
};
