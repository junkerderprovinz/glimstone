import { useState } from "react";
import { FortressAppCard, FortressStatusWindow } from "@glimstone/react";
import { fortressTextEn as text, memberName, openRefusalText, type FortressApp, type FortressInstance } from "@glimstone/core";
import { OPEN_APPS, STATUS_LOG, STATUS_REPORT } from "../fortressData";

// Open goes through the app's onOpen: Delta is a plugin and shows its status,
// Echo refuses until it has a password, which the app's toast says, and the
// two Bravos on Atlas ask first.
export default function FortressOpen() {
  const [said, setSaid] = useState("Nothing yet");
  const [status, setStatus] = useState<{ app: FortressApp; instance: FortressInstance } | null>(null);
  const onOpen = (app: FortressApp, instance: FortressInstance) => {
    if (instance.form === "plugin") setStatus({ app, instance });
    else if (app.id === "echo") setSaid(`Toast: ${openRefusalText(text, "ui_no_login")}`);
    else setSaid(`Opened ${memberName(text, app, instance)} (${instance.id})`);
  };
  return (
    <div className="fortress-demo">
      <div className="glim-fortress-grid">
        {OPEN_APPS.map((a, i) => (
          <FortressAppCard key={a.id} app={a} text={text} lang="en" hueIndex={i} onOpen={onOpen} />
        ))}
      </div>
      {status && <FortressStatusWindow {...status} report={STATUS_REPORT} log={STATUS_LOG} text={text} lang="en" onClose={() => setStatus(null)} />}
      <output data-hook="said">{said}</output>
    </div>
  );
}
