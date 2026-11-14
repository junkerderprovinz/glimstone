import { Carousel } from "@glimstone/react/Carousel";

const shots = [
  { title: "The new overview", body: "Every place a backup goes, at a glance." },
  { title: "Pairing a phone", body: "Twelve words, typed once." },
  { title: "Restoring one file", body: "Open the backup, pick the file, done." },
];

export default function CarouselRelease() {
  return (
    <div style={{ width: "min(30rem, 100%)" }}>
      <Carousel
        label="What is new"
        items={shots}
        slide={(s) => (
          <div className="glim-well" style={{ height: 140, display: "grid", alignContent: "center", gap: 4, padding: 20 }}>
            <strong>{s.title}</strong>
            <span>{s.body}</span>
          </div>
        )}
      />
    </div>
  );
}
