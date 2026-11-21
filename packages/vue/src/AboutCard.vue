<script setup lang="ts">
import { computed, type Component } from "vue";
import { openInBrowser, versionLink, warnDeprecated, type VersionRow } from "@glimstone/core";
import Card from "./Card.vue";
import InfoAboutCard from "./InfoAboutCard.vue";
import InfoHelpCard from "./InfoHelpCard.vue";

// The props of the single About card from before the Info tile, laid out as
// the tile: the About card under `text.title`, the Version card under
// `text.version` with the app and GlimStone as its rows, and the Help card.
// InfoTile adds the update state, the components and the bug report, so a
// new app uses that instead.

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
    repoGlyph?: Component;
    glimstoneRepoUrl: string;
    onCoffee: () => void;
    coffeeArt: Component;
    cryptoGlyph?: Component;
    paypalGlyph?: Component;
    onPaypal?: () => void;
    onCrypto?: () => void;
    discordUrl?: string;
    discordGlyph?: Component;
    mailAddress?: string;
    mailGlyph?: Component;
    openUrl?: OpenUrl;
    hueIndex?: number;
  }>(),
  { openUrl: openInBrowser },
);
warnDeprecated("AboutCard");

const rows = computed(() =>
  (
    [
      ...(props.version ? [{ name: props.text.version, version: props.version, repoUrl: props.repoUrl }] : []),
      { name: "GlimStone", version: props.glimstoneVersion, repoUrl: props.glimstoneRepoUrl },
    ] as VersionRow[]
  ).map((row) => ({ row, link: versionLink(row) })),
);
const at = (offset: number) => (props.hueIndex === undefined ? undefined : props.hueIndex + offset);
</script>

<template>
  <div data-glim="AboutCard" style="display: contents">
    <Card :title="text.version" :hue-index="at(0)">
      <ul class="glim-version-rows">
        <li v-for="{ row, link } in rows" :key="row.name" class="glim-version-row">
          <span class="glim-version-name">
            <span class="glim-version-part">{{ row.name }}</span>
          </span>
          <a v-if="link.href" :href="link.href" target="_blank" rel="noopener noreferrer" class="glim-num glim-version-number">{{ link.shown }}</a>
          <span v-else class="glim-num glim-version-number">{{ link.released ? link.shown : text.unreleased(link.shown) }}</span>
        </li>
      </ul>
    </Card>
    <InfoHelpCard
      :hue-index="at(1)"
      :text="{
        title: text.helpTitle,
        report: text.report,
        repoButton: text.repoButton,
        discordButton: text.discordButton,
        mailButton: text.mailButton,
        mailSubject: text.mailSubject,
      }"
      :repo-url="repoUrl"
      :repo-glyph="repoGlyph"
      :discord-url="discordUrl"
      :discord-glyph="discordGlyph"
      :mail-address="mailAddress"
      :mail-glyph="mailGlyph"
      :open-url="openUrl"
    />
    <InfoAboutCard
      :hue-index="at(2)"
      :text="text"
      :on-coffee="onCoffee"
      :coffee-art="coffeeArt"
      :on-paypal="onPaypal"
      :paypal-glyph="paypalGlyph"
      :on-crypto="onCrypto"
      :crypto-glyph="cryptoGlyph"
    />
  </div>
</template>
