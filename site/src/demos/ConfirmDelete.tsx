import { useRef, useState } from "react";
import { Button, Toggle, useConfirm } from "@glimstone/react";

// `extra` is kept as it was when confirm() was called, so a switch inside it
// holds its own state and reports it out.
function AlsoFiles({ onChange }: { onChange: (on: boolean) => void }) {
  const [on, setOn] = useState(false);
  return (
    <Toggle
      label="Also delete the files on the target"
      checked={on}
      onChange={(next) => {
        setOn(next);
        onChange(next);
      }}
    />
  );
}

export default function ConfirmDelete() {
  const { confirm, confirmDialog } = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });
  const alsoFiles = useRef(false);
  const remove = async () => {
    alsoFiles.current = false;
    const yes = await confirm("Delete the snapshot from 14 October? The archive on the target stays.", {
      confirmLabel: "Delete",
      confirmLabelKey: "delete",
      extra: <AlsoFiles onChange={(on) => (alsoFiles.current = on)} />,
    });
    if (yes) console.info(alsoFiles.current ? "snapshot and files deleted" : "snapshot deleted");
  };
  return (
    <>
      <Button label="Delete snapshot" labelKey="delete" onClick={remove} />
      {confirmDialog}
    </>
  );
}
