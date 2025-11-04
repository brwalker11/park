#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'resources.json');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const SITE_ORIGIN = 'https://monetize-parking.com';

const STATIC_ROUTES = [
  '/',
  '/about/',
  '/calculator/',
  '/contact/',
  '/faq/',
  '/resources/',
  '/services/'
];

function loadArticles() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  return data.map((item) => ({
    slug: item.slug,
    lastmod: item.lastmod || item.date,
    date: item.date,
    canonicalOverride: item.canonicalOverride || ''
  }));
}

function buildUrl(slug, canonicalOverride) {
  if (canonicalOverride) return canonicalOverride;
  return `${SITE_ORIGIN}/article.html?slug=${encodeURIComponent(slug)}`;
}

function xmlEscape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function buildSitemap() {
  const articles = loadArticles();
  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push('<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">');

  STATIC_ROUTES.forEach((route) => {
    parts.push(`  <url><loc>${SITE_ORIGIN}${route}</loc></url>`);
  });

  articles.forEach((article) => {
    const loc = xmlEscape(buildUrl(article.slug, article.canonicalOverride));
    const lastmod = formatDate(article.lastmod || article.date);
    if (lastmod) {
      parts.push(`  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`);
    } else {
      parts.push(`  <url><loc>${loc}</loc></url>`);
    }
  });

  parts.push('</urlset>');
  return parts.join('\n');
}

function main() {
  const xml = buildSitemap();
  fs.writeFileSync(SITEMAP_PATH, `${xml}\n`, 'utf8');
  console.log('Sitemap updated:', SITEMAP_PATH);
}

if (require.main === module) {
  main();
}
