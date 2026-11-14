import { Button } from "@glimstone/react";
import { AccentControl, DensityControl, LabelControl, MotionControl, RainbowControl, ShapeControl, ThemeControl } from "../lookControls";
import { SampleSurface } from "../sample";
import { Callout, Code, ContractTable, Demo, H2, SourceLink } from "../ui";
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
      <p>
        The OLED switch under it puts the dark look on true black for OLED and AMOLED screens. It sets{" "}
        <code>data-oled</code> on <code>&lt;html&gt;</code>, which counts whenever dark is showing, chosen or from the
        system. The surfaces move one step down and the text stays as it is. A card has no ring: its fill is its edge on
        black. It belongs to the screen, so it is kept on the device and never synced. While Light is chosen the switch
        refuses: it keeps its state, its track dims, a press shakes it and its bubble says why. Under System it stays
        free, for the device's dark.
      </p>
      <Code
        code={`import { applyOled, darkShowing, oledRefusal } from "@glimstone/core";\n\napplyOled(true); // kept on this device\ndarkShowing(); // whether OLED is in effect now\noledRefusal(theme); // why the switch refuses, or undefined`}
      />
      <H2>Accent</H2>
      <p>
        One colour that means "this is happening" and nothing else: the active nav row, the primary action, progress.
        The default is Sunflower <code>#FCC419</code> in every app, so the family opens as one product. The text colour
        on top of it is computed, never asked for as a second setting, and every ink the engine computes reaches 4.5:1,
        whatever colour somebody picks.
      </p>
      <Code code={`import { applyAccent } from "./glimstone/appearance";\n\napplyAccent("#1D99F3");`} />
      <p>
        Where the device has a colour of its own, a swatch with a wand stands before the presets and takes it. The
        setting is stored as <code>system</code>, never as the colour, so one device's colour never travels to another.
        The app feeds the colour from its source. The browser is one in Firefox and Safari, so that is where the wand
        shows on this page.
      </p>
      <Code
        code={`import { applyAccent, setSystemAccent, watchBrowserAccent, SYSTEM_ACCENT } from "@glimstone/core";\n\n// Or feed Material You, or the desktop's accent colour.\nwatchBrowserAccent(setSystemAccent);\napplyAccent(SYSTEM_ACCENT);`}
      />
      <Callout>
        The system's colour can be anything, a pale wallpaper tone as well as a dark navy. The engine pushes the ink on
        it and the accent text toward black or white just far enough to keep 4.5:1, so nobody has to check it by hand.
      </Callout>
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

export function DensityEngine() {
  return (
    <>
      <p className="lead">
        How much room a row of a list or a table takes: Compact, Normal or Airy. One attribute moves every row, and
        Normal is the look without a setting.
      </p>
      <Live>
        <DensityControl />
        <Attr name="data-density" />
      </Live>
      <Demo name="DensityRows" />
      <H2>Four dials on the spacing scale</H2>
      <p>
        <code>--row-h</code> is a row's height, <code>--row-gap</code> the room between its tile, name and badges,{" "}
        <code>--row-pad</code> its inline padding and <code>--cell-pad-block</code> a table cell's padding above and
        below. A list row, a placeholder row, a list table and a plain table read them, so they change together.
      </p>
      <Code code={`applyDensity("compact"); // or useDensity() in Vue`} />
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
        code={`/* Name the lively levels: a page without the attribute is subtle. */
:root:is([data-motion="wild"], [data-motion="storm"]) .thing {
  transition-duration: var(--motion-control-dur);
}`}
      />
      <H2>Reordering</H2>
      <p>
        Hold a tile and the others tremble, which says at once that they can be moved. It happens in every list and grid
        that can be reordered by dragging, so the class comes from the drag gesture rather than from each list:{" "}
        <code>useDragArmed</code> puts <code>glim-drag-armed</code> on the list while an item is held and takes it off on
        release, also when the list rewrites its own class in between.
      </p>
      <Demo name="DragArmedTiles" />
      <p>
        A row as wide as the list would swing its ends far at the same angle, so a list of full-width rows also carries{" "}
        <code>glim-drag-rows</code> in its own class, and its rows lift and tilt a little with the row wiggle instead.
      </p>
      <Demo name="DragArmedRows" />
      <p>
        Where a dropped item lands is up to <code>dropIndex</code> from <code>@glimstone/core</code>. It passes a
        neighbour once its edge in the direction of travel crosses that neighbour's middle, so a wide item still reaches
        both ends. It takes plain boxes: the held item where it is held, its place, and the others in their order.
      </p>
      <Code
        code={`import { dropIndex } from "@glimstone/core";
import { useDragArmed } from "@glimstone/react";

// In the app's drag hook, beside the item it lifts.
useDragArmed(list, held !== null);

// On each move, or on the drop: the held item's index among the others.
const index = dropIndex(heldBox, fromBox, otherBoxes, { axis: "grid" });

// Vue: useDragArmed(list, () => held.value !== null), from @glimstone/vue.`}
      />
      <p>
        The tremble reads <code>--motion-wiggle-angle</code> and <code>--motion-wiggle-dur</code>: 2deg every 120ms at
        wild, 1.4deg every 140ms at subtle, 2.8deg every 100ms at storm, and nothing at off or under reduced motion. Rows
        read <code>--motion-row-tremble-lift</code> and <code>--motion-row-tremble-tilt</code> on the same beat: 1.5px and
        .15deg at wild, 1px and .1deg at subtle, 2px and .2deg at storm. The held item stays still when it carries{" "}
        <code>glim-drag-lift</code>, <code>aria-grabbed="true"</code> or <code>data-held="true"</code>.
      </p>
      <ContractTable of="useDragArmed" />
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
