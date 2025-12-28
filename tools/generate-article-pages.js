#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'resources.json');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'article-index.html');
const OUTPUT_ROOT = path.join(ROOT, 'articles');
const BASE_URL = 'https://monetize-parking.com';

function loadArticles() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(raw);
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

  articles.forEach((article) => {
    const slug = article.slug;
    if (!slug) return;

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

    let html = template
      // Update canonical URL
      .replace(
        /<link rel="canonical" href="https:\/\/monetize-parking\.com\/articles\/">/,
        `<link rel="canonical" href="${articleUrl}">`
      )
      // Add preload link for hero image (LCP optimization)
      .replace(
        '</head>',
        `  <link rel="preload" as="image" href="${heroImage}" fetchpriority="high">\n</head>`
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
        /<meta property="og:image" content="https:\/\/monetize-parking\.com\/images\/default-guide\.webp">/,
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
        /<meta name="twitter:image" content="https:\/\/monetize-parking\.com\/images\/default-guide\.webp">/,
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
      // Pre-populate article slug data attribute
      .replace(
        /data-article-slug=""/,
        `data-article-slug="${slug}"`
      );

    fs.writeFileSync(dest, html, 'utf8');
    console.log(`Wrote ${dest}`);
  });
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
