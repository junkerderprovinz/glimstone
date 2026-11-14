import { Badge, DropdownListbox, type BadgeShape } from "@glimstone/react";

const round: BadgeShape = "circle";

export function Status({ ok, onPick }: { ok: boolean; onPick: () => void }) {
  return (
    <div>
      <Badge tone={ok ? "ok" : "fail"} shape="circle" tip="State">
        {ok ? "✓" : "!"}
      </Badge>
      <Badge
        tone="neutral"
        shape='pill'
        onClick={() => onPick()}
      >
        Pick
      </Badge>
      <Badge shape={round} form="square">Mixed</Badge>
      <Badge shape={"circle"} />
      <Badge form="rounded" shape="circle" />
      <DropdownListbox open={false} onClose={onPick} label="Pick">
        <span />
      </DropdownListbox>
    </div>
  );
}
