// Copying a value for a CopyField, or for any button that copies. The
// Clipboard API exists only in a secure context, and a self-hosted app is
// often opened over plain http on the local network, so a hidden text area
// and execCommand stand in there.

/** How long a copy button says it copied before it reads Copy again, in ms. */
export const COPIED_MS = 1600;

/** Puts `text` on the clipboard. Resolves false when the browser refused both ways. */
export async function copyText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // A denied permission falls through to the old way, which needs none.
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  const back = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  document.body.appendChild(area);
  area.select();
  const done = document.execCommand("copy");
  area.remove();
  back?.focus();
  return done;
}
