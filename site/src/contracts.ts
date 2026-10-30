// What each component promises to do, row by row. The site draws these as the
// behaviour table, and tests/contracts.spec.ts checks every row by its id.

export interface Row {
  id: string;
  keys?: string[];
  when: string;
  then: string;
}

export interface Contract {
  /** The WAI-ARIA Authoring Practices pattern the rows follow. */
  pattern?: { name: string; url: string };
  rows: Row[];
}

const APG = "https://www.w3.org/WAI/ARIA/apg/patterns/";

export const CONTRACTS: Record<string, Contract> = {
  Button: {
    pattern: { name: "Button", url: `${APG}button/` },
    rows: [
      { id: "button-keys", keys: ["Enter", "Space"], when: "The button has focus", then: "It acts, once per press." },
      { id: "button-name", when: "The label mode hides the words", then: "The label stays the accessible name." },
      { id: "button-width", when: "The label mode changes", then: "The button keeps its width to the pixel." },
      { id: "button-busy", when: "busy turns on", then: "The width stays and the button announces it is busy." },
    ],
  },
  Toggle: {
    pattern: { name: "Switch", url: `${APG}switch/` },
    rows: [
      { id: "toggle-role", when: "Always", then: "role=\"switch\" with aria-checked matching the state." },
      { id: "toggle-space", keys: ["Space"], when: "The switch has focus", then: "It flips." },
      { id: "toggle-enter", keys: ["Enter"], when: "The switch has focus", then: "It flips." },
      { id: "toggle-name", when: "Always", then: "The label is the accessible name, also with hideLabel." },
      { id: "toggle-disabled", when: "The switch is disabled", then: "A click changes nothing." },
    ],
  },
  ConfirmDialog: {
    pattern: { name: "Dialog (modal)", url: `${APG}dialog-modal/` },
    rows: [
      { id: "dialog-role", when: "The window is open", then: "role=\"dialog\", aria-modal, named by its title, described by its message." },
      { id: "dialog-focus", when: "The window opens", then: "Focus lands on Cancel." },
      { id: "dialog-escape", keys: ["Escape"], when: "The window is open", then: "It cancels." },
      { id: "dialog-trap", keys: ["Tab", "Shift+Tab"], when: "Focus is on the last or first control", then: "Focus wraps inside the window." },
      { id: "dialog-return", when: "The window closes", then: "Focus goes back to the control that opened it." },
      { id: "dialog-backdrop", when: "A click lands outside the window", then: "It cancels." },
    ],
  },
  DropdownListbox: {
    pattern: { name: "Listbox", url: `${APG}listbox/` },
    rows: [
      { id: "list-open-focus", when: "The list opens", then: "Focus is on the selected option." },
      { id: "list-arrows", keys: ["ArrowDown", "ArrowUp"], when: "An option has focus", then: "Focus moves to the next or previous option." },
      { id: "list-home-end", keys: ["Home", "End"], when: "An option has focus", then: "Focus moves to the first or last option." },
      { id: "list-typeahead", keys: ["a-z"], when: "An option has focus", then: "Focus jumps to the next option starting with the letter." },
      { id: "list-escape", keys: ["Escape"], when: "The list is open", then: "It closes and focus returns to the trigger." },
      { id: "list-outside", when: "A click lands outside", then: "It closes." },
    ],
  },
  Select: {
    pattern: { name: "Select-only combobox", url: `${APG}combobox/examples/combobox-select-only/` },
    rows: [
      { id: "select-open-focus", keys: ["Enter", "Space", "ArrowDown"], when: "The trigger has focus", then: "The list opens on the selected option." },
      { id: "select-arrows", keys: ["ArrowDown", "ArrowUp"], when: "The list is open", then: "The highlight moves to the next or previous option." },
      { id: "select-home-end", keys: ["Home", "End"], when: "The list is open", then: "The highlight moves to the first or last option." },
      { id: "select-typeahead", keys: ["a-z"], when: "The list is open or closed", then: "The highlight jumps to the next option starting with the letter." },
      { id: "select-enter", keys: ["Enter"], when: "An option is highlighted", then: "It is chosen and the list closes." },
      { id: "select-escape", keys: ["Escape"], when: "The list is open", then: "It closes and focus stays on the trigger." },
      { id: "select-outside", when: "A click lands outside", then: "It closes." },
      { id: "select-scroll-away", when: "The page scrolls or resizes outside the open list", then: "It closes." },
      { id: "select-groups", when: "The list has groups", then: "A group with a heading is role=\"group\" named by its heading, and the arrows run through every group." },
      { id: "select-wheel", keys: ["Wheel"], when: "The closed trigger has focus", then: "The value steps to the next or previous option, skipping disabled ones and stopping at both ends." },
      { id: "select-wheel-hover", keys: ["Wheel"], when: "The pointer is over a trigger that does not have focus", then: "The value stays." },
      { id: "select-placeholder", when: "The value is null", then: "The trigger shows the placeholder and no option is ticked." },
      { id: "select-busy", keys: ["Enter", "Wheel"], when: "busy is on", then: "The trigger keeps its focus and changes nothing." },
      { id: "select-shake", when: "shake goes up", then: "The trigger shakes once." },
      { id: "select-tip", when: "A trigger with a tip gets focus", then: "The tip shows in the house bubble." },
      { id: "select-widths", when: "The value changes", then: "steady keeps its width, hug follows the value, squeeze gives way to its row and fill takes it." },
      { id: "select-sizes", when: "size is row or inset", then: "row keeps the field's height in small type, inset is 1.5rem tall, and both stay steady." },
      { id: "select-min-width", when: "The trigger is narrower than 13rem", then: "The open list is still 13rem wide." },
      { id: "select-label-for", when: "The select has an id and a ref", then: "A <label htmlFor> outside it names the trigger, and the ref reaches the trigger." },
      { id: "select-wrap", when: "wrap is on and the value is longer than the trigger", then: "The value runs onto a second line and nothing is cut." },
      { id: "select-submenu-home", when: "A list with submenus opens", then: "The highlight is on the row whose submenu holds the value." },
      { id: "select-submenu-open", keys: ["ArrowRight"], when: "A row with a submenu is highlighted", then: "Its list opens beside the row." },
      { id: "select-submenu-back", keys: ["ArrowLeft"], when: "A submenu is open", then: "It closes and the highlight goes back to its row." },
      { id: "select-submenu-pick", keys: ["Enter"], when: "An option in a submenu is highlighted", then: "It is chosen, every list closes and focus is on the trigger." },
      { id: "select-rtl", when: "The page runs right to left", then: "The list lines up with the trigger's right edge, and ArrowLeft opens a submenu to the left." },
      { id: "select-reduced-motion", when: "The system asks for reduced motion", then: "The list appears without a fade." },
      { id: "select-touch", when: "The pointer is a finger", then: "A tap opens the list and every row is at least 44px tall." },
      { id: "select-vanilla", when: "It is mounted without a framework", then: "It has the same groups and answers the wheel." },
    ],
  },
  Combobox: {
    pattern: { name: "Combobox", url: `${APG}combobox/` },
    rows: [
      { id: "combo-filter", when: "Somebody types", then: "The list opens and shows only matching entries." },
      { id: "combo-pick", keys: ["ArrowDown", "Enter"], when: "The list is open", then: "The highlighted entry fills the field." },
      { id: "combo-active", when: "An entry is highlighted", then: "The field points at it with aria-activedescendant; focus stays in the field." },
      { id: "combo-escape", keys: ["Escape"], when: "The list is open", then: "It closes." },
      { id: "combo-empty", when: "Nothing matches", then: "The list says so instead of vanishing." },
    ],
  },
  Slider: {
    pattern: { name: "Slider", url: `${APG}slider/` },
    rows: [
      { id: "slider-role", when: "Always", then: "role=\"slider\" with aria-valuenow, -min, -max and a readable aria-valuetext." },
      { id: "slider-arrows", keys: ["ArrowRight", "ArrowLeft"], when: "The thumb has focus", then: "The value moves by one step." },
      { id: "slider-page", keys: ["PageUp", "PageDown"], when: "The thumb has focus", then: "The value moves by a large step, ten by default." },
      { id: "slider-home-end", keys: ["Home", "End"], when: "The thumb has focus", then: "The value jumps to the minimum or maximum." },
    ],
  },
  InfoBubble: {
    pattern: { name: "Tooltip", url: `${APG}tooltip/` },
    rows: [
      { id: "bubble-focus", keys: ["Tab"], when: "The (i) receives keyboard focus", then: "The bubble opens." },
      { id: "bubble-hover", when: "The pointer rests on the (i)", then: "The bubble opens." },
      { id: "bubble-escape", keys: ["Escape"], when: "The bubble is open", then: "It closes and focus stays on the (i)." },
      { id: "bubble-described", when: "The bubble is open", then: "role=\"tooltip\", and the (i) points at it with aria-describedby." },
      { id: "bubble-viewport", when: "The (i) sits at the window edge", then: "The bubble stays fully inside the window." },
    ],
  },
  IconTipButton: {
    rows: [
      { id: "icontip-name", when: "Always", then: "The tip is the accessible name." },
      { id: "icontip-focus", keys: ["Tab"], when: "The button receives keyboard focus", then: "The tip shows in the house bubble, not the browser's." },
    ],
  },
  Toast: {
    rows: [
      { id: "toast-roles", when: "A toast appears", then: "A failure is role=\"alert\", a success role=\"status\"." },
      { id: "toast-expire", when: "Nobody touches it", then: "It leaves after four seconds." },
      { id: "toast-pause", when: "The pointer rests on it", then: "It stays, and the time left is kept." },
      { id: "toast-dismiss", when: "The dismiss button is pressed", then: "Only that toast leaves." },
    ],
  },
  WindowBar: {
    rows: [
      { id: "window-name", when: "Always", then: "The bar is named after the app, shows no text and holds three buttons." },
      { id: "window-order", keys: ["Tab"], when: "Focus is in the bar", then: "It moves from Minimise to Maximise to Close." },
      { id: "window-keys", keys: ["Enter", "Space"], when: "A button has focus", then: "It acts, once per press." },
      { id: "window-restore", when: "The window is maximised", then: "The middle button is named Restore." },
      { id: "window-tip", keys: ["Tab"], when: "A button receives keyboard focus", then: "Its name shows in the house bubble." },
      { id: "window-drag", when: "A press on the bar starts to move", then: "The window moves; a press that does not move stays a click." },
      { id: "window-drag-button", when: "A press on a button moves", then: "The window stays where it is." },
      { id: "window-dblclick", when: "The bar is double-clicked", then: "The window maximises or restores; a double click on a button does not." },
    ],
  },
};
