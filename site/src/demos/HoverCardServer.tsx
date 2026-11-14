import { HoverCard } from "@glimstone/react/HoverCard";

export default function HoverCardServer() {
  return (
    <p style={{ margin: 0, maxWidth: "32rem" }}>
      Last night's backup went to{" "}
      <HoverCard
        label="the server in the cellar"
        href="#/components/hover-card"
        content={() => (
          <div style={{ display: "grid", gap: 4 }}>
            <strong>Cellar</strong>
            <span>Connected, 2.1 TB free, last seen a minute ago</span>
          </div>
        )}
      />{" "}
      and finished in four minutes.
    </p>
  );
}
