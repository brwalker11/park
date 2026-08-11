#!/usr/bin/env node
'use strict';
/*
 * Homepage rebuild splice.
 *
 * Rewrites only three regions of index.html and leaves everything else byte
 * identical:
 *   1. inserts a SECOND head <style> block after the shared 4757-byte payload,
 *      following the services/index.html pattern, so the six-file shared
 *      payload group is not split
 *   2. adds the page-home class to <body>
 *   3. replaces <main> ... </main>
 * and removes the hero video's bespoke loading script, which has no subject
 * once the video hero is gone.
 *
 * The <head> guard blocks and the Bundle B header and footer are never matched
 * by any of these anchors.
 *
 * Dry run by default. Pass --write to apply.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const S = process.env.HOME_SPLICE_SRC || path.join(__dirname, 'fixtures');
const WRITE = process.argv.includes('--write');

const FILE = path.join(ROOT, 'index.html');
const src = fs.readFileSync(FILE, 'utf8');
let out = src;
const problems = [];
const counts = {};

function once(name, needle, replacement) {
  const n = out.split(needle).length - 1;
  counts[name] = n;
  if (n !== 1) { problems.push(`${name}: matched ${n} time(s), expected exactly 1`); return; }
  out = out.replace(needle, replacement);
}

// ---- 1. second head <style> block ------------------------------------------
// Anchored on the END of the shared payload plus the comment that follows it,
// so the shared payload itself is not touched.
const criticalCss = fs.readFileSync(path.join(S, 'home-critical.css'), 'utf8').replace(/\n$/, '');
const AFTER_SHARED = '</style>\n  <!-- Deferred full CSS loading -->';
once('second <style> block',
  AFTER_SHARED,
  `</style>\n  <!-- Homepage critical CSS. Second block on purpose: the block above is\n       byte-identical across six pages, and diverging it would split that\n       payload group. Hex literals only, never var(): a token reference here\n       would resolve only once the async styles.css lands, which is the exact\n       flash this payload exists to prevent. -->\n  <style>${criticalCss}</style>\n  <!-- Deferred full CSS loading -->`);

// ---- 2. body class ---------------------------------------------------------
once('body class', '<body>\n  <a href="#main" class="skip-link">',
  '<body class="page-home">\n  <a href="#main" class="skip-link">');

// ---- 3. <main> -------------------------------------------------------------
const newMain = fs.readFileSync(path.join(S, 'main.html'), 'utf8').replace(/\n$/, '');
{
  const a = out.indexOf('  <main id="main">');
  const b = out.indexOf('</main>');
  if (a === -1 || b === -1 || b < a) problems.push('main: could not locate <main> ... </main>');
  else {
    counts['<main> replaced'] = 1;
    out = out.slice(0, a) + newMain + out.slice(b + '</main>'.length);
  }
}

// ---- 4. drop the hero video loader ----------------------------------------
{
  const marker = '  <script>\n    // Intelligent video loading optimization';
  const a = out.indexOf(marker);
  if (a === -1) problems.push('video script: marker not found');
  else {
    const b = out.indexOf('</script>', a);
    counts['video loader removed'] = 1;
    out = out.slice(0, a) + out.slice(b + '</script>'.length).replace(/^\n/, '');
  }
}

// ---- assertions ------------------------------------------------------------
const guardChecks = {
  'noindex guard intact': '<!-- Preview noindex guard - remove on merge day -->',
  'gtag gate intact': "window.location.hostname === 'monetize-parking.com'",
  'Bundle B header intact': '<header class="site-header">',
  'Bundle B footer intact': '<footer class="site-footer">',
  'shared payload intact': ':root{--brand:#004FC8;--brand-blue:#004FC8;',
};
for (const [k, needle] of Object.entries(guardChecks)) {
  if (!out.includes(needle)) problems.push(`${k}: MISSING after splice`);
}
if (out.includes('hero-bg__video')) problems.push('video markup still present');

for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);
console.log(`  head <style> blocks now: ${(out.slice(0, out.indexOf('</head>')).match(/<style>/g) || []).length} (expected 2)`);
console.log(`  bytes: ${src.length} -> ${out.length}`);

if (problems.length) {
  console.error(`\nFAIL: ${problems.length} problem(s), nothing written`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
if (!WRITE) { console.log('\nDRY RUN ok. Re-run with --write to apply.'); process.exit(0); }
fs.writeFileSync(FILE, out);
console.log('\nPASS: index.html rewritten');
