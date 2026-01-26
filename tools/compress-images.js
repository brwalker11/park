#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const QUALITY = 80;
const MAX_WIDTH = 1920;

async function compressImage(filePath) {
  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);

  if (sizeMB < 0.5) {
    return null; // Skip small images
  }

  const tempPath = filePath + '.tmp';

  try {
    await sharp(filePath)
      .resize(MAX_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(tempPath);

    const newStats = fs.statSync(tempPath);
    const newSizeMB = newStats.size / (1024 * 1024);

    // Only replace if we saved space
    if (newStats.size < stats.size) {
      fs.renameSync(tempPath, filePath);
      return {
        file: path.basename(filePath),
        before: sizeMB.toFixed(2),
        after: newSizeMB.toFixed(2),
        saved: ((1 - newStats.size / stats.size) * 100).toFixed(0)
      };
    } else {
      fs.unlinkSync(tempPath);
      return null;
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error(`Error processing ${filePath}:`, err.message);
    return null;
  }
}

async function main() {
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'))
    .map(f => path.join(IMAGES_DIR, f));

  console.log(`Processing ${files.length} JPG files...`);

  const results = [];
  for (const file of files) {
    const result = await compressImage(file);
    if (result) {
      results.push(result);
      console.log(`${result.file}: ${result.before}MB → ${result.after}MB (${result.saved}% saved)`);
    }
  }

  console.log(`\nCompressed ${results.length} images`);
}

main().catch(console.error);
