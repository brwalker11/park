#!/usr/bin/env node
'use strict';
/*
 * Bundle B commit 3, second half: rename --blue-brand to --blue.
 *
 * The canonical blue could not be called --blue in Pass 2a because four
 * body-level inline payloads defined --blue at their own values, from the body,
 * which permanently outranks styles.css. Those definitions were renamed to
 * --btn-blue by recolor-commit3.js, so the name is now free.
 *
 * The one real hazard: --blue-brand-tint-08 and --blue-brand-tint-12 share the
 * --blue-brand prefix, and --blue-tint-08 and --blue-tint-12 ALREADY EXIST at
 * different values. A naive string replace would rename the first pair onto the
 * second and silently merge four tokens into two. The match is therefore
 * guarded so it only fires when --blue-brand is not followed by another name
 * character.
 *
 * Dry run by default. Pass --write to apply.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WRITE = process.argv.includes('--write');
const FILES = ['styles.css', 'css/resources.css', 'css/state-map.css'];
const ALL_CSS = ['styles.css', 'css/article.css', 'css/resources.css', 'css/state-map.css', 'css/style.css'];

const BARE = /--blue-brand(?![-\w])/g;
const EXPECT = { 'styles.css': 8, 'css/resources.css': 8, 'css/state-map.css': 1 };

const problems = [];

// Comments are prose about tokens, not tokens. They must not count as
// collisions, and they must not be rewritten by the rename either.
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Guard 1: --blue must not already be defined or referenced anywhere in the
// authoritative stylesheets, or the rename would collide.
for (const f of ALL_CSS) {
  const src = stripComments(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const clashes = (src.match(/--blue(?![-\w])/g) || []).length;
  if (clashes) problems.push(`${f}: --blue already appears ${clashes} time(s) in code before the rename`);
}

// Guard 2: the tint tokens that share the prefix must survive untouched.
const beforeTints = {};
for (const f of ALL_CSS) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  beforeTints[f] = {
    brandTint: (src.match(/--blue-brand-tint-\d+/g) || []).length,
    plainTint: (src.match(/--blue-tint-\d+/g) || []).length,
  };
}

if (problems.length) {
  console.error('FAIL: preconditions not met, nothing written');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const pending = [];
let total = 0;
for (const f of FILES) {
  const abs = path.join(ROOT, f);
  const src = fs.readFileSync(abs, 'utf8');
  const n = (src.match(BARE) || []).length;
  console.log(`  ${String(n).padStart(3)}  ${f}  (expected ${EXPECT[f]})`);
  if (n !== EXPECT[f]) problems.push(`${f}: found ${n} bare --blue-brand, expected ${EXPECT[f]}`);
  total += n;
  pending.push([abs, src.replace(BARE, '--blue'), f]);
}
console.log(`  ${String(total).padStart(3)}  TOTAL bare --blue-brand renamed to --blue`);

if (problems.length) {
  console.error('\nFAIL: count mismatch, nothing written');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

if (!WRITE) { console.log('\nDRY RUN ok. Re-run with --write to apply.'); process.exit(0); }

for (const [abs, src] of pending) fs.writeFileSync(abs, src);

// Guard 3: prove the prefixed tints were not swept up by the rename.
let ok = true;
for (const f of ALL_CSS) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const after = {
    brandTint: (src.match(/--blue-brand-tint-\d+/g) || []).length,
    plainTint: (src.match(/--blue-tint-\d+/g) || []).length,
  };
  const b = beforeTints[f];
  const same = after.brandTint === b.brandTint && after.plainTint === b.plainTint;
  console.log(`  ${same ? 'ok  ' : 'FAIL'}  ${f}: --blue-brand-tint-* ${b.brandTint}->${after.brandTint}, --blue-tint-* ${b.plainTint}->${after.plainTint}`);
  if (!same) ok = false;
}
if (!ok) { console.error('\nFAIL: prefixed tint tokens were altered by the rename'); process.exit(1); }

console.log(`\nPASS: ${total} occurrences renamed across ${FILES.length} files, prefixed tints intact`);
