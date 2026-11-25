import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAPTCHA_MARKS } from '../src/captchaMarks.ts';
import { DOWNLOAD_MARKS } from '../src/downloadMarks.ts';
import { MCP_MARKS } from '../src/mcpMarks.ts';
import { OFFICE_MARKS } from '../src/officeMarks.ts';
import { REGISTRY_MARKS } from '../src/registryMarks.ts';
import { SERVICE_MARKS } from '../src/serviceMarks.ts';
import { STORAGE_MARKS } from '../src/storageMarks.ts';
import { TRANSFER_MARKS } from '../src/transferMarks.ts';
import { VPN_MARKS } from '../src/vpnMarks.ts';
import { contrastRatio } from '../src/contrast.ts';

// The resting drawing of every brand mark, on the tile it rests on: surface2
// of each ramp. The floors are the generator's: 3:1 for a graphic on the dark
// tile, and on the light one a brand's own colour down to 1.35:1.
const catalogs = { CAPTCHA_MARKS, DOWNLOAD_MARKS, MCP_MARKS, OFFICE_MARKS, REGISTRY_MARKS, SERVICE_MARKS, STORAGE_MARKS, TRANSFER_MARKS, VPN_MARKS };
const marks = Object.entries(catalogs).flatMap(([set, entries]) =>
  Object.entries(entries).map(([id, mark]) => [`${set}.${id}`, mark.svg] as const),
);
const themes = [
  { name: 'light', side: 1, tile: '#e8e8e8', floor: 1.35 },
  { name: 'dark', side: 2, tile: '#393939', floor: 3 },
] as const;
const PAIR = /light-dark\(([^,()]+), ([^,()]+)\)/g;
const KEYWORD: Record<string, string> = { white: '#ffffff', black: '#000000' };

// Below this spread between its channels a colour shows no hue, only a tint of
// a few units the eye does not resolve.
const NEUTRAL_SPREAD = 8;

function hex(colour: string): string | undefined {
  const text = KEYWORD[colour.trim().toLowerCase()] ?? colour.trim();
  const rgb = text.match(/^rgb\(([\d.]+%?)[, ]+([\d.]+%?)[, ]+([\d.]+%?)/);
  if (rgb) {
    const byte = (v: string) => Math.round(v.endsWith('%') ? (parseFloat(v) * 255) / 100 : parseFloat(v));
    return '#' + rgb.slice(1, 4).map((v) => byte(v).toString(16).padStart(2, '0')).join('');
  }
  const short = text.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) return '#' + short.slice(1).map((c) => c + c).join('');
  return /^#[0-9a-f]{6}$/i.test(text) ? text : undefined;
}

function channels(colour: string): number[] {
  return [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16));
}

/** Every colour the drawing paints with in one theme, leaving out what a mask or a clip path only uses to say which parts show. */
function painted(svg: string, side: 1 | 2): string[] {
  const drawn = svg.replace(/<(mask|clipPath)\b.*?<\/\1>/gs, '').replace(PAIR, (_, light, dark) => (side === 1 ? light : dark));
  const found = [...drawn.matchAll(/(?:fill|stroke|stop-color)(?:="|:)(?:var\(--mark-(?:ink|cut), )?(#[0-9a-fA-F]{3,6}\b|rgb\([^)]*\)|white|black)/g)];
  return found.map((m) => hex(m[1]!)).filter((c): c is string => !!c);
}

test('every brand mark stands out from its resting tile in both themes', () => {
  for (const [id, svg] of marks) {
    for (const theme of themes) {
      const colours = painted(svg, theme.side);
      assert.ok(colours.length > 0, `${id} paints no colour this can read`);
      const best = Math.max(...colours.map((c) => contrastRatio(c, theme.tile)));
      assert.ok(best >= theme.floor, `${id} in ${theme.name}: ${best.toFixed(2)}:1 at best`);
    }
  }
});

test('a black or grey part turns white on the dark tile, since it carries no hue to stay close to', () => {
  for (const [id, svg] of marks) {
    for (const [, lightText, darkText] of svg.matchAll(PAIR)) {
      const light = hex(lightText!);
      const dark = hex(darkText!);
      if (!light || !dark || light.toLowerCase() === dark.toLowerCase()) continue;
      const rgb = channels(light);
      if (Math.max(...rgb) - Math.min(...rgb) > NEUTRAL_SPREAD) continue;
      const lifted = channels(dark);
      assert.ok(Math.max(...lifted) - Math.min(...lifted) <= NEUTRAL_SPREAD && contrastRatio(dark, '#393939') >= 10, `${id}: ${light} turns ${dark}`);
    }
  }
});
