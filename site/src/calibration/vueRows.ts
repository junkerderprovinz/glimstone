// The Vue side of the calibration page: each row of the prototype drawn with
// the components, in the same words, so a difference on the page is one of
// look and not of content. The menu and the window are a button each, since
// both take the focus and float over the page.
import { defineComponent, h, ref, type Component } from "vue";
import {
  Button,
  Checkbox,
  ColorPicker,
  ContextMenu,
  CopyField,
  Kbd,
  MenuBar,
  Meter,
  PasswordField,
  Pill,
  ProgressBar,
  Selector,
  Toggle,
  Window,
  type MenuEntry,
} from "@glimstone/vue";
import { Select } from "@glimstone/vue/Select";
import { glyph } from "../vue/glyph";

const col = (width?: string) => ({ display: "grid", gap: "0.75rem", width });
const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" } as const;

function stateful<T>(initial: T, render: (value: { value: T }) => ReturnType<typeof h>): Component {
  return defineComponent({
    setup() {
      const value = ref(initial) as { value: T };
      return () => render(value);
    },
  });
}

const menuItems = (hidden: { value: boolean }): MenuEntry[] => [
  { head: "Datei" },
  { label: "Öffnen", glyph: glyph("IconFolderOpen"), shortcut: "Enter", onSelect: () => {} },
  { label: "Umbenennen", glyph: glyph("IconPencil"), shortcut: "F2", onSelect: () => {} },
  { label: "Einfügen", glyph: glyph("IconPaste"), shortcut: "Strg+V", disabled: true, onSelect: () => {} },
  "-",
  {
    label: "Sortieren nach",
    glyph: glyph("IconSort"),
    sub: ["Name", "Größe", "Datum"].map((label) => ({ label, radio: true, checked: label === "Name", onSelect: () => {} })),
  },
  { label: "Versteckte Dateien", checked: hidden.value, onSelect: () => (hidden.value = !hidden.value) },
  { label: "Dateiendungen", checked: false, onSelect: () => {} },
  { label: "Details", glyph: glyph("IconTabApps"), radio: true, checked: true, onSelect: () => {} },
  { label: "Papierkorb", glyph: glyph("IconTrash"), count: 12, onSelect: () => {} },
];

export const VUE_ROWS: Record<string, Component> = {
  button: () =>
    h("div", { style: row }, [
      h(Button, { label: "Aktualisieren", labelKey: "refresh", glyph: glyph("IconRefresh") }),
      h(Button, { label: "Übernehmen", labelKey: "confirm", glyph: glyph("IconCheck"), tone: "accent" }),
      h(Button, { label: "Kopieren", labelKey: "copy", glyph: glyph("IconCopy"), variant: "icon" }),
      h(Button, { label: "Löschen", labelKey: "delete", glyph: glyph("IconTrash"), disabled: true }),
    ]),
  switch: stateful({ hidden: true, ext: false }, (s) =>
    h("div", { style: col("20rem") }, [
      h(Toggle, { label: "Versteckte Dateien", modelValue: s.value.hidden, "onUpdate:modelValue": (v: boolean) => (s.value = { ...s.value, hidden: v }) }),
      h(Toggle, { label: "Dateiendungen", modelValue: s.value.ext, "onUpdate:modelValue": (v: boolean) => (s.value = { ...s.value, ext: v }) }),
    ]),
  ),
  selector: stateful("details", (s) =>
    h(Selector, {
      label: "Ansicht",
      items: [
        { id: "details", label: "Details", glyph: glyph("IconTabApps") },
        { id: "list", label: "Liste", glyph: glyph("IconTabGeneral") },
        { id: "tiles", label: "Kacheln", glyph: glyph("IconFolderOpen") },
      ],
      size: "md",
      modelValue: s.value,
      "onUpdate:modelValue": (v: string) => (s.value = v),
    }),
  ),
  dropdown: stateful<string | null>("name", (s) =>
    h("div", { style: { width: "12rem" } }, [
      h(Select, {
        label: "Sortieren nach",
        options: [
          { value: "name", label: "Name" },
          { value: "size", label: "Größe" },
          { value: "date", label: "Datum" },
        ],
        modelValue: s.value,
        "onUpdate:modelValue": (v: string | null) => (s.value = v),
      }),
    ]),
  ),
  field: () => h("input", { class: "glim-input", value: "Urlaub 2026", "aria-label": "Name", style: { width: "22rem" } }),
  password: stateful("geheim123", (s) =>
    h(PasswordField, {
      modelValue: s.value,
      "onUpdate:modelValue": (v: string) => (s.value = v),
      "aria-label": "Passwort",
      text: { show: "Anzeigen", hide: "Verbergen" },
      style: { width: "22rem" },
    }),
  ),
  copy: () =>
    h(CopyField, {
      label: "Adresse",
      value: "smb://bottich/media/filme",
      text: { copy: "Kopieren", copied: "Kopiert" },
      style: { width: "24.4rem" },
    }),
  menu: defineComponent({
    setup() {
      const at = ref<{ x: number; y: number; opener: HTMLElement } | null>(null);
      const hidden = ref(true);
      return () =>
        h("div", [
          h(Button, {
            label: "Menü öffnen",
            labelKey: null,
            onClick: (e: MouseEvent) => {
              const opener = e.currentTarget as HTMLElement;
              const r = opener.getBoundingClientRect();
              at.value = at.value ? null : { x: r.left, y: r.bottom + 6, opener };
            },
          }),
          at.value &&
            h(ContextMenu, { x: at.value.x, y: at.value.y, opener: at.value.opener, items: menuItems(hidden), onClose: () => (at.value = null) }),
        ]);
    },
  }),
  menubar: () =>
    h(MenuBar, {
      label: "Menü",
      menus: ["Datei", "Bearbeiten", "Ansicht", "Hilfe"].map((label) => ({
        label,
        items: [{ label: "Öffnen", glyph: glyph("IconFolderOpen"), onSelect: () => {} }],
      })),
    }),
  window: defineComponent({
    setup() {
      const open = ref(false);
      const size = ref(true);
      const changed = ref(false);
      return () =>
        h("div", [
          h(Button, { label: "Fenster öffnen", labelKey: null, onClick: () => (open.value = true) }),
          open.value &&
            h(
              Window,
              {
                title: "Spalten",
                start: "Ziehen ändert die Reihenfolge",
                text: { cancel: "Abbrechen", close: "Schließen" },
                actions: [{ label: "Übernehmen", labelKey: "confirm", glyph: glyph("IconCheck"), primary: true }],
                onClose: () => (open.value = false),
              },
              () =>
                h("div", { class: "glim-well", style: { display: "grid", gap: "0.6rem", padding: "0.85rem 0.9rem" } }, [
                  h(Toggle, { label: "Größe", modelValue: size.value, "onUpdate:modelValue": (v: boolean) => (size.value = v) }),
                  h(Toggle, { label: "Geändert", modelValue: changed.value, "onUpdate:modelValue": (v: boolean) => (changed.value = v) }),
                ]),
            ),
        ]);
    },
  }),
  checkbox: stateful({ size: true, changed: false }, (s) =>
    h("div", { style: { display: "grid", gap: "0.25rem" } }, [
      h(Checkbox, { label: "Größe", modelValue: s.value.size, "onUpdate:modelValue": (v: boolean) => (s.value = { ...s.value, size: v }) }),
      h(Checkbox, { label: "Geändert", modelValue: s.value.changed, "onUpdate:modelValue": (v: boolean) => (s.value = { ...s.value, changed: v }) }),
      h(Checkbox, { label: "Name", modelValue: true, disabled: true }),
    ]),
  ),
  kbd: () => h("div", { style: row }, [h(Kbd, () => "Strg+K"), h(Kbd, () => "F2"), h(Kbd, () => "Entf")]),
  pill: () =>
    h("div", { style: row }, [
      h(Pill, { class: "glim-num" }, () => "4,2 GB"),
      h(Pill, { tone: "state" }, () => "läuft"),
      h(Pill, { tone: "ok" }, () => "fertig"),
      h(Pill, { tone: "warn" }, () => "wartet"),
      h(Pill, { tone: "fail" }, () => "Fehler"),
    ]),
  meter: () =>
    h("div", { style: col("20rem") }, [
      h("div", { style: row }, ["disk1 ", h(Meter, { size: "small", value: 0.42, label: "disk1" })]),
      h("div", { style: row }, ["cache ", h(Meter, { size: "small", value: 0.95, label: "cache" })]),
      h(Meter, { value: 0.31, label: "media" }),
      h(Meter, { value: 0.92, label: "backups" }),
    ]),
  footmeter: () =>
    h("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", width: "22rem", fontSize: "12px", color: "var(--carbon-text-muted)" } }, [
      h("span", "3 Elemente"),
      h("span", { style: { flex: 1 } }),
      h("button", { type: "button", class: "demo-footer-line" }, ["1,4 TB frei", h(Meter, { quiet: true, size: "small", value: 0.66, label: "disk1" })]),
    ]),
  rowcheck: stateful(new Set(["thumbs.db"]), (s) =>
    h(
      "div",
      { style: { display: "grid", gap: "2px", width: "18rem", fontSize: "13px" } },
      ["thumbs.db", "desktop.ini", "old-cache.tmp"].map((name) =>
        h("div", { class: "demo-dense-row", style: { height: "2.25rem" } }, [
          h(Checkbox, {
            slim: true,
            label: name,
            modelValue: s.value.has(name),
            "onUpdate:modelValue": (on: boolean) => {
              const next = new Set(s.value);
              if (on) next.add(name);
              else next.delete(name);
              s.value = next;
            },
          }),
          name,
        ]),
      ),
    ),
  ),
  progress: () =>
    h("div", { style: col("22rem") }, [h(ProgressBar, { value: 0.62, label: "Kopieren" }), h(ProgressBar, { value: 0.4, label: "Hochladen" })]),
  colour: stateful("#1b6b73", (s) =>
    h("div", { class: "glim-card", style: { padding: "0.8rem", width: "18.5rem" } }, [
      h(ColorPicker, {
        modelValue: s.value,
        "onUpdate:modelValue": (v: string) => (s.value = v),
        text: { apply: "Übernehmen", hex: "Farbwert", area: "Sättigung und Helligkeit", hue: "Farbton" },
      }),
    ]),
  ),
};
