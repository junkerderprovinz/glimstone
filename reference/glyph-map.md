# Which glyph each app wears

[`glyphs.md`](glyphs.md) says which drawing means what. This file says where each app stands against it: one row per meaning, the GlimStone name, the component each app renders for it today, and whether that is already the standard drawing. An app that adds or swaps a glyph changes its row here in the same commit.

"Standard" means the app's next release renders the drawing from [`glyphs.json`](glyphs.json). "Switch" means it still renders its own and moves to the standard one. "To follow" means the app has the setting and takes the standard drawing in a later release. "None" means the app has no such meaning.

<br>

## Actions, the verbs a button wears

| Meaning | GlimStone | BombVault | KnightLoader |
| --- | --- | --- | --- |
| Show, reveal | `IconEye` | `IconEye`, standard | `IconEye`, standard |
| Hide again | `IconEyeOff` | `IconEyeOff`, standard | `IconEyeOff`, standard |
| Reset to the default | `IconRefresh` | `IconClearSelection`, switch | to follow |
| Retry, reload, refresh | `IconRetry` | `IconRefresh`, switch | `IconRefresh`, switch |
| Upload | `IconUpload` | `IconUpload`, standard | `IconUpload`, standard |
| Import, read in | `IconImport` | to follow | `IconUpload`, switch |
| Download | `IconDownload` | `IconDownload`, standard | `IconDownload`, standard |
| Export | `IconExport` | `IconDownload`, switch | `IconDownload`, switch |
| Search | `IconSearch` | `IconSearch`, standard | `IconSearch`, standard |
| Start, run now, play | `IconPlay` | `IconPlay`, standard | `IconPlay`, standard |
| Pause | `IconPause` | none | `IconPause`, standard |
| Stop, abort | `IconStop` | `IconStop`, standard | `IconStop`, standard |
| Power on and off | `IconPower` | `IconPower`, standard | `IconPower`, standard |
| Delete, remove | `IconTrash` | `IconTrash`, standard | `IconTrash`, standard |
| Delete with its files | `IconTrashFiles` | none | `IconTrashFiles`, standard |
| Clear, empty a list | `IconEmpty` | none | to follow |
| Add, create | `IconAdd` | `IconAdd`, standard | `IconAdd`, standard |
| Close, cancel, dismiss | `IconClose` | `IconClose`, standard | `IconClose`, standard |
| Edit, rename, change | `IconPencil` | `IconPencil`, standard | `IconPencil`, standard |
| Copy | `IconCopy` | `IconCopy`, standard | `IconCopy`, standard |
| Test, verify, success | `IconCheck` | `IconCheck`, standard | `IconCheck`, standard |
| Done, confirm, got it | `IconConfirm` | `IconCheck`, switch | to follow |
| Refuse, decline | `IconReject` | `IconClose`, switch | to follow |
| Apply, take over, use this one | `IconApply` | `IconSave`, switch | to follow |
| Undo | `IconUndo` | `IconRestore`, switch | to follow |
| Connect, pair | `IconLink` | `IconLink`, standard | `IconLink`, standard |
| Credentials, key, set a password | `IconKey` | `IconKey`, standard | `IconKey`, standard |
| Revoke a key, remove a password or passkey | `IconKeyRevoke` | `IconKeyRevoke`, standard | to follow |
| Forgot password | `IconForgotPassword` | `IconKey`, switch | to follow |
| Sign in | `IconSignIn` | `IconSignIn`, switch | to follow |
| Sign out | `IconSignOut` | `IconSignOut`, standard | `IconSignOut`, standard |
| Information | `IconInfo` | `IconInfo`, standard | `IconInfo`, standard |
| Help | `IconHelp` | none | `IconHelp`, standard |
| More | `IconMore` | `IconMore`, standard | `IconMore`, standard |
| Menu | `IconMenu` | none | `IconMenu`, standard |
| Save | `IconSave` | `IconSave`, switch | to follow |
| Unlock, clear a lock | `IconUnlock` | `IconUnlock`, standard | none |
| Prune, reclaim space | `IconPrune` | `IconPrune`, standard | none |
| Compact a database | `IconCompact` | none | to follow |
| Compute, calculate | `IconCompute` | none | none |
| Back | `IconBack` | `IconBack`, standard | `IconBack`, standard |
| Next, continue | `IconForward` | `IconForward`, standard | `IconForward`, standard |
| Jump to the newest entry, the end | `IconLatest` | `IconLatest`, standard | `IconLatest`, standard |
| Jump to the start | `IconFirst` | none | `IconFirst`, standard |
| Move up one | `IconMoveUp` | none | `IconMoveUp`, standard |
| Move down one | `IconMoveDown` | none | `IconMoveDown`, standard |
| Move elsewhere | `IconMove` | none | none |
| Expand | `IconExpand` | none | `IconExpand`, standard |
| Collapse | `IconCollapse` | none | `IconCollapse`, standard |
| Select all | `IconSelectAll` | `IconSelectAll`, standard | `IconSelectAll`, standard |
| Clear the selection | `IconClearSelection` | `IconClearSelection`, standard | `IconClearSelection`, standard |
| Compare | `IconCompare` | `IconCompare`, standard | none |
| Keep both versions | `IconKeepBoth` | none | to follow |
| Keep the left version | `IconKeepLeft` | none | none |
| Keep the right version | `IconKeepRight` | none | none |
| Merge | `IconMerge` | none | to follow |
| Filter | `IconFilter` | none | `IconFilter`, standard |
| Pin | `IconPin` | none | `IconPin`, standard |
| Priority | `IconPriority` | none | `IconPriority`, standard |
| Drag to reorder | `IconGrip` | none | `IconGrip`, switch |
| Open a service's own site | `IconExternalLink` | none | `IconExternalLink`, standard |
| Warning | `IconWarning` | none | `IconWarning`, standard |
| Right away | `IconBolt` | none | `IconBolt`, standard |
| Write to us | `IconMail` | `IconMail`, standard | `IconMail`, standard |
| Send a test | `IconSendTest` | `IconCheck`, switch | to follow |
| Buy the author a coffee | `IconCoffee` | `IconCoffee`, standard | none |
| A protection is on, turn it on | `IconShieldOn` | `IconShieldOn`, standard | `IconShieldOn`, standard |
| A protection is off, turn it off | `IconShieldOff` | `IconShieldOff`, standard | to follow |
| Store uncompressed | `IconCompressOff` | `IconCompressOff`, standard | none |
| Automatic, the app chooses | `IconCompressAuto` | `IconCompressAuto`, standard | to follow |
| Compress as far as possible | `IconCompressMax` | `IconCompressMax`, standard | none |
| Script, code, variables | `IconCode` | none | `IconCode`, standard |
| Dark look | `IconMoon` | none | `IconMoon`, standard |
| Light look | `IconSun` | none | `IconSun`, standard |
| Paste | `IconPaste` | none | `IconPaste`, standard |
| Sort direction | `IconSort` | none | `IconSort`, standard |
| Up one folder | `IconFolderUp` | none | `IconFolderUp`, standard |
| Write to us, under the pointer or a finger | `IconMailOpen` | `IconMailOpen`, standard | `IconMailOpen`, standard |
| Open the manual | `IconManual`; on the Help card's button the README's book in `MANUAL_SVG` | `IconManual`, switch to `MANUAL_SVG` on the Help card | `MANUAL_SVG`, standard |
| Open the manual, under the pointer, a finger or the focus | `IconManualOpen` | `IconManualOpen`, standard | `IconManualOpen`, standard |
| Default, preferred | `IconStar` | `IconStar`, standard on the Default badge and the Make default button | none |
| Stop asking | `IconStopAsking` | none | to follow |
| Store cookies | `IconCookies` | none | to follow |
| Open the log | `IconLog` | none | to follow |
| Install | `IconInstall` | to follow | to follow |
| Fetch an update, update now | `IconUpdate` | none | to follow |
| Up to date after an update check | `IconUpToDate` | `IconCheck`, switch | none |
| An update is available | `IconUpdateAvailable` | `IconSearch`, switch | none |

<br>

## Navigation and domain

| Meaning | GlimStone | BombVault | KnightLoader |
| --- | --- | --- | --- |
| Settings, open a setting | `IconGear` | `IconGear`, standard | `IconGear`, standard |
| Dashboard, overview | `IconDashboard` | `IconDashboard`, standard | `IconDashboard`, standard |
| A folder | `IconFolder` | `IconFolder`, standard | `IconFolder`, standard |
| An open folder | `IconFolderOpen` | none | `IconFolderOpen`, standard |
| New folder | `IconFolderAdd` | none | `IconFolderAdd`, standard |
| Archive | `IconArchive` | none | `IconArchive`, standard |
| Instances, other boxes | `IconFleet` | `IconFleet`, standard | `IconFleet`, standard |
| Collector, taking links in | `IconCollector` | none | `IconCollector`, standard |
| Accounts | `IconAccounts` | none | `IconAccounts`, standard |
| Network, connections | `IconNetwork` | none | `IconNetwork`, standard |
| Phone | `IconPhone` | none | `IconPhone`, standard |
| Browser | `IconBrowser` | none | `IconBrowser`, standard |
| Open or show the app | `IconApp` | none | `IconApp`, standard |
| Modules | `IconModules` | none | `IconModules`, standard |
| Captcha | `IconCaptcha` | none | `IconCaptcha`, standard |
| Docker containers | `IconContainers` | `IconContainers`, standard | none |
| Virtual machines | `IconVM` | `IconVM`, standard | none |
| Files and folder sets | `IconFiles` | `IconFiles`, standard | none |
| Receiver, an incoming transfer | `IconReceiver` | `IconReceiver`, standard | none |
| Back up now | `IconBackupNow` | `IconBackupNow`, standard | none |
| Restore | `IconRestore` | `IconRestore`, standard | to follow |
| Replicate, synchronise | `IconSync` | `IconSync`, standard | none |
| Recovery, rebuild from backups | `IconRecovery` | `IconRecovery`, standard | none |
| Live, running now | `IconLive` | `IconLive`, standard | none |
| Configuration self-backup | `IconConfig` | `IconConfig`, standard | none |
| Simple view | `IconViewSimple` | `IconViewSimple`, standard | none |
| Advanced view | `IconViewAdvanced` | `IconViewAdvanced`, standard | none |
| Boot flash drive | `IconFlash` | `IconFlash`, standard | none |
| Off-site, cloud | `IconCloud` | `IconCloud`, standard | none |
| Local storage | `IconLocal` | `IconLocal`, standard | none |
| A database | `IconDatabase` | `IconDatabase`, standard | none |
| ZFS datasets | `IconZFS` | `IconZFS`, standard | none |
| Anomalies | `IconAnomalies` | `IconAnomalies`, standard | none |
| The GitHub repository | `IconGithub` | `IconGithub`, standard | `IconGithub`, standard |
| Health of the services | `IconHealth` | none | `IconHealth`, standard |
| Queued | `IconQueued` | none | `IconQueued`, standard |
| Time left on a captcha | `IconCaptchaTimer` | none | `IconCaptchaTimer`, standard |
| Resolvers, download quality and format | `IconResolvers` | none | `IconResolvers`, standard |
| What's new | `IconWhatsNew` | none | to follow |

<br>

## Settings tabs

| Meaning | GlimStone | BombVault | KnightLoader |
| --- | --- | --- | --- |
| General tab | `IconTabGeneral` | `IconTabGeneral`, standard | `IconTabGeneral`, standard |
| Look tab | `IconTabLook` | `IconTabLook`, standard | `IconTabLook`, standard |
| Security tab | `IconTabSecurity` | `IconTabSecurity`, standard | `IconTabSecurity`, standard |
| Advanced tab | `IconTabAdvanced` | none | `IconTabAdvanced`, standard |
| App tab, the other forms of the product | `IconTabApp` | none | `IconTabApp`, standard |
| Apps tab, the companions | `IconTabApps` | `IconTabApps`, standard | none |
| System tab | `IconTabSystem` | `IconTabSystem`, standard | none |
| Paths and storage tab | `IconTabStorage` | `IconTabStorage`, standard | none |
| Retention tab, how long backups are kept | `IconTabRetention` | `IconTabRetention`, standard | none |
| Integrity tab, checks | `IconTabIntegrity` | `IconTabIntegrity`, standard | none |
| Recovery tab and rail entry | `IconTabRecovery` | `IconTabRecovery`, switch | none |
| Off-site tab | `IconTabOffsite` | `IconTabOffsite`, standard | none |
| Schedules, automation | `IconSchedules` | `IconSchedules`, standard | `IconSchedules`, standard |
| Notifications | `IconNotifications` | `IconNotifications`, standard | `IconNotifications`, standard |
| Schedule sliders, set limits | `IconSliders` | none | `IconSliders`, standard |
| Diagnostics | `IconDiagnostics` | none | `IconDiagnostics`, standard |
| Keyboard shortcuts | `IconKeyboard` | none | `IconKeyboard`, standard |

<br>

## Look settings

ArrowLoop drew the glyphs for the segments of its Design, Corners and Motion selectors, so this table gets a column for it. BombVault and KnightLoader wear them too. The Labels and Row height glyphs were drawn for GlimStone; only KnightLoader has a Row height selector.

| Meaning | GlimStone | ArrowLoop | BombVault | KnightLoader |
| --- | --- | --- | --- | --- |
| Design selector, System | `IconThemeSystem` | `IconThemeSystem`, standard | `IconThemeSystem`, standard | `IconThemeSystem`, standard |
| Design selector, Dark | `IconMoon` | `IconMoon`, standard | `IconMoon`, standard | `IconMoon`, standard |
| Design selector, Light | `IconSun` | `IconSun`, standard | `IconSun`, standard | `IconSun`, standard |
| Corners selector, Round | `IconCornerRound` | `IconCornerRound`, standard | `IconCornerRound`, standard | `IconCornerRound`, standard |
| Corners selector, Soft | `IconCornerSoft` | `IconCornerSoft`, standard | `IconCornerSoft`, standard | `IconCornerSoft`, standard |
| Corners selector, Square | `IconCornerSquare` | `IconCornerSquare`, standard | `IconCornerSquare`, standard | `IconCornerSquare`, standard |
| Corners selector, the hidden leaf | `IconCornerLeaf` | `IconCornerLeaf`, standard | `IconCornerLeaf`, standard | `IconCornerLeaf`, standard |
| Motion selector, Off | `IconMotionOff` | `IconMotionOff`, standard | `IconMotionOff`, standard | `IconMotionOff`, standard |
| Motion selector, Subtle | `IconMotionSubtle` | `IconMotionSubtle`, standard | `IconMotionSubtle`, standard | `IconMotionSubtle`, standard |
| Motion selector, Wild | `IconMotionWild` | `IconMotionWild`, standard | `IconMotionWild`, standard | `IconMotionWild`, standard |
| Motion selector, the hidden storm | `IconMotionStorm` | `IconMotionStorm`, standard | `IconMotionStorm`, standard | `IconMotionStorm`, standard |
| Labels selector, Text | `IconLabelText` | `IconLabelText`, standard | `IconLabelText`, standard | `IconLabelText`, standard |
| Labels selector, Text and glyph | `IconLabelTextGlyph` | `IconLabelTextGlyph`, standard | `IconLabelTextGlyph`, standard | `IconLabelTextGlyph`, standard |
| Labels selector, Glyph | `IconLabelGlyph` | `IconLabelGlyph`, standard | `IconLabelGlyph`, standard | `IconLabelGlyph`, standard |
| Labels selector, Reactive | `IconLabelReactive` | `IconLabelReactive`, standard | `IconLabelReactive`, standard | `IconLabelReactive`, standard |
| Row height selector, Compact | `IconRowCompact` | none | none | `IconRowCompact`, standard |
| Row height selector, Medium | `IconRowMedium` | none | none | `IconRowMedium`, standard |
| Row height selector, Comfortable | `IconRowComfortable` | none | none | `IconRowComfortable`, standard |

<br>

## TowerTorch

TowerTorch wears the assortment on its own controls and on the Unraid buttons it draws as badges, and it drew the glyphs below for them. Its other rows are not listed here yet.

| Meaning | GlimStone | TowerTorch |
| --- | --- | --- |
| Drag to reorder | `IconGrip` | `Grip`, standard |
| Move elsewhere | `IconMove` | `Move`, standard |
| Compute, calculate | `IconCompute` | `Compute`, standard |
| Labels selector, Text | `IconLabelText` | `IconLabelText`, standard |
| Labels selector, Text and glyph | `IconLabelTextGlyph` | `IconLabelTextGlyph`, standard |
| Labels selector, Glyph | `IconLabelGlyph` | `IconLabelGlyph`, standard |
| Labels selector, Reactive | `IconLabelReactive` | `IconLabelReactive`, standard |
| Row height selector, Compact | `IconRowCompact` | `IconRowCompact`, standard |
| Row height selector, Medium | `IconRowMedium` | `IconRowMedium`, standard |
| Row height selector, Comfortable | `IconRowComfortable` | `IconRowComfortable`, standard |

KnightLoader still draws its own grip, three rows of two dots in an 8 by 12 box, which is why its row above says switch.

<br>

## ArrowLoop

ArrowLoop picks a button's glyph from its translation key. The rows below are the button meanings where it has a button; its other rows are not listed here yet.

| Meaning | GlimStone | ArrowLoop |
| --- | --- | --- |
| Reset to the default | `IconRefresh` | `IconRefresh`, standard |
| Import, read in | `IconImport` | `IconUpload`, switch |
| Export | `IconExport` | `IconDownload`, switch |
| Done, confirm, got it | `IconConfirm` | `IconSave`, switch |
| Apply, take over, use this one | `IconApply` | `IconSave`, switch |
| Send a test | `IconSendTest` | `IconCheck`, switch |
| Keep both versions | `IconKeepBoth` | to follow |
| Keep the left version | `IconKeepLeft` | to follow |
| Keep the right version | `IconKeepRight` | to follow |
| Sign in | `IconSignIn` | `IconSave`, switch |
| Forgot password | `IconForgotPassword` | `IconRefresh`, switch |
| Up to date after an update check | `IconUpToDate` | to follow |
| An update is available | `IconUpdateAvailable` | to follow |
| What's new | `IconWhatsNew` | to follow, beside the dot its button wears |
| Open or show the app | `IconApp` | `IconTabApp` on the tray's Open, switch |

<br>

## Where each app keeps its glyphs

- **ArrowLoop:** `scripts/gen_glyphs.py` writes the app's glyphs, and the Look settings glyphs come from it, for the web and, through `scripts/gen_glyph_data.py`, for the phone. `web/src/lib/glyphName.ts` maps a translation key to a glyph name, and a key it does not know keeps its text.
- **BombVault:** `scripts/gen_glyphs.py` writes `web/src/components/glyphs.tsx` and `navGlyphs.tsx` from a copy of `glyphs.json` at 16px; the phone app shows the web launcher and uses the same files. `glyphFor.tsx` maps a translation key to a glyph when a button passes none; a button that passes one wins.
- **KnightLoader:** `web/scripts/gen-glyphs.mjs` writes `web/src/lib/glyphs.tsx` at 22px with the ink at three quarters of the box; the Android app has no SVG and shows tinted bitmaps rendered from the same list into `mobile/assets/`. Every call site passes its glyph; Settings page glyphs are mapped in `pages/settings/pageIcons.tsx`. The browser extension copies the eye and a few others in `extension/src/`.
- **TowerTorch:** `scripts/cc-theme.js` holds a copy of every entry it draws, the square viewBox and the drawing, for its own controls and for Unraid's buttons; Unraid's own icons keep their Font Awesome. The glyphs of its settings selectors sit in `scripts/settings.js`, and `scripts/labels.js` maps Unraid's button captions to glyph names.
