import { Button } from "@gs/react/Button";

export default function ButtonTones() {
  return (
    <>
      <Button label="Save" labelKey="save" tone="accent" />
      <Button label="Refresh" labelKey="refresh" tone="neutral" />
      <Button label="Copy" labelKey="copy" tone="subtle" />
      <Button label="Restore" labelKey="restore" tone="ok" />
      <Button label="Delete" labelKey="delete" tone="danger" />
      <Button label="Upload" labelKey="upload" tone="warn" />
    </>
  );
}
