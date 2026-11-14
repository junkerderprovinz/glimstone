import { CopyField } from "@glimstone/solid";

export default function CopyFieldBasic() {
  return (
    <div style={{ display: "grid", gap: "8px", width: "360px" }}>
      <CopyField label="Share address" value="smb://bottich/media/filme" />
    </div>
  );
}
