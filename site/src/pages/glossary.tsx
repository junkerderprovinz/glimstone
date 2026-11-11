import { useState, type ReactNode } from "react";
import { Badge, Button, Selector, Table, Toggle } from "@glimstone/react";
import { GLIMSTONE_VERSION } from "@glimstone/core";
import { GLOSSARY, type GlossaryEntry } from "./glossary.data";
import { DEMOS, LangContext, NotchedSubCard, PAGE_RANGES, WindowInPlace, useT, type Lang } from "./glossaryDemos";
import "./glossary.css";

const ENTRIES = GLOSSARY.flatMap((s) => s.entries);
const PROPOSALS = ENTRIES.filter((e) => e.proposal).length;
const domId = (id: string) => `gl-${id}`;
const KEY = "gs-docs-glossary-lang";

function storedLang(): Lang {
  try {
    return localStorage.getItem(KEY) === "de" ? "de" : "en";
  } catch {
    return "en";
  }
}

function Proposal() {
  const t = useT();
  return (
    <Badge tone="warn" size="small" title={t("The German name waits for confirmation", "Der deutsche Name wartet auf ein Ja")}>
      {t("Proposal", "Vorschlag")}
    </Badge>
  );
}

function rulesText(rules: number[], t: ReturnType<typeof useT>) {
  const list = rules.length === 1 ? String(rules[0]) : `${rules.slice(0, -1).join(", ")} ${t("and", "und")} ${rules.at(-1)}`;
  return rules.length === 1 ? t(`Rule ${list}`, `Regel ${list}`) : t(`Rules ${list}`, `Regeln ${list}`);
}

function EntryView({ entry, lang }: { entry: GlossaryEntry; lang: Lang }) {
  const t = useT();
  const Demo = DEMOS[entry.id];
  const first = lang === "de" ? entry.de : entry.en;
  const second = lang === "de" ? entry.en : entry.de;
  const firstIsGerman = lang === "de";
  return (
    <article className="gl-entry" id={domId(entry.id)} aria-labelledby={`${domId(entry.id)}-name`}>
      <div className="gl-entry-text">
        <h3 className="gl-entry-name" id={`${domId(entry.id)}-name`}>
          <span lang={lang}>{first}</span>
          {firstIsGerman && entry.proposal && <Proposal />}
        </h3>
        <dl className="gl-names">
          <dt>{firstIsGerman ? "EN" : "DE"}</dt>
          <dd>
            <span lang={firstIsGerman ? "en" : "de"}>{second}</span>
            {!firstIsGerman && entry.proposal && <Proposal />}
          </dd>
          {entry.abbr && (
            <>
              <dt>{t("Short", "Kurz")}</dt>
              <dd>
                <span className="gl-abbr">{entry.abbr}</span>
              </dd>
            </>
          )}
          <dt>Code</dt>
          <dd className="gl-code">
            {entry.code.map((c) => (
              <code key={c}>{c}</code>
            ))}
          </dd>
        </dl>
        <p className="gl-desc" lang={lang}>
          {entry.text[lang]}
        </p>
        {entry.rules && <p className="gl-rule">{rulesText(entry.rules, t)}</p>}
      </div>
      <div className={`gl-stage${Demo ? "" : " gl-stage--listed"}`} data-entry={entry.id}>
        {Demo ? <Demo /> : <p className="gl-listed">{t("Listed only, without a live element.", "Nur aufgeführt, ohne lebendes Element.")}</p>}
      </div>
    </article>
  );
}

interface Part {
  n: number;
  entry: string;
  /** Where its number sits on the part. */
  at: string;
  /** The name in the legend, where it says more than the entry's own. */
  name?: { en: string; de: string };
}

const PARTS: Part[] = [
  { n: 1, entry: "window", at: "corner" },
  { n: 2, entry: "sub-card", at: "bottom" },
  { n: 3, entry: "section-badge", at: "notch", name: { en: "Section badge in the notch", de: "Abschnittsbadge in der Kerbe" } },
  { n: 4, entry: "state-badge", at: "start" },
  { n: 5, entry: "toggle", at: "end" },
  { n: 6, entry: "selector-well", at: "start" },
  { n: 7, entry: "row-tiles", at: "start" },
  { n: 8, entry: "window-foot", at: "foot" },
  { n: 9, entry: "button", at: "start", name: { en: "Accent button", de: "Knopf im Akzent" } },
];
const byId = new Map(ENTRIES.map((e) => [e.id, e]));

function Mark({ n, at }: { n: number; at: string }) {
  return (
    <span className={`gl-mark gl-mark--${at}`} data-mark={n} aria-hidden="true">
      {n}
    </span>
  );
}

function Spot({ n, block, children }: { n: number; block?: boolean; children: ReactNode }) {
  const part = PARTS.find((p) => p.n === n)!;
  return (
    <span className={`gl-spot${block ? " gl-spot--block" : ""}`} data-spot={n}>
      <Mark n={n} at={part.at} />
      {children}
    </span>
  );
}

function Figure({ lang }: { lang: Lang }) {
  const t = useT();
  const [hot, setHot] = useState<number | null>(null);
  const [images, setImages] = useState(true);
  const [format, setFormat] = useState("pdf");
  const [pages, setPages] = useState("all");
  const point = (n: number) => ({ onMouseEnter: () => setHot(n), onMouseLeave: () => setHot(null), onFocus: () => setHot(n), onBlur: () => setHot(null) });

  return (
    <div className="gl-figure">
      <div
        className="gl-figure-stage"
        data-hot={hot ?? undefined}
        onMouseOver={(e) => setHot(Number((e.target as Element).closest<HTMLElement>("[data-spot]")?.dataset.spot) || null)}
        onMouseLeave={() => setHot(null)}
      >
        <div className="gl-figure-window" data-spot={1}>
          <Mark n={1} at="corner" />
          <Mark n={3} at="notch" />
          <Mark n={8} at="foot" />
          <WindowInPlace
            title="Export"
            start={t("12 pages, 3 MB", "12 Seiten, 3 MB")}
            foot={
              <>
                <Button label={t("Cancel", "Abbrechen")} labelKey="cancel" />
                <Spot n={9}>
                  <Button label="Export" labelKey="download" tone="accent" />
                </Spot>
              </>
            }
          >
            <div className="gl-spot gl-spot--block" data-spot={2}>
              <Mark n={2} at="bottom" />
              <Mark n={3} at="notch" />
              <NotchedSubCard
                title="Format"
                end={
                  <>
                    <Spot n={4}>
                      <Badge tone="ok">{t("Ready", "Bereit")}</Badge>
                    </Spot>
                    <Spot n={5}>
                      <Toggle label={t("With images", "Mit Bildern")} checked={images} onChange={setImages} />
                    </Spot>
                  </>
                }
              >
                <Spot n={6} block>
                  <Selector
                    label={t("File type", "Dateityp")}
                    activation="manual"
                    equalWidth
                    items={[
                      { id: "pdf", label: "PDF" },
                      { id: "csv", label: "CSV" },
                      { id: "json", label: "JSON" },
                    ]}
                    value={format}
                    onChange={setFormat}
                  />
                </Spot>
                <Spot n={7} block>
                  <Selector
                    label={t("Pages", "Seiten")}
                    orientation="vertical"
                    className="gl-row-tiles"
                    items={PAGE_RANGES.map((r) => ({ id: r.id, label: t(r.en, r.de) }))}
                    value={pages}
                    onChange={setPages}
                  />
                </Spot>
              </NotchedSubCard>
            </div>
          </WindowInPlace>
        </div>
      </div>
      <div className="gl-legend-wrap">
        <p className="gl-legend-lead">
          {t(
            "Point at a part or at a name, and its twin lights up. The notch is no part of its own: it is where the section badge sits, half over the top edge.",
            "Fahr über ein Teil oder einen Namen, dann leuchtet das Gegenstück auf. Die Kerbe ist kein eigenes Teil, sondern der Platz des AB halb über der Oberkante.",
          )}
        </p>
        <ol className="gl-legend" aria-label={t("The parts in the picture", "Die Teile im Bild")}>
          {PARTS.map((p) => {
            const e = byId.get(p.entry)!;
            const name = p.name ?? { en: e.en, de: e.de };
            return (
              <li key={p.n}>
                <a href={`#/guide/glossary?s=${domId(e.id)}`} className={`gl-legend-item${hot === p.n ? " is-hot" : ""}`} {...point(p.n)}>
                  <span className="gl-legend-n" aria-hidden="true">
                    {p.n}
                  </span>
                  <span className="gl-legend-text">
                    <span className="gl-legend-name">
                      <strong>{lang === "de" ? name.de : name.en}</strong>
                      {e.abbr && <span className="gl-abbr">{e.abbr.split(",")[0]}</span>}
                    </span>
                    <span className="gl-legend-other">{lang === "de" ? name.en : name.de}</span>
                    <code className="gl-legend-code">{e.code[0]}</code>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

interface IndexRow {
  en: string;
  de: string;
  abbr: string;
  code: string;
  id: string;
  proposal: boolean;
}

function indexRows(lang: Lang): IndexRow[] {
  return ENTRIES.flatMap((e) => [
    { en: e.en, de: e.de, abbr: e.abbr ?? "", code: e.code[0]!, id: e.id, proposal: !!e.proposal },
    ...(e.also ?? []).map((a) => ({ en: a.en, de: a.de, abbr: a.abbr ?? "", code: a.code, id: e.id, proposal: !!a.proposal })),
  ]).sort((a, b) => a[lang].localeCompare(b[lang], lang));
}

function Section({ id, title, count, children }: { id: string; title: string; count?: number; children: ReactNode }) {
  return (
    <section className="glim-panel glim-notch-card gl-section" aria-labelledby={id}>
      <h2 className="glim-panel-heading" id={id}>
        <Badge tone="heading" size="heading" wrap>
          {title}
          {count !== undefined && <span className="glim-num gl-count">{count}</span>}
        </Badge>
      </h2>
      {children}
    </section>
  );
}

export function GlossaryPage({ lang: fixed }: { lang?: Lang }) {
  const [chosen, setChosen] = useState<Lang>(storedLang);
  const lang = fixed ?? chosen;
  const t = (en: string, de: string) => (lang === "de" ? de : en);
  const pick = (next: Lang) => {
    setChosen(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // The choice holds until the tab closes.
    }
  };
  const rows = indexRows(lang);

  return (
    <LangContext.Provider value={lang}>
      <div className="gl-page" lang={lang}>
        <p className="lead">
          {t(
            "Every element of GlimStone, rendered live under its English and its German name, its short form and how the code spells it. Point at a number in the picture or name something from the index, and we are sure to mean the same thing.",
            "Jedes Bauteil von GlimStone, echt gerendert, mit englischem und deutschem Namen, Kurzform und Schreibweise im Code. Zeig auf eine Nummer im Bild oder nenn einen Namen aus der Liste, dann reden wir sicher von derselben Sache.",
          )}
        </p>
        <div className="gl-bar">
          {!fixed && (
            <Selector
              label={t("Names first in", "Namen zuerst auf")}
              size="sm"
              inline
              activation="manual"
              items={[
                { id: "en", label: "English" },
                { id: "de", label: "Deutsch" },
              ]}
              value={lang}
              onChange={(v) => pick(v as Lang)}
            />
          )}
          <span className="gl-meta-line">
            GlimStone {GLIMSTONE_VERSION}, {t(`${ENTRIES.length} entries.`, `${ENTRIES.length} Einträge.`)}{" "}
            {t(`${PROPOSALS} German names are marked`, `${PROPOSALS} deutsche Namen tragen ein`)} <Proposal />{" "}
            {t("until they are confirmed.", "und warten auf ein Ja.")}
          </span>
        </div>

        <div className="gl-sections">
          <Section id="gl-picture" title={t("The picture to point at", "Das Bild zum Zeigen")}>
            <Figure lang={lang} />
          </Section>

          <nav className="gl-jump" aria-label={t("Sections", "Abschnitte")}>
            {GLOSSARY.map((s) => (
              <Badge key={s.id} as="a" href={`#/guide/glossary?s=${domId(s.id)}`} tone="neutral">
                {s[lang]}
              </Badge>
            ))}
            <Badge as="a" href="#/guide/glossary?s=gl-index" tone="neutral">
              {t("A to Z", "Von A bis Z")}
            </Badge>
          </nav>

          {GLOSSARY.map((s) => (
            <Section key={s.id} id={domId(s.id)} title={s[lang]} count={s.entries.length}>
              <div className="gl-entries">
                {s.entries.map((e) => (
                  <EntryView key={e.id} entry={e} lang={lang} />
                ))}
              </div>
            </Section>
          ))}

          <Section id="gl-index" title={t("A to Z", "Von A bis Z")} count={rows.length}>
            <div className="gl-index">
              <Table
                label={t("Every name from A to Z", "Alle Namen von A bis Z")}
                columns={
                  lang === "de"
                    ? [
                        { key: "de", label: "Deutsch" },
                        { key: "en", label: "English" },
                        { key: "abbr", label: "Kurz", tone: "muted" },
                        { key: "code", label: "Code" },
                      ]
                    : [
                        { key: "en", label: "English" },
                        { key: "de", label: "Deutsch" },
                        { key: "abbr", label: "Short", tone: "muted" },
                        { key: "code", label: "Code" },
                      ]
                }
                rows={rows}
                cell={(r, c) =>
                  c.key === lang ? (
                    <span className="gl-index-name">
                      <a href={`#/guide/glossary?s=${domId(r.id)}`}>{r[lang]}</a>
                      {lang === "de" && r.proposal && <Proposal />}
                    </span>
                  ) : c.key === "de" ? (
                    <span className="gl-index-name">
                      {r.de}
                      {r.proposal && <Proposal />}
                    </span>
                  ) : c.key === "code" ? (
                    <code>{r.code}</code>
                  ) : undefined
                }
              />
            </div>
          </Section>
        </div>
      </div>
    </LangContext.Provider>
  );
}
