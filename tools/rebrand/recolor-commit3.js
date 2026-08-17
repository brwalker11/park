#!/usr/bin/env node
'use strict';
/*
 * Bundle B commit 3: inline payload recolor.
 *
 * Rewrites old colour literals to their new values IN PLACE inside the inline
 * <style> payloads. Literals only, never var(): a var() in critical CSS would
 * resolve only after styles.css lands, which is exactly the async load the
 * inline payload exists to hide, so it would reintroduce a colour flash.
 *
 * Nothing is deleted. Rule count, selector set and payload structure are
 * unchanged; only the characters inside colour literals move.
 *
 * Edits are confined to the contents of <style> elements so that meta tags,
 * JSON-LD and inline style attributes are never touched by a blind replace.
 *
 * Dry run by default. Pass --write to apply.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'docs']);
const WRITE = process.argv.includes('--write');
const FROZEN = (r) => r.startsWith('consultation/');

/* Targets come from the Pass 2b-b list, formerly in REBRAND.md, which was
 * deleted at the end of the rebrand; see git history if this ever needs
 * re-reading. Each old literal maps to
 * the value its owning primitive holds after the 2b-b retarget, so the inline
 * payloads and the token layer land on the same colour in the same session. */
const MAP = [
  // blues folding onto the canonical --blue #004FC8
  ['#0b6efd', '#004FC8'],   // --blue-brand
  ['#0A68FF', '#004FC8'],   // --blue-alt-tmp
  ['#2563eb', '#004FC8'],   // --blue-accent-tmp
  // blues folding onto --blue-deep #0043B3
  ['#005CE6', '#0043B3'],   // --blue-hover-tmp
  ['#0958d9', '#0043B3'],   // --blue-deep
  ['#0856c9', '#0043B3'],   // --blue-ask-tmp
  ['#1a73e8', '#004FC8'],   // --blue-inline-tmp
  ['#1557b0', '#0043B3'],   // --blue-inline-deep-tmp
  // border grey folding onto --border-1
  ['#cbd5e1', '#e2e8f0'],   // --border-2-tmp
  // blue tints: base moves, alpha is preserved
  ['rgba(13,110,253,0)', 'rgba(0,79,200,0)'],
  ['rgba(13, 110, 253, 0)', 'rgba(0, 79, 200, 0)'],
  ['rgba(13,110,253,0.05)', 'rgba(0,79,200,0.05)'],
  ['rgba(13,110,253,0.08)', 'rgba(0,79,200,0.08)'],
  ['rgba(13, 110, 253, 0.08)', 'rgba(0, 79, 200, 0.08)'],
  ['rgba(13,110,253,0.25)', 'rgba(0,79,200,0.25)'],
  ['rgba(13,110,253,0.4)', 'rgba(0,79,200,0.4)'],
  // drifted second base, same destination
  ['rgba(11, 110, 253, 0.35)', 'rgba(0, 79, 200, 0.35)'],
  ['rgba(11, 110, 253, 0.45)', 'rgba(0, 79, 200, 0.45)'],
];

/* The four body-level payloads define --blue at two different values under one
 * name. The name is needed for the canonical primitive, so it is renamed here;
 * the value moves in the same pass so these pages do not keep an old-blue
 * button after the token layer retargets. --blue-600 keeps its name (nothing
 * collides with it) and only changes value. */
const BODY_PAYLOAD_PAGES = [
  'calculator/index.html',
  'calculator/report/index.html',
  'contact/index.html',
  'contact/thank-you/index.html',
];

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (SKIP_DIRS.has(e.name)) continue; walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}

/* Apply fn to the contents of every <style> element, leaving everything else
 * byte-identical. */
function mapStyleBlocks(src, fn) {
  return src.replace(/(<style>)([\s\S]*?)(<\/style>)/g, (m, a, body, c) => a + fn(body) + c);
}

const files = walk(ROOT, []).sort();
const counts = new Map(MAP.map(([o]) => [o, 0]));
let renameDefs = 0, renameRefs = 0, blue600 = 0;
let filesChanged = 0, outsideStyle = [];
const pending = [];

for (const abs of files) {
  const r = path.relative(ROOT, abs).split(path.sep).join('/');
  if (FROZEN(r)) continue;
  const before = fs.readFileSync(abs, 'utf8');

  // report, but never edit, mapped literals living outside a <style> block
  const stripped = before.replace(/<style>[\s\S]*?<\/style>/g, '');
  for (const [oldV] of MAP) {
    const n = stripped.split(oldV).length - 1;
    if (n) outsideStyle.push(`${r}: ${n} x ${oldV} outside <style>`);
  }

  let after = mapStyleBlocks(before, (css) => {
    let out = css;
    for (const [oldV, newV] of MAP) {
      const n = out.split(oldV).length - 1;
      if (n) { counts.set(oldV, counts.get(oldV) + n); out = out.split(oldV).join(newV); }
    }
    return out;
  });

  if (BODY_PAYLOAD_PAGES.includes(r)) {
    after = mapStyleBlocks(after, (css) => {
      let out = css;
      // definition: --blue: <value>  ->  --btn-blue: <value>
      out = out.replace(/--blue(?![-\w])/g, (m) => { renameDefs++; return '--btn-blue'; });
      // var(--blue) references were rewritten by the same pattern above
      return out;
    });
    // count how many of those were var() references rather than definitions
    renameRefs += (before.match(/var\(--blue(?![-\w])/g) || []).length;
  }

  if (after !== before) { pending.push([abs, after]); filesChanged++; }
}

console.log(`Files scanned (consultation excluded): ${files.length}`);
console.log('\nLiteral replacements inside <style> blocks:');
let total = 0;
for (const [oldV, n] of counts) {
  const newV = MAP.find(([o]) => o === oldV)[1];
  console.log(`  ${String(n).padStart(4)}  ${oldV.padEnd(26)} -> ${newV}`);
  total += n;
}
console.log(`  ${String(total).padStart(4)}  TOTAL`);
console.log(`\n--blue -> --btn-blue occurrences rewritten: ${renameDefs} (of which ${renameRefs} are var() references)`);
console.log(`Files to write: ${filesChanged}`);

if (outsideStyle.length) {
  console.log(`\nNOTE: ${outsideStyle.length} mapped literal(s) live outside a <style> block and were NOT edited:`);
  for (const o of outsideStyle) console.log(`  - ${o}`);
}

if (total === 0) { console.error('\nFAIL: no replacements made'); process.exit(1); }

if (!WRITE) { console.log('\nDRY RUN ok. Re-run with --write to apply.'); process.exit(0); }
for (const [abs, src] of pending) fs.writeFileSync(abs, src);
console.log(`\nPASS: wrote ${pending.length} files`);
