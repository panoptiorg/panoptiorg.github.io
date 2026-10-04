#!/usr/bin/env node
// Shapes every JS and CSS file of the site into the panopti mark, the way donut.c is shaped like a donut.
//
//   src/js/**/*.js         -> assets/js/**/*.js     one file each
//   src/css/site/*.css     -> assets/css/site.css   concatenated in file-name order
//   src/css/**/*.css       -> assets/css/**/*.css   one file each (everything outside site/)
//
// A shaped file is a flipbook of the M mark (two rings around the tower), one frame per screenful:
// the frames cycle through the five shapes of the animated logo (doors, source lines, </>, bits,
// folders) while the red taint walks out of its home cell and back. Code fills the grey and white
// cells; the green tower is a solid comment, the cells on the taint's path are comments that say
// "taint". Nothing is minified away: every token of the source is kept, in order.
//
// Each output is parsed again and compared with its source (JS: same tokens and the same AST;
// CSS: the same stylesheet once css-tree has normalised both), so a shaped file can never behave
// differently from the readable one.
//
//   node tools/shape.mjs            write the shaped files
//   node tools/shape.mjs --check    exit 1 if a shaped file is missing, stale, or unexpected
//   node tools/shape.mjs --watch    reshape whenever something under src/ changes

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import * as csstree from 'css-tree';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'assets');

// One logo pixel is PX_W characters by PX_H lines: close to square in GitHub's code view and in
// most editors. A cell is 3 pixels, so the longest unbreakable piece of code (a string, a
// property name, a compound selector) must fit in 3 * PX_W characters; longer ones scale the
// whole file up instead of failing.
const PX_W = 8;
const PX_H = 3;
const FRAME_GAP = 1; // blank pixels between frames
const MAX_SCALE = 3; // the file grows with the square of the scale: refuse to go further
const SIZE = 23; // the M mark is 23 x 23 pixels

const JS_OPTS = { ecmaVersion: 'latest', sourceType: 'module' };

// ---------------------------------------------------------------------------------------------
// The mark: the same cells, shapes and taint routes as the animated logo on the site
// (src/js/mark.js draws the large version; this is the two-ring M mark).

const STYLES = ['door', 'code', 'tag', 'byte', 'folder'];
const INNER = [['T', 6, 0, 1, 2], ['TR', 10, 2, 0, 2], ['R', 12, 6, 0, 1], ['BR', 10, 10, 0, 0], ['B', 6, 12, 1, 0], ['BL', 2, 10, 2, 0], ['L', 0, 6, 2, 1], ['TL', 2, 2, 2, 2]];
const CODE = { T: ['##.', '.##', '###'], TR: ['###', '.#.', '##.'], R: ['#..', '.##', '.##'], BR: ['###', '##.', '.#.'], B: ['##.', '###', '#..'], BL: ['###', '.##', '##.'], L: ['#..', '.##', '###'], TL: ['##.', '.#.', '.##'] };
const CODE8 = Object.values(CODE);
const TAG = { L: ['.##', '##.', '.##'], R: ['##.', '.##', '##.'], B: ['..#', '.#.', '#..'] };
// the taint's routes from home (inner ring, lower left) out into the grey ring
const ROUTES = [
  ['BL', 'L', 'O9', 'O10', 'O11'],
  ['BL', 'B', 'O6', 'O5', 'O4'],
  ['BL', 'L', 'TL', 'O11', 'O0', 'O1'],
  ['BL', 'B', 'BR', 'O4', 'O3', 'O2'],
  ['BL', 'O8', 'O9', 'O10'],
  ['BL', 'O7', 'O6', 'O5'],
];

function markCells() {
  const sgn = (c) => (Math.abs(c) > 0.6 ? Math.sign(c) : 0);
  const cells = INNER.map(([key, x, y, dx, dy], i) => ({ ring: 'in', key, i, x: x + 4, y: y + 4, dx, dy }));
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 - 90) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    cells.push({ ring: 'out', key: 'O' + k, i: k, x: Math.round(10 + 10 * c), y: Math.round(10 + 10 * s), dx: 1 - sgn(c), dy: 1 - sgn(s) });
  }
  return cells;
}

function cellPattern(c, style) {
  const door = () => [0, 1, 2].map((y) => [0, 1, 2].map((x) => (x === c.dx && y === c.dy ? '.' : '#')).join(''));
  if (style === 'code') return c.ring === 'in' ? CODE[c.key] : CODE8[(c.i * 3) % 8];
  if (style === 'tag') return c.ring === 'in' && TAG[c.key] ? TAG[c.key] : door();
  if (style === 'byte') {
    const bits = c.ring === 'in' ? '01110000' : '011011110111';
    return bits[c.i] === '1' ? ['###', '###', '###'] : ['###', '#.#', '###'];
  }
  if (style === 'folder') return ['##.', '###', '###'];
  return door();
}

// the taint's position in frame n: out along a route and back, the whole path from home red
function taintPath(n) {
  const steps = [];
  for (const route of ROUTES) {
    for (let p = 0; p < route.length; p++) steps.push(route.slice(0, p + 1));
    for (let p = route.length - 2; p > 0; p--) steps.push(route.slice(0, p + 1));
  }
  return new Set(steps[n % steps.length]);
}

// frame n as a SIZE x SIZE grid: '' empty, 'c' code, 't' tower, 'r' taint
function frameGrid(n) {
  const style = STYLES[n % STYLES.length];
  const red = taintPath(n);
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
  for (const c of markCells()) {
    cellPattern(c, style).forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '#') grid[c.y + y][c.x + x] = red.has(c.key) ? 'r' : 'c';
    }));
  }
  const tower = style === 'code' ? [[10, 10], [11, 11], [10, 12], [12, 12]]
    : [10, 11, 12].flatMap((y) => [10, 11, 12].map((x) => [x, y]));
  for (const [x, y] of tower) grid[y][x] = 't';
  return grid;
}

// ---------------------------------------------------------------------------------------------
// Atoms: the code as a list of unbreakable strings. Between two atoms any amount of whitespace,
// newlines and comments is allowed; `req` marks the joints that need at least one real space.

class AtomList {
  constructor() { this.atoms = []; this.req = []; this.glue = false; this.space = false; }
  // the next atom is glued to the previous one (no whitespace allowed between them)
  none() { this.glue = true; }
  // whitespace is required before the next atom
  need() { this.space = true; }
  push(text) {
    if (text === '') return;
    if (this.glue && this.atoms.length) {
      this.atoms[this.atoms.length - 1] += (this.space ? ' ' : '') + text;
    } else {
      if (this.atoms.length) this.req.push(this.space);
      this.atoms.push(text);
    }
    this.glue = false; this.space = false;
  }
}

// JS: acorn's tokens. Template literals stay whole; a line break is never allowed where it would
// change the program (after return/throw/break/continue/yield/async, before ++/--/=>), so those
// pairs are glued; `req` joints are the ones where two tokens would run together.
const NO_BREAK_AFTER = new Set(['return', 'throw', 'break', 'continue', 'yield', 'async']);
const NO_BREAK_BEFORE = new Set(['++', '--', '=>']);

function jsTokens(src) {
  const tt = acorn.tokTypes;
  const toks = [];
  for (const t of acorn.tokenizer(src, JS_OPTS)) {
    toks.push({ type: t.type, raw: src.slice(t.start, t.end), value: t.value });
  }
  return { toks, tt };
}

function needsSpace(a, b, tt) {
  const x = a.raw[a.raw.length - 1], y = b.raw[0];
  const word = /[\w$\\\u0080-￿]/;
  if (word.test(x) && word.test(y)) return true;
  // `/a/ in o` would turn "in" into regex flags; `1. in o` would read "1.in"
  if ((a.type === tt.regexp || a.type === tt.num) && word.test(y)) return true;
  if (a.type === tt.num && y === '.') return true;
  if ((x === '+' || x === '-') && y === x) return true;
  if (x === '/' && (y === '/' || y === '*')) return true;
  if (x === '<' && y === '!') return true;
  if (a.raw.endsWith('--') && y === '>') return true;
  return false;
}

function jsAtoms(src) {
  const { toks, tt } = jsTokens(src);
  const list = new AtomList();
  toks.forEach((t, i) => {
    if (i > 0) {
      const p = toks[i - 1];
      const inTemplate = p.type === tt.template || t.type === tt.template || p.type === tt.invalidTemplate || t.type === tt.invalidTemplate;
      if (inTemplate || NO_BREAK_AFTER.has(p.raw) || NO_BREAK_BEFORE.has(t.raw)) list.none();
      if (!inTemplate && needsSpace(p, t, tt)) list.need();
    }
    list.push(t.raw === '' ? '\u0000' : t.raw);
  });
  // empty template chunks were kept as placeholders so the glue around them survives
  list.atoms = list.atoms.map((a) => a.replaceAll('\u0000', ''));
  return list;
}

// CSS: walk css-tree's AST. Compound selectors, numbers with units, strings and so on are atoms;
// a descendant combinator or a space between values is a required joint; around { } ; : , > + ~
// ( ) whitespace is optional. Comments are only ever added next to real whitespace or at those
// optional joints, never inside a token.
const CSS_PARSE = { parseValue: true, parseCustomProperty: true, positions: false };
// comments css-tree keeps (/*! ... */) and <!-- --> markers: dropped from the shaped file
const SKIP = new Set(['Comment', 'CDO', 'CDC']);

function cssParse(src) {
  return csstree.parse(src, { ...CSS_PARSE, onParseError: (e) => { throw new Error('CSS parse error: ' + e.formattedMessage); } });
}

function cssAtoms(src) {
  const list = new AtomList();
  const emitTokens = (text, mode) => {
    // a value or an at-rule prelude, as css-tree prints it: split at whitespace (required) and
    // next to punctuation (optional); glue everything else. Which punctuation is loose depends
    // on where we are: `/` and `*` (calc) in a declaration value, the `:` of a feature in
    // @media and @container. Elsewhere a colon may start a pseudo-class (`@page :first`,
    // `@supports selector(:focus-visible)`), so it stays glued.
    const parts = [];
    csstree.tokenize(text, (type, start, end) => parts.push({ type, s: text.slice(start, end) }));
    const T = csstree.tokenTypes;
    const loose = (p) => p.type === T.Comma
      || (mode === 'value' && p.type === T.Delim && (p.s === '/' || p.s === '*'))
      || (mode === 'media' && p.type === T.Colon);
    const open = (p) => p.type === T.Function || p.type === T.LeftParenthesis || loose(p);
    const close = (p) => p.type === T.RightParenthesis || loose(p);
    let prev = null, ws = false;
    for (const p of parts) {
      if (p.type === T.WhiteSpace) { ws = true; continue; }
      if (p.type === T.Comment) continue;
      if (prev) {
        if (ws) list.need();
        else if (!open(prev) && !close(p)) list.none();
      }
      list.push(p.s);
      prev = p; ws = false;
    }
  };
  const emitSelector = (sel) => {
    let compound = '';
    const flush = () => { list.push(compound); compound = ''; };
    sel.children.forEach((node) => {
      if (node.type !== 'Combinator') { compound += csstree.generate(node); return; }
      flush();
      if (node.name === ' ') list.need();
      else list.push(node.name);
    });
    flush();
  };
  const emitPrelude = (prelude, mode = 'other') => {
    if (prelude.type === 'SelectorList') {
      prelude.children.toArray().forEach((sel, i) => {
        if (i) list.push(',');
        if (sel.type === 'Selector') emitSelector(sel);
        else emitTokens(csstree.generate(sel), 'other');
      });
    } else emitTokens(csstree.generate(prelude), mode);
  };
  const emitBlock = (block) => {
    list.push('{');
    block.children.forEach((node) => {
      if (node.type === 'Declaration') {
        list.push(node.property);
        list.push(':');
        emitTokens(csstree.generate(node.value), 'value');
        if (node.important) list.push(node.important === true ? '!important' : '!' + node.important);
        list.push(';');
      } else if (!SKIP.has(node.type)) emitNode(node);
    });
    list.push('}');
  };
  const emitNode = (node) => {
    if (node.type === 'Rule') {
      emitPrelude(node.prelude);
      emitBlock(node.block);
    } else if (node.type === 'Atrule') {
      list.push('@' + node.name);
      const mode = node.name === 'media' || node.name === 'container' ? 'media' : 'other';
      if (node.prelude) { list.need(); emitPrelude(node.prelude, mode); }
      if (node.block) emitBlock(node.block);
      else list.push(';');
    } else {
      throw new Error('CSS: unsupported top-level node ' + node.type);
    }
  };
  cssParse(src).children.forEach((node) => { if (!SKIP.has(node.type)) emitNode(node); });
  return list;
}

// ---------------------------------------------------------------------------------------------
// Layout: pour the atoms into the frames, row by row, run by run.

const FILL = 'panopti';

function comment(width, pattern, offset = 0) {
  let body = '';
  for (let i = 0; i < width - 4; i++) body += pattern[(offset + i) % pattern.length];
  return '/*' + body + '*/';
}

function shape(list) {
  const { atoms, req } = list;
  const longest = atoms.reduce((m, a) => Math.max(m, a.length), 0);
  // scale up (never down) so the longest atom fits in a full cell row
  const scale = Math.max(1, Math.ceil(longest / (3 * PX_W)));
  if (scale > MAX_SCALE) {
    const piece = atoms.find((a) => a.length === longest);
    throw new Error(`a ${longest}-character piece cannot be drawn (the limit is ${3 * PX_W * MAX_SCALE}; split it): ${piece.slice(0, 60)}...`);
  }
  const pw = PX_W * scale, ph = PX_H * scale;
  let pos = 0, fillAt = 0;
  const frames = [];

  // fill one run of code cells of the given width; returns its text (exactly `width` chars)
  const fillRun = (width) => {
    if (pos >= atoms.length) { const s = comment(width, FILL, fillAt); fillAt += width; return s; }
    const placed = [];
    let used = 0;
    while (pos + placed.length < atoms.length) {
      const k = pos + placed.length;
      const sep = placed.length && req[k - 1] ? 1 : 0;
      if (used + sep + atoms[k].length > width) break;
      placed.push({ text: atoms[k], sep });
      used += sep + atoms[k].length;
    }
    const end = pos + placed.length >= atoms.length;
    let slack = width - used;
    const last = placed.length ? placed[placed.length - 1].text : '';
    const commentGap = last.endsWith('/') ? 1 : 0; // never write "//" or "/*" by accident
    if (slack > 0 && slack < 4 + commentGap && placed.length > 1) {
      // too small for a comment: widen the joints inside the run instead
      for (let j = 1; slack > 0; j = j % (placed.length - 1) + 1) { placed[j].sep++; slack--; }
    } else if (slack > 0 && slack < 4 + commentGap && placed.length === 1 && !end && width < 3 * pw) {
      // a single atom that leaves a sliver: try it in a later run instead
      placed.pop(); slack = width;
    }
    let s = placed.map((p) => ' '.repeat(p.sep) + p.text).join('');
    pos += placed.length;
    if (slack >= 4 + (placed.length ? commentGap : 0)) {
      if (placed.length && commentGap) { s += ' '; slack--; }
      s += comment(slack, FILL, fillAt); fillAt += slack;
    } else if (slack > 0) {
      s += ' '.repeat(slack); // last resort, only for a lone atom in a full-width run
    }
    return s;
  };

  for (let n = 0; pos < atoms.length || n === 0; n++) {
    const grid = frameGrid(n);
    const lines = [];
    for (let py = 0; py < SIZE; py++) {
      for (let sub = 0; sub < ph; sub++) {
        let line = '';
        let x = 0;
        while (x < SIZE) {
          const kind = grid[py][x];
          if (!kind) { x++; continue; }
          let x1 = x;
          while (x1 < SIZE && grid[py][x1] === kind) x1++;
          const width = (x1 - x) * pw;
          line = line.padEnd(x * pw, ' ');
          if (kind === 'c') line += fillRun(width);
          else if (kind === 't') line += comment(width, '#');
          else line += comment(width, 'taint~', sub * 2 + x);
          x = x1;
        }
        lines.push(line);
      }
    }
    frames.push(lines.join('\n'));
  }
  return { text: frames.join('\n'.repeat(FRAME_GAP * ph + 1)), frames: frames.length, scale };
}

// ---------------------------------------------------------------------------------------------
// Proof that the shaped file means exactly what the source means.

const json = (v) => JSON.stringify(v, (k, x) => (typeof x === 'bigint' ? x + 'n' : x));

function stripAst(node) {
  if (Array.isArray(node)) return node.map(stripAst);
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) if (k !== 'start' && k !== 'end' && k !== 'loc' && k !== 'range') out[k] = stripAst(v);
    return out;
  }
  return node;
}

function verifyJs(src, shaped) {
  const tokens = (s) => jsTokens(s).toks.map((t) => t.type.label + ' ' + json(t.value ?? null));
  const a = tokens(src), b = tokens(shaped);
  if (a.length !== b.length) throw new Error(`token count changed: ${a.length} -> ${b.length}`);
  a.forEach((t, i) => { if (t !== b[i]) throw new Error(`token ${i} changed: ${t} -> ${b[i]}`); });
  const astA = json(stripAst(acorn.parse(src, JS_OPTS)));
  const astB = json(stripAst(acorn.parse(shaped, JS_OPTS)));
  if (astA !== astB) throw new Error('the syntax tree changed');
}

// the stylesheet as css-tree prints it, without the comments the shaper drops
function cssCanon(src) {
  const ast = cssParse(src);
  csstree.walk(ast, { enter(node, item, list) { if (list && SKIP.has(node.type)) list.remove(item); } });
  return csstree.generate(ast);
}

function verifyCss(src, shaped) {
  const a = cssCanon(src), b = cssCanon(shaped);
  if (a !== b) {
    let i = 0; while (a[i] === b[i]) i++;
    throw new Error(`the stylesheet changed near: ${JSON.stringify(a.slice(Math.max(0, i - 40), i + 40))} vs ${JSON.stringify(b.slice(Math.max(0, i - 40), i + 40))}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Files

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  }).sort();
}

function jobs() {
  const list = [];
  for (const f of walk(path.join(SRC, 'js')).filter((f) => f.endsWith('.js'))) {
    list.push({ kind: 'js', out: path.join(OUT, 'js', path.relative(path.join(SRC, 'js'), f)), srcs: [f] });
  }
  const site = walk(path.join(SRC, 'css', 'site')).filter((f) => f.endsWith('.css'));
  if (site.length) list.push({ kind: 'css', out: path.join(OUT, 'css', 'site.css'), srcs: site });
  for (const f of walk(path.join(SRC, 'css')).filter((f) => f.endsWith('.css') && !f.startsWith(path.join(SRC, 'css', 'site') + path.sep))) {
    list.push({ kind: 'css', out: path.join(OUT, 'css', path.relative(path.join(SRC, 'css'), f)), srcs: [f] });
  }
  return list;
}

function build(job) {
  const rel = (p) => path.relative(ROOT, p);
  const src = job.srcs.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const list = job.kind === 'js' ? jsAtoms(src) : cssAtoms(src);
  const { text, frames, scale } = shape(list);
  const from = job.srcs.length === 1 ? rel(job.srcs[0]) : rel(path.dirname(job.srcs[0])) + '/*.css';
  const header = `/* panopti.org - ${rel(job.out)} - generated from ${from} by tools/shape.mjs; edit the source, not this file */`;
  const out = header + '\n\n' + text + '\n';
  try {
    if (job.kind === 'js') verifyJs(src, out); else verifyCss(src, out);
  } catch (e) {
    throw new Error(`${rel(job.out)}: shaped output differs from ${from}: ${e.message}`);
  }
  if (scale > 1) {
    const longest = list.atoms.reduce((a, b) => (b.length > a.length ? b : a), '');
    console.warn(`warning: ${rel(job.out)} drawn at ${scale}x because of a ${longest.length}-character piece: ${longest.slice(0, 60)}`);
  }
  return { out, frames, scale };
}

function run({ check }) {
  const list = jobs();
  const expected = new Set(list.map((j) => j.out));
  let stale = 0;
  for (const job of list) {
    const rel = path.relative(ROOT, job.out);
    const { out, frames } = build(job);
    const current = fs.existsSync(job.out) ? fs.readFileSync(job.out, 'utf8') : null;
    if (check) {
      if (current !== out) { console.error(`stale: ${rel} (run: npm run shape)`); stale++; }
      continue;
    }
    if (current !== out) {
      fs.mkdirSync(path.dirname(job.out), { recursive: true });
      fs.writeFileSync(job.out, out);
    }
    console.log(`${rel}: ${frames} frame${frames === 1 ? '' : 's'}, ${out.length} bytes`);
  }
  // shaped files whose source is gone
  for (const f of [...walk(path.join(OUT, 'js')), ...walk(path.join(OUT, 'css'))]) {
    if ((f.endsWith('.js') || f.endsWith('.css')) && !expected.has(f)) {
      console.error(`orphan: ${path.relative(ROOT, f)} has no source under src/ (delete it or add the source)`);
      stale++;
    }
  }
  if (check && stale) process.exit(1);
  if (check) console.log(`ok: ${list.length} shaped files match their sources`);
  return stale;
}

export { jsAtoms, cssAtoms, shape, frameGrid, verifyJs, verifyCss, PX_W, PX_H, SIZE };

// run only when executed, not when imported by the tests
const realArg = () => { try { return fs.realpathSync(process.argv[1]); } catch { return null; } };
const main = process.argv[1] && realArg() === fs.realpathSync(fileURLToPath(import.meta.url));
if (main) {
  const args = new Set(process.argv.slice(2));
  if (args.has('--watch')) {
    const go = () => { try { run({ check: false }); } catch (e) { console.error(e.message); } };
    go();
    let timer = null;
    fs.watch(SRC, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(go, 150); });
    console.log('watching src/ ...');
  } else {
    try {
      run({ check: args.has('--check') });
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  }
}
