<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface AboutCardProps {
    text: {
      title: string;
      body: string;
      coffee: string;
      coffeeButton: string;
      cryptoButton?: string;
      paypalButton?: string;
      report: string;
      repoButton: string;
      mailButton: string;
      mailSubject: string;
      version: string;
      unreleased: (version: string) => string;
      /** The Help card's heading. Without it the card draws none. */
      helpTitle?: string;
    };
    version: string | null;
    glimstoneVersion: string;
    repoUrl: string;
    repoGlyph?: Snippet;
    glimstoneRepoUrl: string;
    onCoffee: () => void;
    coffeeArt: Snippet;
    cryptoGlyph?: Snippet;
    paypalGlyph?: Snippet;
    onPaypal?: () => void;
    onCrypto?: () => void;
    mailAddress?: string;
    mailGlyph?: Snippet;
    openUrl?: (url: string) => void;
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import { openInBrowser, warnDeprecated, type VersionRow } from "@glimstone/core";
  import InfoTile from "./InfoTile.svelte";

  // The 3.2.0 props of the single About card, laid out as the Info tile: the
  // About card under `text.title`, the Version card under `text.version` with
  // the app and GlimStone as its rows, and the Help card. Deprecated for
  // InfoTile, which adds the version rows' sub-lines, the other components,
  // "Check for updates" and the bug report.
  let {
    text,
    version,
    glimstoneVersion,
    repoUrl,
    repoGlyph,
    glimstoneRepoUrl,
    onCoffee,
    coffeeArt,
    cryptoGlyph,
    paypalGlyph,
    onPaypal,
    onCrypto,
    mailAddress,
    mailGlyph,
    openUrl = openInBrowser,
    hueIndex,
  }: AboutCardProps = $props();
  warnDeprecated("AboutCard");

  const rows: VersionRow[] = $derived([
    ...(version ? [{ name: text.version, version, repoUrl }] : []),
    { name: "GlimStone", version: glimstoneVersion, repoUrl: glimstoneRepoUrl },
  ]);
</script>

<InfoTile
  data-glim="AboutCard"
  {hueIndex}
  about={{ text, onCoffee, coffeeArt, onPaypal, paypalGlyph, onCrypto, cryptoGlyph }}
  version={{ text: { title: text.version, unreleased: text.unreleased }, rows, openUrl }}
  help={{
    text: { title: text.helpTitle, report: text.report, repoButton: text.repoButton, mailButton: text.mailButton, mailSubject: text.mailSubject },
    repoUrl,
    repoGlyph,
    mailAddress,
    mailGlyph,
    openUrl,
  }}
/>
