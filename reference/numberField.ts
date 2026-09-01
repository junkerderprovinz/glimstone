// The number field: no native spinner, two steppers of our own inside the box.
//
// The design language already carries the rule (docs/design-language.md, "Never
// a native number spinner either" and the bullet after it). This is the working
// piece, because that rule was written twice and got it wrong once, and prose
// alone did not stop the wrong version from shipping:
//
//   1.5.1 said the browser's arrows go. Correct and incomplete — a number field
//         wants a way to nudge it without typing, and on a touch screen that is
//         the only comfortable way to reach 5 from 4. What came back one release
//         later was three words: "jetzt sind keine pfeiltasten mehr da".
//   1.6.x replaced them with two filled squares BESIDE the field, in the page's
//         own surface token. That turned one control into three objects in a
//         row and re-imported the exact property the original complaint was
//         about, only in our own colours. The complaint had never been "there
//         are arrows". It was "sie haben einen dunklen hintergrund und der text
//         ist zu nah an diesen pfeilen".
//
// So the shape of the answer is fixed, and both halves matter equally:
//
//   · A stepper is PART OF THE FIELD, not a control beside it. It sits inside
//     the field's own box and has no ground of its own — `background: none`,
//     and only the ink changes on hover.
//   · The field carries enough inline padding that the digits never run
//     underneath the arrows. That is the second half of the original sentence
//     and it is the half people forget.
//
// This file stays framework-free like the rest of reference/: it attaches to a
// plain `<input type="number">` and returns a teardown. A React app wraps it in
// a ref effect; anything else calls it directly.

/** Everything the field needs from its host, all optional. */
export interface NumberFieldOptions {
  /**
   * Class put on each arrow button. Defaults to none: the CSS in tokens.css
   * (`.glim-num-step`) is enough, and an app that wants a different ink hands
   * its own class in rather than fighting a specificity war.
   */
  buttonClass?: string;
}

// No labels option, and that is a decision rather than an omission. The arrows
// are aria-hidden and tabIndex=-1, so nobody using a keyboard or a screen
// reader ever reaches them — which leaves a `title` doing only one thing:
// painting the OS balloon this design language spends a section rejecting
// everywhere else. A chevron inside a number field, beside that field's own
// label, is not a control anybody has to be told about. An app that adds one
// anyway is adding an untranslated string too.

/**
 * The value a step would produce, without applying it.
 *
 * Exported because the disabled state needs it and because it is the one piece
 * worth testing on its own: `stepUp()` throws on a bad value and silently
 * clamps at the ends, so asking "would this move" has to be answerable without
 * moving anything.
 */
export function wouldStep(input: HTMLInputElement, direction: 1 | -1): boolean {
  const step = Number(input.step) || 1;
  const raw = input.value === "" ? Number(input.min) || 0 : Number(input.value);
  if (!Number.isFinite(raw)) return true; // unparseable: let the browser decide
  const next = raw + direction * step;
  const min = input.min === "" ? -Infinity : Number(input.min);
  const max = input.max === "" ? Infinity : Number(input.max);
  return direction > 0 ? next <= max : next >= min;
}

/**
 * Give one `<input type="number">` a pair of in-field steppers.
 *
 * The input is wrapped in a relatively-positioned span, so the arrows can be
 * absolutely placed inside the field's box without the host having to change
 * its own layout. Returns a teardown that unwraps cleanly.
 *
 * The buttons drive `stepUp()`/`stepDown()` rather than writing the value
 * themselves, so min/max/step live in exactly one place — the markup — and the
 * browser's own clamping applies. The `input` and `change` events are then
 * dispatched by hand, because `stepUp()` deliberately fires neither, and a
 * field that saves on change would otherwise save everything except the arrows.
 */
export function attachNumberSteppers(
  input: HTMLInputElement,
  options: NumberFieldOptions = {},
): () => void {
  const doc = input.ownerDocument;

  const wrap = doc.createElement("span");
  wrap.className = "glim-num-wrap";
  input.parentNode?.insertBefore(wrap, input);
  wrap.appendChild(input);
  input.classList.add("glim-num-input");

  const stack = doc.createElement("span");
  stack.className = "glim-num-steppers";
  // Not focusable and not announced: the input itself already carries the
  // value, the range and the arrow keys. These are a pointer convenience, and
  // a screen reader that met them would hear a third control that changes the
  // same number for no reason.
  stack.setAttribute("aria-hidden", "true");

  const make = (direction: 1 | -1, glyph: string) => {
    const b = doc.createElement("button");
    b.type = "button"; // inside a form, a bare <button> submits it
    b.className = "glim-num-step" + (options.buttonClass ? ` ${options.buttonClass}` : "");
    b.tabIndex = -1;
    b.innerHTML = glyph;
    b.addEventListener("mousedown", (e) => e.preventDefault()); // keep focus in the field
    b.addEventListener("click", () => {
      if (input.disabled || input.readOnly) return;
      if (direction > 0) input.stepUp();
      else input.stepDown();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
    });
    return b;
  };

  // Chevrons, drawn rather than typed: an arrow CHARACTER inherits the font and
  // the OS glyph, which is the same mistake as the native widget one size down.
  const up = make(1, '<svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 5 L5 1 L9 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  const down = make(-1, '<svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M1 1 L5 5 L9 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');

  stack.append(up, down);
  wrap.appendChild(stack);

  /**
   * Grey out whichever arrow has nothing left to do.
   *
   * A control that looks pressable and does nothing is worse than one that says
   * so, and at a boundary the native widget did say so.
   */
  function sync() {
    up.disabled = input.disabled || input.readOnly || !wouldStep(input, 1);
    down.disabled = input.disabled || input.readOnly || !wouldStep(input, -1);
  }

  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  sync();

  return () => {
    input.removeEventListener("input", sync);
    input.removeEventListener("change", sync);
    input.classList.remove("glim-num-input");
    wrap.parentNode?.insertBefore(input, wrap);
    wrap.remove();
  };
}
