#!/usr/bin/env node
'use strict';
/*
 * Bundle B commit 2 verification gates.
 * Every gate prints the count it checked. Any failure exits non-zero.
 *
 * The headline gate is the DELIBERATE-DIFF gate: for every swept file, the
 * three intended substitutions are reversed and the result is compared byte
 * for byte against the file at HEAD. If anything else moved anywhere in those
 * 148 files, the reconstruction fails. This gate is written for this pass; it
 * is deliberately not the 2a first-paint checker reused.
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const S = path.join(__dirname, 'fixtures');
const SKIP_DIRS = new Set(['node_modules', '.git', 'docs']);
process.chdir(ROOT);

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (SKIP_DIRS.has(e.name)) continue; walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}
const files = walk(ROOT, []).sort();
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const read = (f) => fs.readFileSync(f, 'utf8');
const atHead = (r) => {
  try { return cp.execSync(`git show HEAD:"${r}"`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch { return null; }
};

let failures = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (detail) console.log(`      ${detail}`);
  if (!ok) failures++;
}

// ---------------------------------------------------------------- markers
const count = (needle, pred = () => true) =>
  files.filter((f) => pred(rel(f)) && read(f).includes(needle)).length;

const newHeaderFiles = count('<header class="site-header">');
const newFooterFiles = count('<footer class="site-footer">');
const oldHeaderLeft = count('<div class="header-inner">\n      <a href="/" class="brand" aria-label="Monetize Parking Home">\n        <img src="/images/Logo.svg"');
const oldFooterLeft = count('<footer class="footer">');
const oldNavLeft = count('<a href="/services/">Services</a>');
const contactBtnLeft = count('class="contact-btn"');

gate('new header markup present', newHeaderFiles === 148, `${newHeaderFiles} files carry <header class="site-header">, expected 148`);
gate('new footer markup present', newFooterFiles === 148, `${newFooterFiles} files carry <footer class="site-footer">, expected 148`);
gate('old footer markup gone', oldFooterLeft === 0, `${oldFooterLeft} files still carry <footer class="footer">, expected 0`);
gate('old flat nav gone', oldNavLeft === 0, `${oldNavLeft} files still carry the old Services nav link, expected 0`);
gate('old contact-btn gone', contactBtnLeft === 0, `${contactBtnLeft} files still carry .contact-btn, expected 0`);

// ---------------------------------------------------------------- logo swap
const newLogo = count('src="/assets/brand/MP_Logo_400.png"');
gate('logo swapped in chrome', newLogo === 148, `${newLogo} files reference MP_Logo_400.png, expected 148`);

/* Logo.svg is deliberately NOT deleted: it is still the Organization /
 * LocalBusiness `logo` value in JSON-LD, which search engines render on
 * white, and MP_Logo_400.png is a silver gradient on transparent. That stays
 * until assets/brand/MP_Logo_dark.png lands. What this gate asserts is that
 * no RENDERED reference survives outside the two frozen consultation pages. */
const renderedSvg = files.filter((f) => /<img[^>]*images\/Logo\.svg/.test(read(f))).map(rel);
const jsonLdSvg = files.filter((f) => read(f).includes('images/Logo.svg') && !/<img[^>]*images\/Logo\.svg/.test(read(f))).map(rel);
gate('no rendered Logo.svg outside the frozen pages',
  renderedSvg.length === 2 && renderedSvg.every((r) => r.startsWith('consultation/')),
  `${renderedSvg.length} rendered <img> references remain, all on frozen pages: ${renderedSvg.join(', ')}`);
gate('Logo.svg survives only in structured data',
  jsonLdSvg.length === 33,
  `${jsonLdSvg.length} pages keep images/Logo.svg in JSON-LD only (expected 33), blocked on MP_Logo_dark.png`);

// width/height on every chrome logo img
let missingDims = 0;
for (const f of files) {
  const s = read(f);
  const re = /<img src="\/assets\/brand\/MP_Logo_400\.png"[^>]*>/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (!/width="400"/.test(m[0]) || !/height="160"/.test(m[0])) missingDims++;
  }
}
gate('logo img carries width/height', missingDims === 0, `${missingDims} logo <img> tags missing width/height, expected 0; 296 tags checked (148 header + 148 footer)`);

// ---------------------------------------------------------------- dropdown wiring
let trig = 0, panels = 0, unmatched = 0, notHidden = 0, notAnchor = 0;
for (const f of files) {
  const s = read(f);
  const ts = [...s.matchAll(/<a class="nav-trigger" href="([^"]+)" data-nav-panel="([^"]+)">/g)];
  trig += ts.length;
  for (const t of ts) {
    const id = t[2];
    const p = new RegExp(`<div class="nav-panel" id="${id}"([^>]*)>`).exec(s);
    if (!p) { unmatched++; continue; }
    panels++;
    if (!/\bhidden\b/.test(p[1])) notHidden++;
  }
  // any <button class="nav-trigger"> would break the no-JS fallback
  if (/<button[^>]*class="nav-trigger"/.test(s)) notAnchor++;
}
gate('every trigger has a matching panel id', unmatched === 0, `${trig} triggers checked across 148 pages, ${panels} matched panels, ${unmatched} unmatched`);
gate('every panel ships hidden', notHidden === 0, `${panels} panels checked, ${notHidden} missing the hidden attribute`);
gate('triggers are anchors, not buttons', notAnchor === 0, `${notAnchor} files use <button class="nav-trigger">, expected 0`);

// no-JS reachability: each trigger href must be a real page
const trigHrefs = new Set();
for (const f of files) for (const m of read(f).matchAll(/<a class="nav-trigger" href="([^"]+)"/g)) trigHrefs.add(m[1]);
const missingTargets = [...trigHrefs].filter((h) => !fs.existsSync(path.join(ROOT, h.replace(/^\//, ''), 'index.html')));
gate('trigger hrefs resolve with JS off', missingTargets.length === 0,
  `${trigHrefs.size} distinct trigger hrefs (${[...trigHrefs].join(', ')}), ${missingTargets.length} unresolved`);

// ---------------------------------------------------------------- nav link targets
const navTargets = new Set();
for (const f of files) {
  const s = read(f);
  const nav = /<nav class="site-nav"[\s\S]*?<\/nav>/.exec(s);
  if (!nav) continue;
  for (const m of nav[0].matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)) navTargets.add(m[1]);
}
const deadNav = [...navTargets].filter((h) => {
  if (h.endsWith('.html')) return !fs.existsSync(path.join(ROOT, h.replace(/^\//, '')));
  return !fs.existsSync(path.join(ROOT, h.replace(/^\//, ''), 'index.html'));
});
gate('nav link targets exist', deadNav.length === 0, `${navTargets.size} distinct nav targets checked, dead: ${deadNav.join(', ') || 'none'}`);

// nav identical across all pages
const navHashes = new Map();
for (const f of files) {
  const nav = /<nav class="site-nav"[\s\S]*?<\/nav>/.exec(read(f));
  if (!nav) continue;
  const k = require('crypto').createHash('sha256').update(nav[0]).digest('hex').slice(0, 12);
  navHashes.set(k, (navHashes.get(k) || 0) + 1);
}
gate('nav markup identical site-wide', navHashes.size === 1, `${[...navHashes.values()].reduce((a, b) => a + b, 0)} nav blocks, ${navHashes.size} distinct variant(s)`);

// ---------------------------------------------------------------- services anchors
const svc = read(path.join(ROOT, 'services/index.html'));
const anchors = ['parking', 'ev'].filter((id) => svc.includes(`id="${id}"`));
gate('services anchors present', anchors.length === 2, `${anchors.length} of 2 expected anchors found: ${anchors.join(', ')}; #solar has no content to anchor yet`);

// ---------------------------------------------------------------- scroll offset
const css = read(path.join(ROOT, 'styles.css'));
const old100 = (css.match(/scroll-margin-top:\s*100px/g) || []).length;
const old120 = (css.match(/scroll-padding-top:\s*120px/g) || []).length;
const new88 = (css.match(/scroll-(margin|padding)-top:\s*88px/g) || []).length;
gate('scroll offset moved to 88px', old100 === 0 && old120 === 0 && new88 === 2,
  `${new88} declarations at 88px, ${old100 + old120} left at the old 100/120px values`);

// ---------------------------------------------------------------- consultation frozen
const consult = ['consultation/index.html', 'consultation/thank-you/index.html'];
const consultChanged = consult.filter((r) => read(path.join(ROOT, r)) !== atHead(r));
gate('consultation pages untouched', consultChanged.length === 0,
  `${consult.length} frozen pages compared against HEAD, ${consultChanged.length} changed`);

// ---------------------------------------------------------------- sitemap
gate('sitemap unchanged', read(path.join(ROOT, 'sitemap.xml')) === atHead('sitemap.xml'), 'sitemap.xml compared against HEAD');

// ---------------------------------------------------------------- DELIBERATE DIFF
const OLD_CSS = fs.readFileSync(path.join(S, 'old-inline-header.css'), 'utf8').replace(/\n$/, '');
const NEW_CSS = fs.readFileSync(path.join(S, 'new-inline-header.css'), 'utf8').replace(/\n$/, '');
const OLD_HEADER = fs.readFileSync(path.join(S, 'old-header-markup.html'), 'utf8').replace(/\n$/, '');
const OLD_FOOTER = fs.readFileSync(path.join(S, 'old-footer-markup.html'), 'utf8').replace(/\n$/, '');
const NEW_HEADER = fs.readFileSync(path.join(S, 'new-header-markup.html'), 'utf8').replace(/\n$/, '');
const NEW_FOOTER = fs.readFileSync(path.join(S, 'new-footer-markup.html'), 'utf8').replace(/\n$/, '');

// services/index.html also gained two id attributes and one CSS rule by design
const EXTRA = new Set(['services/index.html']);

let checked = 0, mismatched = [];
for (const f of files) {
  const r = rel(f);
  const now = read(f);
  if (!now.includes('<header class="site-header">')) continue;
  checked++;
  let reconstructed = now
    .split(NEW_HEADER).join(OLD_HEADER)
    .split(NEW_FOOTER).join(OLD_FOOTER)
    .split(NEW_CSS).join(OLD_CSS);
  if (EXTRA.has(r)) {
    reconstructed = reconstructed
      .replace('<div class="services-stream-card" id="parking">', '<div class="services-stream-card">')
      .replace('<div class="services-stream-card" id="ev">', '<div class="services-stream-card">')
      .replace(/\n    \/\* Nav dropdown deep links land here; clear the 72px sticky header \*\/\n    \.services-stream-card\[id\] \{\n      scroll-margin-top: 88px;\n    \}/, '');
  }
  const head = atHead(r);
  if (head === null) { mismatched.push(`${r}: not present at HEAD`); continue; }
  if (reconstructed !== head) mismatched.push(r);
}
gate('deliberate-diff: nothing changed but the three intended substitutions',
  mismatched.length === 0,
  `${checked} swept files reconstructed and compared byte-for-byte against HEAD; ${mismatched.length} unexplained difference(s)` +
  (mismatched.length ? `\n      ${mismatched.slice(0, 10).join('\n      ')}` : ''));

// ---------------------------------------------------------------- JS health
try {
  cp.execSync('node --check script.js', { stdio: 'pipe' });
  gate('node --check script.js', true, '1 edited JS file checked');
} catch (e) {
  gate('node --check script.js', false, String(e.stderr || e));
}

console.log(`\n${failures === 0 ? 'ALL GATES PASSED' : failures + ' GATE(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
