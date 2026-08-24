#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'resources.json');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'article-index.html');
const OUTPUT_ROOT = path.join(ROOT, 'articles');
const SERIES_PATH = path.join(ROOT, 'data', 'series.json');
const REDIRECTS_PATH = path.join(ROOT, '_redirects');

/* Matches the whole #related-list container in the template, skeleton cards and
   all, up to the blank line before </div></section>. Anchored on the closing
   comment-free boundary rather than the first </div>, because the skeletons
   contain nested divs and a lazy match would stop inside the first one.
   aria-live is dropped from the replacement on purpose: the list is static once
   pre-rendered, and announcing it on load is noise for a screen reader. */
const RELATED_LIST_RE = /<div id="related-list" class="related-list" aria-live="polite">[\s\S]*?\n        <\/div>\n/;
const BASE_URL = 'https://monetize-parking.com';

/* Every article page used to ship an empty #article-body and no JSON-LD: the
   body, the schema and the dates were all produced at runtime by js/article.js,
   which first fetches data/resources.json and then fetches the body fragment.
   Three sequential round-trips before a crawler saw a sentence.

   Measured 2026-08-18: the static body text of every /articles/{slug}/ page was
   69 words, identical across all 71 of them once the title and hero alt are
   excluded, and 0 of them carried a ld+json block. Search Console had 49 URLs in
   "Crawled - currently not indexed", 5 in "Discovered - currently not indexed",
   and two live articles classified Soft 404
   (ev-charging-revenue-share-vs-ownership, questions-before-signing-ev-charging-contract)
   - Google rendered those two and still concluded the page was empty.

   The body fragment, the Article schema, the BreadcrumbList schema and the
   published/modified dates are now inlined here at build time. js/article.js
   still runs and still owns the TOC, related rail, breadcrumb and CTA
   behaviour; it just no longer has to CREATE the content. See the "pre-rendered"
   handling in js/article.js, which is what keeps the two halves in agreement. */

function loadArticles() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

/* ---------------------------------------------------------------------------
   Related rail, pre-rendered (added 2026-08-21)

   The rail was the last piece of the article page still built at runtime, and
   it was costing twice over:

   1. Every article pageview downloaded data/resources.json - 85KB - purely to
      rank five related links. That data is fully known at build time.
   2. Those five links per article were invisible to any crawler that does not
      execute JavaScript. Measured before this change: 84 contextual in-body
      article links across all 75 pages, and 36 articles with zero contextual
      inbound links. Each article's only reliable crawlable inbound link was the
      one from the /resources/ index.

   Pre-rendering the rail fixes both at once, which is why js/article.js can now
   skip loadArticles() entirely on a pre-rendered page.

   THREE DELIBERATE DIFFERENCES from renderRelated() in js/article.js. The
   runtime version is now dead code for article pages, so these are corrections
   rather than a divergence to reconcile:

   - Redirect sources are excluded. The four consolidated pricing articles are
     still records in data/resources.json, so the runtime happily linked rails
     at URLs that 301. Sources are derived from _redirects, not hardcoded.
   - `type: "external"` is excluded. Not our page.
   - `hidden: true` is excluded, which the runtime never did despite CLAUDE.md
     stating hidden means "does not appear in the resources grid or in related
     articles". Eight records carry it: the four series sub-articles, which are
     surfaced through the series sidebar instead, and the four redirected ones.
   --------------------------------------------------------------------------- */

function loadSeries() {
  try {
    return JSON.parse(fs.readFileSync(SERIES_PATH, 'utf8')).series || [];
  } catch (error) {
    console.warn(`Could not read ${SERIES_PATH}; series sidebars will fall back to the default rail.`);
    return [];
  }
}

/* Source side of every _redirects rule, so a consolidated article can never be
   linked from a rail. Derived, so it stays correct after the next consolidation. */
function loadRedirectSources() {
  const sources = new Set();
  let raw = '';
  try {
    raw = fs.readFileSync(REDIRECTS_PATH, 'utf8');
  } catch (error) {
    console.warn(`Could not read ${REDIRECTS_PATH}; no redirect filtering applied to rails.`);
    return sources;
  }
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const source = trimmed.split(/\s+/)[0];
    if (source && source.startsWith('/')) {
      sources.add(source.replace(/\/?\*$/, '').replace(/\/$/, ''));
    }
  });
  return sources;
}

function seriesForSlug(seriesList, slug) {
  for (const series of seriesList) {
    if (series.mainSlug === slug) return { series, isMain: true };
    if (series.articles.some((a) => a.slug === slug)) return { series, isMain: false };
  }
  return null;
}

function overlapCount(baseTags, candidateTags) {
  if (!Array.isArray(baseTags) || !Array.isArray(candidateTags)) return 0;
  return candidateTags.filter((tag) => baseTags.includes(tag)).length;
}

/* Byte-compatible with buildRelatedCard() in js/article.js. If that markup
   changes, this must change with it or the rail restyles itself. */
function buildRelatedCard(item) {
  const thumb = normaliseImage(item.thumbnail || item.image);
  const read = item.readTime
    ? `\n              <span class="related-read">${escapeHtml(item.readTime)}</span>`
    : '';
  return (
    `            <a class="related-card" href="/articles/${encodeURIComponent(item.slug)}/">\n` +
    `              <div class="related-thumb"><img src="${thumb}" alt="${escapeHtml(
      item.imageAlt || item.title
    )}" loading="lazy"></div>\n` +
    `              <div class="related-content">\n` +
    `                <span class="related-tag">${escapeHtml(item.category || 'Articles')}</span>\n` +
    `                <div class="related-title">${escapeHtml(item.title)}</div>${read}\n` +
    `              </div>\n` +
    `            </a>`
  );
}

/* Ranks every candidate for one article. Split out from buildRelatedRail so the
   rebalance pass below can ask "where would this article have placed?" without
   re-deriving the sort. */
function rankCandidates(article, linkable) {
  return linkable
    .filter((item) => !item.hidden)
    .map((item) => ({
      item,
      tagOverlap: overlapCount(article.tags, item.tags),
      sameService: (item.service || 'Parking') === (article.service || 'Parking'),
      sameCategory: item.category === article.category,
      recency: Date.parse(item.lastmod || item.date || '') || 0
    }))
    .sort((a, b) => {
      if (b.tagOverlap !== a.tagOverlap) return b.tagOverlap - a.tagOverlap;
      if (b.sameService !== a.sameService) return (b.sameService ? 1 : 0) - (a.sameService ? 1 : 0);
      if (b.sameCategory !== a.sameCategory) return (b.sameCategory ? 1 : 0) - (a.sameCategory ? 1 : 0);
      if (b.recency !== a.recency) return b.recency - a.recency;
      /* Slug tiebreak so the whole pipeline is deterministic. Without it, two
         records with identical keys could order differently between runs and the
         generated diff would be noisy for no reason. */
      return a.item.slug.localeCompare(b.item.slug);
    });
}

/* ---------------------------------------------------------------------------
   Inbound-link rebalance (added 2026-08-21)

   Pre-rendering the rail made 370 links crawlable, but it did not make them
   evenly distributed. Measured immediately after: parking-lot-revenue-tax-
   implications received 39 inbound rail links while 27 articles received none.

   The cause is documented in CLAUDE.md under Related Articles - 278 of the 305
   tags in data/resources.json appear on exactly one record, so tagOverlap ties
   at 0 for nearly every pair and recency ends up deciding most rails. A handful
   of recent records win every slot.

   This pass keeps the ranking intact and only fixes the tail: while some article
   sits below MIN_INBOUND, take the slot of an over-linked article in whichever
   host ranks the starved one highest, and give it away. A swap is only made when
   the host still has a link to spare, so no article is pushed below the floor to
   raise another.

   It is deterministic: candidates carry a slug tiebreak, hosts are visited in
   sorted order, and the loop has a hard iteration cap. Same input, same output,
   every run - which the repo's verification depends on.
   --------------------------------------------------------------------------- */
const MIN_INBOUND = 3;

function rebalanceRails(rails, linkable, rankings) {
  const inbound = new Map(linkable.map((a) => [a.slug, 0]));
  for (const picks of rails.values()) {
    picks.forEach((slug) => inbound.set(slug, (inbound.get(slug) || 0) + 1));
  }

  const swappableHosts = [...rails.keys()].filter((slug) => !rails.get(slug).fixed).sort();
  let guard = 0;
  const CAP = 5000;

  while (guard++ < CAP) {
    const starved = [...inbound.entries()]
      .filter(([, n]) => n < MIN_INBOUND)
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
    if (!starved.length) break;

    const [needySlug] = starved[0];
    let done = false;

    /* Prefer the host that ranks this article highest: the link should still
       make sense to a reader, not just to a crawler. */
    const hostsByFit = swappableHosts
      .map((host) => {
        const ranked = rankings.get(host) || [];
        const pos = ranked.findIndex((c) => c.item.slug === needySlug);
        return { host, pos };
      })
      .filter((h) => h.pos !== -1 && !rails.get(h.host).includes(needySlug))
      .sort((a, b) => a.pos - b.pos || a.host.localeCompare(b.host));

    for (const { host } of hostsByFit) {
      const picks = rails.get(host);
      // Drop whichever of the host's current links can most afford to lose one.
      const donorIdx = picks
        .map((slug, i) => ({ slug, i, n: inbound.get(slug) || 0 }))
        .filter((d) => d.n > MIN_INBOUND)
        .sort((a, b) => b.n - a.n || a.slug.localeCompare(b.slug))[0];
      if (!donorIdx) continue;
      inbound.set(donorIdx.slug, donorIdx.n - 1);
      picks[donorIdx.i] = needySlug;
      inbound.set(needySlug, (inbound.get(needySlug) || 0) + 1);
      done = true;
      break;
    }
    if (!done) break; // nothing left to give; report and move on
  }
  return inbound;
}

/* Which articles this one is ALLOWED to link at. Excludes itself, external
   records, and anything that is a redirect source. */
function linkableFor(article, allArticles, redirected) {
  return allArticles.filter((item) => {
    if (!item.slug || item.slug === article.slug) return false;
    if (item.type === 'external') return false;
    if (redirected.has(`/articles/${item.slug}`)) return false;
    return true;
  });
}

/* Returns the rail as SLUGS, not markup, so rebalanceRails() can move links
   around before anything is rendered. `fixed` marks a series rail, which is
   editorial and must not be rebalanced. */
function computeRail(article, allArticles, seriesList, redirected, rankings) {
  const linkable = linkableFor(article, allArticles, redirected);
  const bySlug = new Map(linkable.map((item) => [item.slug, item]));

  const info = seriesForSlug(seriesList, article.slug);
  if (info) {
    /* Series pages get the series, in order, minus the current article. The
       series sub-articles are `hidden`, so they are reachable ONLY here and
       from the /resources/ index - which is exactly why this branch must not
       apply the hidden filter, and why these rails are never rebalanced. */
    const slugs = [];
    if (!info.isMain && bySlug.has(info.series.mainSlug)) slugs.push(info.series.mainSlug);
    info.series.articles.forEach((entry) => {
      if (entry.slug !== article.slug && bySlug.has(entry.slug)) slugs.push(entry.slug);
    });
    if (slugs.length) {
      const out = slugs;
      out.fixed = true;
      return out;
    }
  }

  const ranked = rankCandidates(article, linkable);
  rankings.set(article.slug, ranked);
  const out = ranked.slice(0, 5).map((c) => c.item.slug);
  out.fixed = false;
  return out;
}

function renderRail(slugs, bySlugAll) {
  if (!slugs.length) {
    return '            <p class="related-empty">Check back soon for more related resources.</p>';
  }
  return slugs
    .map((slug) => bySlugAll.get(slug))
    .filter(Boolean)
    .map(buildRelatedCard)
    .join('\n');
}

/* The string that goes in <title>, which is NOT the same string as the <h1>.
   `title` in data/resources.json drives four things at once - the h1, the SERP
   title, the resource card and the breadcrumb - so a title tuned for a 60-character
   SERP limit made a worse on-page heading, and vice versa. `seoTitle` breaks the
   tie for the SERP only, exactly as `canonicalOverride` does for canonicals.
   Absent, behaviour is unchanged.

   The " | Monetize Parking" suffix is NOT appended here, and that is the point.
   Measured 2026-08-18: 74 of 75 article titles exceeded 60 characters WITH the
   suffix, but only 30 exceeded it without. The suffix alone was truncating 44
   pages in the SERP, at an average position of 13.7 where a clipped title is
   the whole first impression. Google appends the site name itself when it
   judges it useful.

   The suffix DOES stay on og:title and twitter:title. Those are not
   pixel-limited the same way and a shared card with no brand on it is worth
   less. See CLAUDE.md, "SERP title vs page heading". */
function seoTitleFor(article) {
  return article.seoTitle || article.title || 'Loading article…';
}

function isoDate(input) {
  if (!input) return '';
  const value = Date.parse(input);
  if (!value) return '';
  return new Date(value).toISOString();
}

function formatDisplayDate(input) {
  if (!input) return '';
  const value = Date.parse(input);
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(value));
}

/* Mirrors buildMetaLine() in js/article.js. The two must agree, or the line
   visibly rewrites itself on load. */
function buildMetaLine(article) {
  const published = formatDisplayDate(article.date);
  const updated = formatDisplayDate(article.lastmod || article.date);
  const parts = [`By ${article.author || 'Monetize Parking'}`];
  if (updated && updated !== published) {
    parts.push(`Updated ${updated}`);
  } else if (published) {
    parts.push(`Published ${published}`);
  }
  if (article.readTime) {
    parts.push(article.readTime);
  }
  return parts.join(' • ');
}

/* JSON-LD goes inside a <script>, so the only character that can break out of
   the block is `<`. Escaping it as < keeps the JSON valid and the HTML
   safe without touching anything else. */
function jsonLdPayload(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* Byte-for-byte the same object js/article.js:injectJsonLd builds, and carries
   the same data-dynamic="article" attribute. That attribute is load-bearing:
   injectJsonLd removes every script matching
   [type="application/ld+json"][data-dynamic="article"] before appending its
   own, so the runtime replaces this block rather than duplicating it. Drop the
   attribute and every article page ends up with two Article blocks. */
function buildArticleJsonLd(article, canonicalUrl, imageUrl, publishDate, modifiedDate) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || '',
    image: imageUrl,
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Organization',
      name: article.author || 'Monetize Parking'
    },
    mainEntityOfPage: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Monetize Parking',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/assets/brand/MP_Logo_dark.png`
      }
    },
    keywords: Array.isArray(article.tags) ? article.tags : []
  };
}

/* The visible crumb is Resources / {service} / {title}, and the service link
   points at the facet /resources/ actually filters on - same rule as
   renderBreadcrumb() in js/article.js, including its 'Parking' fallback for
   records predating the service field.

   This one is NOT marked data-dynamic="article", so injectJsonLd leaves it
   alone. js/article.js has never emitted a BreadcrumbList; articles were the
   only page type on the site without one. */
function buildBreadcrumbJsonLd(article, service, articleUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Resources', item: `${BASE_URL}/resources/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: service,
        item: `${BASE_URL}/resources/?service=${encodeURIComponent(service)}`
      },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl }
    ]
  };
}

function normaliseImage(imgPath) {
  if (!imgPath) return '/images/default-guide.webp';
  if (imgPath.startsWith('http')) return imgPath;
  return imgPath.startsWith('/images/') ? imgPath : `/images/${imgPath.replace(/^\/+/, '')}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Missing template: ${TEMPLATE_PATH}`);
  }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const articles = loadArticles();
  const seriesList = loadSeries();
  const redirected = loadRedirectSources();
  const missingBodies = [];

  /* THREE PASSES. Rails have to exist for every article before any of them can
     be rebalanced, and rebalancing has to finish before anything is rendered,
     so the markup cannot be produced inside a single loop. */
  const renderable = articles.filter((a) => a.slug && a.type !== 'external');
  const bySlugAll = new Map(articles.filter((a) => a.slug).map((a) => [a.slug, a]));
  const rankings = new Map();
  const rails = new Map();
  renderable.forEach((article) => {
    rails.set(article.slug, computeRail(article, articles, seriesList, redirected, rankings));
  });
  const linkablePool = articles.filter(
    (a) => a.slug && a.type !== 'external' && !redirected.has(`/articles/${a.slug}`) && !a.hidden
  );
  const inboundCounts = rebalanceRails(rails, linkablePool, rankings);

  articles.forEach((article) => {
    const slug = article.slug;
    if (!slug) return;
    if (article.type === 'external') return;

    const dir = path.join(OUTPUT_ROOT, slug);
    ensureDir(dir);
    const dest = path.join(dir, 'index.html');

    // Prepare article data
    const articleUrl = `${BASE_URL}/articles/${slug}/`;
    const heroImage = normaliseImage(article.image);
    const heroImageUrl = heroImage.startsWith('http') ? heroImage : `${BASE_URL}${heroImage}`;
    const title = article.title || 'Loading article…';
    const description = article.description || article.excerpt || '';
    const imageAlt = article.imageAlt || title;
    const category = article.category || 'Resource';
    const excerpt = article.excerpt || article.description || '';
    const service = article.service || 'Parking';
    const canonicalUrl = article.canonicalOverride || articleUrl;
    const publishDate = isoDate(article.date);
    const modifiedDate = isoDate(article.lastmod || article.date);

    /* The body fragment is read from disk, not fetched. A missing or unreadable
       fragment is collected and reported at the end rather than thrown: one bad
       record must not stop the other 75 pages from building. Before
       pre-rendering this failed silently at runtime instead, which is how
       data/resources.json ended up carrying `parking-today-small-lots`, a record
       whose content path 404s in production. */
    let bodyHtml = '';
    if (article.content) {
      const fragmentPath = path.join(ROOT, article.content.replace(/^\/+/, ''));
      try {
        bodyHtml = fs.readFileSync(fragmentPath, 'utf8').trim();
      } catch (error) {
        missingBodies.push(`${slug} -> ${article.content} (${error.code || error.message})`);
      }
    } else {
      missingBodies.push(`${slug} -> no content path in data/resources.json`);
    }

    const relatedRail = renderRail(rails.get(slug) || [], bySlugAll);

    const jsonLd =
      `  <script type="application/ld+json" data-dynamic="article">${jsonLdPayload(
        buildArticleJsonLd(article, canonicalUrl, heroImageUrl, publishDate, modifiedDate)
      )}</script>\n` +
      `  <script type="application/ld+json">${jsonLdPayload(
        buildBreadcrumbJsonLd(article, service, articleUrl)
      )}</script>\n`;

    let html = template
      // Update canonical URL
      .replace(
        /<link rel="canonical" href="https:\/\/monetize-parking\.com\/articles\/">/,
        `<link rel="canonical" href="${articleUrl}">`
      )
      // Add preload link for hero image (LCP optimization) and the pre-rendered
      // JSON-LD. Both land immediately before </head>, in that order.
      .replace(
        '</head>',
        `  <link rel="preload" as="image" href="${heroImage}" fetchpriority="high">\n${jsonLd}</head>`
      )
      // og:type is "website" in the template because the template is not itself
      // an article. Every page built from it is.
      .replace(
        /<meta property="og:type" content="website">/,
        '<meta property="og:type" content="article">'
      )
      // Pre-populate the publish/modify dates. These shipped empty on every
      // article page until 2026-08-18 because js/article.js only set them after
      // its second fetch resolved.
      .replace(
        /<meta property="article:published_time" content="">/,
        `<meta property="article:published_time" content="${publishDate}">`
      )
      .replace(
        /<meta property="article:modified_time" content="">/,
        `<meta property="article:modified_time" content="${modifiedDate}">`
      )
      // Pre-populate title tag. No brand suffix - see seoTitleFor().
      .replace(
        /<title>Loading article… \| Monetize Parking<\/title>/,
        `<title>${escapeHtml(seoTitleFor(article))}</title>`
      )
      // Pre-populate meta description
      .replace(
        /<meta name="description" content="[^"]*">/,
        `<meta name="description" content="${escapeHtml(description)}">`
      )
      // Pre-populate OG tags
      .replace(
        /<meta property="og:title" content="[^"]*">/,
        `<meta property="og:title" content="${escapeHtml(title)} | Monetize Parking">`
      )
      .replace(
        /<meta property="og:description" content="[^"]*">/,
        `<meta property="og:description" content="${escapeHtml(description)}">`
      )
      .replace(
        /<meta property="og:url" content="https:\/\/monetize-parking\.com\/articles\/">/,
        `<meta property="og:url" content="${articleUrl}">`
      )
      .replace(
        // The ?v=2 must match the template. If the og-image is ever reversioned,
        // this regex and the twitter:image one below move with it, or the
        // substitution stops firing and every article page silently ships the
        // default social card instead of its own hero.
        /<meta property="og:image" content="https:\/\/monetize-parking\.com\/images\/og-image\.png\?v=2">/,
        `<meta property="og:image" content="${heroImageUrl}">`
      )
      // Pre-populate Twitter tags
      .replace(
        /<meta name="twitter:title" content="[^"]*">/,
        `<meta name="twitter:title" content="${escapeHtml(title)} | Monetize Parking">`
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*">/,
        `<meta name="twitter:description" content="${escapeHtml(description)}">`
      )
      .replace(
        /<meta name="twitter:image" content="https:\/\/monetize-parking\.com\/images\/og-image\.png\?v=2">/,
        `<meta name="twitter:image" content="${heroImageUrl}">`
      )
      // Pre-populate hero image src and alt (LCP discovery)
      .replace(
        /src="\/images\/default-guide\.webp"/,
        `src="${heroImage}"`
      )
      .replace(
        /alt="Parking lot revenue guide"/,
        `alt="${escapeHtml(imageAlt)}"`
      )
      // Pre-populate eyebrow category
      .replace(
        /<p class="eyebrow">Resource<\/p>/,
        `<p class="eyebrow">${escapeHtml(category)}</p>`
      )
      // Pre-populate article title in hero
      .replace(
        /<h1 id="article-title">Loading…<\/h1>/,
        `<h1 id="article-title">${escapeHtml(title)}</h1>`
      )
      // Pre-populate breadcrumb title
      .replace(
        /<li id="breadcrumb-title" aria-current="page">Loading…<\/li>/,
        `<li id="breadcrumb-title" aria-current="page">${escapeHtml(title)}</li>`
      )
      // Pre-populate the breadcrumb category link. Same service axis and same
      // 'Parking' fallback as renderBreadcrumb() in js/article.js.
      .replace(
        /<a id="breadcrumb-category" class="breadcrumb-link" href="\/resources\/">Category<\/a>/,
        `<a id="breadcrumb-category" class="breadcrumb-link" href="/resources/?service=${encodeURIComponent(
          service
        )}">${escapeHtml(service)}</a>`
      )
      // Pre-populate the byline/date line and the summary.
      .replace(
        /<div id="article-meta"><\/div>/,
        `<div id="article-meta">${escapeHtml(buildMetaLine(article))}</div>`
      )
      .replace(
        /<div id="article-summary"><\/div>/,
        excerpt
          ? `<div id="article-summary">${escapeHtml(excerpt)}</div>`
          : '<div id="article-summary" style="display:none"></div>'
      )
      // THE ONE THAT MATTERS: inline the article body. Everything above is
      // metadata; this is the change that puts words on the page for a crawler
      // that does not execute JavaScript.
      .replace(
        /<div id="article-body" class="article-body" aria-live="polite"><\/div>/,
        `<div id="article-body" class="article-body">\n${bodyHtml}\n</div>`
      )
      // Pre-render the related rail. This is the substitution that turns five
      // JS-only links per article into crawlable HTML, and it is why
      // js/article.js can skip fetching data/resources.json entirely.
      .replace(
        RELATED_LIST_RE,
        `<div id="related-list" class="related-list">\n${relatedRail}\n        </div>\n`
      )
      // Pre-populate article slug data attribute
      .replace(
        /data-article-slug=""/,
        `data-article-slug="${slug}"`
      );

    fs.writeFileSync(dest, html, 'utf8');
    console.log(`Wrote ${dest}`);
  });

  const counts = [...inboundCounts.values()].sort((a, b) => a - b);
  if (counts.length) {
    const starved = [...inboundCounts.entries()].filter(([, n]) => n < MIN_INBOUND);
    console.log(
      `Rail inbound links: min ${counts[0]}, median ${counts[Math.floor(counts.length / 2)]}, ` +
        `max ${counts[counts.length - 1]} across ${counts.length} linkable articles ` +
        `(floor ${MIN_INBOUND})`
    );
    if (starved.length) {
      console.log(`  ${starved.length} below the floor: ${starved.map(([s2, n]) => `${s2}(${n})`).join(', ')}`);
    }
  }

  if (missingBodies.length) {
    console.error(
      `\n${missingBodies.length} article record(s) have no readable body fragment. ` +
        'Those pages were still written, but they ship an empty #article-body and ' +
        'will read as thin or empty to a crawler:'
    );
    missingBodies.forEach((line) => console.error(`  - ${line}`));
    console.error(
      'Fix the content path or remove the record from data/resources.json, then rebuild.\n'
    );
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
