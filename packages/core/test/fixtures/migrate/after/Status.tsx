import { Badge, DropdownListbox, type BadgeForm } from "@glimstone/react";

const round: BadgeForm = "circle";

export function Status({ ok, onPick }: { ok: boolean; onPick: () => void }) {
  return (
    <div>
      <Badge tone={ok ? "ok" : "fail"} form="circle" tip="State">
        {ok ? "✓" : "!"}
      </Badge>
      <Badge
        tone="neutral"
        onClick={() => onPick()}
      >
        Pick
      </Badge>
      <Badge shape={round} form="square">Mixed</Badge>
      <Badge form="circle" />
      <Badge form="rounded" />
      <DropdownListbox open={false} onClose={onPick} label="Pick">
        <span />
      </DropdownListbox>
    </div>
  );
}
