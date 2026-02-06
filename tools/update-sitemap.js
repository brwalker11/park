#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'resources.json');
const STATE_DATA_PATH = path.join(ROOT, 'data', 'state-resources.json');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const STATES_DIR = path.join(ROOT, 'resources', 'states');
const SITE_ORIGIN = 'https://monetize-parking.com';

const VIDEOS_DIR = path.join(ROOT, 'resources', 'videos');

const STATIC_ROUTES = [
  '/',
  '/about/',
  '/ask-the-experts.html',
  '/calculator/',
  '/contact/',
  '/faq/',
  '/resources/',
  '/services/'
];

function loadArticles() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  return data
    .filter((item) => item.type !== 'external')
    .map((item) => ({
      slug: item.slug,
      lastmod: item.lastmod || item.date,
      date: item.date,
      canonicalOverride: item.canonicalOverride || ''
    }));
}

function getFileModifiedDate(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
}

function findStatePages() {
  const statePages = [];

  // Add main states index
  const statesIndexPath = path.join(STATES_DIR, 'index.html');
  if (fs.existsSync(statesIndexPath)) {
    statePages.push({
      url: '/resources/states/',
      lastmod: getFileModifiedDate(statesIndexPath)
    });
  }

  // Find all state directories
  if (fs.existsSync(STATES_DIR)) {
    const states = fs.readdirSync(STATES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    states.forEach(state => {
      const statePath = path.join(STATES_DIR, state);

      // Add main state page
      const stateIndexPath = path.join(statePath, 'index.html');
      if (fs.existsSync(stateIndexPath)) {
        statePages.push({
          url: `/resources/states/${state}/`,
          lastmod: getFileModifiedDate(stateIndexPath)
        });
      }

      // Find all sub-pages
      const subDirs = fs.readdirSync(statePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      subDirs.forEach(subDir => {
        const subPagePath = path.join(statePath, subDir, 'index.html');
        if (fs.existsSync(subPagePath)) {
          statePages.push({
            url: `/resources/states/${state}/${subDir}/`,
            lastmod: getFileModifiedDate(subPagePath)
          });
        }
      });
    });
  }

  return statePages;
}

function findVideoPages() {
  const videoPages = [];
  if (fs.existsSync(VIDEOS_DIR)) {
    const dirs = fs.readdirSync(VIDEOS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    dirs.forEach(dir => {
      const indexPath = path.join(VIDEOS_DIR, dir, 'index.html');
      if (fs.existsSync(indexPath)) {
        videoPages.push({
          url: `/resources/videos/${dir}/`,
          lastmod: getFileModifiedDate(indexPath)
        });
      }
    });
  }
  return videoPages;
}

function buildUrl(slug, canonicalOverride) {
  if (canonicalOverride) return canonicalOverride;
  return `${SITE_ORIGIN}/articles/${encodeURIComponent(slug)}/`;
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
  const statePages = findStatePages();
  const videoPages = findVideoPages();
  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push('<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">');

  STATIC_ROUTES.forEach((route) => {
    parts.push(`  <url><loc>${SITE_ORIGIN}${route}</loc></url>`);
  });

  statePages.forEach((page) => {
    const loc = xmlEscape(`${SITE_ORIGIN}${page.url}`);
    if (page.lastmod) {
      parts.push(`  <url><loc>${loc}</loc><lastmod>${page.lastmod}</lastmod></url>`);
    } else {
      parts.push(`  <url><loc>${loc}</loc></url>`);
    }
  });

  videoPages.forEach((page) => {
    const loc = xmlEscape(`${SITE_ORIGIN}${page.url}`);
    if (page.lastmod) {
      parts.push(`  <url><loc>${loc}</loc><lastmod>${page.lastmod}</lastmod></url>`);
    } else {
      parts.push(`  <url><loc>${loc}</loc></url>`);
    }
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
