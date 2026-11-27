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
        <li>Six boxes stand as two groups of three, the way a code is read aloud. The box that takes the next character shows a caret of its own, and a whole code takes a short wash in the good colour.</li>
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
        <li>The tags stand inside the field as quiet pills on a wash of the field's own fill, each with a remove mark a step quieter than its words.</li>
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
        <li>While the app sends a file, <code>progress</code> fills its row from the start, so no bar of its own is needed.</li>
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
        <li>The chosen day is filled with the accent and today stands on a quiet ground. A day outside the month or outside min and max only fades, nothing is struck through.</li>
        <li>Going to the next or the previous month, the new one slides in from that side.</li>
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

export function TimePickerPage() {
  return (
    <>
      <p className="lead">A time of day in one field, such as when a backup starts, and a span of two, such as the quiet hours.</p>
      <Demo name="TimePickerHours" />
      <Code
        code={`import { TimePicker, TimeRangePicker } from "@glimstone/react";

<FieldRow label="Backup starts at">
  <TimePicker value={start} onChange={setStart} minuteStep={15} />
</FieldRow>
<FieldRow label="Quiet hours">
  <TimeRangePicker value={quiet} onChange={setQuiet} />
</FieldRow>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>One field with two segments, hours and minutes, on the 24-hour clock. It takes the field's fill and no line.</li>
        <li>The segment that has the focus takes the accent's soft fill, so it is clear which number the keys change.</li>
        <li>The arrows count the segment round the clock, Home and End go to its ends, and <code>minuteStep</code> sets how far the minutes move.</li>
        <li>Digits type the segment and move on once it is full. Backspace empties a segment, and in an empty one steps back.</li>
        <li>A time travels as "08:30". While a segment is empty the value is null, and the field keeps what was typed.</li>
        <li><code>TimeRangePicker</code> holds a start and an end in one field, such as 08:00 to 17:00, and hands over both.</li>
        <li>A time is data, so the segments run left to right in a right-to-left language too.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="TimePicker" />
      <H2>API</H2>
      <PropsTable of="TimePicker" />
      <H2>TimeRangePicker</H2>
      <PropsTable of="TimeRangePicker" />
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
        <li>A pointer over a star fills the stars up to it one after the other, showing what a press would give, and they go back when it leaves. The star a press picks springs once.</li>
        <li><code>allowHalf</code> takes half stars, and <code>readOnly</code> shows a value such as an average.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Rating" />
      <H2>API</H2>
      <PropsTable of="Rating" />
    </>
  );
}

export function AngleSliderPage() {
  return (
    <>
      <p className="lead">An angle set on a dial, such as how far a picture turns.</p>
      <MachineNote file="react/AngleSlider.tsx" machine="angle-slider" />
      <Demo name="AngleSliderTurn" />
      <Code
        code={`import { AngleSlider } from "@glimstone/react/AngleSlider";

<AngleSlider label="Turn the picture" value={angle} onChange={setAngle} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The dial is round in every shape setting: the circle is its geometry, not a corner.</li>
        <li>An accent hand runs from the middle to the knob on the rim, and the value stands in the middle in degrees, left to right in every language.</li>
        <li>It snaps every 15° with a short spring, and a tick marks each snap, a longer one each quarter. <code>step</code> asks for finer.</li>
        <li>The arrows turn it a step, Home and End go to 0° and to the last step before a full turn, and a press or a drag on the dial sets the angle there.</li>
        <li>Where a few angles are usual, a selector of steps stands beside it ("The one horizontal selector").</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="AngleSlider" />
      <H2>API</H2>
      <PropsTable of="AngleSlider" />
    </>
  );
}

export function SignaturePadPage() {
  return (
    <>
      <p className="lead">A signature drawn with a mouse, a pen or a finger, such as the approval of a handover.</p>
      <MachineNote file="react/SignaturePad.tsx" machine="signature-pad" />
      <Demo name="SignaturePadHandover" />
      <Code
        code={`import { SignaturePad } from "@glimstone/react/SignaturePad";

<SignaturePad label="Signed for the handover" value={strokes} onChange={setStrokes} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The strokes are drawn in the text colour on the second surface, over a hairline to sign on.</li>
        <li>The value is the strokes as SVG path data, which an app stores as text and draws again as it was.</li>
        <li>Clear stands in the foot at the end and is disabled while nothing is drawn.</li>
        <li>
          A signature cannot be given with the keys. Where one is asked for, the app offers another way to agree, such as
          a checkbox under the notice.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="SignaturePad" />
      <H2>API</H2>
      <PropsTable of="SignaturePad" />
    </>
  );
}
