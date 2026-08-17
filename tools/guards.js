#!/usr/bin/env node
'use strict';

/*
 * Guard integrity checker for the rebrand branch.
 *
 * Two guardrails must survive every rebrand sweep untouched:
 *
 *   1. The noindex guard (commit 3596d3d) - an inline <head> script that sets
 *      meta[name="robots"] to "noindex, nofollow" on any non-production
 *      hostname. Marked by NOINDEX_MARKER below.
 *   2. The gtag hostname gate (commit 187bfbd) - the inline <head> script that
 *      only initialises GA4 / Google Ads when the hostname is
 *      monetize-parking.com, and defines a no-op gtag otherwise.
 *
 * BOTH ARE PERMANENT. They were built to be reverted on merge day and that was
 * wrong: the preview environment is ongoing, so the day they would have been
 * deleted is the day the preview starts needing them indefinitely. The revert
 * items are gone from the merge-day checklist and must not be re-added. Full
 * reasoning in CLAUDE.md, "The hostname gates are permanent infrastructure",
 * including why git revert of the two commits was tested and does not apply.
 *
 * So a failure here is a LIVE DEFECT, not a future merge conflict: it means the
 * preview is indexable, or is firing real analytics, from the commit that broke
 * it. This script hashes each block on every page and compares against a
 * captured baseline.
 *
 * Usage:
 *   node tools/guards.js capture    # write tools/guards.baseline.json
 *   node tools/guards.js verify     # compare working tree against baseline
 *
 * Both subcommands print the number of files scanned and the number of blocks
 * found. `verify` exits non-zero and prints every difference on any mismatch.
 *
 * IMPORTANT - the counts are 155 noindex and 154 gtag, and BOTH include
 * templates/article-index.html. The template is not a rendered page; a checker
 * that enumerates rendered pages only reports one fewer of each and looks like a
 * regression. This cost one false alarm already, so the expected totals are
 * asserted explicitly below. 404.html is the one file with a noindex block and
 * no gtag block, which is why the two totals differ by one.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const BASELINE = path.join(ROOT, 'tools', 'guards.baseline.json');

// Directories that never contain guarded pages.
//   node_modules / .git  - not ours
//   docs                 - the homepage prototype carries no analytics by design
const SKIP_DIRS = new Set(['node_modules', '.git', 'docs']);

// Expected totals. These are asserted, not merely reported, so an enumeration
// bug fails loudly instead of quietly shrinking the covered set.
//
// Raised from 150/149 on 2026-08-12, when services/solar-lighting/index.html
// was added. That is the FIRST file addition of the rebrand: every pass before
// it edited existing files, so the totals had never legitimately moved. They
// are 151 noindex and 150 gtag because the new page carries both guard blocks,
// copied byte-identically from services/index.html rather than authored.
//
// The recapture that accompanied this was gated on the new baseline differing
// from the old in exactly one added entry, with all 150 pre-existing hashes
// unchanged, so the recapture could not launder a drift elsewhere. Any future
// change to these numbers deserves the same check.
//
// Raised again to 152/151 on 2026-08-13, when services/ev-charging/index.html
// was added. Second file addition of the rebrand, same shape as the first: the
// new page was built from services/solar-lighting/index.html as a structural
// donor, so both guard blocks are byte-identical to the donor's by
// construction rather than by care. Same gated recapture: exactly one entry
// added, zero removed, all 151 pre-existing hashes byte-identical.
//
// Raised again to 155/154 on 2026-08-16, when the three solar lighting
// articles were added (what-parking-lot-lighting-costs,
// solar-lighting-winter-performance, when-solar-lighting-is-wrong). Third
// addition of the rebrand and the first that is not hand-authored: these are
// generated pages, so all three carry both guard blocks copied from
// templates/article-index.html by npm run generate:articles, which is why the
// noindex and gtag counts moved together by three. Same gated recapture:
// exactly three entries added, zero removed, all 152 pre-existing hashes
// byte-identical.
const EXPECT_NOINDEX = 155;
const EXPECT_GTAG = 154;

// This string is BOTH the marker guards.js searches for AND part of the hashed
// block. Reword the comment on the pages and this constant must move with it in
// the same commit, or every block becomes undiscoverable and the counts drop to
// zero. Changed 2026-08-17 from "- remove on merge day", which was stale once the
// gates became permanent.
const NOINDEX_MARKER = '<!-- Preview noindex guard - PERMANENT, do not remove. Reasoning in CLAUDE.md -->';
const GTAG_NEEDLE = "window.location.hostname === 'monetize-parking.com'";

function sha(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/* Extract the noindex guard: the marker comment through the end of the
 * <script> element that follows it. Whitespace between the two is included so
 * that reindentation is caught as a change. */
function extractNoindex(src) {
  const start = src.indexOf(NOINDEX_MARKER);
  if (start === -1) return null;
  const close = src.indexOf('</script>', start);
  if (close === -1) return null;
  return src.slice(start, close + '</script>'.length);
}

/* Extract the gtag gate: the whole <script> element whose body performs the
 * production hostname comparison. The async loader tag above it is deliberately
 * not part of the hash; it is not gated and never changes. */
function extractGtag(src) {
  const re = /<script>[\s\S]*?<\/script>/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[0].includes(GTAG_NEEDLE)) return m[0];
  }
  return null;
}

function scan() {
  const files = walk(ROOT, []).sort();
  const entries = {};
  let noindexCount = 0;
  let gtagCount = 0;

  for (const abs of files) {
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    const src = fs.readFileSync(abs, 'utf8');
    const noindex = extractNoindex(src);
    const gtag = extractGtag(src);
    if (!noindex && !gtag) continue;
    if (noindex) noindexCount++;
    if (gtag) gtagCount++;
    entries[rel] = {
      noindex: noindex ? sha(noindex) : null,
      gtag: gtag ? sha(gtag) : null,
    };
  }

  return {
    scannedFiles: files.length,
    guardedFiles: Object.keys(entries).length,
    noindexCount,
    gtagCount,
    entries,
  };
}

function assertTotals(result, label) {
  const problems = [];
  if (result.noindexCount !== EXPECT_NOINDEX) {
    problems.push(
      `noindex block count is ${result.noindexCount}, expected ${EXPECT_NOINDEX}`
    );
  }
  if (result.gtagCount !== EXPECT_GTAG) {
    problems.push(
      `gtag gate count is ${result.gtagCount}, expected ${EXPECT_GTAG}`
    );
  }
  const tpl = 'templates/article-index.html';
  if (!result.entries[tpl]) {
    problems.push(`${tpl} carries no guard blocks; it must carry both`);
  } else {
    if (!result.entries[tpl].noindex) problems.push(`${tpl} is missing the noindex guard`);
    if (!result.entries[tpl].gtag) problems.push(`${tpl} is missing the gtag gate`);
  }
  if (problems.length) {
    console.error(`\nFAIL (${label}): guard totals are wrong`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error(
      '\nThe expected totals include templates/article-index.html. If a real,\n' +
      'intentional change moved these numbers, update EXPECT_NOINDEX /\n' +
      'EXPECT_GTAG in tools/guards.js in the same commit and say why.'
    );
    process.exit(1);
  }
}

function capture() {
  const result = scan();
  console.log(`Scanned ${result.scannedFiles} HTML files under ${ROOT}`);
  console.log(`Guarded files:  ${result.guardedFiles}`);
  console.log(`noindex blocks: ${result.noindexCount} (expected ${EXPECT_NOINDEX})`);
  console.log(`gtag gates:     ${result.gtagCount} (expected ${EXPECT_GTAG})`);
  assertTotals(result, 'capture');

  const baseline = {
    capturedAt: new Date().toISOString(),
    expect: { noindex: EXPECT_NOINDEX, gtag: EXPECT_GTAG },
    counts: {
      guardedFiles: result.guardedFiles,
      noindex: result.noindexCount,
      gtag: result.gtagCount,
    },
    entries: result.entries,
  };
  fs.writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + '\n');
  console.log(`\nPASS: baseline written to ${path.relative(ROOT, BASELINE)}`);
  console.log(`      ${result.guardedFiles} files, ${result.noindexCount + result.gtagCount} block hashes recorded`);
}

function verify() {
  if (!fs.existsSync(BASELINE)) {
    console.error(`FAIL: no baseline at ${path.relative(ROOT, BASELINE)}`);
    console.error('      Run "node tools/guards.js capture" BEFORE the first edit of a pass.');
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const result = scan();

  console.log(`Scanned ${result.scannedFiles} HTML files under ${ROOT}`);
  console.log(`Guarded files:  ${result.guardedFiles} (baseline ${baseline.counts.guardedFiles})`);
  console.log(`noindex blocks: ${result.noindexCount} (baseline ${baseline.counts.noindex}, expected ${EXPECT_NOINDEX})`);
  console.log(`gtag gates:     ${result.gtagCount} (baseline ${baseline.counts.gtag}, expected ${EXPECT_GTAG})`);
  assertTotals(result, 'verify');

  const problems = [];
  const baseFiles = Object.keys(baseline.entries);
  const nowFiles = Object.keys(result.entries);

  for (const f of baseFiles) {
    if (!result.entries[f]) { problems.push(`${f}: guarded in baseline, no guard blocks now`); continue; }
    const b = baseline.entries[f];
    const n = result.entries[f];
    if (b.noindex !== n.noindex) {
      problems.push(`${f}: noindex guard CHANGED (${b.noindex ? b.noindex.slice(0, 12) : 'absent'} -> ${n.noindex ? n.noindex.slice(0, 12) : 'absent'})`);
    }
    if (b.gtag !== n.gtag) {
      problems.push(`${f}: gtag gate CHANGED (${b.gtag ? b.gtag.slice(0, 12) : 'absent'} -> ${n.gtag ? n.gtag.slice(0, 12) : 'absent'})`);
    }
  }
  for (const f of nowFiles) {
    if (!baseline.entries[f]) problems.push(`${f}: guard blocks present now, absent from baseline`);
  }

  let checkedHashes = 0;
  for (const f of baseFiles) {
    const b = baseline.entries[f];
    if (b.noindex) checkedHashes++;
    if (b.gtag) checkedHashes++;
  }

  if (problems.length) {
    console.error(`\nFAIL: ${problems.length} guard difference(s) across ${baseFiles.length} baselined files`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nThe merge-day reverts of 187bfbd and 3596d3d depend on these blocks being');
    console.error('byte-identical. Fix before the next commit.');
    process.exit(1);
  }

  console.log(`\nPASS: ${checkedHashes} block hashes compared across ${baseFiles.length} files, all identical`);
}

const cmd = process.argv[2];
if (cmd === 'capture') capture();
else if (cmd === 'verify') verify();
else {
  console.error('Usage: node tools/guards.js capture|verify');
  process.exit(2);
}
