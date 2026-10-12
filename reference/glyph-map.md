# Which glyph each app wears

[`glyphs.md`](glyphs.md) says which drawing means what. This file says where each app stands against it: one row per meaning, the GlimStone name, the component each app renders for it today, and whether that is already the standard drawing. An app that adds or swaps a glyph changes its row here in the same commit.

"Standard" means the app's next release renders the drawing from [`glyphs.json`](glyphs.json). "Switch" means it still renders its own and moves to the standard one. "None" means the app has no such meaning.

<br>

## Actions, the verbs a button wears

| Meaning | GlimStone | BombVault | KnightLoader | ArrowLoop |
| --- | --- | --- | --- | --- |
| Show, reveal | `IconEye` | `IconEye`, standard | `IconEye`, standard | `IconEye`, standard |
| Hide again | `IconEyeOff` | `IconEyeOff`, standard | `IconEyeOff`, standard | `IconEyeOff`, standard |
| Refresh, retry | `IconRefresh` | `IconRefresh`, standard | `IconRefresh`, standard | `IconRefresh`, standard |
| Upload, import | `IconUpload` | `IconUpload`, standard | `IconUpload`, standard | `IconUpload`, standard |
| Download, export | `IconDownload` | `IconDownload`, standard | `IconDownload`, standard | `IconDownload`, standard |
| Search | `IconSearch` | `IconSearch`, standard | `IconSearch`, standard | `IconSearch`, standard |
| Start, run now | `IconPlay` | `IconPlay`, standard | `IconPlay`, standard | `IconPlay`, standard |
| Pause | `IconPause` | none | `IconPause`, standard | `IconPause`, standard |
| Stop, abort | `IconStop` | `IconStop`, standard | `IconStop`, standard | none |
| Power on and off | `IconPower` | `IconPower`, standard | `IconPower`, standard | none |
| Delete | `IconTrash` | `IconTrash`, standard | `IconTrash`, standard | `IconTrash`, standard |
| Delete with its files | `IconTrashFiles` | none | `IconTrashFiles`, standard | none |
| Add | `IconAdd` | `IconAdd`, standard | `IconAdd`, standard | `IconAdd`, standard |
| Close, cancel | `IconClose` | `IconClose`, standard | `IconClose`, standard | `IconClose`, standard |
| Edit | `IconPencil` | `IconPencil`, standard | `IconPencil`, standard | `IconPencil`, standard |
| Copy | `IconCopy` | `IconCopy`, standard | `IconCopy`, standard | `IconCopy`, standard |
| Verify, confirmed | `IconCheck` | `IconCheck`, standard | `IconCheck`, standard | `IconCheck`, standard |
| Connect, pair | `IconLink` | `IconLink`, standard | `IconLink`, standard | `IconLink`, standard |
| Credentials, key | `IconKey` | `IconKey`, standard | `IconKey`, standard | none |
| Revoke a key | `IconKeyRevoke` | `IconKeyRevoke`, standard | none | none |
| Sign in | `IconSignIn` | `IconSignIn`, standard | none | none |
| Sign out | `IconSignOut` | `IconSignOut`, standard | `IconSignOut`, standard | `IconSignOut`, standard |
| Information | `IconInfo` | `IconInfo`, standard | `IconInfo`, standard | `IconInfo`, standard |
| Help | `IconHelp` | none | `IconHelp`, standard | none |
| More | `IconMore` | `IconMore`, standard | `IconMore`, standard | `IconMore`, standard |
| Menu | `IconMenu` | none | `IconMenu`, standard | none |
| Save | `IconSave` | `IconSave`, switch | none | `IconSave`, standard |
| Unlock, clear a lock | `IconUnlock` | `IconUnlock`, standard | none | `IconUnlock`, standard |
| Prune, reclaim space | `IconPrune` | `IconPrune`, standard | none | none |
| Back | `IconBack` | `IconBack`, standard | `IconBack`, standard | `IconBack`, standard |
| Next, forward | `IconForward` | `IconForward`, standard | `IconForward`, standard | none |
| Jump to the newest entry, the end | `IconLatest` | `IconLatest`, standard | `IconLatest`, standard | none |
| Jump to the start | `IconFirst` | none | `IconFirst`, standard | none |
| Move up one | `IconMoveUp` | none | `IconMoveUp`, standard | none |
| Move down one | `IconMoveDown` | none | `IconMoveDown`, standard | none |
| Expand | `IconExpand` | none | `IconExpand`, standard | none |
| Collapse | `IconCollapse` | none | `IconCollapse`, standard | none |
| Select all | `IconSelectAll` | `IconSelectAll`, standard | `IconSelectAll`, standard | none |
| Clear the selection | `IconClearSelection` | `IconClearSelection`, standard | `IconClearSelection`, standard | none |
| Compare | `IconCompare` | `IconCompare`, standard | none | none |
| Filter | `IconFilter` | none | `IconFilter`, standard | `IconFilter`, standard |
| Pin | `IconPin` | none | `IconPin`, standard | none |
| Priority | `IconPriority` | none | `IconPriority`, standard | none |
| Drag to reorder | `IconGrip` | none | `IconGrip`, standard | none |
| Open a service's own site | `IconExternalLink` | none | `IconExternalLink`, standard | none |
| Warning | `IconWarning` | none | `IconWarning`, standard | none |
| Right away | `IconBolt` | none | `IconBolt`, standard | none |
| Write to us | `IconMail` | `IconMail`, standard | `IconMail`, standard | `IconMail`, standard |
| Buy the author a coffee | `IconCoffee` | `IconCoffee`, standard | none | `IconCoffee`, standard |
| A protection is on | `IconShieldOn` | `IconShieldOn`, standard | `IconShieldOn`, standard | `IconShieldOn`, standard |
| A protection is off | `IconShieldOff` | `IconShieldOff`, standard | none | none |
| Store uncompressed | `IconCompressOff` | `IconCompressOff`, standard | none | none |
| Let the tool choose the compression | `IconCompressAuto` | `IconCompressAuto`, standard | none | none |
| Compress as far as possible | `IconCompressMax` | `IconCompressMax`, standard | none | none |
| Script, code | `IconCode` | none | `IconCode`, standard | none |
| Dark look | `IconMoon` | none | `IconMoon`, standard | none |
| Light look | `IconSun` | none | `IconSun`, standard | none |
| Paste | `IconPaste` | none | `IconPaste`, standard | none |
| Sort direction | `IconSort` | none | `IconSort`, standard | `IconSort`, standard |
| Up one folder | `IconFolderUp` | none | `IconFolderUp`, standard | `IconFolderUp`, standard |
| Write to us, under the pointer or a finger | `IconMailOpen` | `IconMailOpen`, standard | `IconMailOpen`, standard | `IconMailOpen`, standard |
| Open the manual | `IconManual` | `IconManual`, standard | `IconManual`, standard | `IconManual`, standard |
| Open the manual, under the pointer, a finger or the focus | `IconManualOpen` | `IconManualOpen`, standard | `IconManualOpen`, standard | `IconManualOpen`, standard |

<br>

## Navigation and domain

| Meaning | GlimStone | BombVault | KnightLoader | ArrowLoop |
| --- | --- | --- | --- | --- |
| Settings | `IconGear` | `IconGear`, standard | `IconGear`, standard | `IconGear`, standard |
| Dashboard, overview | `IconDashboard` | `IconDashboard`, standard | `IconDashboard`, standard | `IconDashboard`, standard |
| A folder | `IconFolder` | `IconFolder`, standard | `IconFolder`, standard | `IconFolder`, standard |
| An open folder | `IconFolderOpen` | none | `IconFolderOpen`, standard | none |
| New folder | `IconFolderAdd` | none | `IconFolderAdd`, standard | `IconFolderAdd`, standard |
| Archive | `IconArchive` | none | `IconArchive`, standard | none |
| Instances, other boxes | `IconFleet` | `IconFleet`, standard | `IconFleet`, standard | none |
| Collector, taking links in | `IconCollector` | none | `IconCollector`, standard | none |
| Accounts | `IconAccounts` | none | `IconAccounts`, standard | none |
| Network, connections | `IconNetwork` | none | `IconNetwork`, standard | none |
| Phone | `IconPhone` | none | `IconPhone`, standard | `IconPhone`, standard |
| Browser | `IconBrowser` | none | `IconBrowser`, standard | none |
| Open the app | `IconApp` | none | `IconApp`, standard | none |
| Modules | `IconModules` | none | `IconModules`, standard | none |
| Captcha | `IconCaptcha` | none | `IconCaptcha`, standard | none |
| Docker containers | `IconContainers` | `IconContainers`, standard | none | none |
| Virtual machines | `IconVM` | `IconVM`, standard | none | none |
| Files and folder sets | `IconFiles` | `IconFiles`, standard | none | none |
| Receiver, an incoming transfer | `IconReceiver` | `IconReceiver`, standard | none | none |
| Back up now | `IconBackupNow` | `IconBackupNow`, standard | none | none |
| Restore | `IconRestore` | `IconRestore`, standard | none | none |
| Replicate, synchronise | `IconSync` | `IconSync`, standard | none | `IconSync`, standard |
| Recovery, rebuild from backups | `IconRecovery` | `IconRecovery`, standard | none | none |
| Live, running now | `IconLive` | `IconLive`, standard | none | none |
| Configuration self-backup | `IconConfig` | `IconConfig`, standard | none | none |
| Simple view | `IconViewSimple` | `IconViewSimple`, standard | none | none |
| Advanced view | `IconViewAdvanced` | `IconViewAdvanced`, standard | none | none |
| Boot flash drive | `IconFlash` | `IconFlash`, standard | none | none |
| Off-site, cloud | `IconCloud` | `IconCloud`, standard | none | none |
| Local storage | `IconLocal` | `IconLocal`, standard | none | none |
| A database | `IconDatabase` | `IconDatabase`, standard | none | none |
| ZFS datasets | `IconZFS` | `IconZFS`, standard | none | none |
| Anomalies | `IconAnomalies` | `IconAnomalies`, standard | none | `IconAnomalies`, standard |
| The GitHub repository | `IconGithub` | `IconGithub`, standard | `IconGithub`, standard | `IconGithub`, standard |
| Health of the services | `IconHealth` | none | `IconHealth`, standard | none |
| Queued | `IconQueued` | none | `IconQueued`, standard | none |
| Time left on a captcha | `IconCaptchaTimer` | none | `IconCaptchaTimer`, standard | none |
| Resolvers, download quality and format | `IconResolvers` | none | `IconResolvers`, standard | none |

<br>

## Settings tabs

| Meaning | GlimStone | BombVault | KnightLoader | ArrowLoop |
| --- | --- | --- | --- | --- |
| General tab | `IconTabGeneral` | `IconTabGeneral`, standard | `IconTabGeneral`, standard | `IconTabGeneral`, standard |
| Look tab | `IconTabLook` | `IconTabLook`, standard | `IconTabLook`, standard | `IconTabLook`, standard |
| Security tab | `IconTabSecurity` | `IconTabSecurity`, standard | `IconTabSecurity`, standard | `IconTabSecurity`, standard |
| Advanced tab | `IconTabAdvanced` | none | `IconTabAdvanced`, standard | none |
| App tab, the other forms of the product | `IconTabApp` | none | `IconTabApp`, standard | `IconTabApp`, standard |
| Apps tab, the companions | `IconTabApps` | `IconTabApps`, standard | none | none |
| System tab | `IconTabSystem` | `IconTabSystem`, standard | none | none |
| Paths and storage tab | `IconTabStorage` | `IconTabStorage`, standard | none | `IconTabStorage`, standard |
| Retention tab, how long backups are kept | `IconTabRetention` | `IconTabRetention`, standard | none | none |
| Integrity tab, checks | `IconTabIntegrity` | `IconTabIntegrity`, standard | none | none |
| Recovery tab and rail entry | `IconTabRecovery` | `IconTabRecovery`, switch | none | `IconTabRecovery`, standard |
| Off-site tab | `IconTabOffsite` | `IconTabOffsite`, standard | none | none |
| Schedules, automation | `IconSchedules` | `IconSchedules`, standard | `IconSchedules`, standard | none |
| Notifications | `IconNotifications` | `IconNotifications`, standard | `IconNotifications`, standard | `IconNotifications`, standard |
| Schedule sliders | `IconSliders` | none | `IconSliders`, standard | none |
| Diagnostics | `IconDiagnostics` | none | `IconDiagnostics`, standard | `IconDiagnostics`, standard |
| Keyboard shortcuts | `IconKeyboard` | none | `IconKeyboard`, standard | none |

<br>

## Glyphs outside the assortment

A meaning only one app has stays in that app's generator rather than in [`glyphs.json`](glyphs.json). Each entry still names its source and licence there, and the drawing moves into the assortment once a second app needs the meaning. The drawn tick is outside for another reason: `.glim-check-draw` draws it along a stroke, and the assortment holds filled shapes only, so each app keeps its own.

| Meaning | App | Name | Source |
| --- | --- | --- | --- |
| What the runs did, the History page | ArrowLoop | `IconHistory` | Streamline `interface-essential/bullet-list.svg` |
| Conflicts: a sync that waits for somebody to choose | ArrowLoop | `IconConflict` | Streamline `interface-essential/synchronize-warning.svg` |
| See what a run would do before it does it | ArrowLoop | `IconPreview` | Streamline `interface-essential/search-visual.svg` (CC BY 4.0). The eye already means show a secret, so a preview wears a lens of its own |
| Forget a drive, leaving its marker on the drive | ArrowLoop | `IconForget` | Streamline `interface-essential/subtract-circle.svg` |
| A job that copies left to right only | ArrowLoop | `IconToRight` | Streamline `interface-essential/arrow-up-1.svg`, turned |
| A job that copies right to left only | ArrowLoop | `IconToLeft` | Streamline `interface-essential/arrow-up-1.svg`, turned |
| A job that syncs both ways | ArrowLoop | `IconBothWays` | Streamline `interface-essential/arrow-up-1.svg`, twice, scaled and turned |
| Locked or encrypted | ArrowLoop | `IconLock` | Streamline `interface-essential/padlock-square-1.svg` |
| SFTP, a machine reached over SSH | ArrowLoop | `IconServer` | Streamline `computer-devices/database-server-2.svg` |
| FTP | ArrowLoop | `IconTransfer` | Streamline `interface-essential/arrow-transfer-diagonal-1.svg` |
| S3, object storage | ArrowLoop | `IconBuckets` | Streamline `computer-devices/database.svg` |
| A download as a code to scan with the phone | ArrowLoop | `IconQr` | Streamline `money-shopping/qr-code.svg` |
| Give with crypto | ArrowLoop | `IconWallet` | Streamline `money-shopping/wallet.svg` |
| A tick that draws itself where something just worked (`.glim-check-draw`) | ArrowLoop, BombVault | `IconCheckDraw`, `CheckDraw` | Drawn for each app; BombVault's is `web/src/components/CheckDraw.tsx` |

<br>

## Where each app keeps its glyphs

- **BombVault:** `scripts/gen_glyphs.py` writes `web/src/components/glyphs.tsx` and `navGlyphs.tsx` from a copy of `glyphs.json` at 16px; the phone app shows the web launcher and uses the same files. `glyphFor.tsx` maps a translation key to a glyph when a button passes none; a button that passes one wins.
- **KnightLoader:** `web/scripts/gen-glyphs.mjs` writes `web/src/lib/glyphs.tsx` at 22px with the ink at three quarters of the box; the Android app draws its few marks itself with react-native-svg. Every call site passes its glyph; Settings page glyphs are mapped in `pages/settings/pageIcons.tsx`. The browser extension copies the eye and a few others in `extension/src/`.
- **ArrowLoop:** `scripts/gen_glyphs.py` writes `web/src/components/glyphs.tsx` at 14px from a copy of `glyphs.json` plus its own table for the glyphs only it has; `scripts/gen_glyph_data.py` lifts the drawings into `web/src/lib/glyphs.data.ts`, which the phone app draws with react-native-svg. `lib/glyphName.ts` maps a label key to a glyph name for both. The brand marks, GitHub's among them, come from `scripts/gen_brand_glyphs.py`.
