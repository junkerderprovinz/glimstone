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

export function TagsInputPage() {
  return (
    <>
      <p className="lead">A field that turns what is typed into tags, such as the labels of a backup or the addresses a notice goes to.</p>
      <MachineNote file="react/TagsInput.tsx" machine="tags-input" />
      <Demo name="TagsInputLabels" />
      <Code
        code={`import { TagsInput } from "@glimstone/react/TagsInput";

<TagsInput label="Labels" value={labels} onChange={setLabels} placeholder="Add a label" />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>Enter or a comma adds what was typed as a tag, and so does leaving the field. A pasted list becomes one tag per entry.</li>
        <li>The tags stand inside the field as pills, one surface step above it, each with a remove mark.</li>
        <li>
          In an empty field Backspace picks the last tag, which takes the accent, and a second Backspace removes it. The
          arrows walk the tags.
        </li>
        <li>A screen reader hears each tag added, picked and removed, in the words <code>text</code> passes.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="TagsInput" />
      <H2>API</H2>
      <PropsTable of="TagsInput" />
    </>
  );
}
