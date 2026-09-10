# The components

The framework-free files one level up say what a control must look like and how
the engines resolve. These say what a control **is**, as React source an app
copies rather than rebuilds.

That distinction is the reason this folder exists. Two apps built from the prose
alone arrived at the same design language in two different dialects: one calls
the switch `Toggle` and keeps it in `components/Toggle.tsx`, the other calls it
`Switch` and keeps it inside a `Field.tsx` next to six other controls; one has
`ConfirmDialog`, the other has `Confirm`; one has `DropdownListbox`, the other
has `Choice`. Every one of those is a correct reading of the same document. A
third app would have invented a third set of names, and every rule written here
would then have to be re-applied by hand in three places.

## What's here

| File | What it is |
|---|---|
| `Button.tsx` | Every button, including the label engine's text/glyph/both modes and the chip form |
| `Toggle.tsx` | The switch. Never a checkbox |
| `Card.tsx` | The surface, and the one place a section heading is drawn |
| `Badge.tsx` | Status pills and the filled section heading the card draws |
| `DropdownListbox.tsx` | The select replacement, portal-rendered so it can never be clipped |
| `ConfirmDialog.tsx` | The confirm surface for a destructive action |
| `Toast.tsx` + `toastEngine.ts` | Transient feedback, including the shake a failing control does |
| `InfoBubble.tsx`, `IconTipButton.tsx` | The "(i)" explanation and the hover name on an icon-only control |
| `AboutCard.tsx` | The About card, in its fixed order |
| `CryptoDonateDialog.tsx` | The second way to give: one address per chain, as text and as a code |
| `useLabelMode.ts`, `useTipBubble.tsx`, `bubblePosition.ts`, `portalHue.ts` | The small hooks the components above need |
| `glyphs.tsx` | The two marks the components draw themselves, plus the seam an app registers its own icon set through |

## What is deliberately NOT here

**The icon set.** An icon's meaning belongs to the app: only it knows that its own
action is called "backup now". GlimStone ships the assortment as a specification
(`../glyphs.md`) and one function, `setGlyphResolver`, that a button asks by
meaning. Register it once at boot and every button can be shown in glyph mode;
skip it and buttons fall back to the glyph they are handed, then to text alone.

**Translation.** Every string is a prop. The components carry the order and the
behaviour, the app carries its own language.

**Data.** No component here fetches anything. The About card takes its version as
a prop rather than reading a health endpoint, so the same file serves an app with
a different one.

## Copying them in

1. Put this folder's files next to each other in the app, and keep
   `../appearance.ts` and `../controls.ts` one level up — those two imports are
   the only paths that leave the folder.
2. Call `applyStoredLabelModes()` (from `controls.ts`) at the app root before
   first render, not from the settings page that edits it, or the app opens in
   the default mode and snaps over on load.
3. Register the app's own icons with `setGlyphResolver` at the same place.
4. Tailwind v4 apps take `../tailwind-theme.css` for the utility names these
   files use (`bg-carbon-surface`, `text-carbon-textSub`, `rounded-card`). An app
   without Tailwind maps those few names itself; the tokens underneath are the
   same either way.

## Checking that the folder is complete

`bash reference/react/check.sh` from the repository root asks the one question
TypeScript cannot: does every class, themed utility and custom property these
components touch actually exist in `../tokens.css` and `../tailwind-theme.css`?

It exists because the first cut of this folder shipped components reading
thirteen classes and seven tokens that were defined nowhere here - they had been
living in one app's own stylesheet the whole time, so a button copied out of
here arrived with no height, no padding and no radius. Every file typechecked
perfectly. The defect was only visible on screen, in the app that adopted it.

One name is skipped deliberately: `glim-convention-exception` is not a class but
a marker written inside a comment, tagging a departure from a rule that was
reviewed and kept on purpose, so a later reader knows it is a decision rather
than an oversight.

A component copied from here and then edited in the app is a fork, and the next
release of this folder will not reach it. Where an app genuinely needs different
behaviour, add a prop here and copy the file again, so every sibling gets the
same choice.
