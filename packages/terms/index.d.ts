export type Gender = 'm' | 'f' | 'n' | 'c';
export type StemMode = 'start' | 'inside' | 'whole';

export interface Entry {
  singular: string;
  plural: string;
  gender?: Gender;
  stems?: string[];
  forbidden?: string[];
  stemsAt?: StemMode;
}

export interface Language {
  name: string;
  stems: StemMode;
  genders: Gender[];
}

export type Term = { definition: string; enforce?: false } & { [lang: string]: Entry };

export interface Glossary {
  languages: Record<string, Language>;
  terms: Record<string, Term>;
}

export interface Located {
  value: string;
  file: string;
  line: number;
}

export type Tables = Record<string, Record<string, Located>>;

export interface Break {
  kind: 'missing' | 'forbidden';
  lang: string;
  key: string;
  term: string;
  file: string;
  line: number;
  text: string;
  word?: string;
}

export interface CheckOptions {
  ignore?: string[];
  terms?: string[];
}

export declare const glossary: Glossary;
export declare function checkLocales(paths: string[], options?: CheckOptions): Break[];
export declare function checkTables(tables: Tables, options: CheckOptions & { glossary: Glossary }): Break[];
export declare function matchesStems(text: string, stems: string[], mode?: StemMode): boolean;
export declare function matchesForbidden(text: string, word: string): boolean;
export declare function fold(text: string): string;
export declare function readLocales(paths: string[], languages: Record<string, unknown>): Tables;
export declare function languageOf(name: string | null, file: string, languages: Record<string, unknown>): string | null;
export declare function readLocaleText(text: string, options?: { json?: boolean }): { name: string | null; entries: { key: string; value: string; line: number }[] }[];
