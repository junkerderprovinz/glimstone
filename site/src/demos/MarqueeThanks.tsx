import { Marquee } from "@glimstone/react/Marquee";

const people = ["Ines", "Tomasz", "Aiko", "Rafael", "Maren", "Kofi", "Lucía", "Henrik"];

export default function MarqueeThanks() {
  return (
    <div style={{ width: "min(32rem, 100%)" }}>
      <Marquee label="Thanks to" items={people} item={(name) => name} />
    </div>
  );
}
