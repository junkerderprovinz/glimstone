import type { ComponentWords } from "../componentWords.ts";

export const ja: ComponentWords = {
  pagination: { label: "ページ", previous: "前のページ", next: "次のページ", page: "{pages} ページ中 {page} ページ目" },
  pinInput: { cell: "{length} 文字中 {index} 文字目" },
  tagsInput: {
    remove: "{tag} を削除",
    added: "{tag} を追加しました",
    selected: "{tag} を選択しました。Backspace か Delete で削除します",
    removed: "{tag} を削除しました",
  },
  steps: { back: "戻る", next: "次へ", finish: "完了" },
  splitter: { resize: "サイズを変更" },
  fileUpload: {
    drop: "ここにファイルをドロップするか選択してください",
    remove: "{name} を削除",
    refused: {
      TOO_MANY_FILES: "{name} はファイルが 1 つ多すぎます",
      FILE_INVALID_TYPE: "{name} はここで受け付けない種類のファイルです",
      FILE_TOO_LARGE: "{name} は大きすぎます",
      FILE_TOO_SMALL: "{name} は小さすぎます",
      FILE_INVALID: "{name} を読み込めません",
      FILE_EXISTS: "{name} はすでに一覧にあります",
    },
  },
  datePicker: {
    placeholder: "日付なし",
    calendar: "カレンダー",
    previous: { day: "前の月", month: "前の年", year: "前の年代" },
    next: { day: "次の月", month: "次の年", year: "次の年代" },
    zoomOut: "月か年を選択",
  },
  rating: { star: { other: "{count} 個中 {value} 個の星" } },
  timer: {
    start: "開始",
    pause: "一時停止",
    resume: "再開",
    reset: "リセット",
    hours: { other: "{count} 時間" },
    minutes: { other: "{count} 分" },
    seconds: { other: "{count} 秒" },
  },
  carousel: { previous: "前のスライド", next: "次のスライド", slide: "{count} 枚中 {index} 枚目", goTo: "スライド {index}" },
  marquee: { pause: "一時停止", resume: "再開" },
  tour: { back: "戻る", next: "次へ", close: "閉じる", progress: "{steps} 中 {step}" },
  floatingPanel: { minimize: "最小化", maximize: "最大化", restore: "元のサイズに戻す", close: "閉じる" },
  signaturePad: { area: "署名", clear: "消去" },
};
