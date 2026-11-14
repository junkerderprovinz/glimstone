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
