import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const build = fileURLToPath(new URL('../../../scripts/build-tokens.mjs', import.meta.url));
const source = new URL('../tokens/', import.meta.url);

test('every file the tokens reach matches the DTCG source', () => {
  const run = spawnSync(process.execPath, [build, '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('every source token has a value, and a type where DTCG names one', () => {
  for (const file of readdirSync(source)) {
    const doc = JSON.parse(readFileSync(new URL(file, source), 'utf8'));
    for (const [id, group] of Object.entries<Record<string, { $value?: unknown; $type?: string }>>(doc)) {
      for (const [name, token] of Object.entries(group)) {
        if (name.startsWith('$')) continue;
        assert.ok(token.$value !== undefined, `${id}.${name}`);
        if (typeof token.$value === 'string' && /^#[0-9a-f]{6}$/i.test(token.$value)) assert.equal(token.$type, 'color', `${id}.${name}`);
      }
    }
  }
});

test('every Figma variable has a value in each mode of its collection', () => {
  const figma = JSON.parse(readFileSync(new URL('../figma-variables.json', import.meta.url), 'utf8'));
  const modes = new Map<string, string[]>();
  for (const m of figma.variableModes) modes.set(m.variableCollectionId, [...(modes.get(m.variableCollectionId) ?? []), m.id]);
  for (const v of figma.variables) {
    const set = figma.variableModeValues.filter((x: { variableId: string }) => x.variableId === v.id).map((x: { modeId: string }) => x.modeId).sort();
    assert.deepEqual(set, [...modes.get(v.variableCollectionId)!].sort(), v.name);
  }
});

test('the Figma colours carry the ramps the stylesheet paints', () => {
  const figma = JSON.parse(readFileSync(new URL('../figma-variables.json', import.meta.url), 'utf8'));
  const value = (name: string, mode: string) =>
    figma.variableModeValues.find((x: { variableId: string; modeId: string }) => x.variableId === `variable:colour.${name}` && x.modeId === `mode:Colour:${mode}`).value;
  const hex = (c: { r: number; g: number; b: number }) => '#' + [c.r, c.g, c.b].map((n) => Math.round(n * 255).toString(16).padStart(2, '0')).join('');
  assert.equal(hex(value('carbon-bg', 'Light')), '#f4f4f4');
  assert.equal(hex(value('carbon-bg', 'Dark')), '#161616');
  assert.equal(hex(value('carbon-bg', 'OLED')), '#000000');
});
