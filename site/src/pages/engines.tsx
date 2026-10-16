import { Button } from "@gs/react/Button";
import { AccentControl, LabelControl, MotionControl, RainbowControl, ShapeControl, ThemeControl } from "../lookControls";
import { SampleSurface } from "../sample";
import { Callout, Code, H2, SourceLink } from "../ui";
import { useLook } from "../look";

function Live({ children }: { children: React.ReactNode }) {
  return (
    <div className="demo">
      <div className="demo-stage">
        <SampleSurface />
      </div>
      <div className="demo-bar" style={{ flexWrap: "wrap", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Attr({ name }: { name: string }) {
  // Subscribing re-renders this when the look changes the attribute.
  useLook();
  const value = document.documentElement.getAttribute(name) ?? "unset";
  return (
    <span style={{ fontSize: 13, color: "var(--carbon-text-muted)" }}>
      <code>
        {name}="{value}"
      </code>
    </span>
  );
}

export function ColourEngine() {
  return (
    <>
      <p className="lead">
        Theme, accent and rainbow share one engine. It turns at most three inputs into every colour token a component
        reads.
      </p>
      <Live>
        <ThemeControl />
        <AccentControl />
        <RainbowControl />
      </Live>
      <H2>Theme</H2>
      <p>
        <code>data-theme</code> on <code>&lt;html&gt;</code> is <code>light</code>, <code>dark</code> or unset. Unset
        follows the system, and that is the default: an app that opens dark on a light desktop made a choice nobody
        asked it to make. The selector always has a System segment, so a choice once made can be undone.
      </p>
      <H2>Accent</H2>
      <p>
        One colour that means "this is happening" and nothing else: the active nav row, the primary action, progress.
        The default is Sunflower <code>#FCC419</code> in every app, so the family opens as one product. The text colour
        on top of it is computed from its luminance, never asked for as a second setting.
      </p>
      <Code code={`import { applyAccent } from "./glimstone/appearance";\n\napplyAccent("#1D99F3");`} />
      <H2>Rainbow</H2>
      <p>
        With the rainbow on, sections take positions on an eight-colour wheel instead of the single accent. A card with a{" "}
        <code>hueIndex</code> sets <code>--accent</code> once for everything inside it, so no button derives its own hue.
        Reactive keeps everything neutral until the pointer arrives.
      </p>
      <Callout>
        While the rainbow is on, the accent row is dimmed and takes no clicks: nothing reads it then, and a live control
        that changes nothing teaches people the setting is broken.
      </Callout>
      <p>
        Reference: <SourceLink file="appearance.ts" /> <SourceLink file="colorPicker.ts" />
      </p>
    </>
  );
}

export function ShapeEngine() {
  return (
    <>
      <p className="lead">One attribute moves every corner in the app. There is no exception list.</p>
      <Live>
        <ShapeControl />
        <Attr name="data-shape" />
      </Live>
      <H2>Three tokens</H2>
      <p>
        <code>--radius-card</code> for cards, windows and menus, <code>--radius-control</code> for fields, panels and
        tiles, and <code>--radius-pill</code> for everything somebody presses or reads at a glance. Only Round tells the
        last two apart: a button is a true pill there, while a text field keeps a corner a second line can sit in.
      </p>
      <Code code={`.my-control {\n  border-radius: var(--radius-pill);\n}`} />
      <H2>Wire a control in as it is built</H2>
      <p>
        A hard-coded <code>rounded-full</code> and the correct <code>rounded-pill</code> look the same under Round. The
        gap shows only once somebody picks Square, so check a new control by switching the shape, not by reading its
        class list.
      </p>
      <H2>The leaf</H2>
      <p>
        A fourth shape no picker offers: two opposite corners round, the other two sharp. It is found by tapping Square
        five more times once Square is chosen.
      </p>
    </>
  );
}

export function MotionEngine() {
  return (
    <>
      <p className="lead">
        One set of duration and distance tokens feeds the same keyframes at every level. Subtle and Off are smaller
        numbers, not different animations.
      </p>
      <Live>
        <MotionControl />
        <Attr name="data-motion" />
      </Live>
      <H2>Levels</H2>
      <p>
        <code>off</code>, <code>subtle</code> and <code>wild</code>, with <code>storm</code> hidden below the picker. The
        names are a wire format: they go into the attribute, the stylesheet and storage, so an app translates the label
        and never the value.
      </p>
      <H2>The system setting still wins</H2>
      <p>
        <code>data-motion</code> resolves only inside the <code>prefers-reduced-motion: no-preference</code> block. A
        person who asked the system for less motion gets less motion, whatever the app is set to.
      </p>
      <Code
        code={`/* Name the quiet levels, so the rule covers wild, storm and anything added above. */
:root:not([data-motion="subtle"]):not([data-motion="off"]) .thing {
  transition-duration: var(--motion-control-dur);
}`}
      />
    </>
  );
}

export function LabelEngine() {
  return (
    <>
      <p className="lead">How much of a control is shown: its words, its glyph, both, or the glyph until hovered.</p>
      <Live>
        <LabelControl />
        <Attr name="data-labels-buttons" />
      </Live>
      <H2>Four modes, three surfaces</H2>
      <p>
        <code>text</code>, <code>textGlyph</code>, <code>glyph</code> and <code>reactive</code>, set separately for
        buttons, the sidebar and tabs. The default is both.
      </p>
      <H2>The width never moves</H2>
      <p>
        A button keeps the same width in all four modes, so switching never reflows the page. The width comes from the
        label, which is there in every mode at least as the accessible name, and it is known before the first paint.
      </p>
      <div className="demo">
        <div className="demo-stage">
          <Button label="Save" labelKey="save" tone="accent" />
          <Button label="Refresh" labelKey="refresh" />
          <Button label="Delete" labelKey="delete" />
        </div>
      </div>
      <p>
        Reference: <SourceLink file="controls.ts" />
      </p>
    </>
  );
}
