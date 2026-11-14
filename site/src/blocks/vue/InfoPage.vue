<script setup lang="ts">
import { h } from "vue";
import { InfoTile } from "@glimstone/vue";
import { COFFEE_BUTTON_SVG, GLIMSTONE_VERSION, MAIL_SVG } from "@glimstone/core";
import { glyph } from "../../vue/glyph";

const REPO = "https://github.com/junkerderprovinz/glimstone";

const art = (svg: string) => () => h("span", { style: "display: contents", innerHTML: svg });

// The last tile in Settings: what the app is made of, where to report
// something, and who made it.
const version = {
  text: { title: "Version", unreleased: (v: string) => `${v}, not released yet` },
  rows: [
    { name: "Your app", version: "2.1.0", repoUrl: REPO },
    { name: "GlimStone", sub: "Design language", version: GLIMSTONE_VERSION, repoUrl: REPO },
  ],
};
const help = {
  text: {
    title: "Help",
    report: "Something broken, or an idea? An issue or a mail is welcome.",
    repoButton: "GitHub",
    mailButton: "Mail",
    mailSubject: "Your app",
  },
  repoUrl: REPO,
  repoGlyph: glyph("IconGithub"),
  mailAddress: "post@example.com",
  mailGlyph: art(MAIL_SVG),
};
const about = {
  text: {
    title: "About",
    body: "Built in a small workshop, free and open source.",
    coffee: "A donation covers the server and the coffee.",
    coffeeButton: "Buy a coffee",
  },
  // The app's CoffeeDialog opens here, inside the app.
  onCoffee: () => {},
  coffeeArt: art(COFFEE_BUTTON_SVG),
};
</script>

<template>
  <div style="display: grid; gap: 40px; width: 100%; max-width: 480px; padding-top: 12px">
    <InfoTile :hue-index="0" :version="version" :help="help" :about="about" />
  </div>
</template>
