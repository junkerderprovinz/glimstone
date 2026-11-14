import { Fragment, useState, type ComponentType, type ReactNode } from "react";
import type { Component as SvelteComponent } from "svelte";
import type { Component as VueComponent } from "vue";
import { highlight } from "sugar-high";
import { Button } from "@glimstone/react";
import { H2, Selector, useCopied } from "../ui";
import { SolidIsland } from "../solidIsland";
import { SvelteIsland } from "../svelteIsland";
import { VueIsland } from "../vueIsland";

/**
 * A framework a block is written in: its sources by block name and how one
 * renders on the page. A further framework is one more entry here and a
 * folder of blocks under src/blocks.
 */
interface BlockFramework {
  id: string;
  name: string;
  sources: Record<string, string>;
  render: (name: string) => ReactNode;
}

const byName = <T,>(modules: Record<string, T>) =>
  Object.fromEntries(Object.entries(modules).map(([path, m]) => [path.replace(/^.*\/(\w+)\.\w+$/, "$1"), m]));

const react = byName(import.meta.glob<{ default: ComponentType }>("../blocks/react/*.tsx", { eager: true }));
const vue = byName(import.meta.glob<{ default: VueComponent }>("../blocks/vue/*.vue", { eager: true }));
const solid = byName(import.meta.glob<{ default: () => unknown }>("../blocks/solid/*.tsx", { eager: true }));
const svelte = byName(import.meta.glob<{ default: SvelteComponent }>("../blocks/svelte/*.svelte", { eager: true }));

export const BLOCK_FRAMEWORKS: BlockFramework[] = [
  {
    id: "react",
    name: "React",
    sources: byName(import.meta.glob<string>("../blocks/react/*.tsx", { eager: true, query: "?raw", import: "default" })),
    render: (name) => {
      const Block = react[name]?.default;
      return Block && <Block />;
    },
  },
  {
    id: "vue",
    name: "Vue",
    sources: byName(import.meta.glob<string>("../blocks/vue/*.vue", { eager: true, query: "?raw", import: "default" })),
    render: (name) => vue[name] && <VueIsland component={vue[name].default} />,
  },
  {
    id: "solid",
    name: "Solid",
    sources: byName(import.meta.glob<string>("../blocks/solid/*.tsx", { eager: true, query: "?raw", import: "default" })),
    render: (name) => solid[name] && <SolidIsland component={solid[name].default} />,
  },
  {
    id: "svelte",
    name: "Svelte",
    sources: byName(import.meta.glob<string>("../blocks/svelte/*.svelte", { eager: true, query: "?raw", import: "default" })),
    render: (name) => svelte[name] && <SvelteIsland component={svelte[name].default} />,
  },
];

export const BLOCKS = [
  { name: "SignInPage", title: "Sign-in page", lead: "The first screen of an app with a password: the card, the passkey and the way back in." },
  { name: "SettingsPage", title: "Settings page", lead: "Tiles down the side, cards beside them, and every change saved as it is made." },
  { name: "ListPage", title: "List page", lead: "A filter, a list that loads, and an empty state for each way of having nothing to show." },
  { name: "InfoPage", title: "Info tile", lead: "The last tile in Settings: every version, the ways to get help, and who made the app." },
  { name: "UploadArea", title: "Upload area", lead: "A place to drop files or choose them, with each upload's progress under it." },
  { name: "ConfirmFlow", title: "Confirm flow", lead: "Ask once before deleting, then offer the way back in the toast that reports it." },
];

/** `?fw=vue` in the address opens every block in that framework, as a test run does. */
function askedFramework() {
  const fw = new URLSearchParams(location.hash.split("?")[1] ?? "").get("fw");
  return BLOCK_FRAMEWORKS.some((f) => f.id === fw) ? fw! : BLOCK_FRAMEWORKS[0].id;
}

function BlockDemo({ name }: { name: string }) {
  const [framework, setFramework] = useState(askedFramework);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, copy] = useCopied();
  const fw = BLOCK_FRAMEWORKS.find((f) => f.id === framework)!;
  const source = fw.sources[name]?.trim() ?? "";
  return (
    <div className="demo block" data-block={name}>
      <div className="demo-bar block-bar">
        <Selector
          label="Framework"
          value={framework}
          onChange={setFramework}
          options={BLOCK_FRAMEWORKS.filter((f) => f.sources[name]).map((f) => ({ value: f.id, label: f.name }))}
        />
        <span style={{ flex: 1 }} />
        <Selector
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: "preview", label: "Preview" },
            { value: "code", label: "Code" },
          ]}
        />
        <Button label={copied ? "Copied" : "Copy code"} labelKey={copied ? "copied" : "copy"} tone="subtle" compactBelow={640} onClick={() => copy(source)} />
      </div>
      {view === "preview" ? (
        <div className="demo-stage block-stage" data-demo={name} data-framework={framework} key={framework}>
          {fw.render(name)}
        </div>
      ) : (
        <pre className="code block-code">
          <code dangerouslySetInnerHTML={{ __html: highlight(source) }} />
        </pre>
      )}
    </div>
  );
}

export function BlocksPage() {
  return (
    <>
      <p className="lead">
        Page parts built from the components the way an app builds them. Each one runs here as it would in an app, in
        React, Vue, Solid and Svelte, and its code copies with one click.
      </p>
      {BLOCKS.map((b) => (
        <Fragment key={b.name}>
          <H2>{b.title}</H2>
          <p>{b.lead}</p>
          <BlockDemo name={b.name} />
        </Fragment>
      ))}
    </>
  );
}
