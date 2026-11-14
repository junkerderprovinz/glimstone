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
