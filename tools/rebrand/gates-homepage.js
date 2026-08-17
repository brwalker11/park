#!/usr/bin/env node
'use strict';
/*
 * Homepage rebuild verification gates.
 * Every gate prints the count it checked.
 * Usage: node tools/rebrand/gates-homepage.js <base-commit>
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE = process.argv[2];
if (!BASE) { console.error('Usage: node tools/rebrand/gates-homepage.js <base-commit>'); process.exit(2); }
process.chdir(ROOT);

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const atBase = (r) => { try { return cp.execSync(`git show ${BASE}:"${r}"`, { encoding: 'utf8', maxBuffer: 64e6 }); } catch { return null; } };
const h = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

let failures = 0;
function gate(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (detail) console.log(`      ${detail}`);
  if (!ok) failures++;
}

const home = read('index.html');
const head = home.slice(0, home.indexOf('</head>'));
const headStyles = [...head.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);

// ---------------------------------------------- 1. payload group not split
const SKIP = new Set(['node_modules', '.git', 'docs']);
function walk(d, o) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) { if (SKIP.has(e.name)) continue; walk(path.join(d, e.name), o); } else if (e.name.endsWith('.html')) o.push(path.join(d, e.name)); } return o; }
const files = walk(ROOT, []).sort();
const sharedHash = h(headStyles[0]);
const sharing = files.filter(f => {
  const s = fs.readFileSync(f, 'utf8'); const hd = s.slice(0, s.indexOf('</head>'));
  return [...hd.matchAll(/<style>([\s\S]*?)<\/style>/g)].some(m => h(m[1]) === sharedHash);
}).map(f => path.relative(ROOT, f));
gate('shared critical payload still spans six pages', sharing.length === 6,
  `${sharing.length} pages share payload ${sharedHash}: ${sharing.join(', ')}`);
gate('homepage carries exactly two head <style> blocks', headStyles.length === 2,
  `${headStyles.length} blocks: shared ${headStyles[0].length}B + homepage ${headStyles[1] ? headStyles[1].length : 0}B`);
gate('shared payload byte-identical to base', headStyles[0] === (() => {
  const b = atBase('index.html'); const bh = b.slice(0, b.indexOf('</head>'));
  return [...bh.matchAll(/<style>([\s\S]*?)<\/style>/g)][0][1];
})(), 'the six-page shared block was not edited');

// ---------------------------------------------- 2. critical CSS discipline
const homeCritical = headStyles[1] || '';
const varRefs = [...homeCritical.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)].map(m => m[1]);
gate('homepage critical CSS uses hex literals only, no var()', varRefs.length === 0,
  `${homeCritical.length} bytes scanned; ${varRefs.length} var() reference(s)${varRefs.length ? ': ' + [...new Set(varRefs)].join(', ') : ''}`);

// ---------------------------------------------- 3. chrome and guards untouched
const baseHome = atBase('index.html');
function slice(src, open, close) { const re = new RegExp(open); const m = re.exec(src); if (!m) return null; const e = src.indexOf(close, m.index); return src.slice(m.index, e + close.length); }
const pairs = [
  ['header', '<header[^>]*class="site-header"[^>]*>', '</header>'],
  ['footer', '<footer[^>]*class="site-footer"[^>]*>', '</footer>'],
];
let chromeOk = true, chromeDetail = [];
for (const [name, open, close] of pairs) {
  const a = slice(baseHome, open, close), b = slice(home, open, close);
  const same = a !== null && a === b;
  if (!same) chromeOk = false;
  chromeDetail.push(`${name} ${same ? 'identical' : 'CHANGED'} (${a ? a.length : 0}B)`);
}
gate('Bundle B chrome byte-identical', chromeOk, chromeDetail.join(', '));

// ---------------------------------------------- 4. no other page changed
const changed = cp.execSync(`git diff --name-only ${BASE}`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
// REBRAND.md was deleted at the end of the rebrand. The entry stays because this
// is a one-shot gate for a pass that already ran, and removing it would change
// what the gate allowed at the time.
const allowed = new Set(['index.html', 'styles.css', 'script.js', 'REBRAND.md', 'docs/execution-plan.md',
  'tools/rebrand/splice-homepage.js', 'tools/rebrand/gates-homepage.js',
  'tools/rebrand/fixtures/main.html', 'tools/rebrand/fixtures/home-critical.css']);
const stray = changed.filter(f => !allowed.has(f));
gate('no page outside the homepage touched', stray.length === 0,
  `${changed.length} file(s) changed since ${BASE}; ${stray.length} outside the allowed set${stray.length ? ': ' + stray.join(', ') : ''}`);

const frozen = ['_headers', '_redirects', 'robots.txt', 'sitemap.xml', 'consultation/index.html', 'consultation/thank-you/index.html'];
const frozenChanged = frozen.filter(f => read(f) !== atBase(f));
gate('frozen files untouched', frozenChanged.length === 0,
  `${frozen.length} frozen paths compared against ${BASE}; ${frozenChanged.length} changed`);

// ---------------------------------------------- 5. motion wiring
const body = home.slice(home.indexOf('<body'));
const reveals = (body.match(/data-reveal(?![-\w])/g) || []).length;
const groups = (body.match(/data-reveal-group/g) || []).length;
const counters = (body.match(/data-count-to="/g) || []).length;
gate('motion opt-in attributes present', reveals > 0 && groups > 0 && counters === 4,
  `${reveals} data-reveal, ${groups} data-reveal-group, ${counters} data-count-to (expected 4)`);

const inlineScripts = [...body.matchAll(/<script(?![^>]*src)[^>]*>/g)].length;
gate('no inline motion script on the page', inlineScripts === 0,
  `${inlineScripts} inline <script> element(s) in <body> (expected 0; motion lives in script.js)`);
gate('motion CSS is not in the homepage payload',
  !homeCritical.includes('is-armed') && !homeCritical.includes('data-reveal'),
  'homepage critical block carries no motion rules; they load site-wide from styles.css');

const js = read('script.js');
gate('motion system exported from script.js',
  js.includes('window.MPMotion') && js.includes('MutationObserver') && js.includes('is-armed'),
  `script.js ${js.length}B, exports MPMotion with MutationObserver and individual arming`);
gate('js/article.js untouched', read('js/article.js') === atBase('js/article.js'),
  'the late-content mechanism required no change to the article runtime');

// counters must carry their final value in the HTML
const counterEls = [...body.matchAll(/data-count-to="(\d+)"[^>]*>([^<]*)</g)];
const badCounters = counterEls.filter(m => m[1] !== m[2].trim());
gate('count-up targets carry their final value in the HTML', badCounters.length === 0,
  `${counterEls.length} counters checked; ${badCounters.length} whose text does not equal its target`);

// ---------------------------------------------- 6. content rules
const text = body.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const emdash = (text.match(/[—–]/g) || []).length;
const firstPerson = [...text.matchAll(/\b(we|our|ours|us|my)\b/gi)].map(m => m[0]);
const superl = (text.match(/\b(best|leading|premier|unmatched|world-class)\b/gi) || []).length;
gate('no em dashes in body copy', emdash === 0, `${text.length} characters scanned; ${emdash} found`);
// "What We Do" is the recorded exception: a nav/section label, not body prose
const fpReal = firstPerson.filter((_, i) => {
  const idx = text.toLowerCase().indexOf('what we do');
  return idx === -1 ? true : true;
});
const whatWeDo = (text.match(/What We Do/g) || []).length;
gate('no first person in body copy', firstPerson.length === whatWeDo,
  `${firstPerson.length} match(es), ${whatWeDo} of them the recorded "What We Do" label exception`);
gate('no superlatives', superl === 0, `${text.length} characters scanned; ${superl} found`);

const PERMITTED = ['178', '45', '90', '240', '3,000', '8,000', '30', '101', '2026', '1', '2', '3'];
const nums = [...new Set([...text.matchAll(/\$?[\d][\d,]*/g)].map(m => m[0].replace('$', '')))];
const unexpected = nums.filter(n => !PERMITTED.includes(n));
gate('only permitted figures appear', unexpected.length === 0,
  `${nums.length} distinct numbers in body copy; unexpected: ${unexpected.join(', ') || 'none'}`);

// ---------------------------------------------- 7. links resolve
const hrefs = [...new Set([...body.matchAll(/href="(\/[^"#]*)/g)].map(m => m[1]))];
const dead = hrefs.filter(hh => hh.endsWith('.html')
  ? !fs.existsSync(path.join(ROOT, hh.replace(/^\//, '')))
  : !fs.existsSync(path.join(ROOT, hh.replace(/^\//, ''), 'index.html')));
gate('every homepage link resolves', dead.length === 0,
  `${hrefs.length} distinct internal targets checked; dead: ${dead.join(', ') || 'none'}`);

// ---------------------------------------------- 8. photo slots documented
const slots = (home.match(/PHOTO SLOT/g) || []).length;
gate('image slots documented in comments', slots === 3,
  `${slots} PHOTO SLOT comments (hero, approach, resource thumbs)`);

// ---------------------------------------------- 9. JS health
try { cp.execSync('node --check script.js', { stdio: 'pipe' }); gate('node --check script.js', true, '1 file'); }
catch (e) { gate('node --check script.js', false, String(e.stderr || e)); }

console.log(`\n${failures === 0 ? 'ALL GATES PASSED' : failures + ' GATE(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
