import { Code, ContractTable, Demo, H2, PropsTable } from "../ui";
import { MachineNote } from "./reading";

export function SplitterPage() {
  return (
    <>
      <p className="lead">Two or more panels side by side, or one above the other, with a handle between them that moves the seam.</p>
      <MachineNote file="react/Splitter.tsx" machine="splitter" />
      <Demo name="SplitterFolders" />
      <Code
        code={`import { Splitter } from "@glimstone/react/Splitter";

<Splitter panels={panels} size={size} onSizeChange={setSize} panel={(p) => <Panel of={p} />} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>A hairline marks the seam. The grip on it takes the accent while the handle is hovered, focused or dragged.</li>
        <li>The arrow keys move the seam a step, ten with Shift, and Home and End take it to the limits the panels allow.</li>
        <li>The sizes are percent and belong to the app, which keeps them where it keeps the person's other choices.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Splitter" />
      <H2>API</H2>
      <PropsTable of="Splitter" />
    </>
  );
}

export function ScrollAreaPage() {
  return (
    <>
      <p className="lead">A box that scrolls its content behind thin bars of the house's own, such as a log in a window.</p>
      <MachineNote file="react/ScrollArea.tsx" machine="scroll-area" />
      <Demo name="ScrollAreaLog" />
      <Code
        code={`import { ScrollArea } from "@glimstone/react/ScrollArea";

<ScrollArea label="Backup log" maxHeight="10rem">{lines}</ScrollArea>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The platform's bar is hidden. A thin bar stands over the content's edge, and its thumb steps up the ramp under the pointer.</li>
        <li>The box is a region named by its label, which Tab reaches and the arrow keys and Page keys scroll.</li>
        <li>The wheel and a finger scroll it as they would any box.</li>
        <li>A bar shows only for the direction that has more to show.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="ScrollArea" />
      <H2>API</H2>
      <PropsTable of="ScrollArea" />
    </>
  );
}

export function FloatingPanelPage() {
  return (
    <>
      <p className="lead">A window that stays open beside the work, such as a transfer log, moved by its head and sized by its edges.</p>
      <MachineNote file="react/FloatingPanel.tsx" machine="floating-panel" />
      <Demo name="FloatingPanelLog" />
      <Code
        code={`import { FloatingPanel } from "@glimstone/react/FloatingPanel";

<FloatingPanel title="Transfer log" open={open} onOpenChange={setOpen}>{log}</FloatingPanel>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>It is a window like any other: the same surface and radius, its title in the notch, its way out in the foot.</li>
        <li>Nothing behind it is darkened, since the work behind it goes on. It floats above the page and below a modal window.</li>
        <li>Its head moves it, its edges size it, and the arrow keys move it while it has focus. Escape closes it.</li>
        <li>Minimise folds it to its head, Maximise fills the window with it, Restore brings back its size.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="FloatingPanel" />
      <H2>API</H2>
      <PropsTable of="FloatingPanel" />
    </>
  );
}
