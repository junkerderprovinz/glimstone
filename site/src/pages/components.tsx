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
      <H2>Compact and key</H2>
      <p>
        <code>compact</code> leaves the glyph alone in a square in every label mode, for a narrow place, and{" "}
        <code>compactBelow</code> does so below a window width in pixels. The label stays the name and the bubble.{" "}
        <code>size="key"</code> is the second height, for the button a surface exists for (rule 19).
      </p>
      <Demo name="ButtonCompact" />
      <H2>Links, and what stands around the words</H2>
      <p>
        <code>href</code> makes it a link with the button's look, and a disabled one is a disabled button.{" "}
        <code>before</code> and <code>after</code>, slots in Vue, hold a count or a key cap inside it. In a flex row a
        button keeps its words and whatever stands beside it gives way.
      </p>
      <Demo name="ButtonRow" />
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
      <H2>Refusing for now</H2>
      <p>
        A switch that cannot be flipped right now takes <code>refused</code>, the sentence that says why. OLED does so
        while Light is chosen, since there is no dark to put on black. It keeps its state and its place in the tab order,
        its track dims, and a press shakes it. The sentence is its bubble, and on a touch screen a line under the row.
        Under System the switch stays free, for the device's dark.
      </p>
      <Demo name="ToggleRefused" />
      <Usage code={`import { oledRefusal } from "@glimstone/core";\n\n<Toggle label="OLED" checked={oled} onChange={setOled} refused={oledRefusal(theme)} />`} />
      <H2>Accessibility</H2>
      <ul>
        <li>
          A <code>button</code> with <code>role="switch"</code> and <code>aria-checked</code>.
        </li>
        <li>
          The label is always the accessible name. <code>hideLabel</code> drops only the visible caption, for a row
          that draws the same text right beside it.
        </li>
        <li>
          An <code>id</code>, a data attribute or a listener lands on the switch itself, which is what a script asks for
          its state. A class stays on the frame.
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
      <H2>Markup in the notch</H2>
      <p>
        <code>drawn</code> in React and the <code>title</code> slot in Vue hold a count or an unsaved dot beside the
        words.
      </p>
      <Demo name="CardTitleSlot" />
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
      <H2>Behaviour</H2>
      <ContractTable of="Card" />
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
        <li>
          An entry's <code>action</code> is a filled button such as Undo, under the message. A press runs it and dismisses
          the toast.
        </li>
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
      <H2>One row at every width</H2>
      <p>
        A selector never wraps and never scrolls, and a label never takes a second line. Where the segments do not fit
        at their pinned width they share the row by their labels. Where the labels do not fit either, a strip with a
        glyph on every segment shows the glyphs alone, the whole label staying the segment's name and its bubble. Any
        other strip of one turns into the dropdown, showing the chosen value with every label whole in its list, and
        comes back as segments once they fit. A <code>select="many"</code> strip cuts its long labels short instead,
        with the whole label in the bubble, since a dropdown holds one value. Narrow the window to see it.
      </p>
      <Demo name="SelectorOneRow" />
      <H2>Numbers, hooks and presses</H2>
      <p>
        An item's <code>id</code> may be a number, and it comes back as one. <code>attrs</code> puts attributes on the
        item's own segment, such as a data hook. <code>onPress</code>, <code>@press</code> in Vue, hears every press and
        every arrow key that chooses, before the choice changes, also one on the segment already chosen.
      </p>
      <Demo name="SelectorSteps" />
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
        <li>
          <code>fit</code> shares the row evenly among page tabs without pinning them to a measured width.{" "}
          <code>pairsOnPhone</code> is still accepted and has no effect.
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
      <H2>Without a link, and with more in the row</H2>
      <p>
        Without an <code>href</code> the row is a button. <code>before</code> and <code>after</code>, slots in Vue, hold a
        tree's toggle, a meter, free space or a pin. A control there answers on its own, and a click anywhere else still
        goes to the row. A row with slots is never centred, so they stay in reach in every label mode.{" "}
        <code>depth</code> steps a tree's row in by its level, with a smaller glyph and gap, so a deep name keeps its
        room.
      </p>
      <Demo name="SidebarSlots" />
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

export function FortressPage() {
  return (
    <>
      <p className="lead">
        The fortress in an app's Instances tab: its own instances first, a switch that shows the other apps of the
        fortress with their permissions, and the windows to join with the phrase, leave, remove an instance and show or
        change the phrase.
      </p>
      <Head file="react/Fortress.tsx" />
      <Demo name="FortressBasic" />
      <Usage
        code={`import { Fortress, InstanceCard } from "@glimstone/react";
import { fortressText } from "@glimstone/core";

<Fortress
  text={fortressText(lang)}
  lang={lang}
  app={{ id: "alpha", name: "Alpha", logo }}
  joined={status.joined}
  apps={status.otherApps}
  permissions={status.permissions}
  pairedWith={status.pairedDevices}
  phrasePassword
  hueStart={ownCards.length}
  onJoin={(words) => api.join(words)}
  onLeave={() => api.leave()}
  onRemove={(id) => api.remove(id)}
  onShowPhrase={(password) => api.phrase(password)}
  onChangePhrase={() => api.changePhrase()}
  onPermission={(id, on) => api.permission(id, on)}
>
  {(remove) => ownCards.map((c, i) => <InstanceCard key={c.id} {...c} hueIndex={i} />)}
</Fortress>`}
      />
      <H2>Outside a fortress</H2>
      <p>
        An app in no fortress keeps its own cards and shows an empty place beside them, with the one way in in the
        corner: the phrase. Paste it into the first field and it spreads over all twelve.
      </p>
      <Demo name="FortressOut" />
      <H2>Words</H2>
      <p>
        <code>fortressText(lang)</code> hands out the words in every language of the glossary, and each language is its
        own module under <code>@glimstone/core/fortressLocales/</code> for an app that knows its language at build time.
        The sentences that are the app's own, such as what a permission allows, come in with the data.
      </p>
      <H2>Rules</H2>
      <ul>
        <li>The fortress has no tab of its own. It lives in the Instances tab, which shows this app's instances first.</li>
        <li>The other apps and the permissions show only once the switch is on, and the switch is kept per device.</li>
        <li>An app joins with the phrase and nothing else. There is no field for an address anywhere.</li>
        <li>Show phrase, Change phrase and Leave fortress stand in the corner, Show phrase as the one filled button.</li>
        <li>Every card owns a rainbow position, so its buttons and switches take its hue.</li>
        <li>Permissions are on until switched off, one switch per pair. A refused switch shakes and stays as it was.</li>
        <li>The phrase shows only after the app's password where the app has one.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Fortress" />
      <H2>API</H2>
      <PropsTable of="Fortress" />
      <H2>InstanceCard</H2>
      <PropsTable of="InstanceCard" />
    </>
  );
}

export function SignInCardPage() {
  return (
    <>
      <p className="lead">
        The way into an app with a login: its logo and name, the password, a code when the server asks for one, a
        passkey, and the reset form in the same card.
      </p>
      <Head file="react/SignInCard.tsx" />
      <Demo name="SignInCardBasic" />
      <Usage
        code={`import { SignInCard } from "@glimstone/react";

<SignInCard
  logo="/logo.svg"
  appName="GlimStone"
  text={text}
  passkey={offerPasskey}
  reset
  minPassword={12}
  onSignIn={({ password, code }) => api.login(password, code)}
  onPasskey={() => api.loginWithPasskey()}
  onAskCode={() => api.startPasswordReset()}
  onSetPassword={({ code, password }) => api.finishPasswordReset(code, password)}
/>`}
      />
      <H2>Slots</H2>
      <p>
        <code>fields</code> stand above the password, such as a name and a switch to stay signed in. <code>actions</code>{" "}
        stand under Sign in and the passkey, such as a second way in through a single sign-on. <code>step</code> takes
        the forms' place for a step the app runs itself, such as recovery codes or the page after a reset. In Vue they
        are slots of the same names. <code>SignInField</code> gives a field of the app's own the label above it.
      </p>
      <Demo name="SignInCardSlots" />
      <H2>Rules</H2>
      <ul>
        <li>The logo stands 7.5rem tall at its own proportions with the name under it, centred in the card. No server name, no pill above the card.</li>
        <li>Labels stand above their fields, in normal case. The first empty field has the focus when the card opens.</li>
        <li>Sign in stays disabled until the password field holds something. Every button is as wide as the fields.</li>
        <li>
          A refused try shakes the button that sent it and selects the refused field. At motion off and under reduced
          motion nothing moves, and the reason above the button says it alone.
        </li>
        <li>The accent, theme, shape and motion the app stored in the browser apply before anybody is signed in.</li>
        <li>No language picker and no version number on the page. It follows the system theme.</li>
        <li>
          The card is 24rem wide, and on a phone it fills the width with 16px either side. Its top edge stays where it is when a
          reason, the code field or the reset form makes it taller.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="SignInCard" />
      <H2>API</H2>
      <PropsTable of="SignInCard" />
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
        <li>Its title is not a badge: only a card's outermost heading is. A group that needs no name goes without one.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="SubCard" />
      <H2>API</H2>
      <PropsTable of="SubCard" />
    </>
  );
}

export function WindowPage() {
  return (
    <>
      <p className="lead">
        The window for everything that is more than a question: a form, a list to pick from, a tool. A notch with its
        title, a body that scrolls on its own and a foot with the answers at its end.
      </p>
      <Head file="react/Window.tsx" />
      <Demo name="WindowColumns" />
      <Usage
        code={`import { Window } from "@glimstone/react";

{open && (
  <Window
    title="Columns"
    size="wide"
    text={{ cancel: t("cancel"), close: t("close") }}
    start="Drag a column's header to move it"
    actions={[{ label: t("apply"), labelKey: "apply", primary: true, onClick: apply }]}
    onClose={() => setOpen(false)}
  >
    ...
  </Window>
)}`}
      />
      <H2>The way out</H2>
      <p>
        Every window can be left from its foot. When none of its actions is a way out, the window adds one before them:
        Cancel when an action goes forward, Close when the window only shows something. An action that already leaves,
        such as Got it, says so with <code>wayOut</code>, and then nothing is added.
      </p>
      <p>
        An action closes the window once it has run. One that changes something in view, such as a reset, returns{" "}
        <code>false</code> and the window stays for a second look.
      </p>
      <H2>A full foot</H2>
      <p>
        Foot buttons hug their words down to the smallest width floor, so a start text and three buttons, or four buttons,
        stand on one line in a normal window.
      </p>
      <Demo name="WindowBusyFoot" />
      <H2>Hooks</H2>
      <p>
        An action's <code>attrs</code> go on its foot button. <code>ref</code> in React and the exposed{" "}
        <code>card</code> in Vue hand over the card element, for a caller that measures it or looks for something inside.
        A long <code>start</code> wraps, and the buttons keep their words beside it. <code>drawn</code> in React and the{" "}
        <code>title</code> slot in Vue hold a count in the notch, and <code>title</code> alone stays the window's name.
      </p>
      <Demo name="WindowHooks" />
      <H2>Rules</H2>
      <ul>
        <li>The content is as wide as the window, and the answers stand at the end of the foot, the forward one last.</li>
        <li>
          <code>start</code> holds one quiet line at the start of the foot, such as where the work carries on. A link out
          of the app goes there too.
        </li>
        <li>
          Three widths: <code>normal</code> for a question or a form, <code>wide</code> for a list and <code>full</code>{" "}
          for a tool that needs the screen.
        </li>
        <li>Windows stack. Escape and Tab belong to the one in front, and a press beside an open menu closes only the menu.</li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          <code>role="dialog"</code> with <code>aria-modal</code>, named by its notch.
        </li>
        <li>Focus lands on the first field, so typing can start at once, or on the forward action when there is no field.</li>
        <li>When the window closes, focus goes back to the control that opened it.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Window" />
      <H2>API</H2>
      <PropsTable of="Window" />
    </>
  );
}

export function ContextMenuPage() {
  return (
    <>
      <p className="lead">
        A menu at a point: a right-click on a row, a More button, or one menu of the bar. Its rows can carry a glyph, a
        key, a count, a box to tick or a submenu.
      </p>
      <Head file="react/ContextMenu.tsx" />
      <Demo name="ContextMenuRows" />
      <Usage
        code={`import { ContextMenu, type MenuEntry } from "@glimstone/react";

const items: MenuEntry[] = [
  { label: "Open", glyph: <IconFolderOpen />, shortcut: "Enter", onSelect: open },
  "-",
  { label: "Sort by", sub: sorts.map((s) => ({ label: s, radio: true, checked: sort === s, onSelect: () => setSort(s) })) },
  { label: "Show hidden files", checked: hidden, onSelect: () => setHidden(!hidden) },
];

{at && <ContextMenu x={at.x} y={at.y} items={items} onClose={() => setAt(null)} />}`}
      />
      <H2>What a row can be</H2>
      <ul>
        <li>
          A plain row runs its action and closes the menu. A row without a glyph keeps the glyph's room, so every label
          starts at one edge.
        </li>
        <li>
          A row with <code>checked</code> is on or off. It shows a box where its glyph would be and leaves the menu open,
          so several can be ticked in a row.
        </li>
        <li>
          With <code>radio</code> as well it is one choice among several: it keeps its glyph, the current choice is ticked
          at the end, and choosing closes the menu.
        </li>
        <li>
          <code>shortcut</code> shows the key that does the same, and <code>count</code> a figure at the end.{" "}
          <code>color</code> puts a dot where the glyph would be.
        </li>
        <li>
          <code>sub</code> opens its rows beside the row, one level deep. The submenu is a menu of its own on the body, so
          the first menu's scrolling cannot cut it off.
        </li>
        <li>
          A heading groups the rows under it. With <code>edit</code> it carries a pencil for a group people keep
          themselves, such as bookmarks.
        </li>
        <li>
          Separators at either end, twice in a row or right under a heading are dropped, so a menu put together from parts
          needs no care.
        </li>
      </ul>
      <H2>Rules</H2>
      <ul>
        <li>One menu is open at a time. Opening another closes the first.</li>
        <li>
          It stays inside the window: near an edge it moves back in by its own size, and a submenu opens on the other side
          when there is no room.
        </li>
        <li>A menu over a window closes before the window does: Escape and a press beside it reach the menu first.</li>
        <li>
          Opened with the pointer, the first row holds the focus without showing it: no ring and no wash until a key is
          pressed in the menu. Opened from the keyboard, the ring shows at once.
        </li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          <code>role="menu"</code> with <code>menuitem</code>, <code>menuitemcheckbox</code> and{" "}
          <code>menuitemradio</code> rows. A box or a tick is drawn, and the state is in <code>aria-checked</code>.
        </li>
        <li>
          The arrows move through the rows and skip disabled ones. Right opens a submenu and left closes it, mirrored under
          right to left.
        </li>
        <li>
          A choice or Escape gives the focus back to where it was, or to <code>opener</code>.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="ContextMenu" />
      <H2>API</H2>
      <PropsTable of="ContextMenu" />
    </>
  );
}

export function MenuBarPage() {
  return (
    <>
      <p className="lead">
        The row of menus in a desktop-style app's head bar, which moves between its menus the way a desktop program does.
      </p>
      <Head file="react/MenuBar.tsx" />
      <Demo name="MenuBarDemo" />
      <Usage
        code={`import { MenuBar, type MenuBarHandle } from "@glimstone/react";

const bar = useRef<MenuBarHandle>(null);
// F10 is the app's key, so the app opens the first menu itself.
onKey("F10", () => bar.current?.open(0));

<MenuBar ref={bar} label="Menu" menus={[{ label: "File", items: fileItems }, { label: "Edit", items: editItems }]} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>Each word opens its menu below it. The rows are the same as a ContextMenu's.</li>
        <li>While a menu is open, the pointer on another word opens that one instead, and so do left and right.</li>
        <li>Clicking the open menu's word closes it.</li>
        <li>
          On a narrow screen the bar gives way to one button that lists every menu under its own heading. That button
          belongs to the app.
        </li>
      </ul>
      <H2>Accessibility</H2>
      <ul>
        <li>
          <code>role="menubar"</code> named by its label, one tab stop. Each word is a <code>menuitem</code> with{" "}
          <code>aria-haspopup</code> and <code>aria-expanded</code>.
        </li>
        <li>Left and right move between the words, and down or Enter opens a menu with the focus on its first row.</li>
        <li>Escape closes the menu and puts the focus back on its word.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="MenuBar" />
      <H2>API</H2>
      <PropsTable of="MenuBar" />
    </>
  );
}

export function CheckboxPage() {
  return (
    <>
      <p className="lead">The box for the few places where a switch is the wrong answer.</p>
      <Head file="react/Checkbox.tsx" />
      <Demo name="CheckboxBasic" />
      <Usage
        code={`import { Checkbox } from "@glimstone/react";\n\n<Checkbox label="Don't show again" checked={again} onChange={setAgain} />`}
      />
      <H2>When to use it</H2>
      <ul>
        <li>
          Under a notice that can be switched off, as "Don't show again" (rule 39). A switch there looks like a setting
          that strayed into the notice.
        </li>
        <li>
          In a column of choices that are applied together, such as which columns a list shows, and in a menu row that is
          on or off.
        </li>
        <li>
          Every setting stays a <a href="#/components/toggle">Toggle</a>.
        </li>
      </ul>
      <H2>Rules</H2>
      <ul>
        <li>Drawn, never the system's box. It reads the control radius, held small enough to stay a box.</li>
        <li>Ticked, it fills with the accent and the tick takes the accent's contrast ink.</li>
        <li>The whole row is the target, the words as well as the box.</li>
      </ul>
      <H2>Slim</H2>
      <p>
        <code>slim</code> draws the box alone, without the padding and the hover ground, for a row or a cell of a dense
        list whose choices are applied together, such as the files a cleanup removes. The row around it gives the hover,
        and the label is the box's accessible name.
      </p>
      <Demo name="CheckboxSlim" />
      <H2>Behaviour</H2>
      <ContractTable of="Checkbox" />
      <H2>API</H2>
      <PropsTable of="Checkbox" />
    </>
  );
}

export function KbdPage() {
  return (
    <>
      <p className="lead">A key or a key combination, as it is written on the keys.</p>
      <Head file="react/Kbd.tsx" />
      <Demo name="KbdBasic" />
      <Usage code={`import { Kbd } from "@glimstone/react";\n\n<Kbd>Ctrl+K</Kbd>`} />
      <H2>Rules</H2>
      <ul>
        <li>The words are the app's own, so a German app writes Strg and Entf.</li>
        <li>It is set in the app's type, not the browser's monospace, and sits on the third surface.</li>
        <li>A menu row draws its key with it, at the end of the row.</li>
      </ul>
      <H2>API</H2>
      <PropsTable of="Kbd" />
    </>
  );
}

export function PillPage() {
  return (
    <>
      <p className="lead">One value of a list row: a size, a date or what the row is doing.</p>
      <Head file="react/Pill.tsx" />
      <Demo name="PillTones" />
      <Usage code={`import { Pill } from "@glimstone/react";\n\n<Pill className="glim-num">4.2 GB</Pill>\n<Pill tone="ok">Done</Pill>`} />
      <H2>A pill or a badge</H2>
      <p>
        A <a href="#/components/badge">Badge</a> says something about a row and is coloured to be seen. A pill is one of
        the row's values and stays quiet, so a column of them reads as one column. A state washes it in its colour over
        the second surface, and the words keep the body ink.
      </p>
      <H2>Rules</H2>
      <ul>
        <li>
          <code>glim-num</code> lines figures up, so sizes and percentages in a column do not jitter.
        </li>
        <li>
          <code>state</code> lifts a word that says what the row is doing. <code>ok</code>, <code>warn</code> and{" "}
          <code>fail</code> are the state colours and nothing else.
        </li>
      </ul>
      <H2>In a well</H2>
      <p>
        In a <code>glim-well</code> or a <a href="#/components/sub-card">SubCard</a> a pill steps up one surface, so it
        does not vanish into the ground, and a state keeps its wash.
      </p>
      <Demo name="PillWell" />
      <H2>Behaviour</H2>
      <ContractTable of="Pill" />
      <H2>API</H2>
      <PropsTable of="Pill" />
    </>
  );
}

export function PasswordFieldPage() {
  return (
    <>
      <p className="lead">A field for a secret, with the eye that shows it inside the field.</p>
      <Head file="react/PasswordField.tsx" />
      <Demo name="PasswordFieldBasic" />
      <Usage
        code={`import { PasswordField } from "@glimstone/react";\n\n<PasswordField aria-label={t("password")} value={pw} onChange={(e) => setPw(e.target.value)} text={{ show: t("show"), hide: t("hide") }} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The eye is a bare glyph in the field's trailing padding, neutral and never the accent. It means look, not act.</li>
        <li>
          The field is as wide as a plain field in the same column, or takes <code>width</code>. In Vue a template ref
          reaches the input as <code>input</code>, and <code>eyeAttrs</code> go on the eye.
        </li>
        <li>Edge's own eye is switched off, so there is only one.</li>
        <li>
          A secret that is already stored is a row with Change, not an empty field on every visit ("The reveal eye" in the
          design language).
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="PasswordField" />
      <H2>API</H2>
      <PropsTable of="PasswordField" />
    </>
  );
}

export function TextFieldPage() {
  return (
    <>
      <p className="lead">A line of text and a few lines of text, borderless and filled.</p>
      <Head file="react/TextField.tsx" />
      <Demo name="TextFieldBasic" />
      <Usage
        code={`import { TextArea, TextField } from "@glimstone/react";

<TextField label={t("name")} width="wide" value={name} onChange={(e) => setName(e.target.value)} />
<TextArea label={t("notes")} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>Focus is a step up the ramp, never a ring: the fill and the caret say where the typing goes (rule 14).</li>
        <li>
          A field beside its name stands in a <a href="#/components/field-row">FieldRow</a>, which names it (rule 35).
          A text area keeps its name above it, because it needs the column's width.
        </li>
        <li>
          Four widths and the column: <code>short</code> for a port or a time, <code>medium</code> for a word,{" "}
          <code>wide</code> for a line of text, <code>grow</code> for what a row has left, and <code>fill</code> for the
          whole column. <code>PasswordField</code>, <code>CopyField</code> and <code>PathField</code> take the same{" "}
          <code>width</code>, and any other wrapper the class <code>glim-field--wide</code> and its siblings.
        </li>
        <li>
          <code>mono</code> sets a path or a token in monospace.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="TextField" />
      <H2>API</H2>
      <PropsTable of="TextField" />
      <H2>TextArea</H2>
      <PropsTable of="TextArea" />
    </>
  );
}

export function FieldRowPage() {
  return (
    <>
      <p className="lead">One labelled row of a card or a window: the name at its start, the control at its end.</p>
      <Head file="react/FieldRow.tsx" />
      <Demo name="FieldRowBasic" />
      <Usage
        code={`import { FieldRow, Toggle } from "@glimstone/react";

<FieldRow label={t("notify")} hint={t("notifyHint")}>
  <Toggle checked={notify} onChange={setNotify} />
</FieldRow>
<FieldRow label={t("lastRun")} value={lastRun} />`}
      />
      <H2>A group of rows</H2>
      <p>
        <code>FieldRowGroup</code> gives the rows in it one column for their names, as wide as the longest, so fields
        that grow start at one edge. The rows stand directly in it. Below 600px they wrap on their own again.
      </p>
      <Demo name="FieldRowGroup" />
      <p>
        <code>columns={2}</code> sets two columns of rows side by side, each lining up its own names, and{" "}
        <code>wide</code> lets a row span both.
      </p>
      <Demo name="FieldRowColumns" />
      <H2>Rules</H2>
      <ul>
        <li>
          The label names the control, so <code>Toggle</code>, <code>Selector</code>, <code>Select</code>,{" "}
          <code>TextField</code>, <code>TextArea</code>, <code>GlyphField</code>, <code>PasswordField</code>,{" "}
          <code>NumberField</code>, <code>CopyField</code>, <code>PathField</code>, <code>Slider</code> and{" "}
          <code>Combobox</code> need no <code>label</code> of their own there. An app's own
          control asks <code>useFieldName</code> for it.
        </li>
        <li>Several controls stand together at the row's end, and one with <code>width="grow"</code> takes all the room the name leaves.</li>
        <li>A click on the label focuses a field and flips a switch, as a real label does. A selector stays as it is.</li>
        <li>
          <code>hint</code> is the "(i)" beside the name (rule 8). Words in other markup, such as a quiet "optional", go
          into <code>drawn</code> in React and the <code>label</code> slot in Vue; the <code>label</code> stays the name.
        </li>
        <li>
          With only a <code>value</code> the row shows it as a <a href="#/components/pill">Pill</a>, in its{" "}
          <code>tone</code>.
        </li>
        <li>Where the row is too narrow for both, the control moves under the name and keeps the row's end (rule 35).</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="FieldRow" />
      <H2>API</H2>
      <PropsTable of="FieldRow" />
    </>
  );
}

export function PathFieldPage() {
  return (
    <>
      <p className="lead">A path to type, and a button beside it that asks the app for one.</p>
      <Head file="react/PathField.tsx" />
      <Demo name="PathFieldBasic" />
      <Usage
        code={`import { PathField } from "@glimstone/react";

<PathField label={t("target")} value={path} onChange={setPath} pick={openFolderPicker} text={{ pick: t("choose") }} />`}
      />
      <H2>The picker is the app's</H2>
      <p>
        GlimStone does not know where an app's folders come from. <code>pick</code> is handed the path in the field and
        answers with a path, or with nothing when the person left, and it may take its time. Most apps open a{" "}
        <a href="#/components/window">Window</a> with a <a href="#/components/tree">Tree</a>, as this demo does.
      </p>
      <H2>Rules</H2>
      <ul>
        <li>The path is set in monospace, and the field takes the focus back once the picker has answered.</li>
        <li>The button is an ordinary icon button that follows the label mode. <code>glyph</code> swaps the open folder for a file.</li>
        <li>With less than 20rem of room, or with <code>compact</code>, the button shows its glyph alone and leaves the room to the path.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="PathField" />
      <H2>API</H2>
      <PropsTable of="PathField" />
    </>
  );
}

export function TreePage() {
  return (
    <>
      <p className="lead">A hierarchy to walk through, such as the folders of a picker, loaded as it opens.</p>
      <Head file="react/Tree.tsx" />
      <Demo name="TreeBasic" />
      <Usage
        code={`import { Tree } from "@glimstone/react";

<Tree label={t("folders")} load={listFolder} defaultOpen={["/mnt"]} value={chosen} onChange={setChosen} onActivate={take} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          <code>load</code> is asked for the children of a row the first time it opens, and for the top with{" "}
          <code>null</code>. It may be async, and a list that failed is asked for again on the next opening.
        </li>
        <li>
          This is the one thing that opens in place (rule 26), because the rows are what it is for: a fold hides a part of
          a page, and a tree's rows are the content being walked through.
        </li>
        <li>The chosen row is filled with the accent. Double click and Enter report the row as acted on, for a picker that takes it at once.</li>
        <li>A row gets the glyph it names, and <code>openGlyph</code> while it is open.</li>
        <li>It draws no ground of its own, so it goes into a <code>glim-well</code> or a card as it is.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Tree" />
      <H2>API</H2>
      <PropsTable of="Tree" />
    </>
  );
}

export function RowMarkPage() {
  return (
    <>
      <p className="lead">The round mark on a row picked for an action on many.</p>
      <Head file="react/RowMark.tsx" />
      <Demo name="RowMarkBasic" />
      <Usage code={`import { RowMark } from "@glimstone/react";\n\n<RowMark on={picked.has(file.id)} />`} />
      <H2>Rules</H2>
      <ul>
        <li>
          Picking rows for a bulk action is this mark, never a <a href="#/components/checkbox">Checkbox</a> (rule 39).
          Round, so the two do not read as one control.
        </li>
        <li>Show it once something in the list is picked or while the pointer is over the row, in the glyph's place.</li>
        <li>On, it fills with <code>--accent</code>, so in a row with a rainbow position it takes that hue.</li>
        <li>The mark is a picture. The row says it is picked, with <code>aria-selected</code>.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="RowMark" />
      <H2>API</H2>
      <PropsTable of="RowMark" />
    </>
  );
}

export function ListRowPage() {
  return (
    <>
      <p className="lead">One row of a list: its tile and name, its badges, and buttons that come in on hover.</p>
      <Head file="react/ListRow.tsx" />
      <Demo name="ListRowBasic" />
      <Usage
        code={`import { IconButton, ListRow, Pill } from "@glimstone/react";

<ListRow
  name={job.name}
  tip={job.note}
  onClick={() => open(job)}
  tile={<IconFolder />}
  badges={<Pill>{job.size}</Pill>}
  actions={<IconButton tip={t("edit")} glyph={<IconPencil />} onClick={() => edit(job)} />}
/>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>At rest a row shows its name and its badges. Its buttons come in on hover and on focus, and stay in on a touch screen (rule 6).</li>
        <li>The tile fills with the accent while the row is hovered or focused ("Lists").</li>
        <li>A click handler makes the whole row the way into its object, with Enter and Space. A press on one of its buttons or its "(i)" stays there.</li>
        <li>Rows in a list share one height, so a long name ends in an ellipsis.</li>
        <li>Below 600px the badges go and the name keeps the room.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="ListRow" />
      <H2>API</H2>
      <PropsTable of="ListRow" />
    </>
  );
}

export function IconButtonPage() {
  return (
    <>
      <p className="lead">A glyph in a square, in every label mode, for a row that keeps its text.</p>
      <Head file="react/IconButton.tsx" />
      <Demo name="IconButtonBasic" />
      <Usage code={`import { IconButton } from "@glimstone/react";\n\n<IconButton tip={t("copy")} glyph={<IconCopy />} onClick={copy} />`} />
      <H2>When to use it</H2>
      <ul>
        <li>
          For the buttons of a list row or a dense toolbar, where words would push out the row's own text. Every other
          button with one action stays a <a href="#/components/button">Button</a> with <code>variant="icon"</code>,
          which follows the label mode (rule 13).
        </li>
        <li>
          It has no ground. The glyph takes the accent under the pointer and the square stays clear (rules 38 and 40).
        </li>
        <li>
          <code>href</code> makes it a link in the same square. <code>pressed</code> makes it a button that stays on or
          off, which the accent washes while it is on.
        </li>
        <li>
          <code>absent</code> holds the place of a button a row does not have, so the others stay where they are in
          every row.
        </li>
        <li>
          <a href="#/components/icon-tip-button">IconTipButton</a> stays the bare control for a box the caller draws itself.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="IconButton" />
      <H2>API</H2>
      <PropsTable of="IconButton" />
    </>
  );
}

export function GlyphFieldPage() {
  return (
    <>
      <p className="lead">A field with a glyph inside it, such as a filter or a search.</p>
      <Head file="react/GlyphField.tsx" />
      <Demo name="GlyphFieldBasic" />
      <Usage code={`import { GlyphField } from "@glimstone/react";\n\n<GlyphField label={t("filter")} glyph={<IconSearch />} value={query} onChange={(e) => setQuery(e.target.value)} />`} />
      <H2>Rules</H2>
      <ul>
        <li>The box is the field: it is filled, it steps up the ramp while the field has focus, and a click on the glyph reaches the field (rule 14).</li>
        <li>
          <code>after</code>, a slot in Vue, holds controls inside the box, such as a clear button. They stay out of the
          field's name.
        </li>
        <li>It takes the widths of a text field, and a FieldRow names it.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="GlyphField" />
      <H2>API</H2>
      <PropsTable of="GlyphField" />
    </>
  );
}

export function GlyphTilePage() {
  return (
    <>
      <p className="lead">A small holder for a glyph at the start of a row or beside a name.</p>
      <Head file="react/GlyphTile.tsx" />
      <Demo name="GlyphTileBasic" />
      <Usage code={`import { GlyphTile } from "@glimstone/react";\n\n<GlyphTile glyph={<IconFolder />} />`} />
      <H2>Rules</H2>
      <ul>
        <li>The glyph takes the accent, and <code>quiet</code> takes it off for a file among folders.</li>
        <li><code>ground</code> sets it on the third surface, for a place where a bare glyph gets lost.</li>
        <li>It fills with the accent while <code>active</code>, and while a row, button or link around it is reached ("Lists").</li>
        <li>It is a picture, so the words beside it name the row.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="GlyphTile" />
      <H2>API</H2>
      <PropsTable of="GlyphTile" />
    </>
  );
}

export function TablePage() {
  return (
    <>
      <p className="lead">A short list of facts in columns, inside a card or a window.</p>
      <Head file="react/Table.tsx" />
      <Demo name="TableBasic" />
      <Usage
        code={`import { Table } from "@glimstone/react";

<Table label={t("largest")} columns={[{ key: "name", label: t("name") }, { key: "size", label: t("size"), end: true }]} rows={files} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>It holds a few facts to read. A list a person works through is a list of <a href="#/components/list-row">rows</a> ("Lists").</li>
        <li>Rows are parted by hairlines at low opacity, and there is no box around them (rule 5).</li>
        <li><code>end</code> sets a column of figures at the end with digits that line up (rule 7).</li>
        <li><code>tone</code> is <code>muted</code> for a quiet column and <code>accent</code> for what changes.</li>
        <li><code>more</code> is one quiet line under the last row, such as how many more there are.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Table" />
      <H2>API</H2>
      <PropsTable of="Table" />
    </>
  );
}

export function CopyFieldPage() {
  return (
    <>
      <p className="lead">A value to copy rather than type: a token, a path, an address.</p>
      <Head file="react/CopyField.tsx" />
      <Demo name="CopyFieldBasic" />
      <Usage
        code={`import { CopyField } from "@glimstone/react";\n\n<CopyField label={t("token")} value={token} text={{ copy: t("copy"), copied: t("copied") }} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The value is set in monospace and stays selectable, so a part of it can be copied by hand.</li>
        <li>The button says Copied with a tick for a moment, and a screen reader hears it from a status line.</li>
        <li>
          The Clipboard API needs a secure context. Over plain http on the local network the copy takes the older way, and
          where the browser refuses both, the value is selected so Ctrl+C works.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="CopyField" />
      <H2>API</H2>
      <PropsTable of="CopyField" />
    </>
  );
}

export function MeterPage() {
  return (
    <>
      <p className="lead">A level that stands, such as how full a disk is.</p>
      <Head file="react/Meter.tsx" />
      <Demo name="MeterLevels" />
      <Usage
        code={`import { Meter } from "@glimstone/react";\n\n<Meter size="small" value={used / total} label={disk.name} valueText={t("freeOf", { free, total })} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          <code>small</code> sits beside a row's name, as in a rail of disks. <code>medium</code> is as wide as its column.
        </li>
        <li>
          From <code>threshold</code> on, 0.9 unless set, the fill takes the fault colour. A nearly full disk is a problem
          to see from across the room.
        </li>
        <li>
          Nothing moves on a meter. It shows a level that stands, so it has no sheen, and without a value the track shows
          still stripes. A light that travels belongs to a <a href="#/components/progress-bar">ProgressBar</a>, where
          something runs.
        </li>
        <li>In the active row of a rail it takes the row's contrast ink.</li>
        <li>The track is contained (rule 37), so a meter that changes all the time lays out nothing around it.</li>
      </ul>
      <H2>Quiet</H2>
      <p>
        <code>quiet</code> is the meter for a footer line or a dense list, where an accent bar on every row would outshout
        the names beside it: a slim track on the second surface and a grey fill. Inside a button it takes the accent while
        the button is reached, and the threshold still turns it red.
      </p>
      <Demo name="MeterQuiet" />
      <H2>Behaviour</H2>
      <ContractTable of="Meter" />
      <H2>API</H2>
      <PropsTable of="Meter" />
    </>
  );
}

export function ProgressBarPage() {
  return (
    <>
      <p className="lead">Work that moves toward its end, with a sheen while it runs.</p>
      <Head file="react/ProgressBar.tsx" />
      <Demo name="ProgressBarStates" />
      <Usage
        code={`import { ProgressBar } from "@glimstone/react";\n\n<ProgressBar value={done / total} label={t("copying")} paused={job.paused} failed={job.failed} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          The sheen runs only while the work does. It stops when the work is paused, done or failed, and a{" "}
          <a href="#/components/meter">Meter</a> never has one.
        </li>
        <li>Paused takes the waiting tone and failed the fault colour, so the state hues stay four (rule 4).</li>
        <li>
          The sheen reads <code>--motion-progress-sheen-dur</code> and the light of a bar without a value{" "}
          <code>--motion-indeterminate-dur</code>. Both stop at "off" and under reduced motion.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="ProgressBar" />
      <H2>API</H2>
      <PropsTable of="ProgressBar" />
    </>
  );
}

export function ColorPickerPage() {
  return (
    <>
      <p className="lead">
        The colour picker as a component: a square and a hue bar, a preview with the name the colour proposes, the hex
        field and Apply.
      </p>
      <Head file="react/ColorPicker.tsx" />
      <Demo name="ColorPickerSwatch" />
      <Usage
        code={`import { ColorPicker } from "@glimstone/react";

<button className="swatch" style={{ background: hex }} onClick={(e) => setAnchor(e.currentTarget)} />
{anchor && (
  <ColorPicker
    value={hex}
    anchor={anchor}
    text={{ apply: t("apply"), hex: t("hex"), area: t("saturationBrightness"), hue: t("hue") }}
    onApply={(hex, name) => save(hex, name)}
    onClose={() => setAnchor(null)}
  />
)}`}
      />
      <H2>Floating or in the page</H2>
      <p>
        With an <code>anchor</code> the picker floats beside the control that opened it, below it or above where there is
        no room. It is the document's one open menu, so Escape and a click beside it close the picker before a window under
        it. Without an anchor it sits in the page, for a settings page with room for it.
      </p>
      <Demo name="ColorPickerInline" />
      <H2>The name</H2>
      <p>
        The name is the nearest entry of a list, measured in OKLab, where distances follow what the eye sees.{" "}
        <code>COLOR_NAMES_DE</code> in the core holds about ninety German names and is the default. <code>names</code>{" "}
        takes another list of <code>[name, hex]</code> pairs, and <code>false</code> shows none. The name goes to{" "}
        <code>onApply</code> with the colour, so a label can start out named.
      </p>
      <H2>Rules</H2>
      <ul>
        <li>
          Nothing changes before Apply. <code>onInput</code> reports every step for a live preview elsewhere.
        </li>
        <li>Mouse, pen and finger drag the same way and keep dragging past the square's edge.</li>
        <li>
          The arrow keys move the colour, Shift in bigger steps. On the square left and right are saturation, up and down
          brightness. Home and End go to the ends of the hue bar.
        </li>
        <li>
          Never a native <code>{`<input type="color">`}</code>, which can open a window of its own outside the page ("The
          user-owned axes" in the design language).
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="ColorPicker" />
      <H2>API</H2>
      <PropsTable of="ColorPicker" />
    </>
  );
}
