#!/usr/bin/env node
'use strict';
/*
 * Bundle B commit 2 propagation.
 *
 * Every edit is anchored on a regex (never on leading whitespace, so the
 * 8-page four-space indentation variance including index.html cannot be
 * skipped), and every matched block is hashed and required to equal the
 * expected value before it is replaced. Exact expected counts are asserted;
 * any deviation aborts before a single file is written.
 *
 * Dry run by default. Pass --write to apply.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'docs']);
const WRITE = process.argv.includes('--write');

const EXPECT_HEADER = 148;
const EXPECT_FOOTER = 148;
const EXPECT_CSS = 114;

const OLD_HEADER_HASH = 'fe099ec8fec1';
const OLD_FOOTER_HASH = '0169ace76aa7';

const h12 = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (SKIP_DIRS.has(e.name)) continue; walk(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}

const NEW_HEADER = `<header class="site-header">
    <div class="header-inner">
      <a href="/" class="brand" aria-label="Monetize Parking Home">
        <img src="/assets/brand/MP_Logo_400.png" alt="Monetize Parking" class="logo" width="400" height="160" />
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="siteNav" aria-label="Open menu">
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
      </button>
      <nav class="site-nav" id="siteNav" aria-label="Primary">
        <div class="nav-item">
          <a class="nav-trigger" href="/services/" data-nav-panel="panelWhat">
            What We Do
            <svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
          </a>
          <div class="nav-panel" id="panelWhat" hidden>
            <a href="/services/">All Services</a>
            <a href="/services/#parking">Parking Revenue &amp; Management</a>
            <a href="/services/#solar" class="scope-green">Solar Lighting</a>
            <a href="/services/#ev" class="scope-green">EV Charging</a>
          </div>
        </div>
        <div class="nav-item">
          <a class="nav-trigger" href="/resources/" data-nav-panel="panelRes">
            Resources
            <svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
          </a>
          <div class="nav-panel" id="panelRes" hidden>
            <a href="/resources/">Articles &amp; Guides</a>
            <a href="/ask-the-experts.html">Video Library</a>
            <a href="/resources/states/">State Guides</a>
            <a href="/faq/">FAQ</a>
          </div>
        </div>
        <div class="nav-item">
          <a class="nav-link" href="/about/">About</a>
        </div>
        <div class="mobile-actions">
          <a href="/calculator/" class="btn btn--secondary">Try the Calculator</a>
          <a href="/contact/" class="btn btn--primary">Get an Assessment</a>
        </div>
      </nav>
      <div class="header-actions">
        <a href="/calculator/" class="btn btn--sm btn--secondary btn--calc">Calculator</a>
        <a href="/contact/" class="btn btn--sm btn--primary">Get an Assessment</a>
      </div>
    </div>
  </header>`;

const SOCIAL = `<a href="https://www.linkedin.com/company/monetize-parking/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            <a href="https://www.youtube.com/@Monetizeparking" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a href="https://www.facebook.com/monetizeparking/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
            <a href="https://www.instagram.com/monetizeparking/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg></a>
            <a href="https://www.tiktok.com/@monetize_parking" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>`;

const NEW_FOOTER = `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/assets/brand/MP_Logo_400.png" alt="Monetize Parking" width="400" height="160" />
          <p>Vendor-neutral consulting for parking revenue, solar lighting, and EV charging.</p>
          <div class="footer-social">
            ${SOCIAL}
          </div>
        </div>
        <nav class="footer-col" aria-label="What We Do">
          <h3>What We Do</h3>
          <ul>
            <li><a href="/services/#parking">Parking Revenue</a></li>
            <li><a href="/services/#solar">Solar Lighting</a></li>
            <li><a href="/services/#ev">EV Charging</a></li>
            <li><a href="/calculator/">Revenue Calculator</a></li>
          </ul>
        </nav>
        <nav class="footer-col" aria-label="Resources">
          <h3>Resources</h3>
          <ul>
            <li><a href="/resources/">Articles &amp; Guides</a></li>
            <li><a href="/ask-the-experts.html">Video Library</a></li>
            <li><a href="/resources/states/">State Guides</a></li>
            <li><a href="/faq/">FAQ</a></li>
          </ul>
        </nav>
        <div class="footer-col">
          <h3>Contact</h3>
          <ul>
            <li><a href="mailto:info@monetize-parking.com">info@monetize-parking.com</a></li>
            <li><a href="/about/">About</a></li>
          </ul>
          <a href="/contact/" class="btn btn--sm btn--primary">Get an Assessment</a>
          <p class="footer-note">Free assessment, no obligation, month-to-month terms.</p>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; <span id="year">2026</span> Monetize Parking - Built for parking lot owners who want results.
      </div>
    </div>
  </footer>`;

const OLD_CSS = fs.readFileSync(path.join(__dirname,'fixtures','old-inline-header.css'), 'utf8').replace(/\n$/, '');
const NEW_CSS = fs.readFileSync(path.join(__dirname,'fixtures','new-inline-header.css'), 'utf8').replace(/\n$/, '');

const files = walk(ROOT, []).sort();
let nHeader = 0, nFooter = 0, nCss = 0;
const problems = [];
const pending = [];

for (const abs of files) {
  const rel = path.relative(ROOT, abs);
  let src = fs.readFileSync(abs, 'utf8');
  const before = src;
  let touched = false;

  // --- header block ---------------------------------------------------
  const hOpen = /<header[^>]*class="site-header"[^>]*>/.exec(src);
  if (hOpen) {
    const end = src.indexOf('</header>', hOpen.index);
    if (end === -1) { problems.push(`${rel}: <header> with no </header>`); continue; }
    const block = src.slice(hOpen.index, end + '</header>'.length);
    if (h12(block) !== OLD_HEADER_HASH) {
      problems.push(`${rel}: header block hash ${h12(block)}, expected ${OLD_HEADER_HASH}`);
    } else {
      src = src.slice(0, hOpen.index) + NEW_HEADER + src.slice(end + '</header>'.length);
      nHeader++; touched = true;
    }
  }

  // --- footer block ---------------------------------------------------
  const fOpen = /<footer[^>]*class="footer"[^>]*>/.exec(src);
  if (fOpen) {
    const end = src.indexOf('</footer>', fOpen.index);
    if (end === -1) { problems.push(`${rel}: <footer> with no </footer>`); continue; }
    const block = src.slice(fOpen.index, end + '</footer>'.length);
    if (h12(block) !== OLD_FOOTER_HASH) {
      problems.push(`${rel}: footer block hash ${h12(block)}, expected ${OLD_FOOTER_HASH}`);
    } else {
      src = src.slice(0, fOpen.index) + NEW_FOOTER + src.slice(end + '</footer>'.length);
      nFooter++; touched = true;
    }
  }

  // --- inline critical header rules -----------------------------------
  const occurrences = src.split(OLD_CSS).length - 1;
  if (occurrences > 1) {
    problems.push(`${rel}: inline header CSS slice found ${occurrences} times, expected 0 or 1`);
  } else if (occurrences === 1) {
    src = src.replace(OLD_CSS, NEW_CSS);
    nCss++; touched = true;
  }

  if (touched && src !== before) pending.push([abs, src]);
}

console.log(`Files scanned:            ${files.length}`);
console.log(`Header blocks replaced:   ${nHeader} (expected ${EXPECT_HEADER})`);
console.log(`Footer blocks replaced:   ${nFooter} (expected ${EXPECT_FOOTER})`);
console.log(`Inline CSS slices:        ${nCss} (expected ${EXPECT_CSS})`);
console.log(`Files to write:           ${pending.length}`);

if (nHeader !== EXPECT_HEADER) problems.push(`header count ${nHeader} != ${EXPECT_HEADER}`);
if (nFooter !== EXPECT_FOOTER) problems.push(`footer count ${nFooter} != ${EXPECT_FOOTER}`);
if (nCss !== EXPECT_CSS) problems.push(`inline CSS count ${nCss} != ${EXPECT_CSS}`);

if (problems.length) {
  console.error(`\nFAIL: ${problems.length} problem(s), nothing written`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

if (!WRITE) {
  console.log('\nDRY RUN ok. Re-run with --write to apply.');
  process.exit(0);
}

for (const [abs, src] of pending) fs.writeFileSync(abs, src);
console.log(`\nPASS: wrote ${pending.length} files`);
