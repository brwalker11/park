#!/usr/bin/env node
'use strict';

/*
 * Server-renders the full resource index into resources/index.html.
 *
 * Why this exists
 * ---------------
 * /resources/ is the Articles & Guides hub, and until 2026-08-18 its server
 * HTML contained 34 links, NONE of which pointed at an /articles/ URL. The
 * whole grid is built by js/resources.js at runtime, so to any crawler that
 * does not execute JavaScript the hub was a 42-word page linking to nothing.
 *
 * Measured consequence, from a link graph built over the raw HTML of all 144
 * sitemap URLs: 41 of 71 articles had ZERO internal inbound links and 57 more
 * had exactly one. Search Console's internal-link report showed 770 internal
 * links of which roughly 728 pointed at the 8 navigation destinations. Google
 * was discovering the article corpus from the XML sitemap alone, with almost no
 * internal link equity reaching it.
 *
 * What this does NOT do
 * ---------------------
 * It does not pre-render the card grid in #res-grid. renderGrid() in
 * js/resources.js opens with `grid.innerHTML = ''`, so anything pre-rendered
 * there is discarded on load anyway, and mirroring buildCard() byte-for-byte
 * would put a second, silently-drifting copy of that markup in this file. The
 * grid stays exactly as it is: filtered, paginated, JS-owned.
 *
 * Instead this writes a plain grouped link list BELOW the grid, between the
 * markers in resources/index.html. It is server-rendered, it survives with
 * JavaScript off, it gives every live article a real internal link from the
 * hub, and it is a legitimately useful "show me everything" view rather than an
 * SEO ornament.
 *
 * Redirected articles are excluded by reading _redirects, so a consolidated
 * article cannot come back as an internal link to a 301. That check is derived,
 * not a hand-maintained list, so it stays correct when the next consolidation
 * happens.
 *
 * Usage: node tools/generate-resources-index.js   (wired into npm run build)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'resources.json');
const PAGE_PATH = path.join(ROOT, 'resources', 'index.html');
const REDIRECTS_PATH = path.join(ROOT, '_redirects');

const BEGIN = '<!-- BEGIN:generated-index -->';
const END = '<!-- END:generated-index -->';

// Display order. Anything with a service outside this list still renders, in a
// trailing group, rather than being dropped on the floor.
const SERVICE_ORDER = ['Parking', 'Solar Lighting', 'EV Charging'];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Collects the source side of every redirect rule so a consolidated article is
   never linked. Rules look like:
     /articles/choosing-pricing-strategy/* /articles/dynamic-pricing-guide/ 301
   The trailing /* is stripped so the comparison is against the article path. */
function loadRedirectSources() {
  let raw = '';
  try {
    raw = fs.readFileSync(REDIRECTS_PATH, 'utf8');
  } catch (error) {
    console.warn(`Could not read ${REDIRECTS_PATH}; no redirect filtering applied.`);
    return new Set();
  }
  const sources = new Set();
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const source = trimmed.split(/\s+/)[0];
    if (!source || !source.startsWith('/')) return;
    sources.add(source.replace(/\/?\*$/, '').replace(/\/$/, ''));
  });
  return sources;
}

function main() {
  const articles = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const page = fs.readFileSync(PAGE_PATH, 'utf8');
  const redirected = loadRedirectSources();

  const begin = page.indexOf(BEGIN);
  const end = page.indexOf(END);
  if (begin === -1 || end === -1 || end < begin) {
    throw new Error(
      `Markers not found in ${PAGE_PATH}. Expected ${BEGIN} ... ${END} inside the ` +
        'resource index section. Restore them rather than deleting this build step.'
    );
  }

  const skipped = [];
  const groups = new Map();

  articles.forEach((article) => {
    /* `type: "external"` is a syndicated link, not one of our pages. The one
       such record, parking-today-small-lots, has a hand-written
       articles/{slug}/index.html that renders "We couldn't find that resource"
       because its entry carries no content field - a pre-existing defect
       recorded in CLAUDE.md. Linking the hub at it would be linking at a broken
       page, and this list is for our own articles anyway. */
    if (article.type === 'external') {
      skipped.push(`${article.slug || '(no slug)'}: type "external"`);
      return;
    }

    /* The url field is optional in data/resources.json - 7 live, sitemap-listed
       articles have none - so it is derived from the slug when absent. The
       derived form is then CHECKED AGAINST DISK rather than trusted: a page the
       generator never wrote must not appear here as a link. Deriving without
       that check is how an earlier pass of this script pointed the hub at a
       nonexistent /articles/parking-today-small-lots/ URL. */
    let url = article.url && article.url.startsWith('/') ? article.url : '';
    if (!url && article.slug) {
      url = `/articles/${article.slug}/`;
    }
    if (!url) {
      skipped.push(`${article.slug || '(no slug)'}: no url field and no slug to derive one from`);
      return;
    }
    const built = path.join(ROOT, url.replace(/^\/+/, ''), 'index.html');
    if (!fs.existsSync(built)) {
      skipped.push(`${article.slug}: ${url} has no generated index.html on disk`);
      return;
    }
    if (redirected.has(url.replace(/\/$/, ''))) {
      skipped.push(`${article.slug}: ${url} is a redirect source in _redirects`);
      return;
    }
    const service = article.service || 'Parking';
    if (!groups.has(service)) groups.set(service, []);
    groups.get(service).push({ url, title: article.title || url, readTime: article.readTime || '' });
  });

  const orderedServices = [
    ...SERVICE_ORDER.filter((s) => groups.has(s)),
    ...[...groups.keys()].filter((s) => !SERVICE_ORDER.includes(s)).sort()
  ];

  let total = 0;
  const html = orderedServices
    .map((service) => {
      /* Alphabetical, not by date: this list is an index, and a stable order
         keeps the generated diff empty on builds where no content changed. */
      const items = groups.get(service).sort((a, b) => a.title.localeCompare(b.title));
      total += items.length;
      const links = items
        .map(
          (item) =>
            `            <li class="res-index-item"><a href="${escapeHtml(item.url)}">${escapeHtml(
              item.title
            )}</a>${item.readTime ? `<span class="res-index-read">${escapeHtml(item.readTime)}</span>` : ''}</li>`
        )
        .join('\n');
      return (
        `        <div class="res-index-group">\n` +
        `          <h3 class="res-index-group-title">${escapeHtml(service)} ` +
        `<span class="res-index-count">${items.length}</span></h3>\n` +
        `          <ul class="res-index-list">\n${links}\n          </ul>\n` +
        `        </div>`
      );
    })
    .join('\n');

  const block =
    `${BEGIN}\n` +
    `      <div class="res-index-groups">\n${html}\n      </div>\n` +
    `      ${END}`;

  const next = page.slice(0, begin) + block + page.slice(end + END.length);
  fs.writeFileSync(PAGE_PATH, next, 'utf8');

  console.log(`Wrote ${total} resource links into ${PAGE_PATH}`);
  orderedServices.forEach((s) => console.log(`  ${s}: ${groups.get(s).length}`));
  if (skipped.length) {
    console.log(`  skipped ${skipped.length}:`);
    skipped.forEach((line) => console.log(`    - ${line}`));
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
