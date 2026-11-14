import { InfoTile } from "@glimstone/solid";
import { COFFEE_BUTTON_SVG, GLIMSTONE_VERSION, MAIL_SVG } from "@glimstone/core";
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
          text: { title: "Version", unreleased: (v) => `${v}, not released yet` },
          rows: [
            { name: "Your app", version: "2.1.0", repoUrl: REPO },
            { name: "GlimStone", sub: "Design language", version: GLIMSTONE_VERSION, repoUrl: REPO },
          ],
        }}
        help={{
          text: {
            title: "Help",
            report: "Something broken, or an idea? An issue or a mail is welcome.",
            repoButton: "GitHub",
            mailButton: "Mail",
            mailSubject: "Your app",
          },
          repoUrl: REPO,
          repoGlyph: <Glyph name="IconGithub" size={20} />,
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
