export function Panel({ busy }: { busy: boolean }) {
  return (
    <div className="bg-stone-ground text-stone-text">
      <p className={busy ? "text-stone-textMuted" : "dark:text-stone-textSub"}>Sync</p>
      <button className="bg-stone-surface2 hover:bg-stone-surface3 border-stone-border/50">Retry</button>
      <span className="[--ring:var(--stone-text)] md:hover:!bg-stone-hoverRaised">Ring</span>
      <i style={{ color: "var(--stone-text-muted)" }} />
      <button className="bg-statusFailSolid hover:bg-statusFailHover">Delete</button>
      <div className="hover:bg-carbon-hover">Row</div>
    </div>
  );
}
