import { Callout, Code, ContractTable, Demo, H2, PropsTable, SourceLink } from "../ui";

/** The note every component on a Zag machine carries: where its behaviour and its look come from. */
export function MachineNote({ file, machine }: { file: string; machine: string }) {
  return (
    <>
      <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <SourceLink file={file} />
      </p>
      <Callout>
        Runs on Zag's <code>{machine}</code> machine, which owns the keys, the focus and the ARIA. GlimStone owns the look
        through the classes in tokens.css, which read only the data attributes the machine sets. It is an entry of its
        own, so an app that does not use it installs no Zag package for it.
      </Callout>
    </>
  );
}

export function AccordionPage() {
  return (
    <>
      <p className="lead">
        Questions whose answers open under them, for reading matter such as a help page or a list of frequent questions.
      </p>
      <MachineNote file="react/Accordion.tsx" machine="accordion" />
      <Demo name="AccordionHelp" />
      <Code
        code={`import { Accordion } from "@glimstone/react/Accordion";

<Accordion items={questions} content={(q) => q.answer} />`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          Only for text that is read, never for settings. Rule 26 still holds on every page that sets something: what
          would fold away goes on a sub-card or a page of its own.
        </li>
        <li>Each row is a heading, so a screen reader can jump from question to question. <code>headingLevel</code> fits it into the page.</li>
        <li>One item opens at a time unless <code>multiple</code> is set, and an open item closes again on its row.</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Accordion" />
      <H2>API</H2>
      <PropsTable of="Accordion" />
    </>
  );
}

export function CollapsiblePage() {
  return (
    <>
      <p className="lead">One row that opens the text under it, for a passage somebody reads once and then leaves closed.</p>
      <MachineNote file="react/Collapsible.tsx" machine="collapsible" />
      <Demo name="CollapsibleBasic" />
      <H2>Rules</H2>
      <ul>
        <li>The same row as an Accordion's, for a single passage. Several in a row are an Accordion.</li>
        <li>It opens and closes over the control duration of the motion level, and at once at off or under reduced motion.</li>
        <li>Never on a settings page (rule 26).</li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="Collapsible" />
      <H2>API</H2>
      <PropsTable of="Collapsible" />
    </>
  );
}
