// Tests for tools/shape.mjs: run with `node --test tools/`
import test from 'node:test';
import assert from 'node:assert/strict';
import { jsAtoms, cssAtoms, shape, frameGrid, verifyJs, verifyCss, PX_W, PX_H, SIZE } from './shape.mjs';

// code that is easy to break by moving whitespace around
const TRICKY_JS = `
const a = \`x\${1 + 2}y\${\`nested \${3}\`}\`;
const e = \`\`;
const t = \`\${a}\`;
const tag = String.raw\`a\\n\${a}\`;
function f(x) { return x; }
function g() { return; }
function* gen() { yield 1; yield; }
const h = async () => { await f(1); };
const i = async function () { return 2; };
let n = 0; n++; n--; ++n; --n;
const r = /ab+c/gi.test('abbc') ? 1 / 2 / 3 : n / 2;
const d = n - -1 + +n - --n + n++ - n--;
outer: for (const k of [1, 2]) { if (k) continue outer; else break outer; }
try { throw new Error('x'); } catch { n = 1; }
class C { static s = 1; #p = 2; get v() { return this.#p; } set v(x) { this.#p = x; } static { C.s++; } }
const o = { 'a b': 1, async m() {}, *g() {}, get z() { return 1; } };
const big = 10n ** 3n;
const num = 1..toString() + 1.5.toFixed(1) + 0x10 + .5 + 1e3;
const opt = o?.a ?? o?.['a b'];
const arr = x => x * 2;
const re2 = /[/]/.source + /\\//.source + (n < !n);
const z = n ? .5 : 1;
export { f, g, gen, h, i, r, d, big, num, opt, arr, re2, z, C, tag, e, t };
`;

const TRICKY_CSS = `
:root{--black:#0b0b0b;--font:"IBM Plex Sans",system-ui,sans-serif;--pad: 72px}
a:hover,a:focus-visible{color:var(--green,#5cc47f);text-underline-offset:3px}
header nav > a + a ~ span .x{margin:0 auto;padding:calc(100% - 2px) calc(1px*2)}
.btn::before{content:"> ";font:16px/1.5 var(--font)}
@media (max-width:640px) and (prefers-reduced-motion:reduce){.a .b{display:none!important}}
.g{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
[aria-pressed="true"]{background:rgb(0 0 0 / 50%)}
:is(h1,h2) :not(.x){color:red}
@keyframes blink{0%{opacity:0}to{opacity:1}}
@supports (display:grid){.c{display:grid}}
`;

// many lines of ordinary code, enough for several frames
const LONG_JS = Array.from({ length: 60 }, (_, k) => `export function step${k}(state, input) {
  const next = { ...state, count: state.count + ${k}, seen: [...state.seen, input] };
  if (next.count > ${k * 3}) { return { ...next, done: true }; }
  return next;
}`).join('\n');

function shaped(kind, src) {
  const { text } = shape(kind === 'js' ? jsAtoms(src) : cssAtoms(src));
  return text;
}

// every character inside the mask is code or comment, and nothing is drawn outside it
function silhouette(text, scale = 1) {
  const pw = PX_W * scale, ph = PX_H * scale;
  const lines = text.split('\n');
  const frameLines = (SIZE + 1) * ph; // a frame plus the gap after it
  let holes = 0, outside = 0, inside = 0;
  for (let n = 0; n * frameLines < lines.length; n++) {
    const grid = frameGrid(n);
    for (let row = 0; row < SIZE * ph; row++) {
      const line = lines[n * frameLines + row] ?? '';
      for (let col = 0; col < SIZE * pw; col++) {
        const on = grid[Math.floor(row / ph)][Math.floor(col / pw)] !== '';
        const ch = line[col] ?? ' ';
        if (on) { inside++; if (ch === ' ') holes++; } else if (ch !== ' ') outside++;
      }
      assert.ok(line.length <= SIZE * pw, `line ${n * frameLines + row} is too long`);
    }
  }
  return { holes, outside, inside };
}

test('tricky JS keeps its tokens and syntax tree', () => {
  const out = shaped('js', TRICKY_JS);
  verifyJs(TRICKY_JS, out);
  const s = silhouette(out);
  assert.equal(s.outside, 0);
});

test('long JS fills several frames and stays in shape', () => {
  const out = shaped('js', LONG_JS);
  verifyJs(LONG_JS, out);
  const s = silhouette(out);
  assert.equal(s.outside, 0);
  assert.ok(s.inside > 3 * SIZE * SIZE, 'expected several frames');
  assert.ok(s.holes / s.inside < 0.08, `too many holes: ${s.holes} of ${s.inside}`);
});

test('tricky CSS keeps its meaning', () => {
  const out = shaped('css', TRICKY_CSS);
  verifyCss(TRICKY_CSS, out);
  assert.equal(silhouette(out).outside, 0);
});

test('a descendant combinator never becomes a comment alone', () => {
  const out = shaped('css', '.a .b{color:red}'.repeat(200));
  verifyCss('.a .b{color:red}'.repeat(200), out);
  assert.doesNotMatch(out, /\.a\/\*/);
});

test('the checks catch real changes', () => {
  assert.throws(() => verifyJs('function f(){return 1;}', 'function f(){return\n1;}'));
  assert.throws(() => verifyJs('let a=1;a++;', 'let a=1;a\n++;'));
  assert.throws(() => verifyJs('const s=`a b`;', 'const s=`a  b`;'));
  assert.throws(() => verifyCss('a .b{color:red}', 'a.b{color:red}'));
  assert.throws(() => verifyCss('a{margin:0 auto}', 'a{margin:0auto}'));
});

test('an atom longer than a cell scales the drawing instead of failing', () => {
  const src = `export const s = '${'x'.repeat(40)}';`;
  const res = shape(jsAtoms(src));
  assert.equal(res.scale, 2);
  verifyJs(src, res.text);
  assert.equal(silhouette(res.text, 2).outside, 0);
});

test('frames cycle through the five shapes and the taint moves', () => {
  const key = (g) => g.map((r) => r.join(',')).join(';');
  const seen = new Set([0, 1, 2, 3, 4, 5].map((n) => key(frameGrid(n))));
  assert.equal(seen.size, 6);
  // frame 0 is the static logo: doors, the home cell red, a solid tower
  const g = frameGrid(0);
  assert.equal(g[14][6], 'r');
  assert.equal(g[11][11], 't');
});

// the same snippet at many different positions in the drawing: the layout must never matter
function atEveryOffset(kind, snippet, filler) {
  for (let k = 0; k < 60; k++) {
    const src = filler.repeat(k) + snippet;
    const { text } = shape(kind === 'js' ? jsAtoms(src) : cssAtoms(src));
    if (kind === 'js') verifyJs(src, text); else verifyCss(src, text);
  }
}

test('regex literals and numbers before a word keep their space', () => {
  atEveryOffset('js', 'export const r = [/a/ in o, /a/ instanceof RegExp, 1. in o];', 'void 0; ');
});

test('colons in at-rule selectors stay glued, wherever they land', () => {
  atEveryOffset('css', '@page :first{margin:0}@supports selector(:focus-visible){a:focus-visible{color:red}}', '.p{color:red}');
});

test('media features and calc keep working', () => {
  atEveryOffset('css', '@media (prefers-reduced-motion:reduce) and (min-width:600px){.a{width:calc(100% - 2px*3)}}', '.p{color:red}');
});

test('special comments are dropped, not a crash', () => {
  const src = '/*! license */\n.a{color:red}<!-- -->';
  verifyCss(src, shape(cssAtoms(src)).text);
});

test('a piece too long to draw is refused with a clear message', () => {
  assert.throws(() => shape(jsAtoms(`export const s = '${'x'.repeat(100)}';`)), /cannot be drawn/);
});
