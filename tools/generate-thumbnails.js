#!/usr/bin/env node
/**
 * Generates optimized thumbnail images for the website.
 * Creates 400px wide versions of all WebP images in /images/
 * and saves them to /images/thumbs/
 *
 * Usage: node tools/generate-thumbnails.js
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'images');
const THUMBS_DIR = path.join(IMAGES_DIR, 'thumbs');
const THUMB_WIDTH = 400;
const QUALITY = 80;

// Images to skip (logos, icons, etc. that don't need thumbnails)
const SKIP_PATTERNS = [
  /^logo/i,
  /^icon/i,
  /^favicon/i,
  /^default-guide/i // Keep default at original size
];

async function main() {
  // Try to load sharp
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.error('Error: sharp is not installed.');
    console.error('Run: npm install sharp');
    process.exit(1);
  }

  // Create thumbs directory
  if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
    console.log(`Created directory: ${THUMBS_DIR}`);
  }

  // Get all WebP files
  const files = fs.readdirSync(IMAGES_DIR).filter((file) => {
    if (!file.endsWith('.webp')) return false;
    // Skip files matching skip patterns
    return !SKIP_PATTERNS.some((pattern) => pattern.test(file));
  });

  console.log(`Found ${files.length} WebP images to process\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(THUMBS_DIR, file);

    try {
      // Check if thumbnail already exists and is newer than source
      if (fs.existsSync(outputPath)) {
        const inputStat = fs.statSync(inputPath);
        const outputStat = fs.statSync(outputPath);
        if (outputStat.mtime >= inputStat.mtime) {
          console.log(`⏭  Skipped (up to date): ${file}`);
          skipped++;
          continue;
        }
      }

      // Get input image metadata
      const metadata = await sharp(inputPath).metadata();

      // Skip if already smaller than target
      if (metadata.width && metadata.width <= THUMB_WIDTH) {
        console.log(`⏭  Skipped (already small): ${file} (${metadata.width}px)`);
        skipped++;
        continue;
      }

      // Generate thumbnail
      await sharp(inputPath)
        .resize(THUMB_WIDTH, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      // Get output size for reporting
      const inputSize = fs.statSync(inputPath).size;
      const outputSize = fs.statSync(outputPath).size;
      const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

      console.log(
        `✓  ${file}: ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (${savings}% smaller)`
      );
      processed++;
    } catch (err) {
      console.error(`✗  Error processing ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Processed: ${processed} | Skipped: ${skipped} | Errors: ${errors}`);
  console.log(`Thumbnails saved to: ${THUMBS_DIR}`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
