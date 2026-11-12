import { ContractTable, Demo, H2, PropsTable } from "../ui";
import { Head, Usage } from "./components";

export function BusyRingPage() {
  return (
    <>
      <p className="lead">The ring that turns while the app works on something.</p>
      <Head file="react/BusyRing.tsx" />
      <Demo name="BusyRingSizes" />
      <Usage
        code={`import { BusyRing } from "@glimstone/react";\n\n{loading && <BusyRing size="large" label={t("loadingContainers")} />}`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          Two flat arcs turn against each other in one period and meet at the top and the bottom. The ring came from
          TowerTorch and keeps its proportions: the arcs are a tenth of the ring thick, each 155° long, with a cap at
          either end that follows the shape.
        </li>
        <li>
          It shows only after 400 ms (<code>BUSY_DELAY</code>), so an answer that comes quickly never flashes a loader.{" "}
          <code>delay={"{0}"}</code> shows it at once. A busy <a href="#/components/button">Button</a> does that, since it
          answers a press.
        </li>
        <li>
          It takes the accent, because waiting on the app is activity (rule 3). Inside a button it takes the button's ink.
        </li>
        <li>
          <code>small</code> fits a button's glyph slot, the middle size a row, <code>large</code> a card that waits for
          its content.
        </li>
        <li>
          The turn reads <code>--motion-spin-dur</code>: 1.5 s at wild, 2.4 s at subtle. At "off" and under reduced motion
          it stands still with the inner arc turned off the outer one, so it never reads as a frozen frame.
        </li>
        <li>
          With a <code>label</code> it is a status that says what is loading. Without one it is hidden from assistive
          technology, and the button's <code>aria-busy</code> or the list's words say it.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="BusyRing" />
      <H2>API</H2>
      <PropsTable of="BusyRing" />
    </>
  );
}

export function SkeletonRowPage() {
  return (
    <>
      <p className="lead">A row that holds a ListRow's place while the list loads.</p>
      <Head file="react/SkeletonRow.tsx" />
      <Demo name="SkeletonRowList" />
      <Usage
        code={`import { SkeletonRow } from "@glimstone/react";\n\n<div role="group" aria-label={t("backups")} aria-busy={loading}>\n  {loading ? [0, 1, 2].map((i) => <SkeletonRow key={i} />) : rows}\n</div>`}
      />
      <H2>Rules</H2>
      <ul>
        <li>
          It has a <a href="#/components/list-row">ListRow</a>'s box, a tile, a name and a badge, so the list does not
          jump when the rows arrive. <code>tile</code> and <code>badge</code> leave out what the real rows do not have.
        </li>
        <li>Three placeholder rows are enough. More promise a list the app does not know it has yet.</li>
        <li>
          Its blocks stand on surface2, one step up from the card (rule 21). One band of light crosses every row at once:
          a faint white on the dark ramps, a strong white on the light one, never a darker stripe.
        </li>
        <li>
          The band reads <code>--motion-skeleton-dur</code> and <code>--motion-skeleton-glow</code>. At "off" and under
          reduced motion no light crosses.
        </li>
        <li>
          Like the <a href="#/components/busy-ring">BusyRing</a> it waits 400 ms before it shows. The list around it
          carries <code>aria-busy</code> and its name. The rows themselves are hidden from assistive technology.
        </li>
      </ul>
      <H2>Behaviour</H2>
      <ContractTable of="SkeletonRow" />
      <H2>API</H2>
      <PropsTable of="SkeletonRow" />
    </>
  );
}
