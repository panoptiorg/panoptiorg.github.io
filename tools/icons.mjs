#!/usr/bin/env node
// Renders the PNG icons from the logo SVGs, pixel for pixel (the marks are pixel art, so a
// whole-number scale gives an exact image). Run after changing a logo: node tools/icons.mjs
//
//   favicon-32.png         S mark, 2x, on the page ground (fallback for browsers without SVG icons)
//   apple-touch-icon.png   M mark, 6x, 180 x 180
//   assets/img/mark-m.png  M mark, 10x, 290 x 290 (the logo in search results' structured data)
//
// The social card (assets/img/og.png) is a screenshot of tools/og.html: see README.md.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GROUND = '#0b0b0b';

function parseSvg(file) {
  const svg = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const [vx, vy, vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const layers = [...svg.matchAll(/<path[^>]*fill="(#[0-9a-f]{6})"[^>]*d="([^"]+)"/g)].map(([, fill, d]) => ({ fill, d }));
  return { vx, vy, vw, vh, layers };
}

function hex(c) {
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
}

// draw an SVG at `scale` pixels per unit into a size x size image, `pad` pixels from the edge
function render(file, scale, size, pad) {
  const { vx, vy, layers } = parseSvg(file);
  const img = Buffer.alloc(size * size * 4);
  const [r, g, b] = hex(GROUND);
  for (let i = 0; i < size * size; i++) img.set([r, g, b, 255], i * 4);
  for (const { fill, d } of layers) {
    const [fr, fg, fb] = hex(fill);
    // every path is a list of rectangles: M x y h w v h h-w z
    for (const [, x, y, w, h] of d.matchAll(/M(-?\d+) (-?\d+)h(\d+)v(\d+)h-\d+z/g)) {
      for (let px = 0; px < Number(w) * scale; px++) {
        for (let py = 0; py < Number(h) * scale; py++) {
          const X = pad + (Number(x) - vx) * scale + px;
          const Y = pad + (Number(y) - vy) * scale + py;
          if (X >= 0 && Y >= 0 && X < size && Y < size) img.set([fr, fg, fb, 255], (Y * size + X) * 4);
        }
      }
    }
  }
  return img;
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(img, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA, no interlace
  const rows = [];
  for (let y = 0; y < size; y++) rows.push(Buffer.from([0]), img.subarray(y * size * 4, (y + 1) * size * 4));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outputs = [
  // S mark: viewBox 1..22, the mark itself spans 4..18 (15 units): 2x is 30 px, 1 px border
  { out: 'favicon-32.png', svg: 'assets/img/mark-s.svg', scale: 2, size: 32, pad: 1 - 3 * 2 },
  // M mark: 29 units; 6x = 174 px centred in 180
  { out: 'apple-touch-icon.png', svg: 'assets/img/mark-m.svg', scale: 6, size: 180, pad: 3 },
  { out: 'assets/img/mark-m.png', svg: 'assets/img/mark-m.svg', scale: 10, size: 290, pad: 0 },
];

for (const { out, svg, scale, size, pad } of outputs) {
  fs.writeFileSync(path.join(ROOT, out), png(render(svg, scale, size, pad), size));
  console.log(`${out}: ${size} x ${size}`);
}
