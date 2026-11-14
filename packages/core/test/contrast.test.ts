import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accentHovers, accentInks, contrastOn, contrastRatio, MIN_TEXT_CONTRAST } from '../src/contrast.ts';
import { ACCENTS } from '../src/appearance.ts';
import { darkenTo, INK_LIGHTNESS, lightenTo } from '../src/oklab.ts';

const EXTREMES = {
  'near white': '#FAFAFA',
  'near black': '#050505',
  'mid grey': '#777777',
  'saturated blue': '#0000FF',
  yellow: '#FFFF00',
  'the crossover grey': '#7B7B7B',
};

// The grounds accent text sits on: each ramp's page ground and card.
const LIGHT_GROUNDS = ['#FFFFFF'];
const DARK_GROUNDS = ['#161616', '#262626'];
const OLED_GROUNDS = ['#000000', '#161616'];

// The stylesheet's own steps, where applyAccent sets nothing.
const lightInk = (hex: string) => accentInks(hex).light ?? darkenTo(hex, INK_LIGHTNESS.light);
const darkInk = (hex: string) => accentInks(hex).dark ?? lightenTo(hex, INK_LIGHTNESS.dark);

test('black on white is 21:1 and a colour on itself is 1:1', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21);
  assert.equal(contrastRatio('#FCC419', '#FCC419'), 1);
});

test('the ratio is the same whichever colour comes first', () => {
  assert.equal(contrastRatio('#1D99F3', '#161616'), contrastRatio('#161616', '#1D99F3'));
});

for (const [name, hex] of Object.entries(EXTREMES)) {
  test(`the ink on a ${name} fill reaches 4.5:1`, () => {
    assert.ok(contrastRatio(contrastOn(hex), hex) >= MIN_TEXT_CONTRAST);
  });

  test(`a ${name} accent reads at 4.5:1 as text on every ramp`, () => {
    for (const g of LIGHT_GROUNDS) assert.ok(contrastRatio(lightInk(hex), g) >= MIN_TEXT_CONTRAST, `light on ${g}`);
    for (const g of DARK_GROUNDS) assert.ok(contrastRatio(darkInk(hex), g) >= MIN_TEXT_CONTRAST, `dark on ${g}`);
    for (const g of OLED_GROUNDS) assert.ok(contrastRatio(darkInk(hex), g) >= MIN_TEXT_CONTRAST, `OLED on ${g}`);
  });
}

test('a light fill takes the near-black ink and a dark one white', () => {
  assert.equal(contrastOn('#FAFAFA'), '#161616');
  assert.equal(contrastOn('#FFFF00'), '#161616');
  assert.equal(contrastOn('#050505'), '#FFFFFF');
  assert.equal(contrastOn('#0000FF'), '#FFFFFF');
});

test('a mid-tone where neither ink reaches 4.5:1 gets a black just dark enough', () => {
  const ink = contrastOn('#7B7B7B');
  assert.notEqual(ink, '#161616');
  assert.notEqual(ink, '#FFFFFF');
  const v = parseInt(ink.slice(1, 3), 16);
  assert.ok(v < 0x16);
  // One step lighter would fall short, so the push went no further than it had to.
  const lighter = '#' + (v + 1).toString(16).padStart(2, '0').repeat(3);
  assert.ok(contrastRatio(lighter, '#7B7B7B') < MIN_TEXT_CONTRAST);
});

test('an accent that already reads keeps the stylesheet ink', () => {
  assert.deepEqual(accentInks('#FCC419'), { light: undefined, dark: undefined });
});

test('every colour gets an ink that reads at 4.5:1 on the card and on its own wash', () => {
  const misses: string[] = [];
  for (let r = 0; r < 256; r += 15) {
    for (let g = 0; g < 256; g += 15) {
      for (let b = 0; b < 256; b += 15) {
        const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
        const wash = (card: number) => '#' + [r, g, b].map((v) => Math.round(card + (v - card) * 0.14).toString(16).padStart(2, '0')).join('');
        const [light, dark] = [lightInk(hex), darkInk(hex)];
        for (const [ink, grounds] of [[light, ['#FFFFFF', wash(255)]], [dark, ['#262626', wash(38)]]] as const) {
          for (const g of grounds) if (contrastRatio(ink, g) < MIN_TEXT_CONTRAST) misses.push(`${hex} on ${g}`);
        }
      }
    }
  }
  assert.deepEqual(misses, []);
});

test('a hover the ink would not read on steps away from the ink instead', () => {
  const { light, dark } = accentHovers('#777777');
  assert.ok(light);
  assert.ok(contrastRatio(contrastOn('#777777'), light) >= MIN_TEXT_CONTRAST);
  assert.equal(dark, undefined);
});

test('every preset keeps the stylesheet hover on both ramps', () => {
  for (const a of ACCENTS) assert.deepEqual(accentHovers(a.hex), { light: undefined, dark: undefined }, a.name);
});

test('every preset keeps its stylesheet ink on both ramps', () => {
  for (const a of ACCENTS) assert.deepEqual(accentInks(a.hex), { light: undefined, dark: undefined }, a.name);
});

test('every preset fill carries an ink at 4.5:1', () => {
  for (const a of ACCENTS) assert.ok(contrastRatio(contrastOn(a.hex), a.hex) >= MIN_TEXT_CONTRAST, a.name);
});

test('anything but a six-digit hex gets white ink and no override', () => {
  assert.equal(contrastOn('red'), '#FFFFFF');
  assert.deepEqual(accentInks('#FFF'), { light: undefined, dark: undefined });
});
