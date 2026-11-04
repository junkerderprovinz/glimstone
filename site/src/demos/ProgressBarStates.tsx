import { ProgressBar } from "@glimstone/react";

export default function ProgressBarStates() {
  return (
    <div style={{ display: "grid", gap: 14, width: 360 }}>
      <ProgressBar value={0.62} label="Copying" valueText="2.5 GB of 4 GB" />
      <ProgressBar value={0.4} paused label="Paused" />
      <ProgressBar value={0.55} failed label="Failed" />
      <ProgressBar value={1} label="Done" />
      <ProgressBar label="Preparing" />
    </div>
  );
}
