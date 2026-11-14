import type { ComponentWords } from "../componentWords.ts";

export const id: ComponentWords = {
  pagination: {
    label: "Halaman",
    previous: "Halaman sebelumnya",
    next: "Halaman berikutnya",
    page: "Halaman {page} dari {pages}",
  },
  pinInput: { cell: "Karakter {index} dari {length}" },
  tagsInput: {
    remove: "Hapus {tag}",
    added: "{tag} ditambahkan",
    selected: "{tag} dipilih. Backspace atau Delete menghapusnya",
    removed: "{tag} dihapus",
  },
  steps: { back: "Kembali", next: "Berikutnya", finish: "Selesai" },
  splitter: { resize: "Ubah ukuran" },
  fileUpload: {
    drop: "Lepas file di sini atau pilih",
    remove: "Hapus {name}",
    refused: {
      TOO_MANY_FILES: "{name} kelebihan satu file",
      FILE_INVALID_TYPE: "{name} bukan jenis file yang diterima di sini",
      FILE_TOO_LARGE: "{name} terlalu besar",
      FILE_TOO_SMALL: "{name} terlalu kecil",
      FILE_INVALID: "{name} tidak bisa dibaca",
      FILE_EXISTS: "{name} sudah ada di daftar",
    },
  },
  datePicker: {
    placeholder: "Tanpa tanggal",
    calendar: "Kalender",
    previous: { day: "Bulan sebelumnya", month: "Tahun sebelumnya", year: "Tahun-tahun sebelumnya" },
    next: { day: "Bulan berikutnya", month: "Tahun berikutnya", year: "Tahun-tahun berikutnya" },
    zoomOut: "Pilih bulan atau tahun",
  },
  rating: { star: { other: "{value} dari {count} bintang" } },
  timer: {
    start: "Mulai",
    pause: "Jeda",
    resume: "Lanjutkan",
    reset: "Atur ulang",
    hours: { other: "{count} jam" },
    minutes: { other: "{count} menit" },
    seconds: { other: "{count} detik" },
  },
  carousel: {
    previous: "Slide sebelumnya",
    next: "Slide berikutnya",
    slide: "{index} dari {count}",
    goTo: "Slide {index}",
  },
  marquee: { pause: "Jeda", resume: "Lanjutkan" },
  tour: { back: "Kembali", next: "Berikutnya", close: "Tutup", progress: "{step} dari {steps}" },
  floatingPanel: { minimize: "Perkecil", maximize: "Perbesar", restore: "Pulihkan", close: "Tutup" },
  signaturePad: { area: "Tanda tangan", clear: "Bersihkan" },
};
