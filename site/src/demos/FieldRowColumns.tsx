import { FieldRow, FieldRowGroup, TextField } from "@glimstone/react";

export default function FieldRowColumns() {
  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <FieldRowGroup columns={2}>
        <FieldRow label="Name">
          <TextField width="grow" defaultValue="*.mkv" />
        </FieldRow>
        <FieldRow label="Changed">
          <TextField width="grow" defaultValue="this week" />
        </FieldRow>
        <FieldRow label="Size at least">
          <TextField width="grow" defaultValue="1 GB" />
        </FieldRow>
        <FieldRow label="Owner">
          <TextField width="grow" defaultValue="anna" />
        </FieldRow>
        <FieldRow label="Look in" wide>
          <TextField width="grow" mono defaultValue="/mnt/user/media" />
        </FieldRow>
      </FieldRowGroup>
    </div>
  );
}
