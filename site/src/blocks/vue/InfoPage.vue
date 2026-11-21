<script setup lang="ts">
import { h } from "vue";
import { InfoTile } from "@glimstone/vue";
import { COFFEE_BUTTON_SVG, COMPONENTS_CARD_TEXT, MAIL_SVG, VERSION_CARD_TEXT } from "@glimstone/core";
import { glyph } from "../../vue/glyph";

const REPO = "https://github.com/junkerderprovinz/glimstone";

const art = (svg: string) => () => h("span", { style: "display: contents", innerHTML: svg });

// The last tile in Settings: what the app is made of, where to report
// something, and who made it.
const version = {
  text: VERSION_CARD_TEXT,
  name: "Your app",
  version: "2.1.0",
  repoUrl: REPO,
  route: "install" as const,
  state: { kind: "available" as const, version: "2.2.0" },
  onCheck: () => {},
  onUpdate: () => {},
  onWhatsNew: () => {},
  unseen: 3,
  autoUpdate: true,
};
const components = {
  text: COMPONENTS_CARD_TEXT,
  name: "Your app",
  rows: [
    { name: "rclone", hint: "Cloud transfers", version: "1.75.2" },
    { name: "Installer", hint: COMPONENTS_CARD_TEXT.installer, version: "1.2.5", kind: "installer" as const },
  ],
};
const help = {
  text: {
    title: "Help",
    report: "Something broken, or an idea? An issue, an email or a word on Discord is welcome.",
    repoButton: "GitHub",
    discordButton: "Discord",
    mailButton: "Mail",
    mailSubject: "Your app",
  },
  repoUrl: REPO,
  repoGlyph: glyph("IconGithub"),
  discordUrl: "https://discord.gg/example",
  discordGlyph: glyph("IconDiscord"),
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
    <InfoTile :hue-index="0" :version="version" :components="components" :help="help" :about="about" />
  </div>
</template>
