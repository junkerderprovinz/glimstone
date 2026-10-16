import { Badge } from "@gs/react/Badge";

export default function BadgeTones() {
  return (
    <>
      <Badge tone="ok">Settled</Badge>
      <Badge tone="warn">Warning</Badge>
      <Badge tone="fail">Fault</Badge>
      <Badge tone="active">Running</Badge>
      <Badge tone="neutral">Paused</Badge>
      <Badge tone="muted">Draft</Badge>
    </>
  );
}
