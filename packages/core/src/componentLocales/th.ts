import type { ComponentWords } from "../componentWords.ts";

export const th: ComponentWords = {
  pagination: { label: "หน้า", previous: "หน้าก่อนหน้า", next: "หน้าถัดไป", page: "หน้า {page} จาก {pages}" },
  pinInput: { cell: "อักขระที่ {index} จาก {length}" },
  tagsInput: {
    remove: "นำ {tag} ออก",
    added: "เพิ่ม {tag} แล้ว",
    selected: "เลือก {tag} แล้ว กด Backspace หรือ Delete เพื่อนำออก",
    removed: "นำ {tag} ออกแล้ว",
  },
  steps: { back: "ย้อนกลับ", next: "ถัดไป", finish: "เสร็จสิ้น" },
  splitter: { resize: "ปรับขนาด" },
  fileUpload: {
    drop: "วางไฟล์ที่นี่หรือเลือกไฟล์",
    remove: "นำ {name} ออก",
    refused: {
      TOO_MANY_FILES: "{name} เกินจำนวนไปหนึ่งไฟล์",
      FILE_INVALID_TYPE: "{name} ไม่ใช่ประเภทไฟล์ที่รับที่นี่",
      FILE_TOO_LARGE: "{name} ใหญ่เกินไป",
      FILE_TOO_SMALL: "{name} เล็กเกินไป",
      FILE_INVALID: "อ่าน {name} ไม่ได้",
      FILE_EXISTS: "{name} อยู่ในรายการแล้ว",
    },
  },
  datePicker: {
    placeholder: "ไม่มีวันที่",
    calendar: "ปฏิทิน",
    previous: { day: "เดือนก่อนหน้า", month: "ปีก่อนหน้า", year: "ช่วงปีก่อนหน้า" },
    next: { day: "เดือนถัดไป", month: "ปีถัดไป", year: "ช่วงปีถัดไป" },
    zoomOut: "เลือกเดือนหรือปี",
  },
  rating: { star: { other: "{value} จาก {count} ดาว" } },
  timer: {
    start: "เริ่ม",
    pause: "หยุดชั่วคราว",
    resume: "ทำต่อ",
    reset: "รีเซ็ต",
    hours: { other: "{count} ชั่วโมง" },
    minutes: { other: "{count} นาที" },
    seconds: { other: "{count} วินาที" },
  },
  carousel: { previous: "สไลด์ก่อนหน้า", next: "สไลด์ถัดไป", slide: "{index} จาก {count}", goTo: "สไลด์ {index}" },
  marquee: { pause: "หยุดชั่วคราว", resume: "ทำต่อ" },
  tour: { back: "ย้อนกลับ", next: "ถัดไป", close: "ปิด", progress: "{step} จาก {steps}" },
  floatingPanel: { minimize: "ย่อ", maximize: "ขยาย", restore: "คืนขนาด", close: "ปิด" },
  signaturePad: { area: "ลายเซ็น", clear: "ล้าง" },
};
