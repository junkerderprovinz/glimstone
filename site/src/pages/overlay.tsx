import { ContractTable, Demo, H2, PropsTable } from "../ui";
import { Head, Usage } from "./components";

export function PopoverPage() {
  return (
    <>
      <p className="lead">A small panel beside the control that opened it, such as a filter.</p>
      <Head file="react/Popover.tsx" />
      <Demo name="PopoverBasic" />
      <Usage
        code={`import { Popover } from "@glimstone/react";\n\n<Button ref={setAnchor} label={t("filter")} onClick={() => setOpen(true)} />\n<Popover open={open} anchor={anchor} label={t("filterTheList")} onClose={() => setOpen(false)}>\n  …\n</Popover>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          It is an element with the <code>popover</code> attribute, so it lives in the top layer: no card and no scroll
          box clips it, and it needs no portal. It renders where it stands, inside a window too.
        </li>
        <li>
          CSS anchor positioning ties it to its trigger: under it and centred, above it where there is no room below.
          Where the browser has no anchor positioning, <code>computeBubblePosition</code> places it the same way.
        </li>
        <li>
          Focus goes to its first control. Escape and a press beside it close it, the browser's light dismiss, and focus
          goes back to the trigger. In a window, Escape closes the popover first and the window on the next press.
        </li>
        <li>It is for a few controls. A form that needs room goes into a <a href="#/components/sheet">Sheet</a>.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Popover" />
      <H2>API</H2>
      <PropsTable of="Popover" />
    </>
  );
}

export function SheetPage() {
  return (
    <>
      <p className="lead">A panel at the end edge for the details of a row, beside the list it came from.</p>
      <Head file="react/Sheet.tsx" />
      <Demo name="SheetBasic" />
      <Usage
        code={`import { Sheet } from "@glimstone/react";\n\n<Sheet open={!!row} title={row.name} text={{ cancel: t("cancel"), close: t("close") }} actions={[{ label: t("runNow"), labelKey: "runNow", primary: true }]} onClose={() => setRow(null)}>\n  …\n</Sheet>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          It is a <code>{"<dialog>"}</code> shown with <code>showModal()</code>: it stands in the top layer and the page
          behind it is inert, for the pointer and for a screen reader alike.
        </li>
        <li>
          It is a card inset by the page gutter, so the title's notch has room above it. On a phone it rises from the
          bottom at the window's full width.
        </li>
        <li>
          Its foot works as a <a href="#/components/window">Window</a>'s: Cancel or Close is added, so its head has no
          close mark. Escape and a press on the scrim close it too, and focus goes back to the control that opened it.
        </li>
        <li>
          Bubbles, menus and lists opened from inside it render into the sheet (<code>portalTarget</code>), since{" "}
          <code>{"<body>"}</code> lies under the top layer.
        </li>
        <li>
          It slides in by <code>--motion-sheet-shift</code> of its width over <code>--motion-sheet-dur</code>: all of it
          at wild, a quarter at subtle, nothing at "off" and under reduced motion.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Sheet" />
      <H2>API</H2>
      <PropsTable of="Sheet" />
    </>
  );
}
