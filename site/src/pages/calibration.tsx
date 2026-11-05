import { useEffect, useRef } from "react";
import { PROTOTYPE_CSS, PROTOTYPE_ROWS } from "../calibration/prototype";
import { VUE_ROWS } from "../calibration/vueRows";
import { H2 } from "../ui";
import { VueIsland } from "../vueIsland";

// The prototype's rules live in a shadow root, so its `.btn` and `.seg` and
// the site's own classes of the same names never meet. The tokens, the font,
// the theme and the accent still reach in through the custom properties, so
// both sides draw with one set of values.
function Prototype({ html }: { html: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = host.current!.shadowRoot ?? host.current!.attachShadow({ mode: "open" });
    root.innerHTML = `<style>${PROTOTYPE_CSS}</style>${html}`;
  }, [html]);
  return <div ref={host} />;
}

interface Row {
  id: string;
  title: string;
  vue: string;
  note?: string;
  /** One side above the other, for a control wider than half the page. */
  wide?: boolean;
}

const ROWS: Row[] = [
  { id: "button", title: "Button", vue: "Button" },
  { id: "switch", title: "Switch", vue: "Toggle" },
  { id: "selector", title: "Selector", vue: "Selector" },
  { id: "dropdown", title: "Dropdown", vue: "Select" },
  { id: "field", title: "Field", vue: "the glim-input class", note: "GlimStone has no text field component. The class is what PasswordField and CopyField draw with." },
  { id: "password", title: "Password field", vue: "PasswordField" },
  { id: "copy", title: "Copy field", vue: "CopyField" },
  { id: "menu", title: "Menu", vue: "ContextMenu", note: "The Vue menu opens from its button, since it takes the focus and floats. Opened with the mouse, its first row shows no ring until a key is pressed." },
  { id: "menubar", title: "Menu bar", vue: "MenuBar" },
  { id: "window", title: "Window", vue: "Window", note: "The Vue window opens from its button, over the page.", wide: true },
  { id: "checkbox", title: "Checkbox", vue: "Checkbox" },
  { id: "kbd", title: "Key cap", vue: "Kbd" },
  { id: "pill", title: "Pill", vue: "Pill" },
  { id: "meter", title: "Meter", vue: "Meter" },
  { id: "footmeter", title: "Footer meter", vue: "Meter quiet", note: "The free space in a list's footer line, grey until the pointer reaches its button." },
  { id: "rowcheck", title: "Row checkmark", vue: "Checkbox slim", note: "The box alone in a row of a dense list. The prototype's box is a mark drawn inside the row, the Vue one a checkbox of its own, named by the row." },
  { id: "progress", title: "Progress bar", vue: "ProgressBar", note: "The prototype's bar with the sheen is the transfer window's, the plain one the upload list's. In GlimStone every bar whose work runs has the sheen, and a meter never does." },
  { id: "colour", title: "Colour picker", vue: "ColorPicker", wide: true },
];

export function Calibration() {
  return (
    <>
      <p className="lead">
        The controls of the CannonCommander prototype beside the Vue components that replace them, row by row, so a
        difference in the look shows before an app moves over.
      </p>
      <p>
        The left side is the prototype's own markup and rules, copied into this page. The right side is the Vue
        component in the same words. Both read the same tokens, so the theme, the accent and the shape set in Look reach
        both, and what still differs is the component.
      </p>
      {ROWS.map((r) => (
        <section key={r.id} className="cal-row" data-cal={r.id}>
          <H2 id={`cal-${r.id}`}>{r.title}</H2>
          {r.note && <p>{r.note}</p>}
          <div className={r.wide ? "cal-pair cal-pair--wide" : "cal-pair"}>
            <div className="cal-cell">
              <span className="demo-fw">Prototype</span>
              <div className="cal-stage" data-side="prototype">
                <Prototype html={PROTOTYPE_ROWS[r.id]} />
              </div>
            </div>
            <div className="cal-cell">
              <span className="demo-fw">Vue: {r.vue}</span>
              <div className="cal-stage" data-side="vue">
                <VueIsland component={VUE_ROWS[r.id]} />
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
