import { Collapsible } from "@glimstone/react/Collapsible";

export default function CollapsibleBasic() {
  return (
    <div style={{ width: "min(32rem, 100%)" }}>
      <Collapsible label="What a relay sees">
        Only the encrypted parcels and the address they go to. It cannot open a backup and keeps nothing once a parcel
        is delivered.
      </Collapsible>
    </div>
  );
}
