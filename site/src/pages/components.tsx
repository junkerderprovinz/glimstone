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
      <Usage code={`import { Button } from "./components/Button";\n\n<Button label="Save" labelKey="save" tone="accent" onClick={save} />`} />
      <H2>Tones</H2>
      <p>
        <code>accent</code> is the one action a view is for. <code>neutral</code> is the default, <code>subtle</code>{" "}
        sits on a surface that already has a fill, and <code>ok</code>, <code>danger</code> and <code>warn</code> carry a
        state. A background written in <code>className</code> next to a tone wins or loses by stylesheet order, so a
        control that needs another fill gets a new tone instead.
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
      <Usage code={`import { Toggle } from "./components/Toggle";\n\n<Toggle label="Quiet notifications" checked={quiet} onChange={setQuiet} />`} />
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
      <Usage code={`import { Badge } from "./components/Badge";\n\n<Badge tone="ok">Settled</Badge>`} />
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
      <Usage code={`import { Card } from "./components/Card";\n\n<Card title="Schedule" hint="When the backup runs on its own.">\n  ...\n</Card>`} />
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
        code={`import { useConfirm } from "./components/useConfirm";

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
        code={`import { addToast } from "./components/toastEngine";

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
