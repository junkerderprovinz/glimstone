import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";
import { compileScript, parse } from "vue/compiler-sfc";
import { program } from "./exports.ts";

// A component's surface in words both frameworks share, so the React and the
// Vue twin can be compared field by field. Each framework spells the same thing
// its own way, and the readers below translate:
//
//   React                         Vue
//   value or checked, onChange    v-model (modelValue, update:modelValue)
//   open with onOpenChange        v-model:open
//   onPress                       emit("press"), or an onPress prop
//   children                      the default slot
//   title: ReactNode              a prop or a slot named title
//   drawn, in place of a title    a slot named title
//   renderSelector                a slot named selector
//   ariaPressed, htmlFor, title   an attribute that falls through
//
// className, style and ref fall through to the root element in Vue, so they
// are no part of either surface.

export interface Surface {
  /** Each prop with its default as source text, "" for none. */
  props: Map<string, string>;
  events: Set<string>;
  /** In React the props that take markup, in Vue the slots. */
  slots: Set<string>;
  /** Names an element takes as an attribute, which Vue lets fall through. */
  attributes: Set<string>;
}

const packages = join(import.meta.dirname, "..", "..", "packages");
const passThrough = new Set(["className", "style", "ref", "key"]);
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const event = (prop: string) => lower(prop.slice(2));
const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

// Nothing, false and an empty factory all leave a prop at its zero value, and a
// factory default reads the same as the value it makes.
function normal(text: string) {
  const value = text
    .replace(/^\(\)\s*=>\s*/, "")
    .replace(/^\(([\s\S]*)\)$/, "$1")
    .replace(/\s+/g, " ")
    .replace(/,\s*([\]}])/g, "$1")
    .replace(/'/g, '"');
  return ["false", "undefined", "null"].includes(value) ? "" : value;
}

const ours = (d: ts.Declaration) => resolve(d.getSourceFile().fileName).startsWith(resolve(packages));

let domNames: Set<string> | undefined;
// Every name React takes as an element attribute or a DOM listener.
function attributeNames() {
  if (domNames) return domNames;
  const checker = program().getTypeChecker();
  domNames = new Set();
  for (const file of program().getSourceFiles()) {
    if (!/[\\/]@types[\\/]react[\\/]index\.d\.ts$/.test(file.fileName)) continue;
    const visit = (n: ts.Node) => {
      if (ts.isInterfaceDeclaration(n) && n.name.text === "AllHTMLAttributes") {
        for (const p of checker.getDeclaredTypeOfSymbol(checker.getSymbolAtLocation(n.name)!).getProperties()) domNames!.add(p.name);
      }
      n.forEachChild(visit);
    };
    visit(file);
  }
  return domNames;
}

// React spells an attribute in camel case, `ariaPressed` for `aria-pressed`
// and `htmlFor` for `for`, where Vue writes the attribute itself.
function attribute(name: string) {
  if (name === "htmlFor") return "for";
  if (/^aria[A-Z]/.test(name)) return `aria-${name.slice(4).toLowerCase()}`;
  return name;
}

// onOpenChange, or onShowOthers beside showOthers, hands back the next value
// of the prop it is named after.
function updates(checker: ts.TypeChecker, every: ts.Symbol[], handler: ts.Symbol) {
  const of = handler.name.match(/^on([A-Z]\w*?)(?:Change)?$/)?.[1];
  const prop = of && every.find((p) => p.name === lower(of));
  const [call] = checker.getNonNullableType(checker.getTypeOfSymbol(handler)).getCallSignatures();
  const [arg] = call?.getParameters() ?? [];
  if (!prop || !arg) return false;
  const text = (s: ts.Symbol) => checker.typeToString(checker.getNonNullableType(checker.getTypeOfSymbol(s)));
  return text(arg) === text(prop);
}

const isMarkup = (checker: ts.TypeChecker, type: ts.Type) => /ReactNode|ReactElement|JSX\.Element/.test(checker.typeToString(type));

/** reactSurface reads a component's props from the type of its first parameter. */
export function reactSurface(name: string, file: string): Surface {
  const checker = program().getTypeChecker();
  const source = program().getSourceFile(file)!;
  let fn: ts.FunctionDeclaration | undefined;
  source.forEachChild((n) => {
    if (ts.isFunctionDeclaration(n) && n.name?.text === name) fn = n;
  });
  const surface: Surface = { props: new Map(), events: new Set(), slots: new Set(), attributes: new Set() };
  const param = fn?.parameters[0];
  if (!param) return surface;

  // The defaults stand in the parameter's destructure, or in one of `props`
  // at the top of the body.
  const defaults = new Map<string, string>();
  const read = (pattern: ts.ObjectBindingPattern) => {
    for (const el of pattern.elements) {
      if (el.initializer) defaults.set((el.propertyName ?? el.name).getText(source), el.initializer.getText(source));
    }
  };
  if (ts.isObjectBindingPattern(param.name)) read(param.name);
  else {
    for (const statement of fn!.body?.statements ?? []) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const d of statement.declarationList.declarations) {
        if (ts.isObjectBindingPattern(d.name) && d.initializer?.getText(source) === param.name.getText(source)) read(d.name);
      }
    }
  }
  const every = checker.getTypeAtLocation(param).getProperties();
  // A native input's value is its model, and so is a value of the component's
  // own that a handler hands back. A meter's value or a button's is a prop.
  const native = (p: ts.Symbol) => (p.declarations ?? []).some((d) => /^(Input|Textarea)HTMLAttributes$/.test((d.parent as ts.InterfaceDeclaration).name?.text ?? ""));
  const handsBack = every.some((p) => (p.name === "onChange" || p.name === "onApply") && (p.declarations ?? []).some(ours));
  const model = every.find((p) => (p.name === "value" || p.name === "checked") && (native(p) || handsBack))?.name;
  const dom = attributeNames();
  for (const p of every) {
    const key = p.name;
    if (passThrough.has(key) || key.startsWith("data-")) continue;
    // The model is the model wherever its type comes from, a native input's
    // included. Any other attribute counts only where the component names it.
    const own = (p.declarations ?? []).some(ours);
    if (key === model) surface.props.set("modelValue", normal(defaults.get(key) ?? ""));
    else if (key === "onChange" && model) surface.events.add("update:modelValue");
    if (!own || key === model || (key === "onChange" && model)) continue;

    const type = checker.getNonNullableType(checker.getTypeOfSymbol(p));
    if (dom.has(key) || /^aria[A-Z]/.test(key)) surface.attributes.add(attribute(key));
    if (key === "children") surface.slots.add("default");
    else if (updates(checker, every, p)) surface.events.add(`update:${lower(key.replace(/^on|Change$/g, ""))}`);
    else if (/^on[A-Z]/.test(key) && type.getCallSignatures().length > 0) surface.events.add(event(key));
    else if (/^render[A-Z]/.test(key)) surface.slots.add(lower(key.slice(6)));
    else {
      surface.props.set(key, normal(defaults.get(key) ?? ""));
      if (isMarkup(checker, type)) surface.slots.add(key);
      // Vue cannot hand markup in through an object, so a field of one that
      // takes it, such as version.whatsNew, is a slot of its own there.
      for (const field of type.getProperties()) {
        if (isMarkup(checker, checker.getNonNullableType(checker.getTypeOfSymbol(field)))) surface.slots.add(field.name);
      }
    }
  }
  // An uncontrolled start value, such as defaultOpen, is the default of the
  // model it starts.
  for (const [key, value] of surface.props) {
    const of = key.match(/^default([A-Z]\w*)$/)?.[1];
    if (of && surface.props.has(lower(of))) {
      surface.props.set(lower(of), value);
      surface.props.delete(key);
    }
  }
  return surface;
}

// The props as the library build compiles them, so a default reads the same
// whether it came from withDefaults, a destructure or defineModel.
function compiled(path: string) {
  const src = dirname(path);
  const inside = (p: string) => resolve(p).startsWith(resolve(src)) && existsSync(p);
  const { descriptor } = parse(readFileSync(path, "utf8"), { filename: path });
  const fs = { fileExists: inside, readFile: (p: string) => (inside(p) ? readFileSync(p, "utf8") : undefined) };
  return { code: compileScript(descriptor, { id: path, isProd: true, fs }).content, template: descriptor.template?.content ?? "" };
}

function optionsOf(code: string) {
  const source = ts.createSourceFile("sfc.ts", code, ts.ScriptTarget.Latest, true);
  const found: { props: ts.ObjectLiteralExpression[]; emits: ts.ArrayLiteralExpression[] } = { props: [], emits: [] };
  // _mergeModels(a, b) puts the declared props and the models side by side.
  const parts = (e: ts.Expression): ts.Expression[] => (ts.isCallExpression(e) ? e.arguments.flatMap(parts) : [e]);
  const visit = (n: ts.Node) => {
    if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && (n.name.text === "props" || n.name.text === "emits")) {
      for (const part of parts(n.initializer)) {
        if (n.name.text === "props" && ts.isObjectLiteralExpression(part)) found.props.push(part);
        if (n.name.text === "emits" && ts.isArrayLiteralExpression(part)) found.emits.push(part);
      }
      return;
    }
    n.forEachChild(visit);
  };
  visit(source);
  return { source, ...found };
}

/** vueSurface reads a component's props and emits from its compiled script, and its slots from the template. */
export function vueSurface(path: string): Surface {
  const { code, template } = compiled(path);
  const { source, props, emits } = optionsOf(code);
  const surface: Surface = { props: new Map(), events: new Set(), slots: new Set(), attributes: new Set() };
  for (const object of props) {
    for (const p of object.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const key = p.name.getText(source).replace(/"/g, "");
      if (key.endsWith("Modifiers")) continue;
      // A listener declared as a prop, so the component can tell whether one was passed.
      if (/^on[A-Z]/.test(key) && !/type: Boolean/.test(p.initializer.getText(source))) {
        surface.events.add(event(key));
        continue;
      }
      let value = "";
      if (ts.isObjectLiteralExpression(p.initializer)) {
        for (const o of p.initializer.properties) {
          if (ts.isPropertyAssignment(o) && o.name.getText(source) === "default") value = o.initializer.getText(source);
        }
      }
      surface.props.set(key, normal(value));
    }
  }
  for (const list of emits) {
    for (const e of list.elements) if (ts.isStringLiteral(e)) surface.events.add(e.text.startsWith("update:") ? e.text : camel(e.text));
  }
  for (const m of template.matchAll(/<slot\b([^>]*)>/g)) {
    surface.slots.add(camel(m[1]!.match(/\bname="([\w-]+)"/)?.[1] ?? "default"));
  }
  return surface;
}

/** drift lists every way the Vue twin's surface differs from the React one, empty when they match. */
export function drift(react: Surface, vue: Surface): string[] {
  const out: string[] = [];
  const vueAttribute = (name: string) => react.attributes.has(name) || attributeNames().has(name);
  const unmatched: string[] = [];
  // A text field without a value is empty in both, uncontrolled in React and
  // bound to "" in Vue.
  const zero = (key: string, value = "") => (key === "modelValue" && value === '""' ? "" : value);
  for (const [key, value] of react.props) {
    if (vue.props.has(key)) {
      if (zero(key, vue.props.get(key)) !== zero(key, value)) out.push(`${key} defaults to ${value || "nothing"} in React and ${vue.props.get(key) || "nothing"} in Vue`);
    } else if (react.slots.has(key) && vue.slots.has(key)) continue;
    else if (react.slots.has(key)) unmatched.push(key);
    else if (react.attributes.has(attribute(key))) continue;
    else out.push(`prop ${key} is missing in Vue`);
  }
  // Markup React takes in a prop of its own goes into a slot Vue names another
  // way: a drawn title into the slot of the text it replaces, and the one other
  // piece into the default slot where React has no children.
  const titleSlot = (s: string) => react.props.has("drawn") && react.props.has(s) && !react.slots.has(s);
  const loose = unmatched.filter((key) => key !== "drawn");
  const intoDefault = loose.length === 1 && !react.slots.has("default") && vue.slots.has("default");
  for (const key of unmatched) {
    const placed = key === "drawn" ? [...vue.slots].some(titleSlot) : intoDefault;
    if (!placed) out.push(`prop ${key} is missing in Vue`);
  }
  for (const s of vue.slots) {
    const placed = react.slots.has(s) || titleSlot(s) || (s === "default" && intoDefault);
    if (!placed) out.push(`slot ${s} is missing in React`);
  }
  if (react.slots.has("default") && !vue.slots.has("default")) out.push("the default slot is missing in Vue");

  // A prop Vue declares that is an attribute, such as disabled, React may take
  // from the element's own attributes, and a DOM listener React declares Vue
  // takes as a native one.
  for (const key of vue.props.keys()) if (!react.props.has(key) && !vueAttribute(key)) out.push(`prop ${key} is missing in React`);
  for (const e of react.events) if (!vue.events.has(e) && !react.attributes.has(`on${e.charAt(0).toUpperCase()}${e.slice(1)}`)) out.push(`event ${e} is missing in Vue`);
  // Vue's model is writable, so it reports a change where React's model is a
  // value the app keeps.
  for (const e of vue.events) if (!react.events.has(e) && !(e === "update:modelValue" && react.props.has("modelValue"))) out.push(`event ${e} is missing in React`);
  return out;
}
