import { HoverCard } from "@glimstone/react/HoverCard";
import { Glyph } from "../glyph";

const FACTS = [
  { label: "Free", value: "2.1 TB" },
  { label: "Backups", value: "214" },
  { label: "Last run", value: "4 min" },
];

export default function HoverCardServer() {
  return (
    <p style={{ margin: 0, maxWidth: "32rem" }}>
      Last night's backup went to{" "}
      <HoverCard
        label="the server in the cellar"
        href="#/components/hover-card"
        media={<Glyph name="IconServer" size={20} />}
        title="Cellar"
        meta="Connected, last seen a minute ago"
        facts={FACTS}
      />{" "}
      and finished in four minutes.
    </p>
  );
}
