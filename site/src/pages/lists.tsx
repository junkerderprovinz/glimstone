import { ContractTable, Demo, H2, PropsTable } from "../ui";
import { Head, Usage } from "./components";

export function ListTablePage() {
  return (
    <>
      <p className="lead">The list of a list page, with its tools inside it.</p>
      <Head file="react/ListTable.tsx" />
      <Demo name="ListTableBackups" />
      <Usage
        code={`import { ListTable } from "@glimstone/react";\n\n<ListTable label={t("backups")} columns={columns} rows={backups} rowKey={(b) => b.id} text={text} onOpen={(b) => go(b.id)} onSelect={setPicked} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          A list page has the cards on top and this list below, and nothing between them. Sorting, filtering and search
          live in the list ("Lists" in the design language).
        </li>
        <li>
          A click on a heading sorts by that column, the next turns the order around, and <code>aria-sort</code> sits on
          that heading alone. Words sort as a person reads them, so 2 comes before 10.
        </li>
        <li>
          A column with <code>filter</code> has a ▾ beside its name. It opens a{" "}
          <a href="#/components/popover">Popover</a> with the values the rows hold, and a column whose filter is on keeps
          its ▾ filled.
        </li>
        <li>
          Typing while the list has focus floats a search inside it with the typed letters, and Ctrl+F opens it empty.
          Escape takes it away and gives the focus back to the list.
        </li>
        <li>
          Rows are picked as in a file manager: a click picks one, Ctrl adds or drops one, Shift takes the range. The
          arrows, Home and End move, Shift with them extends, Space picks, Ctrl+A takes all. Enter or a double click opens
          the row's object.
        </li>
        <li>
          It is an APG grid with row selection. Each row has one stop for the keyboard, its first cell, so Tab enters
          the list once and leaves it again.
        </li>
        <li>
          A row is a <a href="#/components/list-row">ListRow</a>'s height, and a picked one is filled with the accent
          wash (rule 5). What stands on its right is drawn by <code>cell</code>, a <a href="#/components/pill">Pill</a>{" "}
          as a rule.
        </li>
        <li>While loading it holds three <a href="#/components/skeleton-row">SkeletonRow</a>s instead.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="ListTable" />
      <H2>API</H2>
      <PropsTable of="ListTable" />
    </>
  );
}
