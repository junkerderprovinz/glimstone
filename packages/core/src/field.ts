// The text field and the row a control stands in ("A dropdown or a one-line
// field stands beside its label", rule 35).

/**
 * How wide a field is. `fill` takes its column. `short` holds a port or a time,
 * `medium` a word, `wide` a line of text, and `grow` takes what its row has left.
 */
export type FieldWidth = "fill" | "short" | "medium" | "wide" | "grow";

/** The class of a width, for a text field or any wrapper that carries one. */
export function fieldWidthClass(width: FieldWidth = "fill"): string {
  return width === "fill" ? "" : `glim-field--${width}`;
}

/** The classes of a text field or a text area. */
export function textFieldClass({ width, mono, area }: { width?: FieldWidth; mono?: boolean; area?: boolean }): string {
  return ["glim-input", area && "glim-input--area", mono && "glim-input--mono", fieldWidthClass(width)].filter(Boolean).join(" ");
}

/** Below this width a PathField's button shows its glyph alone and leaves the room to the path. */
export const PATH_ROOM_PX = 320;

const FIELD = 'input:not([type="hidden"]), textarea, [role="spinbutton"]';
const PRESSABLE = '[role="switch"], [role="checkbox"], .glim-select-trigger';

/**
 * What a click on a row's label does, as a real label would: a field takes the
 * focus and a switch flips. A selector stays as it is, since no one segment is
 * the row's.
 */
export function pressRowControl(row: HTMLElement): void {
  const control = row.querySelector<HTMLElement>(`${FIELD}, ${PRESSABLE}`);
  if (control?.matches(FIELD)) control.focus();
  else control?.click();
}

// What a press on a row's own ground leaves alone, since it has its own answer.
const OWN_PRESS = "button, a, input, textarea, select, label, [role], [tabindex], .glim-field-row-label, .glim-toggle-label";

/**
 * What a press anywhere on a row with a switch does: the switch flips, as a
 * settings row on a phone does. A press on a control of its own or on the
 * label, which pressRowControl answers, is left alone.
 */
export function pressRowSwitch(row: HTMLElement, target: EventTarget | null): void {
  const sw = row.querySelector<HTMLElement>('[role="switch"]');
  const own = target instanceof Element ? target.closest(OWN_PRESS) : null;
  if (sw && !(own && row.contains(own))) sw.click();
}

/**
 * Keeps data-stacked on a row while its control has dropped under its name,
 * so the stylesheet lets the control take the whole line there instead of the
 * width it has beside the name. Returns the teardown.
 */
export function watchRowStack(row: HTMLElement): () => void {
  const check = () => {
    const name = row.firstElementChild;
    const next = name?.nextElementSibling;
    row.toggleAttribute("data-stacked", !!name && !!next && next.getBoundingClientRect().top >= name.getBoundingClientRect().bottom);
  };
  const watch = new ResizeObserver(check);
  watch.observe(row);
  return () => watch.disconnect();
}

/**
 * Grows a text area with its text where the browser cannot size a field by
 * its content. The stylesheet's lines from three to ten still bound it, and a
 * text area that keeps its corner grip keeps its height to the person.
 */
export function fitTextArea(area: HTMLTextAreaElement | null): void {
  if (!area || CSS.supports("field-sizing", "content") || getComputedStyle(area).resize !== "none") return;
  area.style.height = "auto";
  area.style.height = `${area.scrollHeight + area.offsetHeight - area.clientHeight}px`;
}
