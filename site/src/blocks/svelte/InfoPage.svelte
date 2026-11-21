<script lang="ts">
  import { createRawSnippet } from "svelte";
  import { InfoTile } from "@glimstone/svelte";
  import { COFFEE_BUTTON_SVG, COMPONENTS_CARD_TEXT, MAIL_SVG, VERSION_CARD_TEXT } from "@glimstone/core";
  import { glyph } from "../../svelte/glyph";

  const REPO = "https://github.com/junkerderprovinz/glimstone";

  const art = (svg: string) => createRawSnippet(() => ({ render: () => `<span style="display: contents">${svg}</span>` }));

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
    repoGlyph: glyph("IconGithub", 20),
    discordUrl: "https://discord.gg/example",
    discordGlyph: glyph("IconDiscord", 20),
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

<div style="display: grid; gap: 40px; width: 100%; max-width: 480px; padding-top: 12px">
  <InfoTile hueIndex={0} {version} {components} {help} {about} />
</div>
