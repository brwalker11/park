#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'resources.json');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'article-index.html');
const OUTPUT_ROOT = path.join(ROOT, 'articles');
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
  const missingBodies = [];

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
      // Pre-populate title tag
      .replace(
        /<title>Loading article… \| Monetize Parking<\/title>/,
        `<title>${escapeHtml(title)} | Monetize Parking</title>`
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
      // Pre-populate article slug data attribute
      .replace(
        /data-article-slug=""/,
        `data-article-slug="${slug}"`
      );

    fs.writeFileSync(dest, html, 'utf8');
    console.log(`Wrote ${dest}`);
  });

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
