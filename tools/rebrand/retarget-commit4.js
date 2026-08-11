#!/usr/bin/env node
'use strict';
/*
 * Bundle B commit 4: Pass 2b-b, the primitive retarget.
 *
 * 15 primitives change value, 23 are deleted and their references repointed.
 * Nothing else. No literal in any rule is touched, no selector is edited, no
 * new primitive is added.
 *
 * The exit test is the enumerated list below, NOT `grep -- -tmp`. The grep
 * catches only 13 of the 23 deletions: three drifted tint tokens become
 * byte-identical to their --blue-tint-* counterparts once the base moves, and
 * the five border greys and two neutrals fold on design-direction authority
 * rather than on a temporary-name marker.
 *
 * Cross-file references carry literal fallbacks equal to their primitive's
 * value. When a primitive moves, its fallbacks must move with it or the two
 * drift apart silently, so every fallback is rewritten here and asserted after.
 *
 * Dry run by default. Pass --write to apply.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WRITE = process.argv.includes('--write');
const FILES = ['styles.css', 'css/article.css', 'css/resources.css', 'css/state-map.css', 'css/style.css'];

/* A. 15 primitives change value, names stay. */
const RETARGET = {
  '--blue': '#004FC8',
  '--blue-deep': '#0043B3',
  '--ok': '#10B981',
  '--blue-tint-0': 'rgba(0,79,200,0)',
  '--blue-tint-04': 'rgba(0,79,200,0.04)',
  '--blue-tint-05': 'rgba(0,79,200,0.05)',
  '--blue-tint-08': 'rgba(0,79,200,0.08)',
  '--blue-tint-10': 'rgba(0,79,200,0.1)',
  '--blue-tint-12': 'rgba(0,79,200,0.12)',
  '--blue-tint-20': 'rgba(0,79,200,0.2)',
  '--blue-tint-25': 'rgba(0,79,200,0.25)',
  '--blue-tint-30': 'rgba(0,79,200,0.3)',
  '--blue-tint-40': 'rgba(0,79,200,0.4)',
  '--blue-tint-50': 'rgba(0,79,200,0.5)',
  '--blue-tint-95': 'rgba(0,79,200,0.95)',
};

/* B. 23 primitives are deleted, every reference repointed.
 *    The two hero stops are handled separately: they are gradient stops, not a
 *    flat colour, and fold into --gradient-brand as a whole declaration. */
const FOLD = {
  '--blue-alt-tmp': '--blue',
  '--blue-accent-tmp': '--blue',
  '--blue-check-tmp': '--blue',
  '--blue-cta-tmp': '--blue',
  '--blue-cta-inline-tmp': '--blue',
  '--blue-inline-tmp': '--blue',
  '--blue-ui-tmp': '--blue',
  '--blue-hover-tmp': '--blue-deep',
  '--blue-inline-deep-tmp': '--blue-deep',
  '--blue-ask-tmp': '--blue-deep',
  '--border-2-tmp': '--border-1',
  '--blue-brand-tint-08': '--blue-tint-08',
  '--blue-brand-tint-12': '--blue-tint-12',
  '--blue-accent-tint-08': '--blue-tint-08',
  '--border-grey-2': '--border-1',
  '--border-grey-3': '--border-1',
  '--border-grey-4': '--border-1',
  '--border-grey-5': '--border-1',
  '--border-grey-6': '--border-1',
  '--neutral-700': '--text-2',
  '--neutral-800': '--text-2',
};
const HERO_STOPS = ['--blue-hero-a-tmp', '--blue-hero-c-tmp'];
const DELETED = [...Object.keys(FOLD), ...HERO_STOPS];

/* Values every fold target holds AFTER this pass, for rewriting fallbacks. */
const VALUE_AFTER = Object.assign({
  '--border-1': '#e2e8f0',
  '--text-2': '#475569',
}, RETARGET);

const GRADIENT_OLD = 'background:linear-gradient(135deg,var(--blue-hero-a-tmp) 0%,var(--blue-accent-tmp) 48%,var(--blue-hero-c-tmp) 100%)';
const GRADIENT_NEW = 'background:var(--gradient-brand)';

const src = Object.fromEntries(FILES.map(f => [f, fs.readFileSync(path.join(ROOT, f), 'utf8')]));
const problems = [];
const tally = { gradient: 0, repointed: 0, defsDeleted: 0, valuesChanged: 0, fallbacksUpdated: 0 };

/* Rewrite every var(NAME, FALLBACK) with balanced-paren awareness. */
function mapVars(css, fn) {
  let out = '', i = 0;
  while (i < css.length) {
    if (css.startsWith('var(', i)) {
      let d = 0, j = i + 3;
      for (; j < css.length; j++) {
        if (css[j] === '(') d++;
        else if (css[j] === ')') { d--; if (!d) { j++; break; } }
      }
      const whole = css.slice(i, j);
      const inner = whole.slice(4, -1);
      const comma = (() => { let dd = 0; for (let k = 0; k < inner.length; k++) { const c = inner[k]; if (c === '(') dd++; else if (c === ')') dd--; else if (c === ',' && !dd) return k; } return -1; })();
      const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
      const fb = comma === -1 ? null : inner.slice(comma + 1).trim();
      out += fn(name, fb, whole);
      i = j;
    } else { out += css[i]; i++; }
  }
  return out;
}

for (const f of FILES) {
  let css = src[f];

  // 1. the hero gradient folds into --gradient-brand as one declaration
  if (css.includes(GRADIENT_OLD)) {
    const n = css.split(GRADIENT_OLD).length - 1;
    css = css.split(GRADIENT_OLD).join(GRADIENT_NEW);
    tally.gradient += n;
  }

  // 2. repoint every reference to a deleted name, and refresh fallbacks
  css = mapVars(css, (name, fb) => {
    if (FOLD[name]) {
      const target = FOLD[name];
      tally.repointed++;
      const v = VALUE_AFTER[target];
      if (fb === null) return `var(${target})`;
      if (!v) { problems.push(`${f}: ${name} folds to ${target} but no post-pass value is known for the fallback`); return `var(${target}, ${fb})`; }
      return `var(${target}, ${v})`;
    }
    if (fb !== null && VALUE_AFTER[name] && fb !== VALUE_AFTER[name]) {
      tally.fallbacksUpdated++;
      return `var(${name}, ${VALUE_AFTER[name]})`;
    }
    return fb === null ? `var(${name})` : `var(${name}, ${fb})`;
  });

  src[f] = css;
}

// 3. delete the 23 definitions from the styles.css :root
{
  let css = src['styles.css'];
  for (const name of DELETED) {
    const re = new RegExp(`^[ \\t]*${name}\\s*:[^;\\n]*;[^\\n]*\\n`, 'm');
    if (re.test(css)) { css = css.replace(re, ''); tally.defsDeleted++; }
    else problems.push(`styles.css: no definition line found for ${name}`);
  }
  src['styles.css'] = css;
}

// 4. retarget the 15 values
{
  let css = src['styles.css'];
  for (const [name, val] of Object.entries(RETARGET)) {
    const re = new RegExp(`(^[ \\t]*${name}\\s*:\\s*)([^;]+)(;)`, 'm');
    const m = re.exec(css);
    if (!m) { problems.push(`styles.css: no definition found for ${name}`); continue; }
    if (m[2].trim() === val) { problems.push(`styles.css: ${name} already holds ${val}`); continue; }
    css = css.replace(re, `$1${val}$3`);
    tally.valuesChanged++;
  }
  src['styles.css'] = css;
}

console.log('Pass 2b-b retarget');
console.log(`  hero gradient declarations folded into --gradient-brand: ${tally.gradient} (expected 1)`);
/* 38 references exist to the 21 flat folded names; one of them (a
 * --blue-accent-tmp stop) sits inside the hero gradient and is consumed by the
 * gradient fold above, leaving 37 to repoint individually. */
console.log(`  references repointed off deleted names:                  ${tally.repointed} (expected 37)`);
console.log(`  primitive definitions deleted:                           ${tally.defsDeleted} (expected 23)`);
console.log(`  primitive values changed:                                ${tally.valuesChanged} (expected 15)`);
console.log(`  cross-file fallbacks refreshed:                          ${tally.fallbacksUpdated}`);

if (tally.gradient !== 1) problems.push(`gradient fold count ${tally.gradient} != 1`);
if (tally.repointed !== 37) problems.push(`references repointed ${tally.repointed} != 37`);
if (tally.defsDeleted !== 23) problems.push(`definitions deleted ${tally.defsDeleted} != 23`);
if (tally.valuesChanged !== 15) problems.push(`values changed ${tally.valuesChanged} != 15`);

// exit test: the enumerated list, not the -tmp grep
const stripC = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
for (const f of FILES) {
  for (const name of DELETED) {
    const n = (stripC(src[f]).match(new RegExp(`${name}(?![-\\w])`, 'g')) || []).length;
    if (n) problems.push(`${f}: ${n} surviving reference(s) to deleted name ${name}`);
  }
}

if (problems.length) {
  console.error(`\nFAIL: ${problems.length} problem(s), nothing written`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

if (!WRITE) { console.log('\nDRY RUN ok. Re-run with --write to apply.'); process.exit(0); }
for (const f of FILES) fs.writeFileSync(path.join(ROOT, f), src[f]);
console.log(`\nPASS: wrote ${FILES.length} stylesheets`);
