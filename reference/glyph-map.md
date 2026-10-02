# Which glyph each app wears

[`glyphs.md`](glyphs.md) says which drawing means what. This file says where each app stands against it: one row per meaning, the GlimStone name, the component each app renders for it today, and whether that is already the standard drawing. An app that adds or swaps a glyph changes its row here in the same commit.

"Standard" means the app renders the drawing from [`glyphs.json`](glyphs.json). "Switch" means it still renders its own and moves to the standard one. "None" means the app has no such meaning.

<br>

## Actions, the verbs a button wears

| Meaning | GlimStone | BombVault | KnightLoader |
| --- | --- | --- | --- |
| Show, reveal | `IconEye` | `IconEye`, switch | `IconEye`, switch |
| Hide again | `IconEyeOff` | `IconEyeOff`, switch | `IconEyeOff`, switch |
| Refresh, retry | `IconRefresh` | `IconRefresh`, switch | `IconRetry`, switch |
| Upload, import | `IconUpload` | `IconUpload`, switch | `IconUpload`, switch |
| Download, export | `IconDownload` | `IconDownload`, switch | `IconDownloads`, switch |
| Search | `IconSearch` | `IconSearch`, standard | `IconSearch`, switch |
| Start, run now | `IconPlay` | `IconPlay`, standard | `IconPlay`, switch |
| Pause | `IconPause` | none | `IconPause`, switch |
| Stop, abort | `IconStop` | `IconStop`, standard | `IconStop`, `IconStopMark`, switch |
| Power on and off | `IconPower` | `IconPower`, standard | `IconPower`, switch |
| Delete | `IconTrash` | `IconTrash`, standard | `IconTrash`, switch |
| Delete with its files | `IconTrashFiles` | none | `IconTrashFiles`, switch |
| Add | `IconAdd` | `IconAdd`, switch | `IconPlus`, switch |
| Close, cancel | `IconClose` | `IconClose`, switch | `IconClose`, switch |
| Edit | `IconPencil` | `IconPencil`, standard | `IconEdit`, switch |
| Copy | `IconCopy` | `IconCopy`, standard | `IconClipboard`, switch |
| Verify, confirmed | `IconCheck` | `IconCheckCircle`, switch | `IconCheck`, `IconCheckDrawn`, switch |
| Connect, pair | `IconLink` | `IconLink`, standard | `IconLink`, switch |
| Credentials, key | `IconKey` | `IconKey`, standard | `IconKey`, switch |
| Revoke a key | `IconKeyRevoke` | `IconKeyRevoke`, standard | none |
| Sign in | `IconSignIn` | `IconSignIn`, standard | none |
| Sign out | `IconSignOut` | `IconSignOut`, standard | `IconSignOut`, switch |
| Information | `IconInfo` | `IconInfo`, standard | none |
| Help | `IconHelp` | none | `IconHelp`, switch |
| More | `IconMore` | `IconEllipsis`, switch | `IconMore`, switch |
| Menu | `IconMenu` | none | `IconMenu`, standard |
| Save | `IconSave` | `IconSave`, switch | none |
| Unlock, clear a lock | `IconUnlock` | `IconUnlock`, switch | none |
| Prune, reclaim space | `IconPrune` | `IconPrune`, switch | none |
| Back | `IconBack` | `IconBack`, switch | `IconChevronStart`, standard |
| Next, forward | `IconForward` | `IconForward`, switch | `IconChevronEnd`, standard |
| Jump to the newest entry, the end | `IconLatest` | `IconLatest`, standard | `IconBottom`, switch |
| Jump to the start | `IconFirst` | none | `IconTop`, switch |
| Move up one | `IconMoveUp` | none | `IconArrowUp`, switch |
| Move down one | `IconMoveDown` | none | `IconArrowDown`, switch |
| Expand | `IconExpand` | none | `IconChevronDown`, standard |
| Collapse | `IconCollapse` | none | `IconChevronUp`, standard |
| Select all | `IconSelectAll` | `IconSelectAll`, standard | none |
| Clear the selection | `IconClearSelection` | `IconClearSelection`, standard | none |
| Compare | `IconCompare` | `IconCompare`, standard | none |
| Filter | `IconFilter` | none | `IconFilter`, switch |
| Pin | `IconPin` | none | `IconPin`, standard |
| Priority | `IconPriority` | none | `IconPriority`, standard |
| Drag to reorder | `IconGrip` | none | `IconGrip`, switch |
| Open a service's own site | `IconExternalLink` | none | `IconExternalLink`, switch |
| Warning | `IconWarning` | none | `IconWarning`, switch |
| Right away | `IconBolt` | none | `IconBolt`, standard |
| Write to us | `IconMail` | `IconMail`, standard | none |
| Buy the author a coffee | `IconCoffee` | `IconCoffee`, switch | `IconCoffee`, switch |
| A protection is on | `IconShieldOn` | `IconShieldOn`, switch | `IconShieldCheck`, switch |
| A protection is off | `IconShieldOff` | `IconShieldOff`, switch | none |
| Store uncompressed | `IconCompressOff` | `IconCompressOff`, standard | none |
| Let the tool choose the compression | `IconCompressAuto` | `IconCompressAuto`, standard | none |
| Compress as far as possible | `IconCompressMax` | `IconCompressMax`, standard | none |
| Script, code | `IconCode` | none | `IconCode`, switch |
| Dark look | `IconMoon` | none | `IconMoon`, switch |
| Light look | `IconSun` | none | `IconSun`, switch |

<br>

## Navigation and domain

| Meaning | GlimStone | BombVault | KnightLoader |
| --- | --- | --- | --- |
| Settings | `IconGear` | `IconGear`, standard | `IconSettings`, standard |
| Dashboard, overview | `IconDashboard` | `IconDashboard`, standard | `IconDashboard`, switch |
| A folder | `IconFolder` | `IconFolder`, standard | `IconFolder`, switch |
| An open folder | `IconFolderOpen` | none | `IconFolderOpen`, switch |
| New folder | `IconFolderAdd` | none | `IconFolderPlus`, switch |
| Archive | `IconArchive` | none | `IconArchive`, switch |
| Instances, other boxes | `IconFleet` | `IconFleet`, standard | `IconInstances`, switch |
| Collector, taking links in | `IconCollector` | none | `IconCollector`, switch |
| Accounts | `IconAccounts` | none | `IconAccounts`, standard |
| Network, connections | `IconNetwork` | none | `IconGlobe`, switch |
| Phone | `IconPhone` | none | `IconPhone`, switch |
| Browser | `IconBrowser` | none | `IconBrowser`, switch |
| Open the app | `IconApp` | none | `IconApp`, switch |
| Modules | `IconModules` | none | `IconModules`, switch |
| Captcha | `IconCaptcha` | none | `IconCaptcha`, switch |
| Docker containers | `IconContainers` | `IconContainers`, standard | `IconContainer`, switch |
| Virtual machines | `IconVM` | `IconVM`, standard | none |
| Files and folder sets | `IconFiles` | `IconFiles`, switch | none |
| Receiver, an incoming transfer | `IconReceiver` | `IconReceiver`, switch | none |
| Back up now | `IconBackupNow` | `IconBackupNow`, standard | none |
| Restore | `IconRestore` | `IconRestore`, standard | none |
| Replicate, synchronise | `IconSync` | `IconSync`, switch | none |
| Recovery, rebuild from backups | `IconRecovery` | `IconRecovery`, switch | none |
| Live, running now | `IconLive` | `IconLive`, standard | none |
| Configuration self-backup | `IconConfig` | `IconConfig`, standard | none |
| Simple view | `IconViewSimple` | `IconViewSimple`, standard | none |
| Advanced view | `IconViewAdvanced` | `IconViewAdvanced`, standard | none |
| Boot flash drive | `IconFlash` | `IconFlash`, standard | none |
| Off-site, cloud | `IconCloud` | `IconCloud`, standard | none |
| Local storage | `IconLocal` | `IconLocal`, switch | none |
| A database | `IconDatabase` | `IconDatabase`, switch | none |
| ZFS datasets | `IconZFS` | `IconZFS`, standard | none |
| Anomalies | `IconAnomalies` | `IconAnomalies`, standard | none |
| The GitHub repository | `IconGithub` | `IconGithub`, standard | `IconGithub`, switch |

<br>

## Settings tabs

| Meaning | GlimStone | BombVault | KnightLoader |
| --- | --- | --- | --- |
| General tab | `IconTabGeneral` | `IconTabGeneral`, switch | `IconTabGeneral`, switch |
| Look tab | `IconTabLook` | `IconTabLook`, switch | `IconLook`, switch |
| Security tab | `IconTabSecurity` | `IconTabSecurity`, switch | `IconLock`, switch |
| Advanced tab | `IconTabAdvanced` | none | `IconTabAdvanced`, switch |
| App tab, the other forms of the product | `IconTabApp` | none | `IconTabApp`, switch |
| Apps tab, the companions | `IconTabApps` | `IconApps`, switch | none |
| System tab | `IconTabSystem` | `IconTabSystem`, standard | none |
| Paths and storage tab | `IconTabStorage` | `IconTabStorage`, switch | none |
| Integrity tab | `IconTabIntegrity` | `IconTabIntegrity`, switch | none |
| Off-site tab | `IconTabOffsite` | `IconTabOffsite`, standard | none |
| Schedules, automation | `IconSchedules` | `IconSchedules`, switch | `IconClock`, switch |
| Notifications | `IconNotifications` | `IconNotifications`, switch | `IconBell`, switch |
| Schedule sliders | `IconSliders` | none | `IconSliders`, switch |
| Diagnostics | `IconDiagnostics` | none | `IconDiagnostics`, switch |
| Keyboard shortcuts | `IconKeyboard` | none | `IconKeyboard`, switch |

<br>

## Where each app keeps its glyphs

- **BombVault:** `web/src/components/glyphs.tsx` and `navGlyphs.tsx`, both generated by `scripts/gen_glyphs.py`. `glyphFor.tsx` maps a translation key to a glyph when a button passes none; a button that passes one wins.
- **KnightLoader:** `web/src/lib/icons.tsx`, rendered at 22px. Every call site passes its glyph. Settings page glyphs are mapped in `pages/settings/pageIcons.tsx`. The browser extension copies the eye in `extension/src/options.js`.
