import { useEffect, useRef, useState } from "react";
import { Button } from "@gs/react/Button";
import { ToastViewport } from "@gs/react/Toast";
import { addToast, pauseToast, removeToast, resumeToast, type ToastEntry, type ToastSeverity } from "@gs/react/toastEngine";

const MESSAGES: Record<ToastSeverity, string> = {
  success: "Settings saved.",
  warn: "The target is almost full.",
  fail: "Could not reach the target.",
};

export default function ToastDemo() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const next = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      setToasts((list) => list.filter((t) => t.expiresAt === null || t.expiresAt > now));
    }, 250);
    return () => clearInterval(tick);
  }, []);

  const show = (severity: ToastSeverity) =>
    setToasts((list) => addToast(list, { id: String(next.current++), message: MESSAGES[severity], severity }, Date.now()));
  const pause = (id: string) => setToasts((list) => pauseToast(list, id, Date.now()));
  const resume = (id: string) => setToasts((list) => resumeToast(list, id, Date.now()));

  return (
    <>
      <Button label="Success" labelKey="confirm" tone="ok" onClick={() => show("success")} />
      <Button label="Warning" labelKey="warning" tone="warn" onClick={() => show("warn")} />
      <Button label="Failure" labelKey="close" tone="danger" onClick={() => show("fail")} />
      <ToastViewport
        toasts={toasts}
        dismissLabel="Dismiss"
        onDismiss={(id) => setToasts((list) => removeToast(list, id))}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
      />
    </>
  );
}
