import { Callout, Code, ContractTable, Demo, H2, PropsTable, SourceLink } from "../ui";

function Head({ file }: { file: string }) {
  return (
    <p style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <SourceLink file={file} />
    </p>
  );
}

function Usage({ code }: { code: string }) {
  return (
    <>
      <H2>Usage</H2>
      <Code code={code} />
    </>
  );
}

export function ButtonPage() {
  return (
    <>
      <p className="lead">
        Every button in the family, with the label engine built in: words, glyph or both, at a width that never moves.
      </p>
      <Head file="react/Button.tsx" />
      <Demo name="ButtonTones" />
      <Usage code={`import { Button } from "@glimstone/react";\n\n<Button label="Save" labelKey="save" tone="accent" onClick={save} />`} />
      <H2>Tones</H2>
      <p>
        <code>accent</code> is the one action a view is for. <code>neutral</code> is the default, <code>subtle</code>{" "}
        sits on a surface that already has a fill, and <code>ok</code>, <code>danger</code> and <code>warn</code> carry a
        state. A background written in <code>className</code> next to a tone wins or loses by stylesheet order, so a
        control that needs another fill gets a new tone instead.
      </p>
      <p>
        Every tone has a fill, because a button with words and no ground reads as text (rule 38). Under the pointer{" "}
        <code>neutral</code> and <code>subtle</code> mix a little of <code>--btn-tint</code> into their ground and turn
        the glyph to it, so a grey button does not look flat (rule 40).
      </p>
      <H2>States and variants</H2>
      <Demo name="ButtonStates" />
      <p>
        <code>busy</code> swaps the glyph for a spinner and keeps the label, so the button does not resize while it works.
        Anything that changes, such as the running state or why the button is unavailable, goes into <code>title</code>
        and shows in the bubble, which still reaches a disabled button.
      </p>
      <p>
        <code>icon</code> is a row action among siblings: copy, edit, delete. <code>chip</code> is the small remove
        control inside a pill and shows its glyph in every mode.
      </p>
      <H2>Order in a pair</H2>
      <p>
        The control that goes ahead sits on the right, the one that steps back on the left: Cancel, then Save. Under a
        right-to-left language the pair mirrors with the page.
      </p>
      <H2>Accessibility</H2>
      <ul>
        <li>The label is always the accessible name, also in glyph mode, where it doubles as the tooltip.</li>
        <li>
          <code>labelKey</code> is required, so every call site says which glyph it means or passes <code>null</code>.
        </li>
        <li>
          The focus ring is <code>--focus-ring</code>, measured at 3:1 against the card surface.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Button" />
      <H2>API</H2>
      <PropsTable of="Button" />
    </>
  );
}

export function TogglePage() {
  return (
    <>
      <p className="lead">The switch. Every on/off control is this one, never a native checkbox.</p>
      <Head file="react/Toggle.tsx" />
      <Demo name="ToggleBasic" />
      <Usage code={`import { Toggle } from "@glimstone/react";\n\n<Toggle label="Quiet notifications" checked={quiet} onChange={setQuiet} />`} />
      <H2>Rules</H2>
      <ul>
        <li>
          A native checkbox follows none of the engines and looks pasted in from another program. "This page has no
          framework" is not a reason; the switch is a button and a span.
        </li>
        <li>A sub-switch is absent while its parent is off, not dimmed, and it is never indented.</li>
        <li>A switch shows its own label. A card title above it does not count.</li>
        <li>Switching something on is one click. Its options live on its own page.</li>
        <li>The knob reads the same radius token as the track, so it follows the shape engine too.</li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          A <code>button</code> with <code>role="switch"</code> and <code>aria-checked</code>.
        </li>
        <li>
          The label is always the accessible name. <code>hideLabel</code> drops only the visible caption, for a row
          that draws the same text right beside it.
        </li>
        <li>The thumb mirrors under right-to-left.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Toggle" />
      <H2>API</H2>
      <PropsTable of="Toggle" />
    </>
  );
}

export function BadgePage() {
  return (
    <>
      <p className="lead">Status pills, counts, and the filled section heading every card wears.</p>
      <Head file="react/Badge.tsx" />
      <Demo name="BadgeTones" />
      <Usage code={`import { Badge } from "@glimstone/react";\n\n<Badge tone="ok">Settled</Badge>`} />
      <H2>Sizes and shapes</H2>
      <Demo name="BadgeSizes" />
      <p>
        Sizes are named stages, each fixing font size, padding and height together. A button and a span at the same
        stage render pixel-identical. All four shapes read <code>--radius-pill</code>; the name says what the caller
        means.
      </p>
      <H2>Rules</H2>
      <ul>
        <li>Four state hues in total. Warning is orange, so yellow only ever means "act here" or "chosen".</li>
        <li>A delete badge looks like the badges beside it: no red. The trash glyph and the confirmation say it.</li>
        <li>A square icon badge has one size across the whole app. A dense row adjusts its own padding instead.</li>
        <li>
          Only <code>heading</code> and <code>active</code> take a rainbow position; the other tones are state signals.
        </li>
      </ul>
      <H2>API</H2>
      <PropsTable of="Badge" />
    </>
  );
}

export function CardPage() {
  return (
    <>
      <p className="lead">The one raised surface, and the one place a section heading is drawn.</p>
      <Head file="react/Card.tsx" />
      <Demo name="CardBasic" />
      <Usage code={`import { Card } from "@glimstone/react";\n\n<Card title="Schedule" hint="When the backup runs on its own.">\n  ...\n</Card>`} />
      <H2>The heading notch</H2>
      <p>
        The title is a filled badge that straddles the card's top edge. The <code>hint</code> becomes an "(i)" inside it,
        because grey prose under a heading is read once and then costs space forever.
      </p>
      <H2>Rainbow positions</H2>
      <Demo name="CardRainbow" />
      <p>
        With a <code>hueIndex</code> the card sets <code>--accent</code> once for everything inside it. Turn the rainbow
        on under Look to see each card take its own colour. Moving a card in the markup moves its colour too, so a
        reorder is a colour change.
      </p>
      <H2>Rules</H2>
      <ul>
        <li>One raised level. Never a card inside a card; a nested card drops its surface and side padding.</li>
        <li>Hierarchy comes from type size and colour step, not from borders.</li>
      </ul>
      <H2>API</H2>
      <PropsTable of="Card" />
    </>
  );
}

export function ConfirmDialogPage() {
  return (
    <>
      <p className="lead">The window in front of an action that cannot be undone.</p>
      <Head file="react/ConfirmDialog.tsx" />
      <Demo name="ConfirmDelete" />
      <Usage
        code={`import { useConfirm } from "@glimstone/react";

const { confirm, confirmDialog } = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });

if (await confirm("Delete the snapshot from 14 October?", { confirmLabel: "Delete" })) remove();
return <>... {confirmDialog}</>;`}
      />
      <p>
        ConfirmDialog holds no state and never touches the document. <code>useConfirm</code> beside it owns the portal,
        Escape, the Tab trap and the way back to the control that asked, so an app calls <code>confirm()</code> the way
        it would call <code>window.confirm()</code>, only with await. <SourceLink file="react/useConfirm.tsx" />
      </p>
      <H2>When to ask</H2>
      <ul>
        <li>Reversible actions do not ask. A dialog in front of an undo teaches people to click through dialogs.</li>
        <li>An irreversible one states the stakes: the count and the size of what goes, not "Are you sure?".</li>
        <li>A destructive choice preselects the safe option.</li>
        <li>Neither button is red and neither is recommended. The sentence is the warning.</li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          <code>role="dialog"</code> with <code>aria-modal</code>, labelled by its title and described by its message.
        </li>
        <li>Cancel takes focus when the window opens. A click on the backdrop cancels.</li>
        <li>
          <code>closeLabel</code> adds a corner close only when asked, since one beside Cancel reads as a second choice.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="ConfirmDialog" />
      <H2>API</H2>
      <PropsTable of="ConfirmDialog" />
    </>
  );
}

export function DropdownPage() {
  return (
    <>
      <p className="lead">
        The list panel of a dropdown whose trigger the caller draws. It renders into a portal, so no card or scroll
        container can clip it.
      </p>
      <Head file="react/DropdownListbox.tsx" />
      <Callout>
        <strong>Deprecated.</strong> Use <a href="#/components/select">Select</a>, which keeps focus on its trigger and
        adds typeahead. The behaviour table below shows the row DropdownListbox misses. It stays in the reference until
        the apps have moved.
      </Callout>
      <Demo name="DropdownSelect" />
      <Usage
        code={`<DropdownListbox open={open} onClose={close} triggerRef={trigger} label="Time zone">
  {zones.map((z) => (
    <button role="option" aria-selected={z === zone} onClick={() => pick(z)}>{z}</button>
  ))}
</DropdownListbox>`}
      />
      <H2>The caller owns the trigger</H2>
      <p>
        Only the panel is shared. The trigger is the app's own field at field height, so a closed dropdown never stands
        taller than the inputs beside it. The panel opens toward whichever edge of the viewport has room.
      </p>
      <H2>Accessibility</H2>
      <ul>
        <li>Focus moves to the selected option once the panel sits at its real position.</li>
        <li>Arrow keys, Home and End move between options; Enter and Space work because the options are buttons.</li>
        <li>Escape, an outside click, a scroll or a resize close it. Clicking the trigger does not close and reopen it.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="DropdownListbox" />
      <H2>API</H2>
      <PropsTable of="DropdownListbox" />
    </>
  );
}

export function InfoBubblePage() {
  return (
    <>
      <p className="lead">
        The "(i)" beside a control. Every explanation lives here, never as grey text under a field.
      </p>
      <Head file="react/InfoBubble.tsx" />
      <Demo name="InfoBubbleBasic" />
      <Usage code={`<InfoBubble tip="Reads every file back from the target and compares it." />`} />
      <H2>Rules</H2>
      <ul>
        <li>One bubble element for the whole page, rendered into the body, so nothing can clip it.</li>
        <li>It never runs past the window edge. It clamps sideways and flips above when there is no room below.</li>
        <li>Hover and keyboard focus open it. A press, Escape or a scroll close it.</li>
        <li>An explanation too long for a bubble goes behind a button that opens a window.</li>
        <li>A bubble may be conditional: one that explains a temporary state appears only while that state holds.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="InfoBubble" />
      <H2>API</H2>
      <PropsTable of="InfoBubble" />
    </>
  );
}

export function IconTipPage() {
  return (
    <>
      <p className="lead">An icon-only button whose name shows in the house bubble instead of the browser's balloon.</p>
      <Head file="react/IconTipButton.tsx" />
      <Demo name="IconTipBasic" />
      <Usage code={`<IconTipButton tip="Move up" onClick={up}>\n  <IconMoveUp />\n</IconTipButton>`} />
      <H2>When to use it</H2>
      <p>
        For a bare glyph in a box the caller sizes, such as the arrows on a sortable row. It has no tone, no width stage
        and no place in the label engine. Everything with words is a <a href="#/components/button">Button</a>.
      </p>
      <H2>Behaviour</H2>
      <ContractTable of="IconTipButton" />
      <H2>API</H2>
      <PropsTable of="IconTipButton" />
    </>
  );
}

export function ToastPage() {
  return (
    <>
      <p className="lead">Short notices in a fixed corner. They stack, pause under the pointer, and leave on their own.</p>
      <Head file="react/Toast.tsx" />
      <Demo name="ToastDemo" />
      <Usage
        code={`import { addToast } from "@glimstone/core";

setToasts((list) => addToast(list, { id, message: "Settings saved.", severity: "success" }, Date.now()));`}
      />
      <H2>Rules</H2>
      <ul>
        <li>Four seconds, then gone. A toast is a notice, not a to-do list.</li>
        <li>Toasts stack instead of replacing each other, and each can be dismissed on its own.</li>
        <li>Hover or focus pauses the countdown and keeps the time that was left.</li>
        <li>Quiet mode hides routine successes, never warnings or failures.</li>
        <li>The severity shows in the glyph's colour only, never as a coloured rail on the card.</li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          A failure is <code>role="alert"</code> and interrupts the screen reader; a success is <code>role="status"</code>
          .
        </li>
        <li>The stack sits in the bottom corner on the end side, so it follows the writing direction.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Toast" />
      <H2>API</H2>
      <PropsTable of="ToastViewport" />
    </>
  );
}

export function WindowBarPage() {
  return (
    <>
      <p className="lead">
        A desktop app's own title bar on Windows and Linux: a strip to drag and three buttons, in the app's look rather
        than the system's.
      </p>
      <Head file="react/WindowBar.tsx" />
      <Demo name="WindowBarDemo" />
      <Usage
        code={`<WindowBar
  appName="Example"
  maximised={maximised}
  text={{ minimise: t("window.minimise"), maximise: t("window.maximise"), restore: t("window.restore"), close: t("window.close") }}
  onMinimise={minimise}
  onToggleMaximise={toggleMaximise}
  onClose={close}
  onDragStart={startDrag}
/>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          Minimise, maximise or restore, and close. No mark, no name and no menu: the rail right below already shows
          them.
        </li>
        <li>Close hovers grey like its neighbours. It hides or quits the way the native button does.</li>
        <li>
          The bar is fixed to the top. <code>body</code> starts under it, a scrim stops under it, and the frame marked{" "}
          <code>.glim-shell</code> drops its top gutter, because the bar already is the margin.
        </li>
        <li>A press drags the window once it moves, and a double click maximises or restores.</li>
        <li>macOS keeps its own title bar, and a browser never shows this one.</li>
        <li>
          Windows 11's snap layouts do not open on this maximise button. Snapping to a screen edge still works.
        </li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          The bar is a <code>header</code> named after the app, since it shows no name of its own.
        </li>
        <li>Each button is named after its action, and the name shows in the house bubble on hover and on focus.</li>
        <li>The focus ring is drawn on the square, not around the full-height button.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="WindowBar" />
      <H2>API</H2>
      <PropsTable of="WindowBar" />
    </>
  );
}

export function SelectorPage() {
  return (
    <>
      <p className="lead">
        The one horizontal selector: tabs, filter bars, segmented controls and pickers are the same control, and its
        second form stands the tabs on their side as a column of tiles.
      </p>
      <Head file="react/Selector.tsx" />
      <Demo name="SelectorTabs" />
      <Usage
        code={`import { Selector } from "@glimstone/react";

<Selector label="Settings pages" items={pages} value={page} onChange={setPage} size="lg" variant="chip" hueOffset={0} />`}
      />
      <H2>One or many, auto or manual</H2>
      <Demo name="SelectorPickers" />
      <p>
        With <code>select="one"</code> the strip is a tab list and the arrow keys choose as they move. A strip that
        saves a setting takes <code>activation="manual"</code> and becomes a radio group: the arrows move the focus and
        Space, Enter or a click chooses. <code>select="many"</code> makes every segment a toggle button.
      </p>
      <p>
        A caption such as "Show" is a plain span beside the strip, never a <code>label</code> around it: a label around
        several segments hands its clicks to the first one.
      </p>
      <H2>Two stylings, two scales</H2>
      <ul>
        <li>
          <code>chip</code> is the bare strip, every segment a quiet badge at rest. <code>well</code> sets the segments in
          one groove, and only the chosen one is filled.
        </li>
        <li>
          <code>equalWidth</code> pins every segment to the widest label, at least 200px where the row has room, so the
          page-level pickers of a page come out at one width. Without it the segments hug their labels.
        </li>
        <li>
          A selector with the card to itself spans the card and its segments share the width. <code>inline</code> hugs
          them, for a strip in a toolbar row.
        </li>
        <li>A strip that wraps fills every row evenly, so six options go three and three, never four and two.</li>
        <li>
          <code>pairsOnPhone</code> sets the segments two to a row below 600px and lets their labels wrap.{" "}
          <code>fit</code> keeps page tabs on one row and drops their words before it would wrap.
        </li>
      </ul>
      <H2>Colour</H2>
      <p>
        Under rainbow a selector that sets a value wears one colour on its chosen segment, its place among the page's
        selectors. A tab strip, given a <code>hueOffset</code>, keeps a colour per tab, and an idle tab's glyph shows it
        in every mode but reactive.
      </p>
      <H2>Vertical tiles</H2>
      <Demo name="SelectorTiles" left />
      <p>
        A settings area with many pages stands its tabs in a column beside the content. Each tile is a link to the
        page's own address, so it opens in a new tab on a modified click; a plain click calls <code>onChange</code> for
        the app's router. The tiles share the column's height above a 40px floor, a long name takes a second line, and
        the column follows the rail's label mode and shows glyphs alone below 1024px.
      </p>
      <p>
        The arrow keys only move the focus here, since every page change is a history entry. Enter, Space or a click
        opens the page. A page with nothing on it yet is dimmed with <code>dim</code>, not hidden.
      </p>
      <H2>Accessibility</H2>
      <ul>
        <li>The strip is one tab stop with a roving tabindex; the arrows follow the reading direction.</li>
        <li>A disabled segment is skipped by the arrows and keeps its reason as its description.</li>
        <li>In a mode that hides the words, the label stays the accessible name and shows in the bubble.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Selector" />
      <H2>API</H2>
      <PropsTable of="Selector" />
    </>
  );
}

export function NumberFieldPage() {
  return (
    <>
      <p className="lead">A number input with its two arrows inside the field, in place of the browser's spinner.</p>
      <Head file="react/NumberField.tsx" />
      <Demo name="NumberFieldBasic" />
      <Usage
        code={`import { NumberField } from "@glimstone/react";\n\n<NumberField min={1} max={30} value={keep} onChange={(e) => setKeep(e.target.valueAsNumber)} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          The browser's spinner is an OS widget on its own ground. These arrows have no ground at all; only their ink
          changes on hover, and the digits never run under them.
        </li>
        <li>Each arrow greys out at its own end. A control that looks pressable and does nothing is worse.</li>
        <li>The wheel steps the value only while the field has focus, so scrolling past a field never changes it.</li>
        <li>
          The range lives on the input alone: the arrows, the arrow keys and the wheel all go through{" "}
          <code>stepUp()</code>.
        </li>
        <li>The width belongs to the input and has to be definite, since the arrows sit against its end.</li>
        <li>Under a finger the arrows sit side by side, each the field's full height.</li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          It stays a native <code>input type="number"</code>: a spinbutton with its range, the arrow keys and a phone's
          number pad.
        </li>
        <li>The arrows are hidden from screen readers and out of the tab order, since the input already does their job.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="NumberField" />
      <H2>API</H2>
      <PropsTable of="NumberField" />
    </>
  );
}

export function SidebarRowPage() {
  return (
    <>
      <p className="lead">One destination of the navigation rail: a glyph, a name and, where it has one, a count.</p>
      <Head file="react/SidebarRow.tsx" />
      <Demo name="SidebarRail" />
      <Usage
        code={`import { SidebarRow } from "@glimstone/react";\n\n<SidebarRow label="Backups" glyph={<IconArchive />} href="/backups" active={here} hueIndex={1} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          The rail is real navigation, so a row is a link marked <code>aria-current="page"</code>, not a tab. The rail
          itself, with its brand block and its groups, belongs to the app.
        </li>
        <li>The active row is filled with the accent. Nothing else marks it: no bar beside it, no border.</li>
        <li>
          An idle row shows its colour on its glyph at rest, the accent or its rainbow position. Only reactive rests it
          grey until the pointer comes.
        </li>
        <li>
          The rail has a label mode of its own. Glyph mode narrows the rail to <code>--rail-narrow</code>; reactive keeps
          the full width and slides the name back in.
        </li>
        <li>A count wears its row's colours, and on the active row the two swap.</li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>The name stays the link's name in every mode, and shows in the bubble where it is hidden.</li>
        <li>A count is read in words, such as "3 need attention"; the bare figure is hidden from screen readers.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="SidebarRow" />
      <H2>API</H2>
      <PropsTable of="SidebarRow" />
    </>
  );
}

export function EmptyStatePage() {
  return (
    <>
      <p className="lead">What a list, table or panel shows when it holds nothing.</p>
      <Head file="react/EmptyState.tsx" />
      <Demo name="EmptyStateBasic" />
      <Usage
        code={`import { EmptyState } from "@glimstone/react";\n\n<EmptyState glyph={<IconArchive />} title="No backups yet" action={<Button label="Add a backup" labelKey="add" />} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>An empty list gets a deliberate state, never blank space.</li>
        <li>The glyph is the page's own, muted and large, so the empty state echoes where it is.</li>
        <li>
          "Nothing here yet" and "nothing matches the filter" take the same shape with different words. Calling the
          first one "No results" sends people looking for a filter that was never set.
        </li>
        <li>The hint is one line. Its button carries words, so it is filled like every other.</li>
        <li>
          Inside a card it takes <code>nested</code> and drops its own surface, since a card never holds another card.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="EmptyState" />
      <H2>API</H2>
      <PropsTable of="EmptyState" />
    </>
  );
}

export function SubCardPage() {
  return (
    <>
      <p className="lead">A flat, filled group inside a card, under a small uppercase title.</p>
      <Head file="react/SubCard.tsx" />
      <Demo name="SubCardBasic" />
      <Usage
        code={`import { SubCard } from "@glimstone/react";\n\n<Card title="Snapshots">\n  <SubCard title="Retention">...</SubCard>\n</Card>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          A card never holds another card. Where a card lists things that each need to be seen as one, each becomes a
          sub-card: the second surface at the card radius, without a shadow.
        </li>
        <li>It replaces a fold-out. What used to hide behind a chevron stays in view.</li>
        <li>
          Fields, quiet buttons and bare selector segments inside it step up one surface, or they would vanish into its
          fill.
        </li>
        <li>Its title is not a badge: only a card's outermost heading is.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="SubCard" />
      <H2>API</H2>
      <PropsTable of="SubCard" />
    </>
  );
}
