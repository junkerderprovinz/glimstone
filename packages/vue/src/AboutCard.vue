<script setup lang="ts">
import { computed, type Component } from "vue";
import { openInBrowser, type VersionRow } from "@glimstone/core";
import InfoTile from "./InfoTile.vue";

// The props of the single About card from before the Info tile, laid out as
// the tile: the About card under `text.title`, the Version card under
// `text.version` with the app and GlimStone as its rows, and the Help card.
// InfoTile adds the rows' sub-lines, the other components, "Check for
// updates" and the bug report, so a new app uses that instead.

// Spelled out, as in info.ts, so Vue keeps a function as the default opener.
type OpenUrl = (url: string) => void;

const props = withDefaults(
  defineProps<{
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
    repoGlyph?: Component;
    glimstoneRepoUrl: string;
    onCoffee: () => void;
    coffeeArt: Component;
    cryptoGlyph?: Component;
    paypalGlyph?: Component;
    onPaypal?: () => void;
    onCrypto?: () => void;
    mailAddress?: string;
    mailGlyph?: Component;
    openUrl?: OpenUrl;
    hueIndex?: number;
  }>(),
  { openUrl: openInBrowser },
);

const rows = computed<VersionRow[]>(() => [
  ...(props.version ? [{ name: props.text.version, version: props.version, repoUrl: props.repoUrl }] : []),
  { name: "GlimStone", version: props.glimstoneVersion, repoUrl: props.glimstoneRepoUrl },
]);
</script>

<template>
  <InfoTile
    data-glim="AboutCard"
    :hue-index="hueIndex"
    :about="{ text, onCoffee, coffeeArt, onPaypal, paypalGlyph, onCrypto, cryptoGlyph }"
    :version="{ text: { title: text.version, unreleased: text.unreleased }, rows, openUrl }"
    :help="{
      text: { title: text.helpTitle, report: text.report, repoButton: text.repoButton, mailButton: text.mailButton, mailSubject: text.mailSubject },
      repoUrl,
      repoGlyph,
      mailAddress,
      mailGlyph,
      openUrl,
    }"
  />
</template>
