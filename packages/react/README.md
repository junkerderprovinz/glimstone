# @glimstone/react

The components of [GlimStone](https://junkerderprovinz.github.io/glimstone/) for
React 19. `@glimstone/core` says what a control must look like and decides what
it shows; these say what a control **is**, so an app uses them rather than
rebuilding them.

That distinction is the reason this package exists. Two apps built from the
prose alone arrived at the same design language in two different dialects: one
calls the switch `Toggle` and keeps it in `components/Toggle.tsx`, the other
calls it `Switch` and keeps it inside a `Field.tsx` next to six other controls;
one has `ConfirmDialog`, the other has `Confirm`. Every one of those is a correct
reading of the same document, and every rule would then have to be re-applied
by hand in each dialect.

## Using it

```sh
npm install @glimstone/core @glimstone/react
```

```tsx
import "@glimstone/core/tokens.css";
import { applyCachedAppearance, applyStoredLabelModes } from "@glimstone/core";
import { Button, setGlyphResolver } from "@glimstone/react";
import { Select } from "@glimstone/react/Select";

applyCachedAppearance();
applyStoredLabelModes();
setGlyphResolver((key) => appGlyphs[key]);
```

Call the two `apply` functions at the app root before the first render, not
from the settings page that edits them, or the app opens in the default look
and snaps over. `setStoragePrefix()` before them keeps choices an app already
stored under its own name. Under Tailwind v4 load
`@glimstone/core/tailwind-theme.css` after the tokens; the components themselves
use no Tailwind class.

`Select`, `Combobox` and `Slider` come from their own entries and need
`@zag-js/react` with their machine packages (`@zag-js/select` and
`@zag-js/menu`, `@zag-js/combobox`, `@zag-js/slider`). The rest of the package
needs none of them.

## What's here

| Component | What it is |
|---|---|
| `Button` | Every button, including the label engine's text/glyph/both modes and the chip form |
| `Toggle` | The switch. Never a checkbox |
| `Card` | The surface, and the one place a section heading is drawn |
| `Badge` | Status pills and the filled section heading the card draws |
| `Select` | The one dropdown, on Zag's select machine and on its menu machine for a list with submenus |
| `Combobox` | A field that filters a long list as somebody types |
| `Slider` | A value on a range, with the value in words beside the label |
| `DropdownListbox` | Deprecated, use `Select` |
| `ConfirmDialog` + `useConfirm` | The confirm surface for a destructive action, and the hook that gives it a portal, Escape, the Tab trap and focus back to the control that asked |
| `ToastViewport` | Transient feedback; the queue is the core's `toastEngine` |
| `InfoBubble`, `IconTipButton` | The "(i)" explanation and the hover name on an icon-only control |
| `InfoTile` | The Info tile with its Version, Help and About cards, each also on its own |
| `ReadmeButton` | The button in the shape of the README's, with its segments |
| `CryptoDonateDialog`, `CoffeeDialog`, `PaypalDialog` | The three windows to give |
| `Selector` | The one horizontal selector: tabs, filter bars, segmented pickers, one value or many, and with `orientation="vertical"` the column of tiles beside a settings area's pages |
| `NumberField` | A number with its two steppers inside the field and the wheel while it has focus |
| `SidebarRow` | One row of the rail: glyph, words by the label mode, the current page and a count |
| `EmptyState` | What a list, table or panel shows when it holds nothing |
| `SubCard` | A filled inset group inside a card, which replaces a fold-out |
| `UnavailableNotice` | What stands where a control would be, when the environment forbids the thing entirely |
| `WindowBar` | A desktop app's own title bar on Windows and Linux |
| `Window` | The general window: the title notch, a body for anything and a foot that adds Cancel or Close by itself; windows stack |
| `ContextMenu`, `MenuBar` | A menu at a point and the row of menus in a head bar, with submenus, rows that tick a box, choices, key caps and counts. Opened with the pointer, the first row shows its ring only once a key is pressed |
| `Checkbox` | The drawn box for "Don't show again" and for choices applied together, `slim` for the box alone in a dense row. Every setting is a `Toggle` |
| `Kbd`, `Pill` | A key cap, and the quiet data pill of a list row |
| `TextField`, `TextArea` | A line of text and a few lines of text, borderless and filled, in the widths a row needs |
| `FieldRow`, `FieldRowGroup` | One labelled row: the name at its start with an "(i)", the control at its end, named by the row, or a lone value as a pill, and rows that share one column for their names. `useFieldName` gives an app's own control the same name |
| `GlyphField` | A field with a glyph inside it, such as a filter, and controls after it in the box |
| `Table` | A short list of facts in columns |
| `PasswordField`, `CopyField` | A secret with the reveal eye inside the field, and a value in monospace with a button that copies it |
| `SignInCard`, `SignInField` | The sign-in page: the app's logo and name, the password, a code when the app asks for one, a passkey and the reset form in the same card. The app's own fields, buttons and steps go into `fields`, `actions` and `step`, and `SignInField` gives a field of the app's own the label above it |
| `PathField`, `Tree` | A path with a button that asks the app for one, and a hierarchy loaded as it opens, for the picker behind that button |
| `ListRow`, `RowMark`, `GlyphTile` | One row of a list with a tile, badges and buttons that come in on hover, the round mark on a row picked for an action on many, and a small holder for a glyph |
| `IconButton` | A glyph in a square in every label mode, for a row that keeps its text, as a link with `href`, on or off with `pressed`, and `absent` to hold a missing button's place |
| `Meter`, `ProgressBar` | A level such as a disk's, red from a threshold and `quiet` for a footer line, and work toward its end with a sheen while it runs. Only the bar moves |
| `BusyRing`, `SkeletonRow` | The ring that turns while the app works on something, and a row that holds a list row's place while the list loads. Both show only after 400 ms |
| `Popover`, `Sheet` | A small panel beside its trigger in the top layer, and a panel at the end edge for a row's details, a `<dialog>` shown modal with a window's foot |
| `ColorPicker` | The square, the hue bar, a preview with the name the colour proposes, the hex field and Apply, in the page or floating beside its swatch |
| `useLabelMode`, `useTipBubble`, `usePortalHue` | The small hooks the components need |
| `glyphs` | The marks the components draw themselves, and `setGlyphResolver`, the seam an app registers its own icon set through |

## What is not here

**The icon set.** An icon's meaning belongs to the app: only it knows that its
own action is called "backup now". GlimStone ships the assortment as a
specification (`glyphs.md` in the core) and one function, `setGlyphResolver`,
that a button asks by meaning. Register it once at boot and every button can be
shown in glyph mode; skip it and buttons fall back to the glyph they are handed,
then to text alone.

**Translation.** Every string is a prop. The components carry the order and the
behaviour, the app carries its own language.

**Data.** No component fetches anything. The Version card takes its versions
as props and its update check as a function rather than reading a health
endpoint, so the same component serves an app with a different one.

## The Info tile

`InfoTile` takes one prop object per card and a `hueIndex` for the first of
them; the others take the next positions. It returns the cards without a
wrapper, so they stack in the page's own rhythm.

- **Version:** `rows` lists the app first, then GlimStone and every component
  the app ships, each with a `name`, an optional `sub` line, the `version` read
  from the build and the `repoUrl` whose release page the number opens. A row
  without `repoUrl`, or a build that is not a published release, shows the
  number as plain text. `updateCheck.run` checks them all and resolves to how
  many have a newer release; the button turns `ok` with `upToDate`, `warn` with
  `updatesFound(n)`, or `danger` with `checkFailed` and a shake when it rejects.
  The app puts the reason for a failure in its toast. One button stands
  before the check: `whatsNew`, the app's own "New · n" button, which opens its
  window with the release notes and the changes as tabs, or, in an app that
  marks no changes, "Release notes" from `onReleaseNotes` with
  `text.releaseNotes`, which opens the notes alone. The card never draws both.
- **Help:** the report sentence, GitHub, Email with `MAIL_SVG` when the
  sentence names a mail route and `mailAddress` is set, the manual when
  `manualUrl` and `text.manual` are set, with `MANUAL_SVG` as `manualGlyph` and
  "Open" as `text.manualSub`, and the bug report when `onBugReport` and
  `text.bugReport` are set, with `IconDiagnostics` as `bugGlyph` and "Download"
  as `text.bugReportSub`.
- **About:** the maker's sentence, then the sentence about the money with the
  give row under it.

The glyphs on the update check come from the app's resolver under the keys
`about.checkUpdates`, `about.upToDate`, `about.updatesFound` and
`about.checkFailed`, and the one on "Release notes" under `about.releaseNotes`.

