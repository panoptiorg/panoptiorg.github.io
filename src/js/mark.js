// The animated panopti mark, size L: the two-ring logo plus one ring of services.
//
// The page ships the still frame as inline SVG (_includes/mark-l.svg: every cell a door, the
// taint at home), so nothing is missing without JavaScript. When motion is allowed, every
// svg[data-live] is redrawn every 40 ms:
//   shapes  the five cell styles cycle (doors, source lines, </>, bits, folders); each change is
//           spread over 800 ms, every cell switching at its own fixed random moment, then the
//           full frame holds for 1200 ms;
//   taint   a red path walks from the home cell (inner ring, lower left) out to the outer ring
//           along one of six routes and back, one step every 240 ms; routes shorter than five
//           cells hold each step longer, and the path rests five beats at home between routes.
// Under prefers-reduced-motion, in a hidden tab or off screen, nothing moves. If the mark sits in
// a button[data-mark-toggle], the button pauses and resumes it (WCAG 2.2.2).
//
// Strings stay short on purpose: tools/shape.mjs lays this file out in the shape of the logo,
// and no unbreakable piece may be wider than one cell of that drawing (24 characters).

const STYLES = ['door', 'code', 'tag', 'byte', 'folder'];
const WAVE_MS = 800;
const HOLD_MS = 1200;
const HOP_MS = 240;
const TICK_MS = 40;
// where each taint route heads, as screen angles (0 = right, 90 = down), in visiting order
const TARGETS = [195, 95, 245, 20, 160, 300];
const HOME = 5; // id of the inner lower-left cell
const REDUCE = '(prefers-reduced-' + 'motion: reduce)';

// the inner ring: [key, x, y, door x, door y] on the 3 x 3 grid of each cell
const INNER = [
  ['T', 6, 0, 1, 2], ['TR', 10, 2, 0, 2], ['R', 12, 6, 0, 1], ['BR', 10, 10, 0, 0],
  ['B', 6, 12, 1, 0], ['BL', 2, 10, 2, 0], ['L', 0, 6, 2, 1], ['TL', 2, 2, 2, 2],
];
// source lines: each inner cell its own three lines of code
const CODE = {
  T: ['##.', '.##', '###'], TR: ['###', '.#.', '##.'],
  R: ['#..', '.##', '.##'], BR: ['###', '##.', '.#.'],
  B: ['##.', '###', '#..'], BL: ['###', '.##', '##.'],
  L: ['#..', '.##', '###'], TL: ['##.', '.#.', '.##'],
};
const CODE8 = Object.values(CODE);
// the hidden </>: left, bottom and right of the inner ring
const TAG = {
  L: ['.##', '##.', '.##'],
  R: ['##.', '.##', '##.'],
  B: ['..#', '.#.', '#..'],
};
const FULL = ['###', '###', '###'];
const HOLLOW = ['###', '#.#', '###'];
const FOLDER = ['##.', '###', '###'];
// bits: the inner ring is 0x70 ('p'), the grey ring the first bits of "or",
// the outer ring "panopti.org " in ASCII
const BITS_IN = '01110000';
const BITS_MID = '011011110111';
const BITS_OUT = Array.from('panopti.org ', (ch) => ch.charCodeAt(0).toString(2).padStart(8, '0')).join('');

const pixel = (x, y) => 'M' + x + ' ' + y + 'h1v1h-1z';
const TOWER = 'M10 10h3v3h-3z';
// in the source-lines frame the tower is a >_ prompt
const PROMPT = [[10, 10], [11, 11], [10, 12], [12, 12]].map(([x, y]) => pixel(x, y)).join('');

// a fixed pseudo-random number in [0, 1) for each id
function seed(id) {
  const s = Math.sin(id * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function sign(c) {
  return Math.abs(c) > 0.6 ? Math.sign(c) : 0;
}

// ring 0: the logo's inner ring; ring 1: its grey ring; ring 2: the services around it.
// Every door faces the tower.
function buildCells() {
  const cells = [];
  const add = (cell) => {
    cell.id = cells.length;
    cells.push(cell);
  };
  INNER.forEach(([key, x, y, dx, dy], i) => add({ ring: 0, key, i, x: x + 4, y: y + 4, dx, dy }));
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 - 90) * Math.PI / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    add({ ring: 1, key: 'O' + k, i: k, x: Math.round(10 + 10 * c), y: Math.round(10 + 10 * s), dx: 1 - sign(c), dy: 1 - sign(s) });
  }
  // radius 15, twenty cells, shifted half a step so none collides with the grey ring
  for (let k = 0; k < 20; k++) {
    const a = ((k + 0.5) * 360 / 20 - 90) * Math.PI / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    add({ ring: 2, key: 'S' + k, i: k, x: Math.floor(10 + 15 * c + 0.5), y: Math.floor(10 + 15 * s + 0.5), dx: 1 - sign(c), dy: 1 - sign(s) });
  }
  for (const c of cells) {
    c.scr = (Math.atan2(c.y + 1 - 11.5, c.x + 1 - 11.5) * 180 / Math.PI + 360) % 360;
  }
  return cells;
}

// The taint's routes: shortest walks between neighbouring cells from home to the outer ring,
// so they never cross the tower. Each step is [route, how far along it the head is].
function buildPlan(cells) {
  const near = (a, b) => a !== b && Math.abs(a.x - b.x) <= 5 && Math.abs(a.y - b.y) <= 5;
  const next = cells.map((a) => cells.filter((b) => near(a, b)).map((b) => b.id));
  const prev = new Map([[HOME, -1]]);
  const queue = [HOME];
  for (let q = 0; q < queue.length; q++) {
    for (const id of next[queue[q]]) {
      if (!prev.has(id)) {
        prev.set(id, queue[q]);
        queue.push(id);
      }
    }
  }
  const walkTo = (to) => {
    const path = [];
    for (let id = to; id !== -1 && id !== undefined; id = prev.get(id)) path.unshift(id);
    return path;
  };
  const outer = cells.filter((c) => c.ring === 2);
  const routes = [];
  const steps = [];
  for (const deg of TARGETS) {
    let best = { d: 999, id: outer[0].id };
    for (const c of outer) {
      const d = Math.abs(((c.scr - deg + 540) % 360) - 180);
      if (d < best.d) best = { d, id: c.id };
    }
    const route = walkTo(best.id);
    const r = routes.push(route) - 1;
    const hold = Math.max(1, Math.round(5 / route.length));
    for (let p = 0; p < route.length; p++) for (let h = 0; h < hold; h++) steps.push([r, p]);
    for (let p = route.length - 2; p >= 0; p--) for (let h = 0; h < hold; h++) steps.push([r, p]);
    for (let k = 0; k < 5; k++) steps.push([r, 0]);
  }
  return { routes, steps };
}

function pattern(c, style) {
  if (style === 'code') return c.ring === 0 ? CODE[c.key] : CODE8[(c.i * 3 + c.ring) % 8];
  if (style === 'tag' && c.ring === 0 && TAG[c.key]) return TAG[c.key];
  if (style === 'byte') {
    let bit = BITS_OUT[c.id % BITS_OUT.length];
    if (c.ring === 0) bit = BITS_IN[c.i];
    if (c.ring === 1) bit = BITS_MID[c.i];
    return bit === '1' ? FULL : HOLLOW;
  }
  if (style === 'folder') return FOLDER;
  // a door: the cell with one pixel open towards the tower
  return [0, 1, 2].map((y) => [0, 1, 2].map((x) => (x === c.dx && y === c.dy ? '.' : '#')).join(''));
}

// one cell's pixels as an SVG path, a rectangle per run of filled pixels
function cellPath(c, rows) {
  let d = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < 3;) {
      if (row[x] !== '#') {
        x++;
        continue;
      }
      const x0 = x;
      while (x < 3 && row[x] === '#') x++;
      d += 'M' + (c.x + x0) + ' ' + (c.y + y) + 'h' + (x - x0) + 'v1h-' + (x - x0) + 'z';
    }
  });
  return d;
}

// The paths of the frame at time ms; ms = null gives the still frame (the static logo).
export function frame(cells, plan, ms) {
  const period = WAVE_MS + HOLD_MS;
  const styleAt = (angle) => {
    if (ms === null) return 'door';
    const n = Math.floor((ms - (angle / 360) * WAVE_MS) / period);
    return STYLES[((n % STYLES.length) + STYLES.length) % STYLES.length];
  };
  let red = [HOME];
  if (ms !== null) {
    const [r, p] = plan.steps[Math.floor(ms / HOP_MS) % plan.steps.length];
    red = plan.routes[r].slice(0, p + 1);
  }
  const out = { ring0: '', ring1: '', ring2: '', red: '', tower: '' };
  for (const c of cells) {
    // each cell changes at its own fixed moment within the wave
    const d = cellPath(c, pattern(c, styleAt(seed(c.id + 7) * 360)));
    if (red.includes(c.id)) out.red += d;
    else out['ring' + c.ring] += d;
  }
  out.tower = styleAt(0) === 'code' ? PROMPT : TOWER;
  return out;
}

export function setup() {
  const cells = buildCells();
  return { cells, plan: buildPlan(cells) };
}

function animate(svg, model) {
  const layers = {};
  for (const el of svg.querySelectorAll('[data-layer]')) layers[el.dataset.layer] = el;
  const motion = window.matchMedia(REDUCE);
  const toggle = svg.closest('[data-mark-toggle]');
  let elapsed = 0; // animation time, which only advances while the mark is running
  let last = 0;
  let timer = 0;
  let visible = true;
  let paused = false;

  const draw = (ms) => {
    const paths = frame(model.cells, model.plan, ms);
    for (const key of Object.keys(layers)) layers[key].setAttribute('d', paths[key]);
  };
  const tick = () => {
    const now = performance.now();
    elapsed += now - last;
    last = now;
    draw(elapsed);
  };
  const sync = () => {
    const run = visible && !paused && !document.hidden && !motion.matches;
    if (run && !timer) {
      last = performance.now();
      timer = setInterval(tick, TICK_MS);
    } else if (!run && timer) {
      clearInterval(timer);
      timer = 0;
    }
    // reduced motion: the still frame, wherever the animation was
    if (motion.matches) draw(null);
    if (toggle) {
      toggle.disabled = motion.matches;
      toggle.setAttribute('aria-pressed', String(paused));
    }
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      paused = !paused;
      sync();
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      sync();
    }).observe(svg);
  }
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  sync();
}

if (typeof document !== 'undefined') {
  const svgs = document.querySelectorAll('svg[data-live]');
  if (svgs.length) {
    const model = setup();
    svgs.forEach((svg) => animate(svg, model));
  }
}
