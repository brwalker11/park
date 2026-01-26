#!/usr/bin/env node
/**
 * Build script for minifying JS and CSS assets.
 * Run: node tools/build.js
 *
 * Note: Cloudflare Auto Minify can also handle this automatically.
 * This script is useful for local testing and explicit control.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const JS_FILES = [
  'js/resources.js',
  'js/article.js',
  'js/related.js',
  'js/state-map.js',
  'script.js'
];

const CSS_FILES = [
  'styles.css',
  'css/article.css',
  'css/resources.css',
  'css/state-map.css'
];

function minifyJS() {
  console.log('Minifying JavaScript...');
  JS_FILES.forEach(file => {
    const src = path.join(ROOT, file);
    const dest = src.replace('.js', '.min.js');
    try {
      execSync(`npx terser "${src}" -c -m -o "${dest}"`, { stdio: 'pipe' });
      const srcSize = fs.statSync(src).size;
      const destSize = fs.statSync(dest).size;
      const saved = ((1 - destSize / srcSize) * 100).toFixed(0);
      console.log(`  ${file}: ${(srcSize/1024).toFixed(1)}KB → ${(destSize/1024).toFixed(1)}KB (${saved}% saved)`);
    } catch (err) {
      console.error(`  Error minifying ${file}:`, err.message);
    }
  });
}

function minifyCSS() {
  console.log('Minifying CSS...');
  CSS_FILES.forEach(file => {
    const src = path.join(ROOT, file);
    const dest = src.replace('.css', '.min.css');
    try {
      execSync(`npx postcss "${src}" -o "${dest}"`, { stdio: 'pipe' });
      const srcSize = fs.statSync(src).size;
      const destSize = fs.statSync(dest).size;
      const saved = ((1 - destSize / srcSize) * 100).toFixed(0);
      console.log(`  ${file}: ${(srcSize/1024).toFixed(1)}KB → ${(destSize/1024).toFixed(1)}KB (${saved}% saved)`);
    } catch (err) {
      console.error(`  Error minifying ${file}:`, err.message);
    }
  });
}

console.log('Build started...\n');
minifyJS();
console.log('');
minifyCSS();
console.log('\nBuild complete!');
console.log('\nNote: Enable Cloudflare Auto Minify (Speed → Optimization) for automatic minification in production.');
