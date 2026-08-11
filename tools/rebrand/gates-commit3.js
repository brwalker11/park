#!/usr/bin/env node
'use strict';
/*
 * Bundle B commit 3 verification gates.
 *
 * Headline gate is a DELIBERATE-DIFF gate written for this pass: it reverses
 * the recolor map and the two renames on every touched file and requires the
 * result to equal the file at the given base commit, byte for byte. Anything
 * that moved outside the intended substitutions fails.
 *
 * Structural gates then prove no element lost styling: brace count, selector
 * set and per-selector property set are unchanged in every inline payload, so
 * the recolor cannot have deleted a rule or a declaration.
 *
 * Usage: node tools/rebrand/gates-commit3.js <base-commit>
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.argv[2];
if (!BASE) { console.error('Usage: node tools/rebrand/gates-commit3.js <base-commit>'); process.exit(2); }
process.chdir(ROOT);

const SKIP_DIRS = new Set(['node_modules', '.git', 'docs']);
const FROZEN = (r) => r.startsWith('consultation/');

// Must mirror recolor-commit3.js exactly.
const MAP = [
  ['#0b6efd', '#004FC8'], ['#0A68FF', '#004FC8'], ['#2563eb', '#004FC8'],
  ['#005CE6', '#0043B3'], ['#0958d9', '#0043B3'], ['#0856c9', '#0043B3'],
  ['#1a73e8', '#004FC8'], ['#1557b0', '#0043B3'], ['#cbd5e1', '#e2e8f0'],
  ['rgba(13,110,253,0)', 'rgba(0,79,200,0)'],
  ['rgba(13, 110, 253, 0)', 'rgba(0, 79, 200, 0)'],
  ['rgba(13,110,253,0.05)', 'rgba(0,79,200,0.05)'],
  ['rgba(13,110,253,0.08)', 'rgba(0,79,200,0.08)'],
  ['rgba(13, 110, 253, 0.08)', 'rgba(0, 79, 200, 0.08)'],
  ['rgba(13,110,253,0.25)', 'rgba(0,79,200,0.25)'],
  ['rgba(13,110,253,0.4)', 'rgba(0,79,200,0.4)'],
  ['rgba(11, 110, 253, 0.35)', 'rgba(0, 79, 200, 0.35)'],
  ['rgba(11, 110, 253, 0.45)', 'rgba(0, 79, 200, 0.45)'],
];

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
const atBase = (r) => {
  try { return cp.execSync(`git show ${BASE}:"${r}"`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
  catch { return null; }
};

let failures = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (detail) console.log(`      ${detail}`);
  if (!ok) failures++;
}

const styleBlocks = (src) => [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);

/* Split CSS into top-level rules, returning [selector, declarations]. */
function rules(css) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) { out.push(css.slice(start, i + 1)); start = i + 1; } }
  }
  return out.map(r => {
    const b = r.indexOf('{');
    return [r.slice(0, b).trim(), r.slice(b + 1, -1)];
  });
}
const propsOf = (decls) =>
  [...decls.matchAll(/(^|[;{])\s*([-a-zA-Z][-a-zA-Z0-9]*)\s*:/g)].map(m => m[2]).sort().join(',');

// ------------------------------------------------- 1. deliberate diff
/* The map is many-to-one: four different old blues all become #004FC8, so it
 * cannot be inverted. The gate therefore applies the map FORWARD to the base
 * file and requires the result to equal the working tree exactly. That is the
 * stronger direction anyway: it proves the current state is precisely what the
 * declared substitutions produce from the base, with nothing else applied. */
const BODY_PAYLOAD_PAGES = new Set([
  'calculator/index.html', 'calculator/report/index.html',
  'contact/index.html', 'contact/thank-you/index.html',
]);
function forward(src, r) {
  return src.replace(/(<style>)([\s\S]*?)(<\/style>)/g, (m, a, css, c) => {
    let s = css;
    for (const [oldV, newV] of MAP) s = s.split(oldV).join(newV);
    if (BODY_PAYLOAD_PAGES.has(r)) s = s.replace(/--blue(?![-\w])/g, '--btn-blue');
    return a + s + c;
  });
}

let checked = 0, predictedDelta = 0, actualDelta = 0;
const mismatched = [];
for (const f of files) {
  const r = rel(f);
  if (FROZEN(r)) continue;
  const now = read(f);
  const base = atBase(r);
  if (base === null) continue;
  if (now === base) continue;
  checked++;
  if (forward(base, r) !== now) mismatched.push(r);
  actualDelta += now.length - base.length;
  // predicted: every literal swap plus every rename, by length difference
  for (const [oldV, newV] of MAP) {
    const n = base.split(oldV).length - 1;
    predictedDelta += n * (newV.length - oldV.length);
  }
  if (BODY_PAYLOAD_PAGES.has(r)) {
    const n = (base.match(/--blue(?![-\w])/g) || []).length;
    predictedDelta += n * ('--btn-blue'.length - '--blue'.length);
  }
}
gate('deliberate-diff: base + declared substitutions reproduces the tree exactly',
  mismatched.length === 0,
  `${checked} changed HTML files rebuilt from ${BASE} and compared byte-for-byte; ${mismatched.length} unexplained` +
  (mismatched.length ? `\n      ${mismatched.slice(0, 8).join('\n      ')}` : ''));

gate('payload integrity: byte delta equals the sum of literal length differences',
  predictedDelta === actualDelta,
  `predicted ${predictedDelta} bytes, actual ${actualDelta} bytes across ${checked} files`);

// ------------------------------------------------- 2. no element loses styling
let payloadsChecked = 0, selectorDrift = [], propDrift = [], braceDrift = [];
for (const f of files) {
  const r = rel(f);
  if (FROZEN(r)) continue;
  const base = atBase(r);
  if (base === null) continue;
  const nowB = styleBlocks(read(f)), baseB = styleBlocks(base);
  if (nowB.length !== baseB.length) { selectorDrift.push(`${r}: <style> block count ${baseB.length} -> ${nowB.length}`); continue; }
  for (let i = 0; i < nowB.length; i++) {
    payloadsChecked++;
    const a = baseB[i], b = nowB[i];
    if ((a.match(/{/g) || []).length !== (b.match(/{/g) || []).length)
      braceDrift.push(`${r} block ${i}: brace count changed`);
    const ra = rules(a), rb = rules(b);
    if (ra.length !== rb.length) { selectorDrift.push(`${r} block ${i}: rule count ${ra.length} -> ${rb.length}`); continue; }
    for (let j = 0; j < ra.length; j++) {
      if (ra[j][0] !== rb[j][0]) selectorDrift.push(`${r} block ${i} rule ${j}: selector "${ra[j][0]}" -> "${rb[j][0]}"`);
      // --blue -> --btn-blue is an intended property RENAME in the four body
      // payloads, so normalise it away before comparing property sets;
      // everything else must match exactly.
      else if (propsOf(ra[j][1]) !== propsOf(rb[j][1].replace(/--btn-blue(?![-\w])/g, '--blue')))
        propDrift.push(`${r} block ${i} "${ra[j][0]}": property set changed`);
    }
  }
}
gate('inline payloads: rule and selector set unchanged', selectorDrift.length === 0,
  `${payloadsChecked} <style> blocks compared rule by rule; ${selectorDrift.length} drift(s)` +
  (selectorDrift.length ? `\n      ${selectorDrift.slice(0, 8).join('\n      ')}` : ''));
gate('inline payloads: no declaration removed from any rule', propDrift.length === 0,
  `every rule's property set compared; ${propDrift.length} drift(s)` +
  (propDrift.length ? `\n      ${propDrift.slice(0, 8).join('\n      ')}` : ''));
gate('inline payloads: brace count unchanged', braceDrift.length === 0,
  `${payloadsChecked} blocks checked; ${braceDrift.length} drift(s)`);

// ------------------------------------------------- 3. literals only, no NEW var() leak
/* A var() in critical CSS resolves only once styles.css lands, which is the
 * async load the inline payload exists to hide. This pass must not introduce
 * one. Some pages already carry cross-payload references (404.html leans on
 * --brand, --ink, --muted, --bg and --border from styles.css); those are
 * pre-existing and are counted, not blamed on this commit. The gate asserts
 * the count did not RISE. */
function leaksIn(src) {
  const out = [];
  for (const [i, css] of styleBlocks(src).entries()) {
    const defined = new Set([...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map(m => m[1]));
    for (const m of css.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) if (!defined.has(m[1])) out.push(`block ${i}: ${m[1]}`);
  }
  return out;
}
let payloadVarChecked = 0, leaksNow = 0, leaksBase = 0;
const newLeaks = [];
for (const f of files) {
  const r = rel(f);
  if (FROZEN(r)) continue;
  const base = atBase(r);
  if (base === null) continue;
  payloadVarChecked += styleBlocks(read(f)).length;
  const a = leaksIn(base), b = leaksIn(read(f));
  leaksBase += a.length; leaksNow += b.length;
  if (b.length > a.length) newLeaks.push(`${r}: ${a.length} -> ${b.length}`);
}
gate('this pass introduced no new cross-payload var() reference',
  newLeaks.length === 0 && leaksNow <= leaksBase,
  `${payloadVarChecked} <style> blocks checked; pre-existing cross-payload refs ${leaksBase}, now ${leaksNow}; ${newLeaks.length} page(s) got worse`);

// ------------------------------------------------- 4. recolor completeness
const LEGACY = ['#0b6efd', '#0A68FF', '#0a68ff', '#2563eb', '#005CE6', '#005ce6',
                '#0958d9', '#0856c9', '#1a73e8', '#1557b0', '#007bff',
                'rgba(13,110,253', 'rgba(13, 110, 253', 'rgba(11, 110, 253'];
const survivors = [];
for (const f of files) {
  const r = rel(f);
  if (FROZEN(r)) continue;
  const src = read(f);
  for (const L of LEGACY) {
    const n = src.split(L).length - 1;
    if (n) survivors.push(`${r}: ${n} x ${L}`);
  }
}
gate('no legacy blue survives in any non-frozen page', survivors.length === 0,
  `${files.filter(f => !FROZEN(rel(f))).length} pages scanned for ${LEGACY.length} legacy literals; ${survivors.length} survivor(s)` +
  (survivors.length ? `\n      ${survivors.slice(0, 10).join('\n      ')}` : ''));

// ------------------------------------------------- 5. the --blue rename
const cssFiles = ['styles.css', 'css/article.css', 'css/resources.css', 'css/state-map.css', 'css/style.css'];
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
let bareBrand = 0, bareBlue = 0, brandTint = 0, plainTint = 0;
for (const f of cssFiles) {
  const s = strip(read(path.join(ROOT, f)));
  bareBrand += (s.match(/--blue-brand(?![-\w])/g) || []).length;
  bareBlue += (s.match(/--blue(?![-\w])/g) || []).length;
  brandTint += (s.match(/--blue-brand-tint-\d+/g) || []).length;
  plainTint += (s.match(/--blue-tint-\d+/g) || []).length;
}
/* 17 occurrences were renamed, but 3 of them are inside comments in styles.css
 * (documentation of the token, correctly updated with it). Comments are
 * stripped before counting, so the code-only expectation is 14. */
gate('--blue-brand fully renamed to --blue in the stylesheets', bareBrand === 0 && bareBlue === 14,
  `${cssFiles.length} stylesheets: ${bareBrand} bare --blue-brand remain in code, ${bareBlue} --blue present (expected 0 and 14; 17 total renamed, 3 of them in comments)`);
gate('prefixed tint tokens survived the rename', brandTint === 4 && plainTint === 33,
  `--blue-brand-tint-* ${brandTint} (expected 4), --blue-tint-* ${plainTint} (expected 33)`);

// body payloads must no longer define --blue
let btn = 0, stillBlue = 0;
for (const p of ['calculator/index.html', 'calculator/report/index.html', 'contact/index.html', 'contact/thank-you/index.html']) {
  const s = read(path.join(ROOT, p));
  btn += (s.match(/--btn-blue(?![-\w])/g) || []).length;
  stillBlue += (s.match(/--blue(?![-\w])/g) || []).length;
}
gate('the four body payloads no longer define or use --blue', stillBlue === 0 && btn === 12,
  `4 body payloads: ${btn} --btn-blue occurrences (expected 12), ${stillBlue} --blue remaining (expected 0)`);

// ------------------------------------------------- 6. consultation frozen
const consult = ['consultation/index.html', 'consultation/thank-you/index.html'];
const changed = consult.filter(r => read(path.join(ROOT, r)) !== atBase(r));
gate('consultation pages untouched', changed.length === 0,
  `${consult.length} frozen pages compared against ${BASE}, ${changed.length} changed`);

gate('sitemap unchanged', read(path.join(ROOT, 'sitemap.xml')) === atBase('sitemap.xml'),
  `sitemap.xml compared against ${BASE}`);

console.log(`\n${failures === 0 ? 'ALL GATES PASSED' : failures + ' GATE(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
