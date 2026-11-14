<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { OpenUrl } from "@glimstone/core";

  export interface InfoHelpCardProps {
    text: {
      title?: string;
      /** The card's "(i)", such as what the bug report holds. */
      hint?: string;
      report: string;
      repoButton: string;
      mailButton: string;
      mailSubject: string;
      /** "Bug report". Only drawn together with `onBugReport`. */
      bugReport?: string;
      /** The bug report's second line, "Download". */
      bugReportSub?: string;
      /** "Manual". Only drawn together with `manualUrl`. */
      manual?: string;
      /** The manual's second line, "Open". */
      manualSub?: string;
    };
    repoUrl: string;
    /** The mark on the repository button, passed for the same reason as the
     *  give buttons' marks. */
    repoGlyph?: Snippet;
    /** The workshop's own mailbox. Omit it and the card offers no mail route. */
    mailAddress?: string;
    /** The envelope, `MAIL_SVG` from appMarks.ts, which opens under the pointer. */
    mailGlyph?: Snippet;
    /** The app's handbook. Omit it where the app has none; the README is not a
     *  manual. */
    manualUrl?: string;
    /** The book, `MANUAL_SVG` from appMarks.ts, which opens under the pointer. */
    manualGlyph?: Snippet;
    /** Downloads the instance's logs and settings as one file, without
     *  passwords, keys or credentials. */
    onBugReport?: () => void;
    /** `IconDiagnostics`, the bug. */
    bugGlyph?: Snippet;
    openUrl?: OpenUrl;
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import { mailHref, offersMail, openInBrowser } from "@glimstone/core";
  import Card from "./Card.svelte";
  import ReadmeButton from "./ReadmeButton.svelte";

  // The second card of the Info tile: a sentence inviting a report, then
  // GitHub, Email, the manual and the bug report.
  let {
    text,
    repoUrl,
    repoGlyph,
    mailAddress,
    mailGlyph,
    manualUrl,
    manualGlyph,
    onBugReport,
    bugGlyph,
    openUrl = openInBrowser,
    hueIndex,
  }: InfoHelpCardProps = $props();

  const wantsMail = $derived(offersMail(text.report, mailAddress));
</script>

<Card data-glim="InfoHelpCard" title={text.title} hint={text.hint} {hueIndex}>
  <p class="glim-info-text">{text.report}</p>
  <div class="glim-readme-btn-rows">
    <ReadmeButton brand="github" parts={[{ name: text.repoButton, onClick: () => openUrl(repoUrl) }]} mark={repoGlyph} markClass="glim-github-mark" />
    <!-- This button reaches the app's own authors rather than a third party,
         so it follows the user's accent and rainbow. -->
    {#if wantsMail}
      <ReadmeButton
        brand="house"
        parts={[{ name: text.mailButton, onClick: () => openUrl(mailHref(mailAddress!, text.mailSubject)) }]}
        mark={mailGlyph}
        markClass="glim-house-mark"
      />
    {/if}
    <!-- The README's docs button, its book and its yellow. -->
    {#if manualUrl && text.manual}
      <ReadmeButton brand="docs" parts={[{ name: text.manual, sub: text.manualSub, onClick: () => openUrl(manualUrl) }]} mark={manualGlyph} markClass="glim-docs-mark" />
    {/if}
    <!-- The file goes with an issue on GitHub, so it lights up beside it. -->
    {#if onBugReport && text.bugReport}
      <ReadmeButton brand="github" parts={[{ name: text.bugReport, sub: text.bugReportSub, onClick: onBugReport }]} mark={bugGlyph} />
    {/if}
  </div>
</Card>
