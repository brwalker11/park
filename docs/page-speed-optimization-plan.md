# Page Speed Optimization Plan

This document outlines a comprehensive plan to fix the page speed issues identified in PageSpeed Insights for the Monetize Parking website.

## Executive Summary

**Current Issues:**
1. **Image Delivery**: ~1,067 KiB potential savings (oversized images)
2. **Layout Shift (CLS)**: Score of 1.336 (target: <0.1)
3. **LCP Request Discovery**: Hero image not discoverable in initial HTML

---

## Issue 1: Image Delivery Optimization

### Problem Analysis

Full-size images (1600x1600px, 620KB+) are being used everywhere, including:
- **Hero images**: Display at ~1600px wide (appropriate)
- **Related article thumbnails**: Display at 72x72px
- **Resources page cards**: Display at ~200px wide

**Files affected:**
- `/images/private.webp` - 621.9 KiB (displayed at 126x168)
- `/images/park_problems.webp` - 189.2 KiB (displayed at 126x157)
- `/images/rest_park.webp` - 187.6 KiB (displayed at 192x126)
- `/images/stone.webp` - 58.6 KiB (displayed at 168x126)
- `/images/gate_arms.webp` - 152.1 KiB (displayed at thumbnail size)

### Solution

#### Step 1: Create Thumbnail Image Variants
Create optimized thumbnails for each image at 400px width:

```bash
# Install sharp-cli for image processing
npm install -g sharp-cli

# Create thumbnails directory
mkdir -p images/thumbs

# Generate thumbnails for all WebP images
for img in images/*.webp; do
  filename=$(basename "$img")
  sharp -i "$img" -o "images/thumbs/$filename" resize 400
done
```

Alternatively, use a Node.js script to batch process:

```javascript
// tools/generate-thumbnails.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const THUMBS_DIR = path.join(IMAGES_DIR, 'thumbs');
const THUMB_WIDTH = 400;

async function generateThumbnails() {
  if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.webp'));

  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(THUMBS_DIR, file);

    await sharp(inputPath)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }
}

generateThumbnails();
```

#### Step 2: Update data/resources.json
Ensure each article has a separate `thumbnail` field pointing to the smaller image:

```json
{
  "slug": "gate-arm-maintenance-costs",
  "image": "/images/gate_arms.webp",
  "thumbnail": "/images/thumbs/gate_arms.webp",
  ...
}
```

#### Step 3: Update JavaScript to Use Thumbnails
Both `js/resources.js` and `js/article.js` already support separate `thumbnail` fields. Ensure all JSON entries use them.

#### Step 4: Add srcset for Hero Images (Optional Enhancement)
For even better optimization, add srcset support to hero images:

In `templates/article-index.html`:
```html
<img id="hero-image"
     src="/images/default-guide.webp"
     srcset="/images/thumbs/default-guide.webp 400w,
             /images/default-guide.webp 1600w"
     sizes="(max-width: 600px) 100vw, 1600px"
     alt="Parking lot revenue guide"
     width="1600"
     height="900"
     fetchpriority="high" />
```

Update `js/article.js` to set srcset dynamically:
```javascript
heroImage.srcset = `${article.thumbnail} 400w, ${article.image} 1600w`;
heroImage.sizes = '(max-width: 600px) 100vw, 1600px';
```

**Estimated Savings:** ~1,000 KiB (85%+ reduction for thumbnail contexts)

---

## Issue 2: Layout Shift (CLS) Fixes

### Problem Analysis

**CLS Score: 1.336** (extremely high, target is <0.1)

Layout shift culprits identified:
1. **Article element**: 0.688 CLS - Content loads dynamically
2. **Hero-inner div**: 0.375 CLS - Title/meta text varies
3. **Article element (again)**: 0.274 CLS - Body content injection

**Root causes:**
- Related sidebar (`#related-list`) starts empty, expands when populated
- Article body injected via `innerHTML` without reserved space
- Summary div conditionally shown/hidden

### Solution

#### Step 1: Reserve Space for Related Sidebar

Add minimum height to the related sidebar in `css/article.css`:

```css
/* CLS Prevention: Reserve space for related articles */
.related-sidebar {
  min-height: 540px; /* 5 cards × ~108px each */
}

.related-list {
  min-height: 480px; /* Reserve space for content */
}

@media (max-width: 860px) {
  .related-sidebar {
    min-height: auto; /* Don't reserve on mobile where it reflows */
  }
  .related-list {
    min-height: auto;
  }
}
```

#### Step 2: Add Skeleton Loading for Related Articles

Update `templates/article-index.html` to include skeleton placeholders:

```html
<div id="related-list" class="related-list" aria-live="polite">
  <!-- Skeleton placeholders for CLS prevention -->
  <div class="related-card skeleton" aria-hidden="true">
    <div class="related-thumb skeleton-box"></div>
    <div class="related-content">
      <div class="skeleton-line" style="width: 40%"></div>
      <div class="skeleton-line" style="width: 90%"></div>
      <div class="skeleton-line" style="width: 60%"></div>
    </div>
  </div>
  <!-- Repeat 4 more times for 5 total skeleton cards -->
</div>
```

Add skeleton CSS to critical CSS in template:

```css
.skeleton-box {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.skeleton-line {
  height: 1em;
  border-radius: 4px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  margin-bottom: 0.5em;
}
@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Step 3: Reserve Space for Article Body

Add minimum height for article body area:

```css
/* CLS Prevention: Reserve initial space for article content */
#article-body {
  min-height: 300px; /* Minimum expected content height */
}

#article-body:not(:empty) {
  min-height: auto; /* Remove constraint once content loads */
}
```

#### Step 4: Fix Summary Visibility Toggle

Instead of `display: none`, use `visibility: hidden` with reserved height, or always show with fallback text:

In `js/article.js`:
```javascript
// Instead of:
summaryEl.style.display = article.excerpt ? '' : 'none';

// Use:
if (article.excerpt) {
  summaryEl.textContent = article.excerpt;
  summaryEl.classList.remove('is-hidden');
} else {
  summaryEl.classList.add('is-hidden');
}
```

CSS:
```css
.article-summary.is-hidden {
  visibility: hidden;
  height: 0;
  margin: 0;
  overflow: hidden;
}
```

**Expected CLS Improvement:** From 1.336 to <0.25

---

## Issue 3: LCP Request Discovery

### Problem Analysis

The LCP (Largest Contentful Paint) element is the hero image. Currently:
- ✅ `loading="eager"` is applied
- ✅ `fetchpriority="high"` is applied
- ❌ Request is NOT discoverable in initial HTML

**Why?** The template has a default placeholder image (`/images/default-guide.webp`), but the actual article's hero image is set via JavaScript AFTER `DOMContentLoaded`. The browser can't preload the real image because it doesn't know about it until JS executes.

### Solution

#### Step 1: Enhance Build Script to Pre-populate Hero Image

Update `tools/generate-article-pages.js` to inject the actual hero image URL at build time:

```javascript
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

function normaliseImage(path) {
  if (!path) return '/images/default-guide.webp';
  if (path.startsWith('http')) return path;
  return path.startsWith('/images/') ? path : `/images/${path.replace(/^\/+/, '')}`;
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

    const articleUrl = `${BASE_URL}/articles/${slug}/`;
    const heroImage = normaliseImage(article.image);
    const heroImageUrl = heroImage.startsWith('http') ? heroImage : `${BASE_URL}${heroImage}`;
    const title = article.title || 'Loading article…';
    const description = article.description || article.excerpt || '';
    const imageAlt = article.imageAlt || title;

    let html = template
      // Update canonical and og:url
      .replace(
        /<link rel="canonical" href="https:\/\/monetize-parking\.com\/articles\/">/,
        `<link rel="canonical" href="${articleUrl}">`
      )
      .replace(
        /<meta property="og:url" content="https:\/\/monetize-parking\.com\/articles\/">/,
        `<meta property="og:url" content="${articleUrl}">`
      )
      // Pre-populate hero image for LCP discovery
      .replace(
        /src="\/images\/default-guide\.webp"/,
        `src="${heroImage}"`
      )
      .replace(
        /alt="Parking lot revenue guide"/,
        `alt="${imageAlt.replace(/"/g, '&quot;')}"`
      )
      // Add preload link for hero image (insert before </head>)
      .replace(
        '</head>',
        `  <link rel="preload" as="image" href="${heroImage}" fetchpriority="high">\n</head>`
      )
      // Pre-populate OG and Twitter images
      .replace(
        /<meta property="og:image" content="https:\/\/monetize-parking\.com\/images\/default-guide\.webp">/,
        `<meta property="og:image" content="${heroImageUrl}">`
      )
      .replace(
        /<meta name="twitter:image" content="https:\/\/monetize-parking\.com\/images\/default-guide\.webp">/,
        `<meta name="twitter:image" content="${heroImageUrl}">`
      )
      // Pre-populate title
      .replace(
        /<title>Loading article… \| Monetize Parking<\/title>/,
        `<title>${title} | Monetize Parking</title>`
      )
      .replace(
        /<meta name="description" content="[^"]*">/,
        `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`
      )
      // Pre-populate OG title/description
      .replace(
        /<meta property="og:title" content="[^"]*">/,
        `<meta property="og:title" content="${title} | Monetize Parking">`
      )
      .replace(
        /<meta property="og:description" content="[^"]*">/,
        `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">`
      )
      .replace(
        /<meta name="twitter:title" content="[^"]*">/,
        `<meta name="twitter:title" content="${title} | Monetize Parking">`
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*">/,
        `<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}">`
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
```

#### Step 2: Update article.js to Handle Pre-populated Data

The JavaScript should still work, but verify it doesn't cause flicker by replacing pre-set values:

```javascript
// In renderArticle(), only set heroImage.src if it differs
const heroImageUrl = absolute(article.image);
if (heroImage.src !== heroImageUrl && !heroImage.src.includes(article.image)) {
  hero.style.backgroundImage = `url('${heroImageUrl}')`;
  heroImage.src = heroImageUrl;
}
// Always set alt in case it's more accurate
heroImage.alt = article.imageAlt;
```

#### Step 3: Add Preconnect Hints (Optional)

If images are served from a CDN or different origin, add preconnect:

```html
<link rel="preconnect" href="https://monetize-parking.com">
```

**Expected LCP Improvement:** 200-500ms faster LCP as browser can discover and preload the hero image from initial HTML parse.

---

## Implementation Order

### Phase 1: Quick Wins (CLS Fixes)
1. Add min-height to `.related-sidebar` and `.related-list`
2. Add min-height to `#article-body`
3. Add skeleton placeholders to template

**Files to modify:**
- `css/article.css`
- `templates/article-index.html`

### Phase 2: LCP Discovery Fix
1. Update `tools/generate-article-pages.js` with pre-population logic
2. Regenerate all article pages
3. Verify no JS conflicts

**Files to modify:**
- `tools/generate-article-pages.js`
- All files in `articles/*/index.html` (regenerated)

### Phase 3: Image Optimization
1. Create `tools/generate-thumbnails.js`
2. Generate all thumbnail images
3. Update `data/resources.json` with thumbnail paths
4. Optionally add srcset support

**Files to modify:**
- `tools/generate-thumbnails.js` (new)
- `data/resources.json`
- `js/article.js` (for srcset)
- `templates/article-index.html` (for srcset)

---

## Verification

After implementing each phase, verify with:

1. **Local testing:**
   ```bash
   python3 -m http.server 8000
   ```

2. **PageSpeed Insights:**
   - Test both Mobile and Desktop
   - Target scores:
     - CLS: <0.1
     - LCP: <2.5s
     - Image savings: 0 KiB

3. **Chrome DevTools:**
   - Performance tab → Record page load
   - Check Layout Shift events
   - Check Network waterfall for image preloading

---

## Expected Results

| Metric | Before | After (Target) |
|--------|--------|----------------|
| Image Transfer | 1,209 KiB | ~200 KiB |
| CLS Score | 1.336 | <0.1 |
| LCP Discovery | ❌ Not in HTML | ✅ In HTML |
| Overall Score | ~60-70 | 85-95 |
