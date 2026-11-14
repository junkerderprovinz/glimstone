import { Code, ContractTable, Demo, H2, PropsTable } from "../ui";
import { MachineNote } from "./reading";

export function PaginationPage() {
  return (
    <>
      <p className="lead">The pages of a list too long to show at once.</p>
      <MachineNote file="react/Pagination.tsx" machine="pagination" />
      <Demo name="PaginationList" />
      <Code
        code={`import { Pagination } from "@glimstone/react/Pagination";

<Pagination count={195} page={page} onPageChange={setPage} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The page in force is filled with the accent, the others are quiet badges at the field height.</li>
        <li>
          The first and the last page always stand in the row, and a gap marks the pages between.{" "}
          <code>siblingCount</code> says how many stand on each side of the one in force.
        </li>
        <li>
          The two steps are ordinary buttons and follow the label mode. At the first or the last page the step that goes
          nowhere is disabled.
        </li>
        <li>A screen reader hears the row's name, and each page as "Page 3 of 20", with the one in force marked as the current page.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Pagination" />
      <H2>API</H2>
      <PropsTable of="Pagination" />
    </>
  );
}

export function StepsPage() {
  return (
    <>
      <p className="lead">A task walked in named steps, such as setting up a storage location.</p>
      <MachineNote file="react/Steps.tsx" machine="steps" />
      <Demo name="StepsStorage" />
      <Code
        code={`import { Steps } from "@glimstone/react/Steps";

<Steps items={steps} content={(s) => <StepForm step={s} />} onFinish={save} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>Every step has a name, which stands in the row and is the name of its tab ("Pickers and wizards").</li>
        <li>The step in force is filled with the accent. A finished step carries a tick, and the steps ahead their number, both quiet.</li>
        <li>Back and Next stand in the foot, at the end. On the last step Next turns into Finish, which calls <code>onFinish</code>.</li>
        <li>
          A step in the row is pressed to go back to it. With <code>linear</code> only Back and Next move, for a task
          whose steps depend on each other.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Steps" />
      <H2>API</H2>
      <PropsTable of="Steps" />
    </>
  );
}

export function TourPage() {
  return (
    <>
      <p className="lead">A short walk through a screen, one step a part of it, such as the first start of a new page.</p>
      <MachineNote file="react/Tour.tsx" machine="tour" />
      <Demo name="TourFirstStart" />
      <Code
        code={`import { Tour } from "@glimstone/react/Tour";

<Tour steps={steps} open={open} onOpenChange={setOpen} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The page behind is darkened and blurred as behind a window, and the part a step points at is left clear and ringed in the accent.</li>
        <li>A step is a small window: its title in the notch, its text, and Back and Next in its foot, with where the tour stands at the start.</li>
        <li>Next is the step's one filled button. On the last step it is Close, since a tour has no Done.</li>
        <li>Escape ends the tour from any step and gives the focus back to what started it.</li>
        <li>It is for the first start, once. Somebody who closes it has seen it; the app keeps that per device.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Tour" />
      <H2>API</H2>
      <PropsTable of="Tour" />
    </>
  );
}

export function TabsPage() {
  return (
    <>
      <p className="lead">
        Tabs are the <a href="#/components/selector">Selector</a>. A second drawing of the same row would drift apart from
        the first the moment either changed, so there is no Tabs component of its own.
      </p>
      <Demo name="SelectorTabs" />
      <Code
        code={`import { Selector } from "@glimstone/react";

<Selector label="Settings" items={pages} value={page} onChange={setPage} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>With <code>activation</code> left automatic the strip is a tablist, and the arrows choose as they move.</li>
        <li>Each segment is a tab with a panel of its own, which <code>selectorTabId()</code> names.</li>
        <li>A settings area with many pages turns the strip on its side, as the vertical tiles.</li>
      </ul>
      <p>
        Everything else is on the <a href="#/components/selector">Selector</a> page: its two stylings, its keys and its
        behaviour table.
      </p>
    </>
  );
}

export function RadioGroupPage() {
  return (
    <>
      <p className="lead">
        A radio group is the <a href="#/components/selector">Selector</a> with <code>activation="manual"</code>. It is the
        same row as the tabs, so it is the same component.
      </p>
      <Demo name="SelectorPickers" />
      <Code
        code={`import { Selector } from "@glimstone/react";

<Selector label="Theme" items={themes} value={theme} onChange={setTheme} activation="manual" />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>The strip is a radiogroup and each segment a radio. The arrows move the focus and Space chooses.</li>
        <li>A set too long for one row becomes the dropdown, under the strip's name.</li>
        <li>Several picks at once are <code>select="many"</code>, toggle buttons in a group.</li>
      </ul>
      <p>
        Everything else is on the <a href="#/components/selector">Selector</a> page.
      </p>
    </>
  );
}
