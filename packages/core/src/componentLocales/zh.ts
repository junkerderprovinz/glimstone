import type { ComponentWords } from "../componentWords.ts";

export const zh: ComponentWords = {
  pagination: { label: "页面", previous: "上一页", next: "下一页", page: "第 {page} 页，共 {pages} 页" },
  pinInput: { cell: "第 {index} 个字符，共 {length} 个" },
  tagsInput: {
    remove: "移除 {tag}",
    added: "已添加 {tag}",
    selected: "已选中 {tag}。按 Backspace 或 Delete 移除",
    removed: "已移除 {tag}",
  },
  steps: { back: "上一步", next: "下一步", finish: "完成" },
  splitter: { resize: "调整大小" },
  fileUpload: {
    drop: "将文件拖放到此处或选择文件",
    remove: "移除 {name}",
    refused: {
      TOO_MANY_FILES: "{name} 多出一个文件",
      FILE_INVALID_TYPE: "{name} 不是此处接受的文件类型",
      FILE_TOO_LARGE: "{name} 太大",
      FILE_TOO_SMALL: "{name} 太小",
      FILE_INVALID: "无法读取 {name}",
      FILE_EXISTS: "{name} 已在列表中",
    },
  },
  datePicker: {
    placeholder: "无日期",
    calendar: "日历",
    previous: { day: "上个月", month: "上一年", year: "前几年" },
    next: { day: "下个月", month: "下一年", year: "后几年" },
    zoomOut: "选择月份或年份",
  },
  rating: { star: { other: "{value} 星，共 {count} 星" } },
  timer: {
    start: "开始",
    pause: "暂停",
    resume: "继续",
    reset: "重置",
    hours: { other: "{count} 小时" },
    minutes: { other: "{count} 分钟" },
    seconds: { other: "{count} 秒" },
  },
  carousel: { previous: "上一张幻灯片", next: "下一张幻灯片", slide: "第 {index} 张，共 {count} 张", goTo: "幻灯片 {index}" },
  marquee: { pause: "暂停", resume: "继续" },
  tour: { back: "上一步", next: "下一步", close: "关闭", progress: "第 {step} 步，共 {steps} 步" },
  floatingPanel: { minimize: "最小化", maximize: "最大化", restore: "还原", close: "关闭" },
  signaturePad: { area: "签名", clear: "清除" },
};
