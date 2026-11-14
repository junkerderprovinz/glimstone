import type { ComponentWords } from "../componentWords.ts";

export const ko: ComponentWords = {
  pagination: { label: "페이지", previous: "이전 페이지", next: "다음 페이지", page: "{pages}페이지 중 {page}페이지" },
  pinInput: { cell: "{length}자 중 {index}번째 문자" },
  tagsInput: {
    remove: "{tag} 삭제",
    added: "{tag} 추가됨",
    selected: "{tag} 선택됨. Backspace나 Delete로 삭제합니다",
    removed: "{tag} 삭제됨",
  },
  steps: { back: "이전", next: "다음", finish: "마침" },
  splitter: { resize: "크기 조정" },
  fileUpload: {
    drop: "여기에 파일을 끌어다 놓거나 선택하세요",
    remove: "{name} 삭제",
    refused: {
      TOO_MANY_FILES: "{name}: 파일이 하나 많습니다",
      FILE_INVALID_TYPE: "{name}: 여기서 받지 않는 종류의 파일입니다",
      FILE_TOO_LARGE: "{name}: 파일이 너무 큽니다",
      FILE_TOO_SMALL: "{name}: 파일이 너무 작습니다",
      FILE_INVALID: "{name}: 파일을 읽을 수 없습니다",
      FILE_EXISTS: "{name}: 이미 목록에 있습니다",
    },
  },
  datePicker: {
    placeholder: "날짜 없음",
    calendar: "달력",
    previous: { day: "이전 달", month: "이전 해", year: "이전 연도들" },
    next: { day: "다음 달", month: "다음 해", year: "다음 연도들" },
    zoomOut: "월이나 연도 선택",
  },
  rating: { star: { other: "별 {count}개 중 {value}개" } },
  timer: {
    start: "시작",
    pause: "일시 정지",
    resume: "계속",
    reset: "초기화",
    hours: { other: "{count}시간" },
    minutes: { other: "{count}분" },
    seconds: { other: "{count}초" },
  },
  carousel: { previous: "이전 슬라이드", next: "다음 슬라이드", slide: "{count}개 중 {index}번째", goTo: "슬라이드 {index}" },
  marquee: { pause: "일시 정지", resume: "계속" },
  tour: { back: "이전", next: "다음", close: "닫기", progress: "{steps}단계 중 {step}단계" },
  floatingPanel: { minimize: "최소화", maximize: "최대화", restore: "이전 크기로", close: "닫기" },
  signaturePad: { area: "서명", clear: "지우기" },
};
