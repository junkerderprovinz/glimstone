// Reads the translation tables out of a locale source without running it: a
// TypeScript or JavaScript module with one object literal per language, a JSON
// file, or a Flutter ARB file. Only keys whose value is plain text are kept,
// since a function or an interpolated template has no fixed words to check.

const PUNCT = new Set(['{', '}', '[', ']', '(', ')', ':', ',', ';', '+', '=', '.', '<', '>', '?', '!', '&', '|']);
const BEFORE_REGEX = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', 'return', 'typeof']);

function tokenize(text) {
  const tokens = [];
  let i = 0;
  let line = 1;
  const push = (type, value, at) => tokens.push({ type, value, line: at });
  while (i < text.length) {
    const c = text[i];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end < 0 ? text.length : end + 2;
      for (; i < stop; i++) if (text[i] === '\n') line++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const at = line;
      let value = '';
      let plain = true;
      i++;
      while (i < text.length && text[i] !== c) {
        const ch = text[i];
        if (ch === '\n') line++;
        if (ch === '\\') {
          const [decoded, used] = unescape(text, i);
          if (text[i + 1] === '\n') line++;
          value += decoded;
          i += used;
          continue;
        }
        if (c === '`' && ch === '$' && text[i + 1] === '{') plain = false;
        value += ch;
        i++;
      }
      i++;
      push(c === '`' ? 'template' : 'string', plain ? value : null, at);
      continue;
    }
    if (c === '/') {
      const prev = tokens[tokens.length - 1];
      if (!prev || BEFORE_REGEX.has(prev.value)) {
        i = skipRegex(text, i);
        push('regex', null, line);
        continue;
      }
    }
    const word = /^[\p{L}\p{N}_$]+/u.exec(text.slice(i, i + 200));
    if (word) {
      push(/^\d/.test(word[0]) ? 'number' : 'ident', word[0], line);
      i += word[0].length;
      continue;
    }
    push(PUNCT.has(c) ? 'punct' : 'other', c, line);
    i++;
  }
  return tokens;
}

function unescape(text, i) {
  const n = text[i + 1];
  const simple = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' };
  if (n in simple) return [simple[n], 2];
  if (n === 'u' && text[i + 2] === '{') {
    const end = text.indexOf('}', i + 3);
    return [String.fromCodePoint(parseInt(text.slice(i + 3, end), 16)), end - i + 1];
  }
  if (n === 'u') return [String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16)), 6];
  if (n === 'x') return [String.fromCharCode(parseInt(text.slice(i + 2, i + 4), 16)), 4];
  if (n === '\n') return ['', 2];
  return [n, 2];
}

function skipRegex(text, i) {
  let inClass = false;
  for (i++; i < text.length; i++) {
    const c = text[i];
    if (c === '\\') { i++; continue; }
    if (c === '\n') return i;
    if (c === '[') inClass = true;
    else if (c === ']') inClass = false;
    else if (c === '/' && !inClass) break;
  }
  i++;
  while (/[a-z]/.test(text[i] ?? '')) i++;
  return i;
}

const OPEN = { '{': '}', '[': ']', '(': ')' };

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.at = 0;
  }
  peek(ahead = 0) { return this.tokens[this.at + ahead]; }
  next() { return this.tokens[this.at++]; }
  is(value, ahead = 0) { return this.peek(ahead)?.value === value && this.peek(ahead).type === 'punct'; }

  // Skips one expression, stopping before the comma or bracket that ends it.
  skipExpression() {
    const stack = [];
    while (this.peek()) {
      const t = this.peek();
      if (t.type === 'punct') {
        if (stack.length === 0 && (t.value === ',' || t.value === '}' || t.value === ']' || t.value === ')' || t.value === ';')) return;
        if (OPEN[t.value]) stack.push(OPEN[t.value]);
        else if (t.value === stack[stack.length - 1]) stack.pop();
      }
      this.next();
    }
  }

  readObject(prefix, into) {
    this.next();
    while (this.peek() && !this.is('}')) {
      if (this.is(',')) { this.next(); continue; }
      if (this.is('.') && this.is('.', 1) && this.is('.', 2)) { this.skipExpression(); continue; }
      const keyToken = this.next();
      if (!['string', 'ident', 'number'].includes(keyToken.type) || keyToken.value === null || !this.is(':')) {
        this.skipExpression();
        continue;
      }
      this.next();
      const key = prefix + keyToken.value;
      if (this.is('{')) {
        this.readObject(key + '.', into);
        continue;
      }
      const value = this.readText();
      if (value !== null && (this.is(',') || this.is('}'))) into.push({ key, value, line: keyToken.line });
      else this.skipExpression();
    }
    this.next();
  }

  // Reads a string, or strings joined by +, and answers null for anything else.
  readText() {
    let value = '';
    for (;;) {
      const t = this.peek();
      if (!t || (t.type !== 'string' && t.type !== 'template') || t.value === null) return null;
      value += t.value;
      this.next();
      if (!this.is('+')) return value;
      this.next();
    }
  }
}

/**
 * readLocaleText returns the tables a locale source holds, each as its
 * constant's name (null for JSON and a default export) and its entries in
 * file order, with the line every key sits on.
 */
export function readLocaleText(text, { json = false } = {}) {
  const r = new Reader(tokenize(text));
  const tables = [];
  const read = (name) => {
    const entries = [];
    r.readObject('', entries);
    tables.push({ name, entries: json ? entries.filter((e) => !e.key.startsWith('@')) : entries });
  };
  if (json) {
    while (r.peek() && !r.is('{')) r.next();
    if (r.peek()) read(null);
    return tables;
  }
  let depth = 0;
  while (r.peek()) {
    const t = r.next();
    if (t.type === 'punct') {
      if (OPEN[t.value]) depth++;
      else if (t.value === '}' || t.value === ']' || t.value === ')') depth--;
      continue;
    }
    if (depth !== 0 || t.type !== 'ident') continue;
    if (t.value === 'default' && r.is('{')) { read(null); continue; }
    if (!['const', 'let', 'var'].includes(t.value) || r.peek()?.type !== 'ident') continue;
    const name = r.next().value;
    let angle = 0;
    while (r.peek() && !(angle === 0 && (r.is('=') || r.is(';')))) {
      if (r.is('<')) angle++;
      else if (r.is('>')) angle--;
      r.next();
    }
    if (r.is('=') && r.is('{', 1)) {
      r.next();
      read(name);
    }
  }
  return tables;
}
