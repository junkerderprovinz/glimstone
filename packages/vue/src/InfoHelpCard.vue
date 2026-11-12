<script setup lang="ts">
import { computed } from "vue";
import { mailHref, offersMail, openInBrowser } from "@glimstone/core";
import type { InfoHelpCardProps } from "./info";
import Card from "./Card.vue";
import ReadmeButton from "./ReadmeButton.vue";

// The second card of the Info tile: a sentence inviting a report, then GitHub,
// Email, the manual and the bug report. No card names a route no control on it
// can reach, so mail shows only where the sentence names it.
const props = withDefaults(defineProps<InfoHelpCardProps>(), { openUrl: openInBrowser });
const wantsMail = computed(() => offersMail(props.text.report, props.mailAddress));
</script>

<template>
  <Card data-glim="InfoHelpCard" :title="text.title" :hint="text.hint" :hue-index="hueIndex">
    <p class="glim-info-text">{{ text.report }}</p>
    <div class="glim-readme-btn-rows">
      <ReadmeButton brand="github" :parts="[{ name: text.repoButton, onClick: () => openUrl(repoUrl) }]" mark-class="glim-github-mark">
        <template v-if="repoGlyph" #mark><component :is="repoGlyph" /></template>
      </ReadmeButton>
      <!-- This button reaches the app's own authors rather than a third party,
           so it follows the user's accent and rainbow. -->
      <ReadmeButton
        v-if="wantsMail"
        brand="house"
        :parts="[{ name: text.mailButton, onClick: () => openUrl(mailHref(mailAddress!, text.mailSubject)) }]"
        mark-class="glim-house-mark"
      >
        <template v-if="mailGlyph" #mark><component :is="mailGlyph" /></template>
      </ReadmeButton>
      <ReadmeButton
        v-if="manualUrl && text.manual"
        brand="docs"
        :parts="[{ name: text.manual, sub: text.manualSub, onClick: () => openUrl(manualUrl!) }]"
        mark-class="glim-docs-mark"
      >
        <template v-if="manualGlyph" #mark><component :is="manualGlyph" /></template>
      </ReadmeButton>
      <!-- The file goes with an issue on GitHub, so it lights up beside it. -->
      <ReadmeButton v-if="onBugReport && text.bugReport" brand="github" :parts="[{ name: text.bugReport, sub: text.bugReportSub, onClick: onBugReport }]">
        <template v-if="bugGlyph" #mark><component :is="bugGlyph" /></template>
      </ReadmeButton>
    </div>
  </Card>
</template>
