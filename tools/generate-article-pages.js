#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'resources.json');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'article-index.html');
const OUTPUT_ROOT = path.join(ROOT, 'articles');

function loadArticles() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  return data.map((item) => item.slug).filter(Boolean);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Missing template: ${TEMPLATE_PATH}`);
  }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const slugs = loadArticles();

  slugs.forEach((slug) => {
    const dir = path.join(OUTPUT_ROOT, slug);
    ensureDir(dir);
    const dest = path.join(dir, 'index.html');
    fs.writeFileSync(dest, template, 'utf8');
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
