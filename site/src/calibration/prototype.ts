// The controls of the CannonCommander prototype, copied so the calibration
// page can draw them beside the Vue components without depending on the
// prototype. The rules are the prototype's own, word for word, from
// prototype/src/css/app.css, the kits in src/js/features (a-00-kit.js,
// b-00-kit.js), src/js/25-columns.js, src/js/32-labels.js and the transfer
// preview's bar. The markup is what the prototype's builders (btn, sw, seg,
// menuHTML, win, pwField, copyField, pickColour) write. Only the last block is
// the page's: it stands the menu, the window and the picker in the page,
// where the prototype floats them.
import { hexToHsv } from "@glimstone/core";
import { glyphByName } from "../glyphData";

function g(name: string) {
  const glyph = glyphByName.get(name);
  return glyph ? `<svg viewBox="${glyph.viewBox}" fill="currentColor" aria-hidden="true">${glyph.svg}</svg>` : "";
}

export const PROTOTYPE_CSS = `
:host { display: block; font-family: var(--font-sans); font-size: 14px; line-height: 1.4; color: var(--carbon-text); }
* { box-sizing: border-box; }
button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
input, select, textarea { font: inherit; color: inherit; }
svg { display: block; }
.glim-num { font-variant-numeric: tabular-nums lining-nums; }
.mono { font-family: ui-monospace, "Cascadia Code", Menlo, monospace; font-size: 13px; }
.glim-card { background-color: var(--carbon-surface); border-radius: var(--radius-card); box-shadow: var(--elevation), var(--hairline); }

.menubar { display: flex; align-items: center; gap: 2px; flex: none; }
.menubar button { height: 2.2rem; padding: 0 .7rem; border-radius: var(--radius-pill); color: var(--carbon-text-sub); font-weight: 500; }
.menubar button:hover, .menubar button.open { background: var(--carbon-surface2); color: var(--carbon-text); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: .45rem; height: var(--btn-h); padding: 0 .85rem; border-radius: var(--radius-pill); background: var(--carbon-surface2); color: var(--carbon-text); font-size: 14px; font-weight: 500; white-space: nowrap; flex: none; }
.btn:hover, .btn:focus-visible { background: var(--carbon-surface3); }
.btn svg { width: .875rem; height: .875rem; color: var(--carbon-text); flex: none; }
.btn:hover svg { color: var(--accent-glyph); }
.btn.icon { width: var(--btn-h); padding: 0; }
.btn.icon svg { width: 1rem; height: 1rem; }
.btn.primary { background: var(--accent); color: var(--accent-contrast); }
.btn.primary svg { color: var(--accent-contrast); }
.btn.primary:hover { background: color-mix(in srgb, var(--accent) 85%, var(--carbon-text)); }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.well .btn, .win .well .btn { background: var(--carbon-surface3); }
.well .btn:hover { background: var(--carbon-hover-raised); }
.kbd { font-size: 12px; padding: 0 .4rem; height: 1.2rem; border-radius: var(--radius-control); background: var(--carbon-surface3); color: var(--carbon-text-sub); display: inline-grid; place-items: center; white-space: nowrap; }

.seg { display: inline-flex; padding: 3px; gap: 3px; border-radius: var(--radius-pill); background: var(--carbon-surface); box-shadow: var(--elevation), var(--hairline); flex: none; }
.seg button { height: calc(var(--btn-h) - 6px); padding: 0 .8rem; border-radius: var(--radius-pill); display: inline-flex; align-items: center; gap: .4rem; color: var(--carbon-text-sub); font-weight: 500; white-space: nowrap; }
.seg button svg { width: .875rem; height: .875rem; }
.seg button:hover { background: var(--carbon-hover); color: var(--carbon-text); }
.seg button[aria-pressed="true"] { background: var(--accent); color: var(--accent-contrast); }
.well .seg, .win .seg, .card-body .seg { background: var(--carbon-surface2); box-shadow: none; }
.well .seg button:hover { background: var(--carbon-surface3); }

.vmeter { width: 2.6rem; height: .35rem; border-radius: var(--radius-pill); background: var(--carbon-surface3); overflow: hidden; flex: none; }
.vmeter i { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
.vmeter.full i { background: var(--status-fail-solid, #ff6b72); }
.dbar { height: .55rem; border-radius: var(--radius-pill); background: var(--carbon-surface3); overflow: hidden; }
.dbar i { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
.dbar.full i { background: var(--status-fail-solid, #ff6b72); }
.lfoot { display: flex; align-items: center; gap: .5rem; padding: .5rem .5rem 0; font-size: 12px; color: var(--carbon-text-muted); }
.meter { width: 5rem; height: .35rem; border-radius: var(--radius-pill); background: var(--carbon-surface2); overflow: hidden; }
.meter i { display: block; height: 100%; background: var(--carbon-text-muted); border-radius: inherit; }
.lfree { display: flex; align-items: center; gap: .5rem; height: 1.5rem; padding: 0 .45rem; margin: 0 -.45rem; border-radius: var(--radius-control); color: inherit; font: inherit; }
.lfree:hover { background: var(--carbon-hover); color: var(--carbon-text); }
.lfree:hover .meter i { background: var(--accent); }
.glyph { width: 1.25rem; display: grid; place-items: center; flex: none; }
.glyph .cbox { width: 1.05rem; height: 1.05rem; }

.notch { position: absolute; top: 0; left: 1rem; transform: translateY(-50%); height: 1.6rem; padding: 0 .8rem; border-radius: var(--radius-pill); background: var(--accent); color: var(--accent-contrast); font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; display: inline-flex; align-items: center; gap: .45rem; white-space: nowrap; max-width: calc(100% - 2rem); overflow: hidden; z-index: 1; }
.pill { height: 1.35rem; padding: 0 .55rem; border-radius: var(--radius-pill); background: var(--carbon-surface2); color: var(--carbon-text-sub); font-size: 12px; display: inline-flex; align-items: center; justify-self: end; white-space: nowrap; flex: none; }
.pill.state { background: var(--carbon-surface3); color: var(--carbon-text); }
.pill.ok { background: color-mix(in srgb, var(--carbon-surface2), #6fdc8c 30%); color: var(--carbon-text); }
.pill.warn { background: color-mix(in srgb, var(--carbon-surface2), #FF832B 35%); color: var(--carbon-text); }
.pill.fault { background: color-mix(in srgb, var(--carbon-surface2), #ff8389 35%); color: var(--carbon-text); }

.win { position: relative; width: min(40rem, 100%); max-height: calc(100vh - 3rem); display: flex; flex-direction: column; padding: 1.6rem 1.25rem 1.1rem; }
.win .notch { left: 1.25rem; }
.win-body { overflow: auto; display: flex; flex-direction: column; gap: 1rem; padding: .35rem .1rem .5rem; flex: 1; min-height: 0; }
.win-foot { display: flex; justify-content: flex-end; align-items: center; gap: .5rem; padding-top: .9rem; }
.win-foot .start { margin-right: auto; font-size: 12px; color: var(--carbon-text-muted); }
.well { background: var(--carbon-surface2); border-radius: var(--radius-card); padding: .85rem .9rem; display: flex; flex-direction: column; gap: .6rem; }
.frow { display: flex; align-items: center; gap: .75rem; min-height: var(--btn-h); }
.frow > .lab { flex: 1; display: flex; align-items: center; gap: .35rem; min-width: 0; }

.field { height: var(--btn-h); border-radius: var(--radius-control); background: var(--carbon-surface3); border: 0; padding: 0 .7rem; outline: none; min-width: 0; }
.field:focus { background: var(--carbon-hover-raised); }
.field.w { width: 22rem; } .field.m { width: 12rem; } .field.s { width: 5.5rem; } .field.grow { flex: 1; width: auto; }
.sw { width: 2.3rem; height: 1.3rem; border-radius: var(--radius-pill); background: var(--carbon-surface3); position: relative; flex: none; }
.sw::after { content: ""; position: absolute; top: .2rem; left: .2rem; width: .9rem; height: .9rem; border-radius: var(--radius-pill); background: var(--carbon-text); transition: transform .12s; }
.sw[aria-checked="true"] { background: var(--accent); }
.sw[aria-checked="true"]::after { transform: translateX(1rem); background: var(--accent-contrast); }
.bar { height: .5rem; border-radius: var(--radius-pill); background: var(--carbon-surface3); overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--accent); border-radius: inherit; transition: width .3s; }

.menu { position: fixed; z-index: 60; min-width: 16rem; padding: .35rem; display: flex; flex-direction: column; max-height: calc(100vh - 2rem); overflow: auto; }
.menu button { height: 2rem; padding: 0 .6rem; border-radius: var(--radius-control); display: flex; align-items: center; gap: .6rem; text-align: left; white-space: nowrap; }
.menu button svg { width: .95rem; height: .95rem; color: var(--accent-glyph); flex: none; }
.menu button .ph { width: .95rem; flex: none; }
.menu button:hover, .menu button:focus-visible { background: var(--carbon-hover); outline: none; }
.menu button:disabled { opacity: .45; cursor: default; }
.menu button:disabled:hover { background: none; }
.menu button .kbd, .menu button .cnt, .menu button .tick { margin-left: auto; }
.menu button.on { background: color-mix(in srgb, var(--accent) 16%, transparent); }
.menu button .tick svg { color: var(--accent-glyph); }
.menu button .cnt { padding-left: 1.2rem; font-size: 12px; color: var(--carbon-text-muted); }
.menu button .chev { margin-left: auto; display: grid; }
.menu button .chev svg { width: .7rem; height: .7rem; color: var(--carbon-text-muted); transform: rotate(-90deg); }
.cbox { width: 1.125rem; height: 1.125rem; flex: none; border-radius: min(var(--radius-control), 5px); display: grid; place-items: center; background: color-mix(in srgb, var(--carbon-surface3) 60%, transparent); }
.cbox svg { width: .75rem !important; height: .75rem !important; color: transparent !important; }
.cbox.on { background: var(--accent); }
.cbox.on svg { color: var(--accent-contrast) !important; }
.menu .sep { height: 1px; margin: .3rem .4rem; background: color-mix(in srgb, var(--carbon-text) 9%, transparent); flex: none; }
.menu .head { display: flex; align-items: center; gap: .5rem; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--carbon-text-muted); padding: .35rem .3rem .2rem .6rem; }

.col-check { display: flex; align-items: center; gap: .6rem; min-height: 2rem; padding: 0 .4rem; border-radius: var(--radius-control); text-align: left; }
.col-check:hover { background: var(--carbon-hover); }
.col-check:disabled { opacity: .55; cursor: default; }
.col-check:disabled:hover { background: none; }

.a-ctl { display: inline-flex; gap: .4rem; align-items: center; flex: none; }
.a-pw { position: relative; display: inline-flex; flex: none; }
.a-pw .field { padding-right: 2.3rem; }
.a-eye { position: absolute; right: .35rem; top: 50%; translate: 0 -50%; width: 1.6rem; height: 1.6rem; display: grid; place-items: center; color: var(--carbon-text-muted); border-radius: var(--radius-control); }
.a-eye svg { width: .95rem; height: .95rem; }
.a-eye:hover { color: var(--carbon-text); }
.a-dd { display: inline-flex; align-items: center; justify-content: space-between; gap: .5rem; text-align: left; cursor: pointer; }
.a-dd span { display: inline-flex; align-items: center; gap: .45rem; overflow: hidden; white-space: nowrap; }
.a-dd svg { width: .8rem; height: .8rem; flex: none; color: var(--carbon-text-sub); }
.a-dd:hover { background: var(--carbon-hover-raised); }

.track { position: relative; height: .6rem; margin: .9rem 0 .2rem; border-radius: var(--radius-pill); background: var(--carbon-surface3); overflow: hidden; }
.fill { position: absolute; inset: 0 auto 0 0; width: 0; border-radius: inherit; background: var(--accent); transition: width .25s linear; overflow: hidden; }
.fill::after { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 20%, rgb(255 255 255 / .45) 50%, transparent 80%); translate: -100% 0; animation: shine 1.6s ease-in-out infinite; }
@keyframes shine { to { translate: 100% 0; } }
@media (prefers-reduced-motion: reduce) { .fill::after { animation: none !important; } }

.cpick { --h: 0; --c: #888; position: fixed; z-index: 95; width: 18.5rem; padding: .8rem; display: flex; flex-direction: column; gap: .75rem; }
.cp-sv { position: relative; height: 10rem; border-radius: var(--radius-control); background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(var(--h) 100% 50%)); cursor: crosshair; touch-action: none; outline: none; }
.cp-hue { position: relative; height: .8rem; border-radius: var(--radius-pill); background: linear-gradient(90deg, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00); cursor: pointer; touch-action: none; outline: none; }
.cp-knob { position: absolute; top: 50%; width: 1.1rem; height: 1.1rem; margin: -.55rem 0 0 -.55rem; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 2px #fff, 0 1px 4px rgba(0, 0, 0, .45); pointer-events: none; }
.cp-hue .cp-knob { background: hsl(var(--h) 100% 50%); }
.cp-foot { display: flex; align-items: center; gap: .55rem; }
.cp-now { width: 1.6rem; height: 1.6rem; border-radius: 50%; background: var(--c); flex: none; box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 30%, transparent); }
.cp-name { flex: 1; min-width: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-hex { width: 6.2rem; flex: none; }
.cp-act { display: flex; justify-content: flex-end; }

.menu, .cpick { position: relative; z-index: auto; }
.lrow { display: flex; align-items: center; gap: .6rem; height: 2.25rem; padding: 0 .5rem; border-radius: var(--radius-control); font-size: 13px; }
.lrow:hover { background: var(--carbon-hover); }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; }
.col { display: grid; gap: .75rem; }
`;

const PICKED = "#1b6b73";
const hsv = hexToHsv(PICKED)!;

const MENU = `<div class="menu glim-card" role="menu">
  <div class="head">Datei</div>
  <button role="menuitem">${g("IconFolderOpen")}<span>Öffnen</span><span class="kbd">Enter</span></button>
  <button role="menuitem">${g("IconPencil")}<span>Umbenennen</span><span class="kbd">F2</span></button>
  <button role="menuitem" disabled>${g("IconPaste")}<span>Einfügen</span><span class="kbd">Strg+V</span></button>
  <div class="sep"></div>
  <button role="menuitem" aria-haspopup="menu">${g("IconSort")}<span>Sortieren nach</span><span class="chev">${g("IconExpand")}</span></button>
  <button role="menuitemcheckbox" aria-checked="true"><span class="cbox on" role="presentation">${g("IconCheck")}</span><span>Versteckte Dateien</span></button>
  <button role="menuitemcheckbox" aria-checked="false"><span class="cbox" role="presentation">${g("IconCheck")}</span><span>Dateiendungen</span></button>
  <button role="menuitemradio" aria-checked="true" class="on">${g("IconTabApps")}<span>Details</span><span class="tick">${g("IconCheck")}</span></button>
  <button role="menuitem">${g("IconTrash")}<span>Papierkorb</span><span class="cnt glim-num">12</span></button>
</div>`;

/** Each row of the calibration page, as the prototype draws it. */
export const PROTOTYPE_ROWS: Record<string, string> = {
  button: `<div class="row">
  <button class="btn">${g("IconRefresh")}Aktualisieren</button>
  <button class="btn primary">${g("IconCheck")}Übernehmen</button>
  <button class="btn icon" aria-label="Kopieren">${g("IconCopy")}</button>
  <button class="btn" disabled>${g("IconTrash")}Löschen</button>
</div>`,
  switch: `<div class="col" style="width: 20rem">
  <div class="frow"><span class="lab">Versteckte Dateien</span><button class="sw" role="switch" aria-checked="true"></button></div>
  <div class="frow"><span class="lab">Dateiendungen</span><button class="sw" role="switch" aria-checked="false"></button></div>
</div>`,
  selector: `<div class="seg"><button aria-pressed="true">${g("IconTabApps")}Details</button><button aria-pressed="false">${g("IconTabGeneral")}Liste</button><button aria-pressed="false">${g("IconFolderOpen")}Kacheln</button></div>`,
  dropdown: `<button class="field m a-dd"><span>Name</span>${g("IconExpand")}</button>`,
  field: `<input class="field w" value="Urlaub 2026" aria-label="Name">`,
  password: `<span class="a-pw"><input type="password" class="field w" autocomplete="new-password" value="geheim123" aria-label="Passwort"><button class="a-eye" type="button" aria-label="Anzeigen">${g("IconEye")}</button></span>`,
  copy: `<span class="a-ctl"><input class="field w mono" readonly value="smb://bottich/media/filme" aria-label="Adresse"><button class="btn icon" aria-label="Kopieren">${g("IconCopy")}</button></span>`,
  menu: MENU,
  menubar: `<nav class="menubar" aria-label="Menü"><button>Datei</button><button>Bearbeiten</button><button>Ansicht</button><button>Hilfe</button></nav>`,
  window: `<div class="win glim-card" role="dialog" aria-label="Spalten"><span class="notch">Spalten</span>
  <div class="win-body"><div class="well"><div class="frow"><span class="lab">Größe</span><button class="sw" role="switch" aria-checked="true"></button></div><div class="frow"><span class="lab">Geändert</span><button class="sw" role="switch" aria-checked="false"></button></div></div></div>
  <div class="win-foot"><span class="start">Ziehen ändert die Reihenfolge</span><button class="btn">${g("IconClose")}Abbrechen</button><button class="btn primary">${g("IconCheck")}Übernehmen</button></div>
</div>`,
  checkbox: `<div class="col" style="gap: .25rem">
  <button class="col-check" type="button" role="checkbox" aria-checked="true"><span class="cbox on">${g("IconCheck")}</span>Größe</button>
  <button class="col-check" type="button" role="checkbox" aria-checked="false"><span class="cbox">${g("IconCheck")}</span>Geändert</button>
  <button class="col-check" type="button" role="checkbox" aria-checked="true" disabled><span class="cbox on">${g("IconCheck")}</span>Name</button>
</div>`,
  kbd: `<div class="row"><span class="kbd">Strg+K</span><span class="kbd">F2</span><span class="kbd">Entf</span></div>`,
  pill: `<div class="row"><span class="pill glim-num">4,2 GB</span><span class="pill state">läuft</span><span class="pill ok">fertig</span><span class="pill warn">wartet</span><span class="pill fault">Fehler</span></div>`,
  meter: `<div class="col" style="width: 20rem">
  <div class="row">disk1 <span class="vmeter"><i style="width:42%"></i></span></div>
  <div class="row">cache <span class="vmeter full"><i style="width:95%"></i></span></div>
  <span class="dbar"><i style="width:31%"></i></span>
  <span class="dbar full"><i style="width:92%"></i></span>
</div>`,
  footmeter: `<div class="lfoot" style="width: 22rem"><span>3 Elemente</span><span style="flex: 1"></span><button class="lfree"><span>1,4 TB frei</span><span class="meter"><i style="width:66%"></i></span></button></div>`,
  rowcheck: `<div class="col" style="width: 18rem; gap: 2px">
  <div class="lrow"><span class="glyph"><span class="cbox on">${g("IconCheck")}</span></span>thumbs.db</div>
  <div class="lrow"><span class="glyph"><span class="cbox">${g("IconCheck")}</span></span>desktop.ini</div>
  <div class="lrow"><span class="glyph"><span class="cbox">${g("IconCheck")}</span></span>old-cache.tmp</div>
</div>`,
  progress: `<div class="col" style="width: 22rem">
  <div class="track" style="margin: 0"><div class="fill" style="width:62%"></div></div>
  <span class="bar"><i style="width:40%"></i></span>
</div>`,
  colour: `<div class="cpick glim-card" style="--h: ${hsv.h}; --c: ${PICKED}">
  <div class="cp-sv" tabindex="0" role="slider" aria-label="Sättigung und Helligkeit"><i class="cp-knob" style="left:${hsv.s * 100}%;top:${(1 - hsv.v) * 100}%"></i></div>
  <div class="cp-hue" tabindex="0" role="slider" aria-label="Farbton"><i class="cp-knob" style="left:${hsv.h / 3.6}%"></i></div>
  <div class="cp-foot"><i class="cp-now"></i><span class="cp-name">Petrol</span><input class="field cp-hex mono" maxlength="7" aria-label="Farbwert" spellcheck="false" value="${PICKED}"></div>
  <div class="cp-act"><button class="btn primary cp-ok">${g("IconCheck")}Übernehmen</button></div>
</div>`,
};
