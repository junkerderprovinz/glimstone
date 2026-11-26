export function Panel({ busy }: { busy: boolean }) {
  return (
    <div className="bg-carbon-background text-carbon-text">
      <p className={busy ? "text-carbon-textMuted" : "dark:text-carbon-textSub"}>Sync</p>
      <button className="bg-carbon-surface2 hover:bg-carbon-surface3 border-carbon-border/50">Retry</button>
      <span className="[--ring:var(--carbon-text)] md:hover:!bg-carbon-hoverRaised">Ring</span>
      <i style={{ color: "var(--carbon-text-muted)" }} />
      <button className="bg-statusFailSolid hover:bg-statusFailHover">Delete</button>
      <div className="hover:bg-carbon-hover">Row</div>
    </div>
  );
}
