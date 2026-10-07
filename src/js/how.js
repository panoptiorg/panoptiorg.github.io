// /panopticode: the example's code tabs, the route rail, and the contract ids computed in the
// browser. The page is complete without this script: every figure is static, the code shows
// every file one under the other, and the contract ids are the ones the frontends wrote.
//
// Hashes. contractId is the frontends' own recipe: SHA-256 over parts, each prefixed with its
// length as 8 little-endian bytes (panoptife-go internal/hash/hash.go, panoptife-ts src/hash.ts,
// panopticode core/src/ids.rs). The page ships the values from _data/how.json; with Web Crypto,
// the script computes them again from the names on the page. tools/how.test.mjs runs the same
// functions in Node.
//
// Strings stay short on purpose: tools/shape.mjs lays this file out in the shape of the logo,
// and no unbreakable piece may be wider than one cell of that drawing (24 characters).

const REDUCE = '(prefers-reduced-' + 'motion: reduce)';
const enc = new TextEncoder();

export async function hashParts(parts) {
  const bytes = parts.map((p) => (typeof p === 'string' ? enc.encode(p) : p));
  const all = new Uint8Array(bytes.reduce((n, b) => n + 8 + b.length, 0));
  const view = new DataView(all.buffer);
  let at = 0;
  for (const b of bytes) {
    view.setBigUint64(at, BigInt(b.length), true);
    all.set(b, at + 8);
    at += 8 + b.length;
  }
  const sum = await crypto.subtle.digest('SHA-256', all);
  return Array.from(new Uint8Array(sum), (x) => x.toString(16).padStart(2, '0')).join('');
}

// a contract's id, the same in both frontends; GraphQL names use the "grpc" tag too
export function contractId(name) {
  return hashParts(['', '', name, 'grpc']);
}

// The rail: the step in the middle of the screen is "here", the ones before it are done, and
// the red line runs down to it (--p, 0 to 1).
function rail(nav) {
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const steps = links.map((a) => document.getElementById(a.hash.slice(1)));
  const list = nav.querySelector('ol');
  const mark = (i) => {
    links.forEach((a, k) => {
      if (k < i) a.dataset.s = 'd';
      else if (k === i) a.dataset.s = 'h';
      else delete a.dataset.s;
      if (k === i) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    list.style.setProperty('--p', String(i / (links.length - 1)));
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) mark(steps.indexOf(e.target));
    }
  }, { rootMargin: '-35% 0px -60% 0px' });
  for (const s of steps) {
    if (s) io.observe(s);
  }
}

// The example's code: one file at a time, picked by its tab or by its box in the map above.
// Without the script there are no tabs and every file shows, one under the other.
function tabs(box, motion) {
  const list = box.querySelector('[role=tablist]');
  const btns = Array.from(list.querySelectorAll('[role=tab]'));
  const panels = btns.map((b) => document.getElementById(b.getAttribute('aria-controls')));
  const nodes = Array.from(document.querySelectorAll('[data-tab]'));
  const pick = (i, focus) => {
    btns.forEach((b, k) => {
      b.setAttribute('aria-selected', String(k === i));
      b.tabIndex = k === i ? 0 : -1;
      panels[k].hidden = k !== i;
    });
    for (const n of nodes) {
      if ('tab-' + n.dataset.tab === btns[i].id) n.setAttribute('aria-current', 'true');
      else n.removeAttribute('aria-current');
    }
    if (focus) btns[i].focus();
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[role=tab]');
    if (b) pick(btns.indexOf(b), false);
  });
  list.addEventListener('keydown', (e) => {
    const i = btns.indexOf(document.activeElement);
    let d = 0;
    if (e.key === 'ArrowRight') d = 1;
    if (e.key === 'ArrowLeft') d = -1;
    if (i < 0 || !d) return;
    e.preventDefault();
    pick((i + d + btns.length) % btns.length, true);
  });
  for (const n of nodes) {
    n.addEventListener('click', (e) => {
      const i = btns.findIndex((b) => b.id === 'tab-' + n.dataset.tab);
      if (i < 0) return;
      e.preventDefault();
      pick(i, false);
      box.scrollIntoView({ block: 'start', behavior: motion.matches ? 'auto' : 'smooth' });
    });
  }
  list.hidden = false;
  pick(0, false);
}

// Contracts: hash each side's name; equal ids are a link. Then the box under the pairs hashes
// a name the reader types and says which handler, if any, has that id. textContent only.
function contracts(fig) {
  const pairs = Array.from(fig.querySelectorAll('[data-pair]'));
  const name = (s) => s.querySelector('[data-name]').textContent.trim();
  const short = (id) => id.slice(0, 16) + '…';
  const served = new Map(); // a contract id -> the handler that serves it
  const linked = Promise.all(pairs.map(async (pair) => {
    const sides = Array.from(pair.querySelectorAll('[data-side]'));
    const ids = await Promise.all(sides.map((s) => contractId(name(s))));
    sides.forEach((s, k) => {
      s.querySelector('[data-hash]').textContent = short(ids[k]);
    });
    pair.dataset.match = ids[0] === ids[1] ? 'yes' : 'no';
    served.set(ids[1], sides[1].dataset.handler);
  }));

  const box = fig.querySelector('[data-try]');
  const input = box.querySelector('input');
  const hash = box.querySelector('[data-try-hash]');
  const out = box.querySelector('[data-try-out]');
  let run = 0;
  const check = async () => {
    const mine = ++run;
    const id = await contractId(input.value.trim());
    await linked;
    if (mine !== run) return; // a newer edit is on its way
    const who = served.get(id);
    hash.textContent = short(id);
    out.textContent = who
      ? '→ links to ' + who
      : '→ no handler has ' + 'this id: the route ' + 'would end here';
    box.dataset.match = who ? 'yes' : 'no';
  };
  input.addEventListener('input', check);
  box.hidden = false;
  check();
}

if (typeof document !== 'undefined') {
  const motion = window.matchMedia(REDUCE);
  document.querySelectorAll('[data-tabs]').forEach((t) => tabs(t, motion));
  const nav = document.querySelector('[data-rail]');
  if (nav && 'IntersectionObserver' in window) rail(nav);
  // Web Crypto needs a secure context (https, or localhost)
  if (window.crypto && window.crypto.subtle) {
    document.querySelectorAll('[data-kn]').forEach(contracts);
  }
}
