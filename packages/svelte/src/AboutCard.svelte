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
      discordButton?: string;
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
    discordUrl?: string;
    discordGlyph?: Snippet;
    mailAddress?: string;
    mailGlyph?: Snippet;
    openUrl?: (url: string) => void;
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import { openInBrowser, versionLink, warnDeprecated, type VersionRow } from "@glimstone/core";
  import Card from "./Card.svelte";
  import InfoAboutCard from "./InfoAboutCard.svelte";
  import InfoHelpCard from "./InfoHelpCard.svelte";

  // The 3.2.0 props of the single About card, laid out as the Info tile: the
  // About card under `text.title`, the Version card under `text.version` with
  // the app and GlimStone as its rows, and the Help card. Deprecated for
  // InfoTile, which adds the update state, the components and the bug report.
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
    discordUrl,
    discordGlyph,
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
  const at = (offset: number) => (hueIndex === undefined ? undefined : hueIndex + offset);
</script>

<div data-glim="AboutCard" style="display: contents">
  <Card title={text.version} hueIndex={at(0)}>
    <ul class="glim-version-rows">
      {#each rows as row (row.name)}
        {@const link = versionLink(row)}
        <li class="glim-version-row">
          <span class="glim-version-name"><span class="glim-version-part">{row.name}</span></span>
          {#if link.href}
            <a href={link.href} target="_blank" rel="noopener noreferrer" class="glim-num glim-version-number">{link.shown}</a>
          {:else}
            <span class="glim-num glim-version-number">{link.released ? link.shown : text.unreleased(link.shown)}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </Card>
  <InfoHelpCard
    hueIndex={at(1)}
    text={{
      title: text.helpTitle,
      report: text.report,
      repoButton: text.repoButton,
      discordButton: text.discordButton,
      mailButton: text.mailButton,
      mailSubject: text.mailSubject,
    }}
    {repoUrl}
    {repoGlyph}
    {discordUrl}
    {discordGlyph}
    {mailAddress}
    {mailGlyph}
    {openUrl}
  />
  <InfoAboutCard hueIndex={at(2)} {text} {onCoffee} {coffeeArt} {onPaypal} {paypalGlyph} {onCrypto} {cryptoGlyph} />
</div>
