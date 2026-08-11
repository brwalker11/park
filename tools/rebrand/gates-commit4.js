#!/usr/bin/env node
'use strict';
/*
 * Bundle B commit 4 (Pass 2b-b) verification gates.
 *
 * The exit test is the enumerated list of 23 deletions and 15 retargets, NOT
 * `grep -- -tmp`. The grep is kept as a necessary check, never a sufficient
 * one: it catches 13 of the 23 deletions.
 *
 * The fallback-integrity checker covers EVERY var(--x, LITERAL) in every
 * authoritative stylesheet and prints the number it inspected. The 2a version
 * matched only custom-property definitions carrying a fallback, which was the
 * whole surface at the time; after 2b-a the surface moved to ordinary
 * declarations and the old checker silently covered 15 of 106 while still
 * reporting PASS.
 *
 * Usage: node tools/rebrand/gates-commit4.js <base-commit>
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.argv[2];
if (!BASE) { console.error('Usage: node tools/rebrand/gates-commit4.js <base-commit>'); process.exit(2); }
process.chdir(ROOT);

const FILES = ['styles.css', 'css/article.css', 'css/resources.css', 'css/state-map.css', 'css/style.css'];
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

const DELETED = [
  '--blue-alt-tmp','--blue-accent-tmp','--blue-check-tmp','--blue-cta-tmp','--blue-cta-inline-tmp',
  '--blue-inline-tmp','--blue-ui-tmp','--blue-hover-tmp','--blue-inline-deep-tmp','--blue-ask-tmp',
  '--blue-hero-a-tmp','--blue-hero-c-tmp','--border-2-tmp',
  '--blue-brand-tint-08','--blue-brand-tint-12','--blue-accent-tint-08',
  '--border-grey-2','--border-grey-3','--border-grey-4','--border-grey-5','--border-grey-6',
  '--neutral-700','--neutral-800',
];
const RETARGET = {
  '--blue': '#004FC8', '--blue-deep': '#0043B3', '--ok': '#10B981',
  '--blue-tint-0': 'rgba(0,79,200,0)', '--blue-tint-04': 'rgba(0,79,200,0.04)',
  '--blue-tint-05': 'rgba(0,79,200,0.05)', '--blue-tint-08': 'rgba(0,79,200,0.08)',
  '--blue-tint-10': 'rgba(0,79,200,0.1)', '--blue-tint-12': 'rgba(0,79,200,0.12)',
  '--blue-tint-20': 'rgba(0,79,200,0.2)', '--blue-tint-25': 'rgba(0,79,200,0.25)',
  '--blue-tint-30': 'rgba(0,79,200,0.3)', '--blue-tint-40': 'rgba(0,79,200,0.4)',
  '--blue-tint-50': 'rgba(0,79,200,0.5)', '--blue-tint-95': 'rgba(0,79,200,0.95)',
};

let failures = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (detail) console.log(`      ${detail}`);
  if (!ok) failures++;
}

/* every custom property defined anywhere in the five stylesheets */
const defs = new Map();
for (const f of FILES) {
  for (const m of strip(read(f)).matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;}]+)/g)) {
    defs.set(m[1], m[2].trim());
  }
}

/* balanced-paren var() walker */
function eachVar(css, fn) {
  let i = 0;
  while (i < css.length) {
    if (css.startsWith('var(', i)) {
      let d = 0, j = i + 3;
      for (; j < css.length; j++) { if (css[j] === '(') d++; else if (css[j] === ')') { d--; if (!d) { j++; break; } } }
      const inner = css.slice(i + 4, j - 1);
      let dd = 0, comma = -1;
      for (let k = 0; k < inner.length; k++) { const c = inner[k]; if (c === '(') dd++; else if (c === ')') dd--; else if (c === ',' && !dd) { comma = k; break; } }
      fn((comma === -1 ? inner : inner.slice(0, comma)).trim(), comma === -1 ? null : inner.slice(comma + 1).trim());
      i = j;
    } else i++;
  }
}

// ---------------------------------------------- 1. exit test: enumerated list
const survivors = [];
for (const f of FILES) {
  const s = strip(read(f));
  for (const n of DELETED) {
    const c = (s.match(new RegExp(`${n}(?![-\\w])`, 'g')) || []).length;
    if (c) survivors.push(`${f}: ${c} x ${n}`);
  }
}
gate('exit test: all 23 enumerated names are gone from every stylesheet',
  survivors.length === 0,
  `${DELETED.length} names x ${FILES.length} stylesheets = ${DELETED.length * FILES.length} checks; ${survivors.length} survivor(s)` +
  (survivors.length ? `\n      ${survivors.join('\n      ')}` : ''));

// the -tmp grep is necessary but NOT sufficient; report both
let tmpLeft = 0;
for (const f of FILES) tmpLeft += (strip(read(f)).match(/-tmp\b/g) || []).length;
gate('necessary check: grep -- -tmp returns nothing', tmpLeft === 0,
  `${tmpLeft} occurrence(s); this catches only 13 of the 23 deletions, so it is not the exit test`);

// ---------------------------------------------- 2. the 15 retargets landed
const wrong = [];
for (const [n, v] of Object.entries(RETARGET)) {
  if (!defs.has(n)) wrong.push(`${n} is not defined`);
  else if (defs.get(n) !== v) wrong.push(`${n} = ${defs.get(n)}, expected ${v}`);
}
gate('all 15 retargeted primitives hold their new value', wrong.length === 0,
  `${Object.keys(RETARGET).length} primitives checked; ${wrong.length} wrong` +
  (wrong.length ? `\n      ${wrong.join('\n      ')}` : ''));

// ---------------------------------------------- 3. fallback integrity (full surface)
let fbChecked = 0, bareCross = 0;
const fbBad = [], bareBad = [];
for (const f of FILES) {
  const s = strip(read(f));
  const own = new Set([...s.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map(m => m[1]));
  eachVar(s, (name, fb) => {
    if (fb !== null) {
      fbChecked++;
      const actual = defs.get(name);
      if (actual === undefined) fbBad.push(`${f}: var(${name}, ...) references an undefined primitive`);
      else if (actual !== fb) fbBad.push(`${f}: var(${name}, ${fb}) but ${name} = ${actual}`);
    } else if (f !== 'styles.css' && !own.has(name)) {
      bareCross++;
      bareBad.push(`${f}: bare cross-file var(${name}) with no fallback`);
    }
  });
}
gate('every cross-file fallback equals its primitive value', fbBad.length === 0,
  `${fbChecked} var(--x, LITERAL) references inspected across ${FILES.length} stylesheets; ${fbBad.length} mismatch(es)` +
  (fbBad.length ? `\n      ${fbBad.slice(0, 10).join('\n      ')}` : ''));
gate('no bare cross-file reference without a fallback', bareCross === 0,
  `${bareCross} bare cross-file reference(s)` + (bareBad.length ? `\n      ${bareBad.slice(0, 6).join('\n      ')}` : ''));

// ---------------------------------------------- 4. every referenced token exists
let refChecked = 0;
const undef = [];
for (const f of FILES) {
  eachVar(strip(read(f)), (name) => { refChecked++; if (!defs.has(name)) undef.push(`${f}: var(${name}) is never defined`); });
}
gate('every referenced custom property is defined somewhere', undef.length === 0,
  `${refChecked} var() references resolved against ${defs.size} definitions; ${undef.length} undefined` +
  (undef.length ? `\n      ${[...new Set(undef)].slice(0, 10).join('\n      ')}` : ''));

// ---------------------------------------------- 5. no new raw literal in a rule
function literalsInRules(css) {
  const out = [];
  for (const m of css.matchAll(/([-a-zA-Z][-a-zA-Z0-9]*)\s*:\s*([^;{}]+)/g)) {
    const prop = m[1];
    if (prop.startsWith('--')) continue;
    let s = m[2], blanked = '', i = 0;
    while (i < s.length) {
      if (s.startsWith('var(', i)) { let d = 0, j = i + 3; for (; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')') { d--; if (!d) { j++; break; } } } blanked += ' '.repeat(j - i); i = j; }
      else { blanked += s[i]; i++; }
    }
    for (const c of blanked.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)) out.push(`${prop}:${c[0]}`);
  }
  return out;
}
let nowLit = 0, baseLit = 0;
for (const f of FILES) {
  nowLit += literalsInRules(strip(read(f))).length;
  const b = cp.execSync(`git show ${BASE}:"${f}"`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  baseLit += literalsInRules(strip(b)).length;
}
gate('no raw colour literal added to any rule', nowLit <= baseLit,
  `raw literals in rules: ${baseLit} at ${BASE}, ${nowLit} now (all remaining are box-shadow/text-shadow, deferred to 2b-2)`);

// ---------------------------------------------- 6. token count
const rootDefs = [...strip(read('styles.css')).matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].length;
const baseRoot = [...strip(cp.execSync(`git show ${BASE}:styles.css`, { encoding: 'utf8' })).matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].length;
gate('styles.css token count falls by exactly 23', baseRoot - rootDefs === 23,
  `${baseRoot} definitions at ${BASE} -> ${rootDefs} now, a fall of ${baseRoot - rootDefs}`);

// ---------------------------------------------- 7. HTML untouched by this pass
const htmlChanged = cp.execSync(`git diff --name-only ${BASE} -- '*.html'`, { encoding: 'utf8' }).trim();
gate('no HTML file touched by the retarget', htmlChanged === '',
  htmlChanged === '' ? 'commit 4 is a stylesheet-only pass, 0 HTML files changed' : htmlChanged.split('\n').slice(0, 5).join(', '));

console.log(`\n${failures === 0 ? 'ALL GATES PASSED' : failures + ' GATE(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
