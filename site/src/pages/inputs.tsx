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

export function FileUploadPage() {
  return (
    <>
      <p className="lead">Files handed to the app by dropping them or from the picker, such as a settings file to import.</p>
      <MachineNote file="react/FileUpload.tsx" machine="file-upload" />
      <Demo name="FileUploadImport" />
      <Code
        code={`import { FileUpload } from "@glimstone/react/FileUpload";

<FileUpload label="Settings to import" value={files} onChange={setFiles} accept={["application/json"]} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The drop zone is itself the button that opens the picker: one control, filled, with its glyph and its words.</li>
        <li>While files are held over it, it takes the accent's wash, since the app is about to act.</li>
        <li>A chosen file stands under the zone as a row, with its size in the page's language and a button to remove it.</li>
        <li>A file it does not take is named under the list with the reason, in the words <code>text.refused</code> passes.</li>
        <li>It only hands the files over. Where the app writes them, its window says first (rule 25).</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="FileUpload" />
      <H2>API</H2>
      <PropsTable of="FileUpload" />
    </>
  );
}

export function DatePickerPage() {
  return (
    <>
      <p className="lead">A day picked from a calendar, such as the day a backup is kept until.</p>
      <MachineNote file="react/DatePicker.tsx" machine="date-picker" />
      <Demo name="DatePickerKeep" />
      <Code
        code={`import { DatePicker } from "@glimstone/react/DatePicker";

<DatePicker label="Keep until" value={day} onChange={setDay} min="2026-11-05" />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The trigger is a field that shows the day and takes no typing, as the time picker's does.</li>
        <li>The calendar floats beside it on the body, so no card clips it, and opens on the chosen day.</li>
        <li>The chosen day is filled with the accent, today carries the accent's ink, and a day outside min and max is struck through.</li>
        <li>The head steps out to the months and the years, so a date far away is three presses, not thirty.</li>
        <li>A day travels as "2026-11-14", and the calendar speaks the page's language unless <code>locale</code> names another.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="DatePicker" />
      <H2>API</H2>
      <PropsTable of="DatePicker" />
    </>
  );
}

export function RatingPage() {
  return (
    <>
      <p className="lead">A value given in stars, such as how well something went.</p>
      <MachineNote file="react/Rating.tsx" machine="rating-group" />
      <Demo name="RatingRelease" />
      <Code
        code={`import { Rating } from "@glimstone/react/Rating";

<Rating label="How well did the update go?" value={stars} onChange={setStars} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The stars up to the value are filled with the accent, the rest stand in the muted text colour.</li>
        <li>It is a radio group of stars: the arrows move the value, Home and End go to the ends.</li>
        <li>A pointer over a star shows what a press would give, and the stars go back when it leaves.</li>
        <li><code>allowHalf</code> takes half stars, and <code>readOnly</code> shows a value such as an average.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Rating" />
      <H2>API</H2>
      <PropsTable of="Rating" />
    </>
  );
}
