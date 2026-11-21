import { InfoTile } from "@glimstone/solid";
import { COFFEE_BUTTON_SVG, COMPONENTS_CARD_TEXT, MAIL_SVG, VERSION_CARD_TEXT } from "@glimstone/core";
import { Glyph } from "../../solid/glyph";

const REPO = "https://github.com/junkerderprovinz/glimstone";

const Art = (props: { svg: string }) => <span style={{ display: "contents" }} innerHTML={props.svg} />;

// The last tile in Settings: what the app is made of, where to report
// something, and who made it.
export default function InfoPage() {
  return (
    <div style={{ display: "grid", gap: "40px", width: "100%", "max-width": "480px", "padding-top": "12px" }}>
      <InfoTile
        hueIndex={0}
        version={{
          text: VERSION_CARD_TEXT,
          name: "Your app",
          version: "2.1.0",
          repoUrl: REPO,
          route: "install",
          state: { kind: "available", version: "2.2.0" },
          onCheck: () => {},
          onUpdate: () => {},
          onWhatsNew: () => {},
          unseen: 3,
          autoUpdate: true,
        }}
        components={{
          text: COMPONENTS_CARD_TEXT,
          name: "Your app",
          rows: [
            { name: "rclone", hint: "Cloud transfers", version: "1.75.2" },
            { name: "Installer", hint: COMPONENTS_CARD_TEXT.installer, version: "1.2.5", kind: "installer" },
          ],
        }}
        help={{
          text: {
            title: "Help",
            report: "Something broken, or an idea? An issue, an email or a word on Discord is welcome.",
            repoButton: "GitHub",
            discordButton: "Discord",
            mailButton: "Mail",
            mailSubject: "Your app",
          },
          repoUrl: REPO,
          repoGlyph: <Glyph name="IconGithub" size={20} />,
          discordUrl: "https://discord.gg/example",
          discordGlyph: <Glyph name="IconDiscord" size={20} />,
          mailAddress: "post@example.com",
          mailGlyph: <Art svg={MAIL_SVG} />,
        }}
        about={{
          text: {
            title: "About",
            body: "Built in a small workshop, free and open source.",
            coffee: "A donation covers the server and the coffee.",
            coffeeButton: "Buy a coffee",
          },
          // The app's CoffeeDialog opens here, inside the app.
          onCoffee: () => {},
          coffeeArt: <Art svg={COFFEE_BUTTON_SVG} />,
        }}
      />
    </div>
  );
}
