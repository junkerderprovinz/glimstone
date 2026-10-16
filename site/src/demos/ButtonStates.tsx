import { useState } from "react";
import { Button } from "@gs/react/Button";

export default function ButtonStates() {
  const [busy, setBusy] = useState(false);
  const run = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 1800);
  };
  return (
    <>
      <Button label="Back up now" labelKey="backup" tone="accent" busy={busy} onClick={run} title={busy ? "Backing up" : undefined} />
      <Button label="Download" labelKey="download" disabled title="Nothing to download yet" />
      <Button label="Edit" labelKey="edit" variant="icon" />
      <Button label="Remove /mnt/user/media" labelKey={null} variant="chip" tone="subtle" />
    </>
  );
}
