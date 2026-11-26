import raw from "../../../.github/assets/logo.svg?raw";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from "react";

// The mark's own art with each fill handed to a class, so the stylesheet can
// keep the silver setting and colour the star from the accent.
const ART = raw
  .replace(/<\?xml[^>]*>/, "")
  .replace(/<defs>[\s\S]*?<\/defs>/, "")
  .replace(/ (id|data-name)="[^"]*"/g, "")
  .replace(/class="cls-(\d)"/g, 'class="la-f$1"')
  .replace("<svg ", '<svg class="la-gem-art" aria-hidden="true" focusable="false" ');

// The glint and the flash stay on the metal and the star, never on the air
// around them, so they are masked by the mark itself.
const MASK = { "--la-mark": `url("data:image/svg+xml,${encodeURIComponent(raw)}")` } as CSSProperties;

const SPARKS = [
  { x: "50%", y: "7%", d: "0s" },
  { x: "89%", y: "50%", d: "2.6s" },
  { x: "25%", y: "75%", d: "5.1s" },
];

/** The set stone. `flash` counts the changes that have reached it; each new one runs a light through it. */
export const Gem = forwardRef<HTMLDivElement, { flash: number; style?: CSSProperties }>(function Gem({ flash, style }, outer) {
  const ref = useRef<HTMLDivElement>(null);
  useImperativeHandle(outer, () => ref.current as HTMLDivElement);
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAwake(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`la-gem accent-scope${awake ? " is-awake" : ""}`} style={style} aria-hidden="true">
      <div className="la-gem-halo" key={`h${flash}`} data-flash={flash > 0 || undefined} />
      <div className="la-gem-body" dangerouslySetInnerHTML={{ __html: ART }} />
      <div className="la-gem-glint" style={MASK}>
        <span className="la-gem-sweep" />
        {flash > 0 && <span className="la-gem-flash" key={flash} />}
      </div>
      {SPARKS.map((s) => (
        <svg key={s.d} className="la-spark" viewBox="0 0 24 24" style={{ left: s.x, top: s.y, animationDelay: s.d }}>
          <path d="M12 0 C12.6 8 16 11.4 24 12 C16 12.6 12.6 16 12 24 C11.4 16 8 12.6 0 12 C8 11.4 11.4 8 12 0 Z" />
        </svg>
      ))}
    </div>
  );
});
