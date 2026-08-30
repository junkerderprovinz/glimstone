# The glyph assortment

One icon set across every app that speaks this language, so a folder is the same folder in all of them and nobody has to learn a second vocabulary to use the second app.

This file is the assortment itself: which glyph means what, where each one comes from, and the sizing rules that decide whether a set of icons *looks* like one set. It is a list of sources rather than a folder of SVGs, for the same reason the rest of GlimStone ships tokens instead of components — an app that generates its own file from these names gets a set it can regenerate, in its own framework, at its own indentation, with no vendored artwork to drift.

<br>

## 1. Where the artwork comes from

**[Streamline](https://streamlinehq.com) — free Core Solid, CC BY 4.0.** Specifically the 1000-icon free subset published at [`webalys-hq/streamline-vectors`](https://github.com/webalys-hq/streamline-vectors), folder `core/solid`. That subset is explicitly redistributable; the larger 5771-icon set sold on streamlinehq.com is a different product whose licence forbids redistribution, which is exactly what a public repository does. Getting this wrong is not a style question, so check which set a file came from before adding it.

Two other sources appear where the free set genuinely has no answer, both attributed alongside Streamline in the generated file's header:

- **[Font Awesome Free](https://fontawesome.com)**, icons only, CC BY 4.0. Its licence splits by asset type — fonts are SIL OFL, code is MIT, and only the icons are CC BY. A single path counts as an icon, so attribution is the whole obligation.
- **[Simple Icons](https://simpleicons.org)**, CC0, for brand marks. A brand mark is still a trademark: use it only to refer to the thing it names (a row that navigates to Docker containers), unmodified, and never in a way that implies endorsement.

**Attribution is required and lives in the generated file's header**, not in a licence file nobody reads next to the code that uses it.

<br>

## 2. The rules that make it one set

**Every glyph is a filled solid shape.** This is "Icon glyphs" in [`design-language.md`](../docs/design-language.md), and it is the rule that does the most work: a stroked icon among filled ones reads as a second icon library that happens to share a colour. Import turns the source's hard-coded `#000000` into `currentColor`, so a glyph inherits the ink of whatever carries it and stays correct in every theme, every accent and every rainbow position.

**One grid.** All glyphs render into a **14-unit viewBox** and a **20px box**. The grid is not the box, and mixing them is where sets fall apart — see the sizing rules below.

**The label is the accessible name.** A glyph is `aria-hidden`, and the source `<desc>` is dropped on import. A described glyph gets announced on top of the label beside it, which is worse than silence.

**Two different functions never wear the same glyph.** Discovered the hard way: a "Local" storage switch and a "Browse folders" button both wore a folder and meant different things, which is the kind of collision a generated set makes easy to introduce and easy to miss.

<br>

## 3. Sizing: the part that is not obvious

Three rounds of live review went into these, each one starting from a report that something "looked too big" or "too small" while every box on screen was already the same size. The box is almost never the answer.

**Rule 1 — what the eye compares is INK, not the box.** Two glyphs in identical 20px boxes are not the same size if one is drawn edge to edge and the other has air around it. A hand-drawn cloud covering 10.4 × 8.2 of the grid stood beside an imported drive covering 14 × 13.7: near enough double the ink, in the same box, and it read exactly that way.

**Rule 2 — measure the ink, never infer it from the viewBox.** A path's drawn extent and its viewBox have no necessary relationship. Font Awesome's cloud sits at `(0, 32, 640, 448)` inside a `640 × 512` box; Streamline's `hard-disk` at `(1, 0, 12, 14)` inside `0 0 14 14`. Measure with `getBBox()` on the real markup in a browser and write the number down next to the glyph, so a swapped source file is a visible edit rather than a silent resize.

**Rule 3 — normalise by cropping the viewBox, not by editing paths.** A glyph whose ink fills 69% of its grid renders 69% the size of one that fills 100%. Give it a viewBox cropped to its own measured ink, squared off (side = the larger of width and height) and centred, and the default `preserveAspectRatio="xMidYMid meet"` scales it up to fill its dominant dimension with the aspect ratio untouched. No coordinate moves, so shapes that survived earlier legibility rounds survive this too.

**Rule 4 — a matched pair matches on its shared dimension, and "shared" depends on the shapes.** Two wide glyphs with similar aspect ratios match on WIDTH; a near-square glyph beside a wide one matches on HEIGHT, because a row of icons is read off its height. Getting this backwards leaves one of the pair looking like the smaller symbol while both measurements say they agree.

**Rule 5 — matching a pair to each other is necessary and not sufficient.** A pair tuned only against itself can end up the smallest thing in a strip of other glyphs. The comparison that matters is with every glyph on screen. In practice: fill the box the way the rest of the set does, then match the pair inside that.

**Rule 6 — detail thinner than the raster disappears, and no amount of scaling fixes it.** At a 14-unit grid in a 20px box, one unit is 1.43px, so anything under roughly 1.5 units merges into its neighbour. A cloud whose humps rose 1.3 units read as a plain dome; a drive whose interior arm was under a unit read as a scribble in a box. **Build small glyphs from few, large shapes with deep valleys**, and check them at 20px magnified rather than at 88px where everything looks fine.

**Rule 7 — a plus or an X is shorter and thicker than the source's.** Line glyphs drawn to the full grid are long and thin, which looks oversized and weak at the same time. Around 10 units of arm and 2.8 units of bar reads as a deliberate mark. Draw the X as the plus rotated 45° about the grid centre rather than as a second drawing: two marks meant to read as a pair cannot drift apart if there is only one of them.

<br>

## 4. The assortment

`Icon<Name>` is the component name; the path is the file inside `core/solid`. Meanings are the contract — an app that needs "delete" uses `IconTrash`, it does not pick a different bin.

### Actions — the verbs a button wears

| Name | Source | Means |
| --- | --- | --- |
| `IconSave` | `computer-devices/floppy-disk.svg` | Save |
| `IconRefresh` | `interface-essential/arrow-reload-horizontal-1.svg` | Refresh or reload |
| `IconUpload` | `interface-essential/upload-box-1.svg` | Upload, send, import |
| `IconDownload` | `interface-essential/download-box-1.svg` | Download, export |
| `IconSearch` | `interface-essential/magnifying-glass.svg` | Search, scan, discover |
| `IconUnlock` | `interface-essential/keyhole-lock-circle.svg` | Unlock, clear a stale lock |
| `IconPrune` | `interface-essential/recycle-bin-2.svg` | Prune, reclaim space |
| `IconTrash` | `interface-essential/recycle-bin-2.svg` | Delete |
| `IconPlay` | `entertainment/button-play.svg` | Start, run now |
| `IconStop` | `entertainment/button-stop.svg` | Stop, abort |
| `IconPower` | `entertainment/button-power-1.svg` | Power, start or stop |
| `IconBack` | `interface-essential/move-left.svg` | Back, previous |
| `IconForward` | `interface-essential/move-right.svg` | Next, continue, forward |
| `IconSelectAll` | `interface-essential/check-square.svg` | Select all |
| `IconClearSelection` | `interface-essential/subtract-square.svg` | Clear the selection |
| `IconKey` | `interface-essential/key.svg` | Credentials |
| `IconLink` | `interface-essential/link-chain.svg` | Connect, link |
| `IconEye` | `interface-essential/glasses.svg` | Show, reveal, preview |
| `IconInfo` | `interface-essential/information-circle.svg` | Information, details |
| `IconPencil` | `interface-essential/pencil.svg` | Edit |
| `IconCopy` | `interface-essential/copy-paste.svg` | Copy |
| `IconGear` | `interface-essential/cog.svg` | Settings |
| `IconCheckCircle` | `interface-essential/shield-check.svg` | Verified, test connection |
| `IconSync` | `interface-essential/arrow-reload-vertical-2.svg` | Replicate, synchronise |
| `IconRestore` | `interface-essential/arrow-reload-vertical-1.svg` | Restore |
| `IconRecovery` | `interface-essential/arrow-reload-horizontal-2.svg` | Recovery, rebuild |
| `IconLive` | `interface-essential/live-video.svg` | Live, happening now |

**`IconUpload` and `IconDownload` are one drawing with the arrow reversed.** Wherever an app shows an export and an import together, use this pair — same box, opposite arrow, and no mirroring transform to maintain.

**`IconRefresh`, `IconSync`, `IconRestore` and `IconRecovery` are four different loops and are easy to confuse.** Horizontal reload for "refresh", vertical two-arrow for "replicate", vertical one-arrow for "restore", horizontal two-arrow ring for "recovery". If an app only needs two of them, pick the two that look least alike.

### Navigation and domain

| Name | Source | Means |
| --- | --- | --- |
| `IconDashboard` | `interface-essential/dashboard-3.svg` | Dashboard, overview |
| `IconFolder` | `interface-essential/new-folder.svg` | A folder |
| `IconFiles` | `interface-essential/new-folder.svg` | Files and folder sets |
| `IconVM` | `computer-devices/screen-1.svg` | Virtual machines |
| `IconFlash` | `computer-devices/usb-drive.svg` | A USB / boot flash drive |
| `IconConfig` | `computer-devices/database-setting.svg` | Configuration, self-backup |
| `IconBackupNow` | `computer-devices/database-check.svg` | Back up now |
| `IconReceiver` | `interface-essential/login-1.svg` | Receiver, an incoming transfer |
| `IconFleet` | `interface-essential/hierarchy-2.svg` | Fleet, other instances |
| `IconTabSystem` | `computer-devices/computer-chip-1.svg` | System |
| `IconViewSimple` | `interface-essential/layout-window-11.svg` | Simple view |
| `IconViewAdvanced` | `interface-essential/layout-window-8.svg` | Advanced view |

### Hand-drawn — where no free set had an answer

| Name | Means | Why drawn |
| --- | --- | --- |
| `IconCloud` | Off-site, remote | Font Awesome's `cloud`. Fitted to the pair's width and centre, so it stands beside `IconLocal` as a matched pair. |
| `IconLocal` | Local storage | Two rounded bars, nothing else. Every imported drive glyph carried interior detail finer than 20px can hold (rule 6). |
| `IconAdd` | Add | A plus with 10 units of arm and 2.8 of bar — shorter and thicker than the imported one (rule 7). |
| `IconClose` | Close, dismiss, cancel | The same plus, rotated 45°. |
| `IconContainers` | Docker containers | Simple Icons' whale. A trademark used descriptively, unmodified. |

**`IconLocal` and `IconCloud` are a pair.** Local storage against off-site storage is the one place in these apps where two glyphs must read as two halves of one choice: same width, same centre, and neither of them a folder.

<br>

## 5. Generating the file

Adoption is a script, not a package. The shape that works:

1. Read each source SVG, strip `<desc>`, drop `id` attributes, replace `fill="#000000"` with `fill="currentColor"`, add `aria-hidden`.
2. Emit each as a component with a shared wrapper pinning the 14-unit viewBox and the 16px intrinsic size — the rendered size comes from CSS, so a control can size its own glyph without every glyph knowing about every control.
3. Keep hand-drawn glyphs **in the generator**, not in the generated file. A hand edit to generated output survives exactly until the next run, and that file's own header tells everyone not to touch it.
4. Record each fitted glyph's measured ink box next to its entry, and let one constant drive the fit — a redrawn coordinate is a second place to forget.
5. Pin the arithmetic with a test that RECOMPUTES the transform from the measured boxes rather than snapshotting what the generator emitted. A transform that merely exists proves nothing; a wrong scale renders perfectly well.

BombVault's `scripts/gen_glyphs.py` is the working reference implementation of all five.

<br>

## 6. Adding a glyph

- **Check the assortment first.** A new name for an existing meaning is how two apps end up with two bins.
- **Prefer the free Streamline set**, and check which set the file came from.
- **Measure the ink** and compare it against the glyphs it will stand next to, not against the box.
- **Look at it at 20px, magnified** — not at 88px, where every glyph looks fine.
- **Add it here in the same commit.** An assortment that documents four apps out of five is a list of what somebody remembered.
