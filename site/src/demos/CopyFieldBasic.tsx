import { CopyField } from "@glimstone/react";

export default function CopyFieldBasic() {
  return (
    <div style={{ display: "grid", gap: 8, width: 360 }}>
      <CopyField label="Share address" value="smb://bottich/media/filme" />
    </div>
  );
}
