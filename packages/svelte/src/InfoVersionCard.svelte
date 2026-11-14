<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { OpenUrl, UpdateCheck, VersionRow } from "@glimstone/core";

  export type { UpdateCheck, VersionRow } from "@glimstone/core";

  export interface InfoVersionCardProps {
    text: {
      title: string;
      /** The card's "(i)", such as what a click on a number opens. */
      hint?: string;
      unreleased: (version: string) => string;
      /** "Release notes". Only drawn with `onReleaseNotes` and without `whatsNew`. */
      releaseNotes?: string;
    };
    /** The app first, then the design language, then every component it ships. */
    rows: VersionRow[];
    /** "Check for updates" at the bottom of the card. Omit it and the card
     *  offers no check. */
    updateCheck?: UpdateCheck;
    /** Opens the app's window on the running version's release notes, for an
     *  app that marks no changes. */
    onReleaseNotes?: () => void;
    /** The app's own "New · n" button, wearing `IconWhatsNew` with the dot in
     *  front. It takes the place of "Release notes", so the card has one button there. */
    whatsNew?: Snippet;
    openUrl?: OpenUrl;
    hueIndex?: number;
  }
</script>

<script lang="ts">
  import { openInBrowser, runUpdateCheck, updateFace, updateStage, versionLink, type UpdateVerdict } from "@glimstone/core";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";

  // The first card of the Info tile: every version as a row, and the New or
  // Release notes button and the update check under them. The check shows its
  // verdict on itself, like a test button.
  let { text, rows, updateCheck, onReleaseNotes, whatsNew, openUrl = openInBrowser, hueIndex }: InfoVersionCardProps = $props();

  const notes = $derived(!whatsNew && onReleaseNotes && text.releaseNotes);
  let verdict = $state<UpdateVerdict>({ kind: "idle" });
  let shake = $state(0);

  function check(c: UpdateCheck) {
    void runUpdateCheck(c, verdict, (v) => {
      verdict = v;
      if (v.kind === "failed") shake++;
    });
  }
  function open(e: MouseEvent, href: string) {
    e.preventDefault();
    openUrl(href);
  }
</script>

<Card data-glim="InfoVersionCard" title={text.title} hint={text.hint} {hueIndex}>
  <ul class="glim-version-rows">
    {#each rows as row (row.name)}
      {@const link = versionLink(row)}
      <li class="glim-version-row">
        <span class="glim-version-name">
          <span class="glim-version-part">{row.name}</span>
          {#if row.sub}<span class="glim-version-sub">{row.sub}</span>{/if}
        </span>
        <!-- A link to its release page when it is a published release. It has
             no underline; the ink lifts on hover. -->
        {#if link.href}
          <a href={link.href} target="_blank" rel="noopener noreferrer" onclick={(e) => open(e, link.href!)} class="glim-num glim-version-number">{link.shown}</a>
        {:else}
          <span class="glim-num glim-version-number">{link.released ? link.shown : text.unreleased(link.shown)}</span>
        {/if}
      </li>
    {/each}
  </ul>
  {#if notes || whatsNew || updateCheck}
    <div class="glim-version-actions">
      {#if notes}<Button label={notes} labelKey="about.releaseNotes" onClick={onReleaseNotes} />{/if}
      {@render whatsNew?.()}
      {#if updateCheck}
        {@const face = updateFace(verdict, updateCheck.text)}
        <!-- A new button for every failure, so the shake runs again. -->
        {#key shake}
          <Button
            label={face.label}
            labelKey={face.labelKey}
            tone={face.tone}
            stage={updateStage(updateCheck.text, face.label)}
            busy={verdict.kind === "busy"}
            onClick={() => check(updateCheck)}
            class={shake > 0 ? "glim-shake" : ""}
          />
        {/key}
        <span role="status" class="glim-sr-only">{face.announced}</span>
      {/if}
    </div>
  {/if}
</Card>
