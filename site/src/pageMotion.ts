// A page change cross-fades the page while the header and the nav stay put, and
// the highlight of a list's current entry glides to the new one.

const moving = () =>
  document.documentElement.dataset.motion !== "off" && !matchMedia("(prefers-reduced-motion: reduce)").matches;

const pathOf = (hash: string) => hash.replace(/^#/, "").split("?")[0] || "/";

// The longest a page change waits for the new page before the browser takes
// its picture of the new state anyway.
const CAP = 300;

/** Runs every in-site link to another page through a view transition. Returns the cleanup. */
export function crossFadePages() {
  const click = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!document.startViewTransition || !moving()) return;
    const href = a.getAttribute("href")!;
    // A link to a section of the page in view only scrolls.
    if (pathOf(href) === pathOf(location.hash)) return;
    e.preventDefault();
    // Firefox holds animation frames back while the update runs, so an update
    // that waited for a frame would stall the transition for seconds. It ends
    // once the router has put the new page in place of the old one.
    document.startViewTransition(
      () =>
        new Promise<void>((done) => {
          const before = document.querySelector("main");
          const finish = () => {
            watch.disconnect();
            clearTimeout(cap);
            done();
          };
          const watch = new MutationObserver(() => {
            if (document.querySelector("main") !== before) finish();
          });
          const cap = setTimeout(finish, CAP);
          watch.observe(document.body, { childList: true, subtree: true });
          location.hash = href;
        }),
    );
  };
  document.addEventListener("click", click);
  return () => document.removeEventListener("click", click);
}

/** Moves the list's `.nav-mark` under the entry `current` finds, or fades it out when there is none. */
export function glide(list: HTMLElement | null, current: string) {
  const mark = list?.querySelector<HTMLElement>(":scope > .nav-mark");
  if (!list || !mark) return;
  const at = list.querySelector<HTMLElement>(current);
  if (!at || !at.offsetWidth) {
    mark.style.opacity = "0";
    return;
  }
  const lr = list.getBoundingClientRect();
  const cr = at.getBoundingClientRect();
  // The first placement jumps, or the mark would fly in from the list's corner.
  const first = !("placed" in mark.dataset);
  if (first) mark.style.transition = "none";
  mark.style.opacity = "1";
  mark.style.width = `${cr.width}px`;
  mark.style.height = `${cr.height}px`;
  mark.style.transform = `translate(${cr.left - lr.left + list.scrollLeft}px, ${cr.top - lr.top + list.scrollTop}px)`;
  if (first) {
    void mark.offsetWidth;
    mark.style.transition = "";
    mark.dataset.placed = "";
  }
}
