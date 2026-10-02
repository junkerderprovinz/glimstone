# The glyph assortment

One icon set across every app that speaks this language, so a folder is the same folder in all of them and nobody has to learn a second vocabulary to use the second app.

This file is the assortment itself: which glyph means what, where each one comes from, and the sizing rules that decide whether a set of icons *looks* like one set. It is a list of sources rather than a folder of SVGs, for the same reason the rest of GlimStone ships tokens instead of components: an app that generates its own file from these names gets a set it can regenerate, in its own framework, at its own indentation, with no vendored artwork to drift.

<br>

## 1. Where the artwork comes from

**[Streamline](https://streamlinehq.com), free Core Solid, CC BY 4.0.** Specifically the 1000-icon free subset published at [`webalys-hq/streamline-vectors`](https://github.com/webalys-hq/streamline-vectors), folder `core/solid`. That subset is explicitly redistributable; the larger 5771-icon set sold on streamlinehq.com is a different product whose licence forbids redistribution, which is exactly what a public repository does. Getting this wrong is not a style question, so check which set a file came from before adding it.

Other sources appear where the free set has no answer, or where a better drawing existed. All of them are attributed alongside Streamline in the generated file's header:

- **[Font Awesome Free](https://fontawesome.com)**, icons only, CC BY 4.0. Its licence splits by asset type: fonts are SIL OFL, code is MIT, and only the icons are CC BY. A single path counts as an icon, so attribution is the whole obligation.
- **[Tabler Icons](https://tabler.io/icons)**, MIT. Use the **filled** variants: the outline set is the default on their site and would break the fill rule below.
- **[Material Design Icons](https://pictogrammers.com/library/mdi/)**, Apache 2.0.
- **[Simple Icons](https://simpleicons.org)**, CC0, for brand marks. A brand mark is still a trademark: use it only to refer to the thing it names (a row that navigates to Docker containers), unmodified, and never in a way that implies endorsement.
- **[Vecteezy](https://www.vecteezy.com)**, Free License, for `IconSave` and nothing else so far. Its terms are not a public-licence family and the obligation is specific: *"remember to always attribute the author which can be done by adding Vecteezy.com to your design and linking to vecteezy.com where possible."* So the generated file's header carries **`IconSave from Vecteezy - https://www.vecteezy.com`**, a real link rather than a bare word, and it is not optional. Assume the Free License unless a Pro receipt says otherwise: attributing under Pro costs nothing, and not attributing under Free is a breach. Reach for this source only where a licence like this one is worth the paperwork, which for a single glyph adopted everywhere it was.

**Mixing sets is fine and normalising them is not optional.** Four sets means four ideas about how much of a viewBox a drawing should occupy; the sizing rules below are what make them read as one family rather than four.

**Watch for transparent padding paths.** Tabler and several Illustrator exports ship a `fill="none"` rectangle covering the whole viewBox. It paints nothing, so it is easy to keep, and it makes every ink measurement report 100%, which silently defeats the sizing rules. Drop it on import.

**Attribution is required and lives in the generated file's header**, not in a licence file nobody reads next to the code that uses it.

<br>

## 2. The rules that make it one set

**Every glyph is a filled solid shape.** This is "Icon glyphs" in [`design-language.md`](../docs/design-language.md), and it is the rule that does the most work: a stroked icon among filled ones reads as a second icon library that happens to share a colour. Import turns the source's hard-coded `#000000` into `currentColor`, so a glyph inherits the ink of whatever carries it and stays correct in every theme, every accent and every rainbow position.

**One grid.** All glyphs render into a **14-unit viewBox** and a **20px box**. The grid is not the box, and mixing them is where sets fall apart; see the sizing rules below.

**The label is the accessible name.** A glyph is `aria-hidden`, and the source `<desc>` is dropped on import. A described glyph gets announced on top of the label beside it, which is worse than silence.

**Two different functions never wear the same glyph.** Discovered the hard way: a "Local" storage switch and a "Browse folders" button both wore a folder and meant different things, which is the kind of collision a generated set makes easy to introduce and easy to miss.

<br>

## 3. Sizing: the part that is not obvious

Five rounds of live review went into these, each one starting from a report that something "looked too big" or "too small" while every box on screen was already the same size. The box is almost never the answer.

**Rule 1: what the eye compares is INK, not the box.** Two glyphs in identical 20px boxes are not the same size if one is drawn edge to edge and the other has air around it. A hand-drawn cloud covering 10.4 × 8.2 of the grid stood beside an imported drive covering 14 × 13.7: near enough double the ink, in the same box, and it read exactly that way.

**Rule 2: measure the ink, never infer it from the viewBox.** A path's drawn extent and its viewBox have no necessary relationship. Font Awesome's cloud sits at `(0, 32, 640, 448)` inside a `640 × 512` box; Streamline's `hard-disk` at `(1, 0, 12, 14)` inside `0 0 14 14`. Measure with `getBBox()` on the real markup in a browser and write the number down next to the glyph, so a swapped source file is a visible edit rather than a silent resize.

**Rule 3: normalise by cropping the viewBox, not by editing paths.** A glyph whose ink fills 69% of its grid renders 69% the size of one that fills 100%. Give it a viewBox cropped to its own measured ink, squared off (side = the larger of width and height) and centred, and the default `preserveAspectRatio="xMidYMid meet"` scales it up to fill its dominant dimension with the aspect ratio untouched. No coordinate moves, so shapes that survived earlier legibility rounds survive this too.

**Rule 4: one mechanism, not one per pair.** An earlier version of this file matched individual pairs to each other with a `translate`/`scale` transform and a shared width constant. That works and does not scale: a transform has to know the target grid, so it only ever applies to glyphs already living on it, and every pair needs its own constant that two call sites must keep agreeing on. The cropped viewBox above replaces all of it. It works on a 24-unit Tabler icon and a 512-unit Font Awesome one without converting either first, and two glyphs end up the same size because they follow the same rule, not because somebody kept two numbers in step.

**Rule 5: matching a pair to each other is necessary and not sufficient.** A pair tuned only against itself can end up the smallest thing in a strip of other glyphs, measured once at 68% while the rail beside it sat at 98-100%. The comparison that matters is with every glyph on screen, which is exactly what a single global rule gives you and a per-pair constant does not.

**Rule 6: detail thinner than the raster disappears, and no amount of scaling fixes it.** At a 14-unit grid in a 20px box, one unit is 1.43px, so anything under roughly 1.5 units merges into its neighbour. A cloud whose humps rose 1.3 units read as a plain dome; a drive whose interior arm was under a unit read as a scribble in a box. **Build small glyphs from few, large shapes with deep valleys**, and check them at 20px magnified rather than at 88px where everything looks fine.

**Rule 7: a plus or an X is shorter and thicker than the source's.** Line glyphs drawn to the full grid are long and thin, which looks oversized and weak at the same time. Around 10 units of arm and 2.8 units of bar reads as a deliberate mark. Draw the X as the plus rotated 45° about the grid centre rather than as a second drawing: two marks meant to read as a pair cannot drift apart if there is only one of them.

<br>

## 4. The assortment

Every glyph below is in [`glyphs.json`](glyphs.json) with its drawing, its measured ink box and the square viewBox cropped to it (rule 3), so an app generates its file from that list instead of hunting the sources down again. The drawings were picked one meaning at a time. Meanings are the contract: an app that needs "delete" uses `IconTrash`, it does not pick a different bin.

Two meanings never share a drawing. `IconCloud` and `IconTabOffsite` are the one exception, because the Off-site tab is the off-site meaning itself.

### Actions, the verbs a button wears

| Name | Means | Source |
| --- | --- | --- |
| `IconEye` | Show, reveal | Streamline `interface-essential/visible.svg` |
| `IconEyeOff` | Hide again | Streamline `interface-essential/invisible-1.svg` |
| `IconRefresh` | Refresh, retry | Streamline `interface-essential/arrow-round-left.svg` |
| `IconUpload` | Upload, import | Streamline `interface-essential/upload-circle.svg` |
| `IconDownload` | Download, export | Streamline `interface-essential/download-circle.svg` |
| `IconSearch` | Search | Streamline `interface-essential/magnifying-glass.svg` |
| `IconPlay` | Start, run now | Streamline `entertainment/button-play.svg` |
| `IconPause` | Pause | Streamline `entertainment/button-pause-2.svg` |
| `IconStop` | Stop, abort | Streamline `entertainment/button-stop.svg` |
| `IconPower` | Power on and off | Streamline `entertainment/button-power-1.svg` |
| `IconTrash` | Delete | Streamline `interface-essential/recycle-bin-2.svg` |
| `IconTrashFiles` | Delete with its files | Streamline `interface-essential/file-delete-alternate.svg` |
| `IconAdd` | Add | Drawn for GlimStone |
| `IconClose` | Close, cancel | Drawn for GlimStone |
| `IconPencil` | Edit | Streamline `interface-essential/pencil.svg` |
| `IconCopy` | Copy | Tabler Icons, filled `copy` (MIT) |
| `IconCheck` | Verify, confirmed | Drawn for GlimStone |
| `IconLink` | Connect, pair | Streamline `interface-essential/link-chain.svg` |
| `IconKey` | Credentials, key | BombVault's drawing |
| `IconKeyRevoke` | Revoke a key | Streamline `key` with a bar cut through it |
| `IconSignIn` | Sign in | BombVault's drawing |
| `IconSignOut` | Sign out | BombVault's drawing |
| `IconInfo` | Information | BombVault's drawing |
| `IconHelp` | Help | Streamline `interface-essential/help-question-1.svg` |
| `IconMore` | More | Streamline `interface-essential/horizontal-menu-circle.svg` |
| `IconMenu` | Menu | KnightLoader's drawing on a 20-unit grid |
| `IconSave` | Save | Drawn for GlimStone |
| `IconUnlock` | Unlock, clear a lock | Drawn for GlimStone |
| `IconPrune` | Prune, reclaim space | Streamline `computer-devices/shredder.svg` |
| `IconBack` | Back | KnightLoader's drawing on a 20-unit grid |
| `IconForward` | Next, forward | KnightLoader's drawing on a 20-unit grid |
| `IconLatest` | Jump to the newest entry, the end | BombVault's drawing |
| `IconFirst` | Jump to the start | `IconLatest` mirrored |
| `IconMoveUp` | Move up one | Streamline `interface-essential/arrow-up-1.svg` |
| `IconMoveDown` | Move down one | Streamline `arrow-up-1` mirrored |
| `IconExpand` | Expand | KnightLoader's drawing on a 20-unit grid |
| `IconCollapse` | Collapse | KnightLoader's drawing on a 20-unit grid |
| `IconSelectAll` | Select all | Streamline `interface-essential/check-square.svg` |
| `IconClearSelection` | Clear the selection | Streamline `interface-essential/subtract-square.svg` |
| `IconCompare` | Compare | Streamline `interface-essential/layers-2.svg` |
| `IconFilter` | Filter | Streamline `interface-essential/filter-2.svg` |
| `IconPin` | Pin | KnightLoader's drawing on a 20-unit grid |
| `IconPriority` | Priority | KnightLoader's drawing on a 20-unit grid |
| `IconGrip` | Drag to reorder | Streamline `interface-essential/hand-grab.svg` |
| `IconExternalLink` | Open a service's own site | Streamline `interface-essential/expand-window-2.svg` |
| `IconWarning` | Warning | Streamline `interface-essential/warning-triangle.svg` |
| `IconBolt` | Right away | KnightLoader's drawing on a 20-unit grid |
| `IconMail` | Write to us | Streamline `mail/mail-send-envelope.svg` |
| `IconCoffee` | Buy the author a coffee | Simple Icons `buymeacoffee` (CC0, a trademark used descriptively) |
| `IconShieldOn` | A protection is on | Drawn for GlimStone |
| `IconShieldOff` | A protection is off | Drawn for GlimStone |
| `IconCompressOff` | Store uncompressed | Streamline `shipping/shipping-box-1.svg` |
| `IconCompressAuto` | Let the tool choose the compression | Streamline `interface-essential/magic-wand-2.svg` |
| `IconCompressMax` | Compress as far as possible | Streamline `interface-essential/arrow-shrink.svg` |
| `IconCode` | Script, code | Drawn for GlimStone |
| `IconMoon` | Dark look | Streamline `interface-essential/waning-cresent-moon.svg` |
| `IconSun` | Light look | Streamline `interface-essential/brightness-1.svg` |
| `IconPaste` | Paste | Streamline `interface-essential/empty-clipboard.svg` |
| `IconSort` | Sort direction | Streamline `interface-essential/ascending-number-order.svg` |
| `IconFolderUp` | Up one folder | Material Design Icons `folder-arrow-up` (Apache 2.0) |
| `IconMailOpen` | Write to us, under the pointer or a finger | Material Design Icons `email-open` (Apache 2.0) |

### Navigation and domain

| Name | Means | Source |
| --- | --- | --- |
| `IconGear` | Settings | Streamline `interface-essential/cog.svg` |
| `IconDashboard` | Dashboard, overview | Streamline `interface-essential/dashboard-3.svg` |
| `IconFolder` | A folder | Streamline `interface-essential/new-folder.svg` |
| `IconFolderOpen` | An open folder | Font Awesome Free folder-open (CC BY 4.0) |
| `IconFolderAdd` | New folder | Streamline `interface-essential/folder-add.svg` |
| `IconArchive` | Archive | Streamline `interface-essential/archive-box.svg` |
| `IconFleet` | Instances, other boxes | Streamline `interface-essential/hierarchy-2.svg` |
| `IconCollector` | Collector, taking links in | Streamline `mail/inbox-tray-1.svg` |
| `IconAccounts` | Accounts | KnightLoader's drawing on a 20-unit grid |
| `IconNetwork` | Network, connections | Streamline `computer-devices/wifi.svg` |
| `IconPhone` | Phone | Streamline `phone/phone-mobile-phone.svg` |
| `IconBrowser` | Browser | Streamline `programming/browser-website-1.svg` |
| `IconApp` | Open the app | Streamline `programming/application-add.svg` |
| `IconModules` | Modules | Streamline `programming/module-puzzle-1.svg` |
| `IconCaptcha` | Captcha | reCAPTCHA's mark in one colour, its three arrows set apart (a trademark used descriptively) |
| `IconContainers` | Docker containers | Simple Icons whale (CC0, a trademark used descriptively) |
| `IconVM` | Virtual machines | Streamline `computer-devices/screen-1.svg` |
| `IconFiles` | Files and folder sets | Streamline `interface-essential/multiple-file-2.svg` |
| `IconReceiver` | Receiver, an incoming transfer | Streamline `interface-essential/download-computer.svg` |
| `IconBackupNow` | Back up now | Streamline `computer-devices/database-check.svg` |
| `IconRestore` | Restore | Streamline `interface-essential/arrow-reload-vertical-1.svg` |
| `IconSync` | Replicate, synchronise | Streamline `interface-essential/arrow-reload-horizontal-2.svg` |
| `IconRecovery` | Recovery, rebuild from backups | Streamline `interface-essential/arrow-reload-vertical-2.svg` |
| `IconLive` | Live, running now | Streamline `interface-essential/live-video.svg` |
| `IconConfig` | Configuration self-backup | Streamline `computer-devices/database-setting.svg` |
| `IconViewSimple` | Simple view | Streamline `interface-essential/layout-window-11.svg` |
| `IconViewAdvanced` | Advanced view | Streamline `interface-essential/layout-window-8.svg` |
| `IconFlash` | Boot flash drive | Streamline `computer-devices/usb-drive.svg` |
| `IconCloud` | Off-site, cloud | Font Awesome Free `cloud` (CC BY 4.0) |
| `IconLocal` | Local storage | Streamline `computer-devices/hard-disk.svg` |
| `IconDatabase` | A database | Streamline `computer-devices/database.svg` |
| `IconZFS` | ZFS datasets | Drawn: three separated platters |
| `IconAnomalies` | Anomalies | Drawn: four columns, the third far above the rest |
| `IconGithub` | The GitHub repository | Simple Icons `github` (CC0, a trademark used descriptively) |
| `IconHealth` | Health of the services | Font Awesome Free `heart-pulse` (CC BY 4.0) |
| `IconQueued` | Queued | Font Awesome Free `hourglass-half` (CC BY 4.0) |
| `IconCaptchaTimer` | Time left on a captcha | Material Design Icons `clock-alert` (Apache 2.0) |
| `IconResolvers` | Resolvers, download quality and format | Material Design Icons `movie-cog` (Apache 2.0) |

### Settings tabs

| Name | Means | Source |
| --- | --- | --- |
| `IconTabGeneral` | General tab | Drawn for GlimStone |
| `IconTabLook` | Look tab | Streamline `interface-essential/paint-palette.svg` |
| `IconTabSecurity` | Security tab | Streamline `interface-essential/shield-1.svg` |
| `IconTabAdvanced` | Advanced tab | Streamline `interface-essential/wrench.svg` |
| `IconTabApp` | App tab, the other forms of the product | Streamline `computer-devices/computer-pc-desktop.svg` |
| `IconTabApps` | Apps tab, the companions | Streamline `programming/module-three.svg` |
| `IconTabSystem` | System tab | Streamline `computer-devices/computer-chip-1.svg` |
| `IconTabStorage` | Paths and storage tab | Streamline `computer-devices/database-server-1.svg` |
| `IconTabIntegrity` | Integrity tab | Streamline `interface-essential/shield-check.svg` |
| `IconTabOffsite` | Off-site tab | Font Awesome Free `cloud` (CC BY 4.0) |
| `IconSchedules` | Schedules, automation | Streamline `interface-essential/circle-clock.svg` |
| `IconNotifications` | Notifications | Streamline `interface-essential/ringing-bell-notification.svg` |
| `IconSliders` | Schedule sliders | Streamline `interface-essential/vertical-slider-square.svg` |
| `IconDiagnostics` | Diagnostics | Streamline `programming/bug.svg` |
| `IconKeyboard` | Keyboard shortcuts | Streamline `computer-devices/keyboard.svg` |

**Pairs share one drawing turned or mirrored.** `IconFirst` is `IconLatest` mirrored top to bottom and `IconMoveDown` is `IconMoveUp` mirrored, so the two halves of each pair cannot drift apart. `IconEye` and `IconEyeOff` are Streamline's `visible` and `invisible-1`, and a Show phrase button and the reveal toggle in a password field wear the same two. `IconMail` rests on a mail button and `IconMailOpen` takes its place under the pointer or a finger; `MAIL_SVG` in `appMarks.ts` carries the pair.

**A brand mark is the brand's own and goes only where it is meant.** `IconCoffee` is Buy Me a Coffee's mark and stands only on the button that leads there, and `IconCaptcha` is reCAPTCHA's mark and stands only where a captcha is the subject. `IconContainers` and `IconGithub` follow the same rule (section 1).

**Drawn for GlimStone** means drawn on Streamline's 14-unit grid as filled shapes: lines as strokes buffered with round caps, cut-outs as real holes. `IconAdd` and `IconClose` are Streamline's `add-1` and `delete-1` with a 2.5-unit bar instead of 2.

<br>

## 5. Generating the file

Adoption is a script, not a package. The shape that works:

1. Read each source SVG, strip `<desc>`, drop `id` attributes, replace `fill="#000000"` with `fill="currentColor"`, add `aria-hidden`.
2. Emit each as a component with a shared wrapper pinning the 14-unit viewBox and the 16px intrinsic size: the rendered size comes from CSS, so a control can size its own glyph without every glyph knowing about every control.
3. Keep hand-drawn glyphs **in the generator**, not in the generated file. A hand edit to generated output survives exactly until the next run, and that file's own header tells everyone not to touch it.
4. Record each fitted glyph's measured ink box next to its entry, and let one constant drive the fit: a redrawn coordinate is a second place to forget.
5. Pin the arithmetic with a test that RECOMPUTES the transform from the measured boxes rather than snapshotting what the generator emitted. A transform that merely exists proves nothing; a wrong scale renders perfectly well.

BombVault's `scripts/gen_glyphs.py` is the working reference implementation of all five.

**Keep a glyph from a second source in its own table.** ArrowLoop's generator carries a `LICENSED` list beside the Streamline one: name, meaning, source-and-licence line, the measured crop, and the paths verbatim. It earns the separation twice over - the doc comment it emits names the real source rather than claiming the drawing was made here, and the box sitting next to the paths is the only place the measurement can be read back from later. `scripts/measure_ink.py` in the same repo produces that box without a browser, by flattening every curve and taking the extremes; the reference's own measuring step, in a form a generator can be handed.

<br>

## 6. Adding a glyph

- **Check the assortment first.** A new name for an existing meaning is how two apps end up with two bins.
- **Prefer the free Streamline set**, and check which set the file came from. Any of the sets in section 1 is fine; a new one needs its licence checked and its attribution added in the same commit.
- **Drop any transparent padding path** before measuring, or the measurement is meaningless.
- **Measure the ink** and compare it against the glyphs it will stand next to, not against the box.
- **Look at it at 20px, magnified**, not at 88px, where every glyph looks fine.
- **Add it here in the same commit**, and its row in [`glyph-map.md`](glyph-map.md). An assortment that documents four apps out of five is a list of what somebody remembered.
