#!/usr/bin/env node
'use strict';

/*
 * Repairs the VideoObject schema on the 30 pages under /resources/videos/.
 *
 * Before this ran, every one of them declared:
 *
 *     "duration":   "PT0M0S"
 *     "uploadDate": "2025-01-01T00:00:00Z"
 *
 * Both were placeholders and both were false. Google's Videos report had
 * discovered ZERO videos across the whole site, and the sitemap report agreed:
 * "Discovered videos: 0". A duration of zero is not a missing value, it is an
 * assertion that the video has no length, and `uploadDate` is a REQUIRED field
 * for VideoObject - so the schema was simultaneously wrong and, in Google's
 * eyes, describing 30 identical zero-length videos published on the same day.
 *
 * Real values were read from the live YouTube watch pages on 2026-08-21
 * (lengthSeconds and the itemprop="uploadDate" meta) and recorded in
 * data/videos.json. Actual durations run 35-64 seconds; actual uploads are
 * 1-6 February 2026, more than a year off the placeholder.
 *
 * This is a one-off repair, not a build step, and is deliberately NOT wired
 * into npm run build. The video pages are hand-maintained - there is no
 * generator for them - so if new videos are added, extend data/videos.json and
 * run this again.
 *
 * Nothing outside the two schema fields is touched. A deliberate-diff gate
 * reverses both substitutions on every file and requires the result to equal
 * the original byte for byte.
 *
 * Usage: node tools/fix-video-schema.js [--write]     (dry run by default)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'videos.json');
const VIDEO_ROOT = path.join(ROOT, 'resources', 'videos');

/* The JSON-LD block is pretty-printed, so the space after the colon is part of
   the match. Do not "tidy" these into minified form - they would stop matching
   and the script would refuse to run rather than silently corrupt anything. */
const OLD_DURATION = '"duration": "PT0M0S"';
const OLD_UPLOAD = '"uploadDate": "2025-01-01T00:00:00Z"';

/* ISO 8601 duration. Every one of these is under two minutes, but the minute
   branch is here so a longer video added later does not silently emit PT90S. */
function isoDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m ? `PT${m}M${s}S` : `PT${s}S`;
}

function main() {
  const write = process.argv.includes('--write');
  const { videos } = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const slugs = Object.keys(videos);

  const changed = [];
  const problems = [];

  for (const slug of slugs) {
    const file = path.join(VIDEO_ROOT, slug, 'index.html');
    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch (error) {
      problems.push(`${slug}: cannot read ${file}`);
      continue;
    }

    if (src.indexOf(OLD_DURATION) === -1) problems.push(`${slug}: placeholder duration not found`);
    if (src.indexOf(OLD_UPLOAD) === -1) problems.push(`${slug}: placeholder uploadDate not found`);
    if (src.split(OLD_DURATION).length > 2) problems.push(`${slug}: duration appears more than once`);
    if (src.split(OLD_UPLOAD).length > 2) problems.push(`${slug}: uploadDate appears more than once`);
    if (problems.length) continue;

    const rec = videos[slug];
    if (!rec.seconds || rec.seconds <= 0) {
      problems.push(`${slug}: no positive duration in data/videos.json`);
      continue;
    }
    /* The recorded id must actually be the one embedded on the page, or the
       duration belongs to a different video. */
    if (src.indexOf(rec.id) === -1) {
      problems.push(`${slug}: recorded id ${rec.id} does not appear on the page`);
      continue;
    }

    const newDuration = `"duration": "${isoDuration(rec.seconds)}"`;
    const newUpload = `"uploadDate": "${rec.uploadDate}"`;
    const next = src.replace(OLD_DURATION, newDuration).replace(OLD_UPLOAD, newUpload);

    // Deliberate-diff gate: reversing both edits must restore the original exactly.
    const reversed = next.replace(newDuration, OLD_DURATION).replace(newUpload, OLD_UPLOAD);
    if (reversed !== src) {
      problems.push(`${slug}: reversing the edit did not restore the original`);
      continue;
    }

    changed.push({ slug, file, next, from: 'PT0M0S', to: isoDuration(rec.seconds), date: rec.uploadDate.slice(0, 10) });
  }

  if (problems.length) {
    console.error(`${problems.length} problem(s); nothing written:`);
    problems.forEach((p) => console.error(`  ${p}`));
    process.exitCode = 1;
    return;
  }

  changed.forEach((c) => {
    console.log(`${c.slug.padEnd(38)} ${c.from} -> ${c.to.padEnd(8)} ${c.date}`);
    if (write) fs.writeFileSync(c.file, c.next, 'utf8');
  });
  console.log(`\n${changed.length} of ${slugs.length} pages ${write ? 'written' : 'would change (dry run; pass --write)'}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
