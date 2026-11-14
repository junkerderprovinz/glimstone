export interface Rule {
  number: number;
  title: string;
  blocks: string[];
}

export const DOC: URL;
export function readRules(markdown?: string): Rule[];
export function citedRules(text: string): { number: number; line: number }[];
export function citedTopics(text: string): { number: number; words: string[]; line: number; cited: string }[];
