// The words of a FileUpload and the size of a file in them. Zag's file-upload
// machine takes the drop, the picker and the checks; an app passes its own
// words, and a refused file is named with the reason it was refused.

/** Why a file was refused, as Zag's machine names it. */
export type FileRefusal = "TOO_MANY_FILES" | "FILE_INVALID_TYPE" | "FILE_TOO_LARGE" | "FILE_TOO_SMALL" | "FILE_INVALID" | "FILE_EXISTS";

export interface FileUploadText {
  /** The words in the drop zone, which is also the button that opens the picker. */
  drop: string;
  /** The name of a file's remove button. */
  remove: (name: string) => string;
  /** The line under the list for a file that was refused. */
  refused: (name: string, reason: FileRefusal) => string;
}

export const FILE_UPLOAD_TEXT: FileUploadText = {
  drop: "Drop files here or choose them",
  remove: (name) => `Remove ${name}`,
  refused: (name, reason) =>
    ({
      TOO_MANY_FILES: `${name} is one file too many`,
      FILE_INVALID_TYPE: `${name} is not a kind of file this takes`,
      FILE_TOO_LARGE: `${name} is too large`,
      FILE_TOO_SMALL: `${name} is too small`,
      FILE_INVALID: `${name} cannot be read`,
      FILE_EXISTS: `${name} is already in the list`,
    })[reason],
};

const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

/** A file's size in the largest unit that keeps it at one or more, in the page's language. */
export function formatFileSize(bytes: number, locale?: string): string {
  let unit = 0;
  let value = bytes;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit++;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: UNITS[unit],
    unitDisplay: "short",
    maximumFractionDigits: unit === 0 || value >= 100 ? 0 : 1,
  }).format(value);
}
