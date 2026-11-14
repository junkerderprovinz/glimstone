import type { ComponentWords } from "../componentWords.ts";

export const tr: ComponentWords = {
  pagination: { label: "Sayfalar", previous: "Önceki sayfa", next: "Sonraki sayfa", page: "Sayfa {page}/{pages}" },
  pinInput: { cell: "Karakter {index}/{length}" },
  tagsInput: {
    remove: "{tag} kaldır",
    added: "{tag} eklendi",
    selected: "{tag} seçildi. Geri tuşu ya da Delete onu kaldırır",
    removed: "{tag} kaldırıldı",
  },
  steps: { back: "Geri", next: "İleri", finish: "Bitir" },
  splitter: { resize: "Yeniden boyutlandır" },
  fileUpload: {
    drop: "Dosyaları buraya bırakın ya da seçin",
    remove: "{name} kaldır",
    refused: {
      TOO_MANY_FILES: "{name} bir dosya fazla",
      FILE_INVALID_TYPE: "{name} burada kabul edilen bir dosya türü değil",
      FILE_TOO_LARGE: "{name} çok büyük",
      FILE_TOO_SMALL: "{name} çok küçük",
      FILE_INVALID: "{name} okunamıyor",
      FILE_EXISTS: "{name} zaten listede",
    },
  },
  datePicker: {
    placeholder: "Tarih yok",
    calendar: "Takvim",
    previous: { day: "Önceki ay", month: "Önceki yıl", year: "Önceki yıllar" },
    next: { day: "Sonraki ay", month: "Sonraki yıl", year: "Sonraki yıllar" },
    zoomOut: "Ay ya da yıl seçin",
  },
  rating: { star: { one: "{count} yıldızdan {value}", other: "{count} yıldızdan {value}" } },
  timer: {
    start: "Başlat",
    pause: "Duraklat",
    resume: "Sürdür",
    reset: "Sıfırla",
    hours: { one: "{count} saat", other: "{count} saat" },
    minutes: { one: "{count} dakika", other: "{count} dakika" },
    seconds: { one: "{count} saniye", other: "{count} saniye" },
  },
  carousel: { previous: "Önceki slayt", next: "Sonraki slayt", slide: "{index}/{count}", goTo: "Slayt {index}" },
  marquee: { pause: "Duraklat", resume: "Sürdür" },
  tour: { back: "Geri", next: "İleri", close: "Kapat", progress: "{step}/{steps}" },
  floatingPanel: { minimize: "Simge durumuna küçült", maximize: "Ekranı kapla", restore: "Önceki boyut", close: "Kapat" },
  signaturePad: { area: "İmza", clear: "Temizle" },
};
