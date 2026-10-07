// Tests for /panopticode: the ids the page shows (the contract ids src/js/how.js also computes in
// the browser, a function's iid and the route's id), and the wiring of the page's steps, rail and
// algorithm chips. Run with `node --test tools/`.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { contractId, hashParts } from '../src/js/how.js';

// a Go function's iid: repository, package path, full name, signature (panoptife-go
// internal/hash/hash.go)
const iid = (repo, pkg, name, sig) => hashParts([repo, pkg, name, sig]);

// route.id: the sink class, then per hop the repository, function, callee, line (a 32-bit
// little-endian integer, -1 for none) and kind as Rust prints it; the first 12 hex digits
// (panopticode core/src/ids.rs)
async function routeId(cls, hops) {
  const parts = [cls];
  for (const h of hops) {
    const line = new Uint8Array(4);
    new DataView(line.buffer).setInt32(0, h.line, true);
    const kind = h.kind[0].toUpperCase() + h.kind.slice(1);
    parts.push(h.repo, h.func, h.callee, line, kind);
  }
  return (await hashParts(parts)).slice(0, 12);
}

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const how = JSON.parse(read('_data/how.json'));
const includes = fs.readdirSync(new URL('../_includes/how/', import.meta.url))
  .filter((f) => f.endsWith('.html'))
  .map((f) => ({ f, html: read('_includes/how/' + f) }));

test('contract ids match the frontends and the golden CGF', async () => {
  // pinned in panoptife-ts test/hash.test.ts (values from the Go frontend), and the bytes found
  // in panopticode's testdata/cgf on both the client's and the server's side
  const pinned = { 'pb.Account/GetAccount': '2f3f5d36', 'graphql:Query.searchByToken': 'fbfd406e' };
  for (const c of how.contracts) {
    const id = await contractId(c.name);
    assert.equal(id, c.id, c.name);
    assert.ok(id.startsWith(pinned[c.name]), c.name);
  }
});

test('the iid of SearchByToken matches the one in the CGF', async () => {
  const { repo, package: pkg, name, signature, id } = how.iid;
  // cgfdump prints iid=208c2cf2d9c4 for this function in testdata/cgf/federation
  assert.equal(id, '208c2cf2d9c4');
  assert.ok((await iid(repo, pkg, name, signature)).startsWith(id));
});

test('route.id is recomputed from the hops on the page', async () => {
  const { route } = how;
  assert.equal(route.id, 'a956a2f72f24'); // chains.json
  assert.equal(await routeId(route.class, route.hops), route.id);
  // a different line is a different route
  const moved = route.hops.map((h, i) => (i === 8 ? { ...h, line: h.line + 1 } : h));
  assert.notEqual(await routeId(route.class, moved), route.id);
});

test('every step the rail and the algorithms name exists', () => {
  const slugs = [...read('_data/algorithms.yml').matchAll(/^- slug: (\S+)/gm)].map((m) => m[1]);
  const steps = [...read('_data/algorithms.yml').matchAll(/^ {2}step: (\S+)/gm)].map((m) => m[1]);
  const topicsOf = [...read('_data/algorithms.yml').matchAll(/^ {2}topic: (\S+)/gm)].map((m) => m[1]);
  const topics = [...read('_data/topics.yml').matchAll(/^- id: (\S+)/gm)].map((m) => m[1]);
  const all = includes.map((i) => i.html).join('\n');
  const anchors = new Set([...all.matchAll(/<section class="step[^"]*" id="([\w-]+)"/g)].map((m) => m[1]));
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug');
  // each algorithm names the step that uses it, for the blog posts that link back to it
  for (const s of steps) assert.ok(anchors.has(s), `no step #${s}`);
  for (const t of topicsOf) assert.ok(topics.includes(t), `no topic ${t}`);
  // the rail links every numbered step
  const rail = [...read('panopticode/index.html').matchAll(/<a href="#([\w-]+)" data-n=/g)].map((m) => m[1]);
  assert.equal(rail.length, 11);
  for (const r of rail) assert.ok(anchors.has(r), `rail links to missing #${r}`);
});

test('every line the route passes through is marked in the example code', () => {
  const viewer = read('_includes/how/example-code.html');
  // each file panel: its path, then its lines as <span class="ln[ ln--kind]"><i>N</i>
  const marked = new Map();
  for (const panel of viewer.split('<section class="exc__file"').slice(1)) {
    const path = panel.match(/· ([^<·]+?)(?: · lines|<a)/)[1].trim();
    const lines = [...panel.matchAll(/<span class="ln( ln--\w+)?"><i>(\d+)<\/i>/g)];
    marked.set(path, new Set(lines.filter((m) => m[1]).map((m) => Number(m[2]))));
  }
  for (const h of how.route.hops) {
    if (!h.file) continue; // the source hop has no line
    const file = h.file.replace(/^\/private\/tmp\/panopticode-fixtures\/[^/]+\//, '');
    assert.ok(marked.has(file), `no panel for ${file}`);
    assert.ok(marked.get(file).has(h.line), `${file}:${h.line} is on the route but not marked`);
  }
});
