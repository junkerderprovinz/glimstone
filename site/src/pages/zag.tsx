import vanillaSource from "@gs/select.ts?raw";
import { CONTRACTS } from "../contracts";
import { Callout, Code, ContractTable, Demo, H2, PropsTable, SourceLink } from "../ui";
import results from "../gen/test-results.json";

function ZagNote({ file }: { file: string }) {
  return (
    <>
      <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <SourceLink file={file} />
      </p>
      <Callout>
        Built on <a href="https://zagjs.com">Zag</a>: a state machine owns the behaviour (keys, focus, ARIA, dismissal,
        positioning), GlimStone owns the look through the <code>.glim-select-*</code> and <code>.glim-slider-*</code>{" "}
        rules in tokens.css. The machine runs with React and without a framework.
      </Callout>
    </>
  );
}

export function SelectPage() {
  return (
    <>
      <p className="lead">
        The one dropdown. It picks one value from a short list, in groups with headings and submenus where the list
        needs them. It takes over from DropdownListbox.
      </p>
      <ZagNote file="react/Select.tsx" />
      <Demo name="SelectZag" />
      <Code
        code={`import { Select } from "./components/Select";

<Select label="Time zone" options={zones} value={zone} onChange={setZone} />`}
      />
      <H2>Groups and glyphs</H2>
      <p>
        <code>groups</code> splits the list into runs with a hairline between them. A run with a heading is a named
        group for a screen reader too. An option can carry a glyph; once one does, every row keeps room for one, so the
        labels line up.
      </p>
      <Demo name="SelectGroups" />
      <Code
        code={`<Select
  label="Audio format"
  value={format}
  onChange={setFormat}
  groups={[
    { entries: [auto] },
    { entries: [opus, aac, mp3] },
    { heading: "Convert to", entries: [flac, wav] },
  ]}
/>`}
      />
      <H2>Submenus</H2>
      <p>
        An entry with <code>options</code> of its own opens them beside its row, for a list too long to show flat. A
        listbox cannot nest, so a list with a submenu runs on Zag's menu machine with radio items. The keys, the wheel
        and the look stay the same.
      </p>
      <Demo name="SelectSubmenu" />
      <H2>Widths</H2>
      <p>
        <code>fill</code> takes its line like a text field. <code>steady</code> is as wide as the longest option, so
        choosing never moves what stands beside it. <code>squeeze</code> is steady where there is room and gives way down
        to a few letters and an ellipsis where there is not. <code>hug</code> fits the value on show. The open list shows
        every option in full in all four.
      </p>
      <Demo name="SelectWidths" />
      <H2>Placeholder, busy and refused</H2>
      <p>
        A <code>null</code> value shows the placeholder and ticks nothing. While <code>busy</code>, the trigger keeps its
        focus and takes no input. Each bump of <code>shake</code> shakes it once, for a value the server refused. Pick
        AllDebrid to see it.
      </p>
      <Demo name="SelectStates" />
      <H2>Without a framework</H2>
      <p>
        The same machine and the same rules, mounted into an empty element. This is how an Unraid plugin page uses it.
        Groups, headings, the widths and the wheel come along; submenus need the React component.
      </p>
      <Demo name="SelectVanilla" />
      <Code code={vanillaSource} />
      <H2>Rules</H2>
      <ul>
        <li>The closed select is a field at field height, so it never stands taller than the inputs beside it.</li>
        <li>In a settings row the label stands at the row's start; pass hideLabel and the name stays for screen readers.</li>
        <li>
          With focus on the closed trigger, the mouse wheel steps through the options, skipping disabled ones and
          stopping at both ends. Hovering alone changes nothing.
        </li>
        <li>The list opens below the trigger on the side its text starts from, and above or end-aligned where that does not fit.</li>
        <li>A scroll or a resize outside the open list closes it.</li>
        <li>A list longer than a screen is a <a href="#/components/combobox">Combobox</a>.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Select" />
      <H2>API</H2>
      <PropsTable of="Select" />
    </>
  );
}

export function ComboboxPage() {
  return (
    <>
      <p className="lead">
        A field that filters a long list while somebody types, for lists too long for a select: containers, time zones,
        languages.
      </p>
      <ZagNote file="react/Combobox.tsx" />
      <Demo name="ComboboxZag" />
      <H2>Rules</H2>
      <ul>
        <li>A search that finds nothing says so in the list. A list that vanishes reads as a broken field.</li>
        <li>Focus stays in the field while the arrows move through the list.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Combobox" />
      <H2>API</H2>
      <PropsTable of="Combobox" />
    </>
  );
}

export function SliderPage() {
  return (
    <>
      <p className="lead">A value on a range, for numbers people adjust rather than type.</p>
      <ZagNote file="react/Slider.tsx" />
      <Demo name="SliderZag" />
      <H2>Rules</H2>
      <ul>
        <li>The value stands beside the label in words ("30 days", not "30"), and a screen reader hears the same words.</li>
        <li>Where the exact number matters, pair the slider with a number field.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Slider" />
      <H2>API</H2>
      <PropsTable of="Slider" />
    </>
  );
}

type Results = { rows: Record<string, { ok: boolean }> };

export function BehaviourGuide() {
  const rows = (results as unknown as Results).rows ?? {};
  return (
    <>
      <p className="lead">
        The look is half a component. The other half is what it does when somebody presses a key, clicks outside or
        listens with a screen reader. GlimStone writes that half down as a contract and tests it.
      </p>
      <H2>Contracts</H2>
      <p>
        Every interactive component has a behaviour table: which keys do what, where focus goes, what closes it and what
        a screen reader hears. The tables follow the WAI-ARIA Authoring Practices, the W3C's reference for these
        patterns, so GlimStone does not invent keyboard rules of its own.
      </p>
      <H2>Tests</H2>
      <p>
        Each row is a Playwright test that drives the live demo on this site, on every push. The table shows the result
        of the run this site was built from, so a promise a component does not keep is visible on its own page.
      </p>
      <table className="props">
        <thead>
          <tr>
            <th>Component</th>
            <th>Rows</th>
            <th>Pass</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(CONTRACTS).map(([name, c]) => {
            const pass = c.rows.filter((r) => rows[r.id]?.ok).length;
            return (
              <tr key={name}>
                <td className="pname">{name}</td>
                <td>{c.rows.length}</td>
                <td>
                  <span className={`tested ${pass === c.rows.length ? "pass" : "fail"}`}>
                    {pass} / {c.rows.length}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <H2>Zag for the hard parts</H2>
      <p>
        Simple controls such as the switch and the button stay hand-written. Components whose behaviour is hard to get
        right (select, combobox, slider, and later menus and date pickers) run on Zag's state machines, and GlimStone
        styles them through the data attributes Zag sets. Zag also runs without a framework, so the Unraid plugins get
        the same behaviour as the React apps.
      </p>
    </>
  );
}
