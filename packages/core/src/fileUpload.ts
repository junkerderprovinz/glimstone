// The words of a FileUpload and the size of a file in them. Zag's file-upload
// machine takes the drop, the picker and the checks; an app passes its own
// words, and a refused file is named with the reason it was refused.

import { en } from "./componentLocales/en.ts";
import type { ComponentWords } from "./componentWords.ts";
import { fill } from "./fortressText.ts";

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

/** The words of a FileUpload from a language's table, its counts in that language's digits. */
export function fileUploadText(w: ComponentWords["fileUpload"], lang: string): FileUploadText {
  return {
    drop: w.drop,
    remove: (name) => fill(w.remove, { name }),
    refused: (name, reason) => fill(w.refused[reason], { name }),
  };
}

export const FILE_UPLOAD_TEXT: FileUploadText = fileUploadText(en.fileUpload, "en");

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
