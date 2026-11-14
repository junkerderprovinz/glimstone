import { useEffect, useRef, useState } from "react";
import { addToast, pauseToast, removeToast, resumeToast, type ToastEntry } from "@glimstone/core";
import { Card, IconButton, ListRow, Pill, ToastViewport, useConfirm } from "@glimstone/react";
import { Glyph } from "../../glyph";

const SNAPSHOTS = ["14 October", "21 October", "28 October"];

// Deleting asks first, and the toast that reports it can take it back.
export default function ConfirmFlow() {
  const { confirm, confirmDialog } = useConfirm({ title: "Delete snapshot", cancel: "Cancel", confirm: "Delete" });
  const [snapshots, setSnapshots] = useState(SNAPSHOTS);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const next = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => setToasts((list) => list.filter((t) => t.expiresAt === null || t.expiresAt > Date.now())), 250);
    return () => clearInterval(tick);
  }, []);

  const remove = async (day: string) => {
    if (!(await confirm(`Delete the snapshot from ${day}? The archive on the target stays.`, { confirmLabelKey: "delete" }))) return;
    setSnapshots((list) => list.filter((d) => d !== day));
    const toast = {
      id: String(next.current++),
      message: `Snapshot from ${day} deleted`,
      severity: "success" as const,
      action: { label: "Undo", onClick: () => setSnapshots((list) => SNAPSHOTS.filter((d) => d === day || list.includes(d))) },
    };
    setToasts((list) => addToast(list, toast, Date.now()));
  };

  return (
    <div style={{ width: "100%", maxWidth: 560, paddingTop: 12 }}>
      <Card title="Snapshots">
        <div style={{ display: "grid", gap: 2 }}>
          {snapshots.map((day) => (
            <ListRow
              key={day}
              name={day}
              tile={<Glyph name="IconArchive" />}
              badges={<Pill tone="ok">Settled</Pill>}
              actions={<IconButton tip={`Delete the snapshot from ${day}`} glyph={<Glyph name="IconTrash" />} onClick={() => remove(day)} />}
            />
          ))}
        </div>
      </Card>
      {confirmDialog}
      <ToastViewport
        toasts={toasts}
        dismissLabel="Dismiss"
        onDismiss={(id) => setToasts((list) => removeToast(list, id))}
        onMouseEnter={(id) => setToasts((list) => pauseToast(list, id, Date.now()))}
        onMouseLeave={(id) => setToasts((list) => resumeToast(list, id, Date.now()))}
        onFocus={(id) => setToasts((list) => pauseToast(list, id, Date.now()))}
        onBlur={(id) => setToasts((list) => resumeToast(list, id, Date.now()))}
      />
    </div>
  );
}
