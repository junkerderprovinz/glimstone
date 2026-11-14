import { Code, ContractTable, Demo, H2, PropsTable } from "../ui";
import { MachineNote } from "./reading";

export function PinInputPage() {
  return (
    <>
      <p className="lead">A short code typed one character to a box, such as the six digits of a second factor.</p>
      <MachineNote file="react/PinInput.tsx" machine="pin-input" />
      <Demo name="PinInputCode" />
      <Code
        code={`import { PinInput } from "@glimstone/react/PinInput";

<PinInput label="Code from the app" value={code} onChange={setCode} onComplete={check} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>Each box is a text field, borderless and filled, and a little taller than one so a digit reads at a glance.</li>
        <li>Typing moves on to the next box, Backspace steps back, and a pasted code fills every box at once.</li>
        <li>A code is data, so the boxes run left to right in a right-to-left language too.</li>
        <li><code>onComplete</code> fires once every box holds a character. A refused code takes <code>invalid</code> and the fault wash.</li>
        <li><code>mask</code> draws dots for a code that is a secret, and <code>otp</code> lets the phone offer a code it just received.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="PinInput" />
      <H2>API</H2>
      <PropsTable of="PinInput" />
    </>
  );
}
