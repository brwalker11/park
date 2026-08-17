#!/usr/bin/env node
'use strict';

/*
 * Conversion integrity checker for the /consultation/ ad landing path.
 *
 * WHY THIS IS SEPARATE FROM tools/guards.js
 *
 * guards.js protects two blocks that are DESIGNED TO BE DELETED on merge day
 * (the noindex guard and the gtag hostname gate). A failure there means "a sweep
 * disturbed something that has to be reverted later".
 *
 * The blocks here are the opposite. They must survive forever, across every
 * redesign of these two pages. A failure here means "revenue tracking is
 * broken": Google Ads stops counting conversions, or the only booking path on
 * the site stops reporting. Folding them into guards.js would mix those two
 * meanings and would move the 155 / 154 / 309 totals that CLAUDE.md quotes
 * by number.
 *
 * WHAT IS COVERED
 *
 * Five hashed blocks, byte-identical:
 *   1. consultation/thank-you  Google Ads conversion snippet (send_to, value,
 *                              currency). This is the money block.
 *   2. consultation/thank-you  ppc_callback_conversion load handler.
 *   3. consultation/           Calendly postMessage listener - fires
 *                              calendly_booking and performs the redirect that
 *                              causes block 1 to run.
 *   4. consultation/           ppc_phone_click handler (added f2b1b14).
 *   5. consultation/           callback form submit handler. It performs the
 *                              redirect to thank-you, so a break here silently
 *                              stops form leads being counted as conversions.
 *
 * Plus an assertion set for strings that must survive but whose surrounding
 * markup is expected to change during the rebrand.
 *
 * WHAT IS DELIBERATELY NOT COVERED, AND WHY
 *
 * The Calendly embed <div> is NOT hashed. Its data-url carries
 * background_color and primary_color, which are hand-matched to the CSS behind
 * the iframe; the rebrand has to change them when the section changes surface.
 * Hashing the div would block intended work. Instead the two things in that URL
 * that must never change - the booking path and hide_gdpr_banner - are asserted
 * individually, leaving the colour parameters free.
 *
 * The Formspree callback form is asserted CONDITIONALLY. It was briefly cut in
 * 33d7191 and restored as the page's PRIMARY mechanism in b8fa637, so the
 * conditional shape has already earned its keep once and is kept rather than
 * hardened. What is invariant: IF a Formspree form is present, it posts to the
 * landing page's own endpoint (not the shared contact one) and carries both the
 * honeypot and the reply-to wiring. Its submit HANDLER is hashed unconditionally
 * as block 5, because that is what fires the conversion.
 *
 * Usage:
 *   node tools/conversion-guard.js capture   # write the baseline
 *   node tools/conversion-guard.js verify    # compare working tree
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const BASELINE = path.join(ROOT, 'tools', 'conversion-guard.baseline.json');

const LP = 'consultation/index.html';
const TY = 'consultation/thank-you/index.html';

// Asserted, not merely reported, so an extraction bug fails loudly instead of
// quietly shrinking the covered set. Same discipline as guards.js.
//
// Raised from 4 to 5 on 2026-08-14 to cover the callback form's submit handler.
// It performs the redirect to /consultation/thank-you/, which is what causes
// the Ads conversion snippet on that page to run. Break the handler and form
// submissions stop being counted, exactly as they would if the Calendly
// listener broke. Gated recapture: one block added, four unchanged.
const EXPECT_BLOCKS = 5;

/* Each block is anchored on a literal that opens it and a literal that closes
 * it. Whitespace between is part of the hash, so reindentation is caught. */
const BLOCKS = [
  {
    id: 'ads-conversion',
    file: TY,
    open: '<!-- Event snippet for Submit lead form conversion page -->',
    close: '</script>',
    why: 'Google Ads conversion. Breaking this stops Ads counting conversions.',
  },
  {
    id: 'ppc-callback-handler',
    file: TY,
    open: "window.addEventListener('load'",
    close: '</script>',
    why: 'GA4 ppc_callback_conversion on the thank-you page.',
  },
  {
    id: 'calendly-listener',
    file: LP,
    open: '<!-- Calendly booking conversion tracking -->',
    close: '</script>',
    why: 'Fires calendly_booking and redirects to thank-you, which runs ads-conversion.',
  },
  {
    id: 'callback-submit-handler',
    file: LP,
    open: '<!-- Callback form submission -->',
    close: '</script>',
    why: 'Redirects to thank-you, which is what runs ads-conversion for form leads.',
  },
  {
    id: 'phone-click',
    file: LP,
    open: '<!-- Phone click conversion tracking -->',
    close: '</script>',
    why: 'GA4 ppc_phone_click. The tel: link is a real conversion route.',
  },
];

/* Strings that must be present, with an exact occurrence count. */
const ASSERTIONS = [
  { file: LP, needle: "gtag('config', 'AW-18066534348')", count: 1, why: 'Ads tag configured on the landing page' },
  { file: LP, needle: 'calendly.com/d/cxtd-94s-fmm/free-parking-consultation', count: 1, why: 'the live booking link' },
  { file: LP, needle: 'hide_gdpr_banner=1', count: 1, why: 'Calendly GDPR banner stays suppressed' },
  { file: TY, needle: "gtag('config', 'AW-18066534348')", count: 1, why: 'Ads tag configured on the thank-you page' },
  { file: TY, needle: 'AW-18066534348/dpBlCNapw5YcEMzf5aZD', count: 1, why: 'the conversion label' },
  { file: TY, needle: "'value': 1.0", count: 1, why: 'conversion value' },
  { file: TY, needle: "'currency': 'USD'", count: 1, why: 'conversion currency' },
  { file: TY, needle: "source=calendly", count: 1, why: 'the branch that stops double-counting Calendly bookings in GA4' },
];

/* Conditional: only enforced when the trigger string is present in the file. */
const CONDITIONAL = [
  {
    file: LP,
    trigger: 'formspree.io/f/',
    requires: [
      { needle: 'action="https://formspree.io/f/mqegwawp"', count: 1, why: 'the landing page keeps its OWN endpoint, not the shared contact one' },
      { needle: 'name="_gotcha"', count: 1, why: 'honeypot present on the only form receiving paid traffic' },
      { needle: 'name="_replyto"', count: 1, why: 'replies reach the lead' },
    ],
    note: 'These checks apply only while a Formspree form is on the page. The form was cut in 33d7191 and restored as the primary mechanism in b8fa637.',
  },
];

function sha(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function read(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, 'utf8');
}

function countOf(hay, needle) {
  return hay.split(needle).length - 1;
}

function extract(src, block) {
  const start = src.indexOf(block.open);
  if (start === -1) return null;
  const end = src.indexOf(block.close, start + block.open.length);
  if (end === -1) return null;
  return src.slice(start, end + block.close.length);
}

function scan() {
  const blocks = {};
  const problems = [];
  const sources = {};

  for (const rel of [LP, TY]) {
    const src = read(rel);
    if (src === null) {
      problems.push(`${rel}: file is missing`);
      continue;
    }
    sources[rel] = src;
  }

  for (const b of BLOCKS) {
    const src = sources[b.file];
    if (src === undefined) continue;
    const body = extract(src, b);
    if (body === null) {
      problems.push(`${b.file}: block "${b.id}" not found (${b.why})`);
      continue;
    }
    // A second occurrence of the opening anchor means the extraction is
    // ambiguous and the hash would silently cover only the first one.
    if (countOf(src, b.open) !== 1) {
      problems.push(`${b.file}: block "${b.id}" opening anchor appears ${countOf(src, b.open)} times, expected exactly 1`);
      continue;
    }
    blocks[b.id] = { file: b.file, bytes: body.length, hash: sha(body) };
  }

  return { blocks, problems, sources };
}

function checkAssertions(sources) {
  const problems = [];
  let checked = 0;

  for (const a of ASSERTIONS) {
    const src = sources[a.file];
    if (src === undefined) continue;
    checked++;
    const n = countOf(src, a.needle);
    if (n !== a.count) {
      problems.push(`${a.file}: expected ${a.count} occurrence(s) of ${JSON.stringify(a.needle)}, found ${n} (${a.why})`);
    }
  }

  for (const c of CONDITIONAL) {
    const src = sources[c.file];
    if (src === undefined) continue;
    if (!src.includes(c.trigger)) {
      console.log(`  skipped: conditional set for ${c.file} (trigger ${JSON.stringify(c.trigger)} absent)`);
      console.log(`           ${c.note}`);
      continue;
    }
    for (const r of c.requires) {
      checked++;
      const n = countOf(src, r.needle);
      if (n !== r.count) {
        problems.push(`${c.file}: expected ${r.count} occurrence(s) of ${JSON.stringify(r.needle)}, found ${n} (${r.why})`);
      }
    }
  }

  return { problems, checked };
}

function report(result, assertions) {
  console.log(`Blocks found:     ${Object.keys(result.blocks).length} (expected ${EXPECT_BLOCKS})`);
  for (const b of BLOCKS) {
    const got = result.blocks[b.id];
    console.log(`  ${got ? 'ok  ' : 'MISS'}  ${b.id.padEnd(22)} ${got ? `${String(got.bytes).padStart(5)} b  ${got.hash.slice(0, 12)}` : '-'}  ${b.file}`);
  }
  console.log(`Assertions run:   ${assertions.checked}`);
}

function fail(label, problems) {
  console.error(`\nFAIL (${label}): ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nThese blocks carry Google Ads conversion tracking for the only paid');
  console.error('landing page on the site. A difference here means conversions may have');
  console.error('stopped being recorded. Do not commit until this passes.');
  process.exit(1);
}

function capture() {
  const result = scan();
  const assertions = checkAssertions(result.sources);
  report(result, assertions);

  const problems = [...result.problems, ...assertions.problems];
  if (Object.keys(result.blocks).length !== EXPECT_BLOCKS) {
    problems.push(`found ${Object.keys(result.blocks).length} blocks, expected ${EXPECT_BLOCKS}`);
  }
  if (problems.length) fail('capture', problems);

  const baseline = {
    capturedAt: new Date().toISOString(),
    expect: { blocks: EXPECT_BLOCKS },
    blocks: result.blocks,
  };
  fs.writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + '\n');
  console.log(`\nPASS: baseline written to ${path.relative(ROOT, BASELINE)}`);
  console.log(`      ${Object.keys(result.blocks).length} block hashes, ${assertions.checked} assertions`);
}

function verify() {
  if (!fs.existsSync(BASELINE)) {
    console.error(`FAIL: no baseline at ${path.relative(ROOT, BASELINE)}`);
    console.error('      Run "node tools/conversion-guard.js capture" BEFORE the first edit of a pass.');
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const result = scan();
  const assertions = checkAssertions(result.sources);
  report(result, assertions);

  const problems = [...result.problems, ...assertions.problems];

  if (Object.keys(result.blocks).length !== EXPECT_BLOCKS) {
    problems.push(`found ${Object.keys(result.blocks).length} blocks, expected ${EXPECT_BLOCKS}`);
  }

  for (const id of Object.keys(baseline.blocks)) {
    const b = baseline.blocks[id];
    const n = result.blocks[id];
    if (!n) { problems.push(`block "${id}" is in the baseline but not in the working tree`); continue; }
    if (b.hash !== n.hash) {
      problems.push(`block "${id}" CHANGED in ${n.file} (${b.hash.slice(0, 12)} @${b.bytes}b -> ${n.hash.slice(0, 12)} @${n.bytes}b)`);
    }
    if (b.file !== n.file) {
      problems.push(`block "${id}" moved file (${b.file} -> ${n.file})`);
    }
  }
  for (const id of Object.keys(result.blocks)) {
    if (!baseline.blocks[id]) problems.push(`block "${id}" present now, absent from baseline`);
  }

  if (problems.length) fail('verify', problems);

  console.log(`\nPASS: ${Object.keys(baseline.blocks).length} block hashes and ${assertions.checked} assertions, all unchanged`);
}

const cmd = process.argv[2];
if (cmd === 'capture') capture();
else if (cmd === 'verify') verify();
else {
  console.error('Usage: node tools/conversion-guard.js capture|verify');
  process.exit(2);
}
