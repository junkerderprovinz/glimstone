import type { ComponentWords } from "../componentWords.ts";

export const vi: ComponentWords = {
  pagination: { label: "Các trang", previous: "Trang trước", next: "Trang sau", page: "Trang {page} trên {pages}" },
  pinInput: { cell: "Ký tự {index} trên {length}" },
  tagsInput: {
    remove: "Xóa {tag}",
    added: "Đã thêm {tag}",
    selected: "Đã chọn {tag}. Backspace hoặc Delete sẽ xóa",
    removed: "Đã xóa {tag}",
  },
  steps: { back: "Quay lại", next: "Tiếp", finish: "Hoàn tất" },
  splitter: { resize: "Đổi kích thước" },
  fileUpload: {
    drop: "Thả tệp vào đây hoặc chọn tệp",
    remove: "Xóa {name}",
    refused: {
      TOO_MANY_FILES: "{name} là tệp vượt quá số lượng",
      FILE_INVALID_TYPE: "{name} không phải loại tệp được nhận ở đây",
      FILE_TOO_LARGE: "{name} quá lớn",
      FILE_TOO_SMALL: "{name} quá nhỏ",
      FILE_INVALID: "Không đọc được {name}",
      FILE_EXISTS: "{name} đã có trong danh sách",
    },
  },
  datePicker: {
    placeholder: "Không có ngày",
    calendar: "Lịch",
    previous: { day: "Tháng trước", month: "Năm trước", year: "Các năm trước" },
    next: { day: "Tháng sau", month: "Năm sau", year: "Các năm sau" },
    zoomOut: "Chọn tháng hoặc năm",
  },
  rating: { star: { other: "{value} trên {count} sao" } },
  timer: {
    start: "Bắt đầu",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    reset: "Đặt lại",
    hours: { other: "{count} giờ" },
    minutes: { other: "{count} phút" },
    seconds: { other: "{count} giây" },
  },
  carousel: {
    previous: "Trang chiếu trước",
    next: "Trang chiếu sau",
    slide: "{index} trên {count}",
    goTo: "Trang chiếu {index}",
  },
  marquee: { pause: "Tạm dừng", resume: "Tiếp tục" },
  tour: { back: "Quay lại", next: "Tiếp", close: "Đóng", progress: "{step} trên {steps}" },
  floatingPanel: { minimize: "Thu nhỏ", maximize: "Phóng to", restore: "Khôi phục", close: "Đóng" },
  signaturePad: { area: "Chữ ký", clear: "Xóa sạch" },
};
