import { createSignal, getOwner, runWithOwner } from "solid-js";
import { Button, Toggle, useConfirm } from "@glimstone/solid";

// `extra` is kept as it was when confirm() was called, so a switch inside it
// holds its own state and reports it out.
function AlsoFiles(props: { onChange: (on: boolean) => void }) {
  const [on, setOn] = createSignal(false);
  return (
    <Toggle
      label="Also delete the files on the target"
      checked={on()}
      onChange={(next) => {
        setOn(next);
        props.onChange(next);
      }}
    />
  );
}

export default function ConfirmDelete() {
  const { confirm, confirmDialog } = useConfirm({ title: "Confirm", cancel: "Cancel", confirm: "Confirm" });
  // A press runs outside the component, so the switch is made under its owner.
  const owner = getOwner();
  let alsoFiles = false;
  const remove = async () => {
    alsoFiles = false;
    const yes = await confirm("Delete the snapshot from 14 October? The archive on the target stays.", {
      confirmLabel: "Delete",
      confirmLabelKey: "delete",
      extra: runWithOwner(owner, () => <AlsoFiles onChange={(on) => (alsoFiles = on)} />),
    });
    if (yes) console.info(alsoFiles ? "snapshot and files deleted" : "snapshot deleted");
  };
  return (
    <>
      <Button label="Delete snapshot" labelKey="delete" onClick={remove} />
      {confirmDialog}
    </>
  );
}
