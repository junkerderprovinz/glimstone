import { Code, ContractTable, Demo, H2, PropsTable } from "../ui";
import { MachineNote } from "./reading";

export function AvatarPage() {
  return (
    <>
      <p className="lead">A person's picture, and their initials while it loads, when it fails or when there is none.</p>
      <MachineNote file="react/Avatar.tsx" machine="avatar" />
      <Demo name="AvatarPeople" />
      <Code
        code={`import { Avatar } from "@glimstone/react/Avatar";

<Avatar name="Ada Lovelace" src={photo} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The name is the accessible name in every state. The picture and the initials are only what it looks like.</li>
        <li>Its corners follow the shape setting like everything else somebody presses or looks at, round, soft or square.</li>
        <li>
          At rest the initials stand on the third surface, since a face is not activity. Under rainbow a list of people
          can give each circle a palette position with <code>hueIndex</code>.
        </li>
        <li>
          <code>md</code> is a field's height and <code>lg</code> the key height, so an avatar stands level with the
          controls of its row. <code>sm</code> fits a line of text.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Avatar" />
      <H2>API</H2>
      <PropsTable of="Avatar" />
    </>
  );
}

export function TimerPage() {
  return (
    <>
      <p className="lead">A clock that counts up from a start or down to zero, such as the time a test may run.</p>
      <MachineNote file="react/Timer.tsx" machine="timer" />
      <Demo name="TimerTest" />
      <Code
        code={`import { Timer } from "@glimstone/react/Timer";

<Timer countdown startMs={5 * 60_000} onComplete={stop} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The figure stands at the status size in tabular digits, so it never jitters, and left to right in every language.</li>
        <li>It takes the accent's ink while it runs, the one moment it is activity, and the text colour at rest and when paused.</li>
        <li>Start turns into Pause while it runs and into Resume once paused. Reset puts it back to where it started.</li>
        <li>A screen reader hears the time in words as a timer, which it reads when asked rather than every second.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Timer" />
      <H2>API</H2>
      <PropsTable of="Timer" />
    </>
  );
}

export function HoverCardPage() {
  return (
    <>
      <p className="lead">A card that shows what a link leads to while the pointer rests on it, such as a server named in a sentence.</p>
      <MachineNote file="react/HoverCard.tsx" machine="hover-card" />
      <Demo name="HoverCardServer" />
      <Code
        code={`import { HoverCard } from "@glimstone/react/HoverCard";

<HoverCard label="the server in the cellar" href="/servers/cellar" content={() => <ServerSummary />} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>It is for a link in running text. A control that needs explaining has its (i) and the bubble ("The tooltip and info bubble").</li>
        <li>It opens after the pointer rests for a moment, or when the keyboard reaches the link, and closes on Escape or when both leave.</li>
        <li>It only previews. Everything in it is also behind the link, so a touch screen, which has no hover, loses nothing.</li>
        <li>It stands on the popover's surface at the float step, on the body, so no card clips it.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="HoverCard" />
      <H2>API</H2>
      <PropsTable of="HoverCard" />
    </>
  );
}

export function CarouselPage() {
  return (
    <>
      <p className="lead">A row of slides seen one page at a time, such as the pictures of what is new in a release.</p>
      <MachineNote file="react/Carousel.tsx" machine="carousel" />
      <Demo name="CarouselRelease" />
      <Code
        code={`import { Carousel } from "@glimstone/react/Carousel";

<Carousel label="What is new" items={shots} slide={(s) => <Shot of={s} />} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>It never moves by itself. A settled page does not idle-animate, so there is no autoplay.</li>
        <li>The two steps and one dot a page stand under the slides. The dot of the page in force is filled with the accent.</li>
        <li>A move glides on the motion level and lands at once at off or under reduced motion.</li>
        <li>A finger or a trackpad scrolls it as it would any row, and every slide snaps into place.</li>
        <li>It is for pictures that are looked at in turn. Content somebody needs to compare stands side by side instead.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Carousel" />
      <H2>API</H2>
      <PropsTable of="Carousel" />
    </>
  );
}
