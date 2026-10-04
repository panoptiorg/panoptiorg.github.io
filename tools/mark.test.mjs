// Tests for src/js/mark.js: run with `node --test tools/`
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { frame, setup } from '../src/js/mark.js';

const include = fs.readFileSync(new URL('../_includes/mark-l.svg', import.meta.url), 'utf8');

// "M8 -5h3v1h-3z..." -> the set of "x,y" pixels it fills
function pixels(d) {
  const set = new Set();
  for (const [, x, y, w] of d.matchAll(/M(-?\d+) (-?\d+)h(\d+)v1h-\d+z/g)) {
    for (let i = 0; i < Number(w); i++) set.add(`${Number(x) + i},${y}`);
  }
  return set;
}

const { cells, plan } = setup();

test('the still frame is the static L logo shipped in the page', () => {
  const still = frame(cells, plan, null);
  const layers = [...include.matchAll(/data-layer="(\w+)" fill="#\w+" d="([^"]+)"/g)];
  assert.equal(layers.length, 5);
  for (const [, layer, d] of layers) {
    assert.deepEqual([...pixels(still[layer])].sort(), [...pixels(d)].sort(), `layer ${layer}`);
  }
});

test('every frame of a full cycle stays on the grid and never overlaps itself', () => {
  for (let ms = 0; ms < 60000; ms += 40) {
    const f = frame(cells, plan, ms);
    const seen = new Set();
    for (const layer of ['ring0', 'ring1', 'ring2', 'red', 'tower']) {
      for (const p of pixels(f[layer])) {
        const [x, y] = p.split(',').map(Number);
        assert.ok(x >= -8 && x < 31 && y >= -8 && y < 31, `pixel ${p} outside the view box at ${ms} ms`);
        assert.ok(!seen.has(p), `pixel ${p} drawn twice at ${ms} ms`);
        seen.add(p);
      }
    }
    assert.ok(f.red.length > 0, `no taint at ${ms} ms`);
  }
});

test('the taint routes start at home, step to neighbours and end on the outer ring', () => {
  assert.equal(plan.routes.length, 6);
  for (const route of plan.routes) {
    assert.equal(route[0], 5);
    assert.equal(cells[route[route.length - 1]].ring, 2);
    for (let i = 1; i < route.length; i++) {
      const a = cells[route[i - 1]], b = cells[route[i]];
      assert.ok(Math.abs(a.x - b.x) <= 5 && Math.abs(a.y - b.y) <= 5, 'route jumps');
    }
  }
});
