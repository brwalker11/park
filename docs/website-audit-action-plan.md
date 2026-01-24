# Website Audit Action Plan

**Site:** Monetize Parking (monetize-parking.com)
**Audit Date:** January 2026
**Deployment:** GitHub → Cloudflare Pages

---

## Summary of Findings

| Category | Issues Found | Critical | High | Medium | Low |
|----------|-------------|----------|------|--------|-----|
| SEO | 12 | 1 | 4 | 5 | 2 |
| Performance | 15 | 2 | 6 | 5 | 2 |
| Accessibility | 14 | 4 | 5 | 3 | 2 |
| Technical | 11 | 3 | 4 | 3 | 1 |
| **Total** | **52** | **10** | **19** | **16** | **7** |

---

## 1. Critical Issues (Breaking/Blocking)

### 1.1 Broken Related Articles Data URL
**Issue:** Related articles sidebar fails to load due to incorrect path
**Files:** `js/related.js:2`
**Fix:**
```javascript
// Change from:
const DATA_URL = '/park/data/resources.json';
// To:
const DATA_URL = '/data/resources.json';
```
**Complexity:** Quick fix (1 line change)

---

### 1.2 Hidden Articles in Sitemap
**Issue:** 9 articles marked `hidden: true` appear in sitemap, causing SEO duplicate content issues
**Files:** `tools/update-sitemap.js`, `sitemap.xml`
**Affected Articles:**
- balancing-revenue-relationships
- choosing-pricing-strategy
- custom-operating-hours-strategy
- dynamic-pricing-guide
- dynamic-pricing-mistakes
- dynamic-pricing-strategies
- dynamic-pricing-technology
- license-plate-allow-listing-guide
- pricing-by-property-type

**Fix:** Update `tools/update-sitemap.js` to filter hidden articles:
```javascript
// After loading articles from resources.json, add:
const visibleArticles = articles.filter(a => !a.hidden);
// Then use visibleArticles instead of articles for sitemap generation
```
Then run: `node tools/update-sitemap.js`
**Complexity:** Quick fix + regenerate sitemap

---

### 1.3 Missing Skip Navigation Links
**Issue:** Keyboard users cannot skip repetitive navigation - WCAG 2.1 Level A failure
**Files:** All 98 HTML pages
**Fix:** Add to every page after opening `<body>` tag:
```html
<a href="#main" class="skip-link">Skip to main content</a>
```
Add to `styles.css`:
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--brand);
  color: #fff;
  z-index: 9999;
  text-decoration: none;
}
.skip-link:focus {
  top: 0;
}
```
Ensure all `<main>` elements have `id="main"`.
**Complexity:** Requires work (template changes + CSS)

---

### 1.4 Missing 404 Error Page
**Issue:** No custom 404 page - users see generic error
**Files:** Create new `404.html`
**Fix:** Create `/404.html` with:
- Site header/navigation
- Friendly error message
- Search functionality or popular links
- Contact information

Cloudflare Pages automatically serves `404.html` for not-found routes.
**Complexity:** Requires work (new page creation)

---

### 1.5 No Security Headers Configured
**Issue:** Site vulnerable to XSS, clickjacking, MIME sniffing attacks
**Files:** Create new `_headers`
**Fix:** Create `/_headers` file in repo root:
```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/*.html
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://formspree.io; frame-ancestors 'self'
```
**Complexity:** Quick fix (new file)

---

### 1.6 Broken Anchor Link on Homepage
**Issue:** Link to `/contact/#assessment` - anchor doesn't exist
**Files:** `index.html:151`
**Fix Option A:** Change link to existing anchor:
```html
<a class="timeline-step step step-link" href="/contact/#contactForm">
```
**Fix Option B:** Add anchor to contact page:
```html
<!-- In contact/index.html, add id to the section -->
<section id="assessment" class="...">
```
**Complexity:** Quick fix

---

### 1.7 Footer Incorrectly Inside Main Element
**Issue:** Semantic HTML violation - footer should be sibling of main, not child
**Files:** 78 HTML files (all except contact/index.html and services/index.html)
**Fix:** In each affected file, move `</main>` before `<footer>`:
```html
    </section>
  </main>           <!-- Move this BEFORE footer -->
  <footer class="site-footer">
```

Key files to update:
- `index.html`
- `about/index.html`
- `faq/index.html`
- `calculator/index.html`
- `resources/index.html`
- `templates/article-index.html` (fixes all articles)
- All state page templates

**Complexity:** Requires work (many files, but systematic)

---

### 1.8 Missing Image Dimensions (CLS Issue)
**Issue:** Image missing width/height causes Cumulative Layout Shift
**Files:** `about/index.html:97`
**Fix:**
```html
<!-- Change from: -->
<img src="/images/dave.jpeg" alt="Dave Wickiser" class="owner-photo" />
<!-- To: -->
<img src="/images/dave.jpeg" alt="Dave Wickiser" class="owner-photo"
     width="400" height="400" loading="lazy" />
```
**Complexity:** Quick fix

---

### 1.9 Form Errors Not Announced to Screen Readers
**Issue:** Validation errors not accessible - screen reader users miss feedback
**Files:** `contact/index.html:91,97,123`
**Fix:** Add `role="alert"` to error elements:
```html
<p id="err-name" class="field-error" role="alert" hidden>Please enter your name.</p>
<p id="err-email" class="field-error" role="alert" hidden>Please enter a valid email.</p>
<p id="err-message" class="field-error" role="alert" hidden>Please enter a message.</p>
```
Also add `aria-describedby` to inputs:
```html
<input id="name" name="name" aria-describedby="err-name" required>
<input id="email" name="_replyto" aria-describedby="err-email" required>
<textarea id="message" name="message" aria-describedby="err-message" required></textarea>
```
**Complexity:** Quick fix

---

### 1.10 Missing aria-selected on Filter Tabs
**Issue:** Screen readers can't identify active filter on resources page
**Files:** `resources/index.html:74-78`, `js/resources.js`
**Fix in HTML:**
```html
<button class="res-chip is-active" role="tab" aria-selected="true" data-filter="all">All</button>
<button class="res-chip" role="tab" aria-selected="false" data-filter="Case Study">Case Studies</button>
<!-- etc. -->
```
**Fix in JS** (when switching tabs):
```javascript
// Add to filter click handler in resources.js
chips.forEach(c => c.setAttribute('aria-selected', 'false'));
chip.setAttribute('aria-selected', 'true');
```
**Complexity:** Quick fix

---

## 2. High Priority Issues (Significant Impact)

### 2.1 Missing Open Graph Tags on Main Pages
**Issue:** Missing `og:type` and `twitter:image` on 7 main pages affects social sharing
**Files:**
- `index.html`
- `services/index.html`
- `about/index.html`
- `faq/index.html`
- `calculator/index.html`
- `contact/index.html`
- `resources/index.html`

**Fix:** Add to each file's `<head>`:
```html
<meta property="og:type" content="website">
<meta name="twitter:image" content="https://monetize-parking.com/images/og-hero.webp">
```
**Complexity:** Quick fix (7 files)

---

### 2.2 No Caching Headers
**Issue:** All assets re-downloaded on every visit - slow repeat loads
**Files:** Create/update `_headers`
**Fix:** Add to `/_headers`:
```
/images/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=31536000, immutable

/css/*
  Cache-Control: public, max-age=31536000, immutable

/data/*
  Cache-Control: public, max-age=3600

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```
**Complexity:** Quick fix

---

### 2.3 Unminified JavaScript (53KB → ~21KB)
**Issue:** 61% larger than necessary, slows page load
**Files:**
- `js/resources.js` (22KB → ~9KB)
- `js/article.js` (19KB → ~7KB)
- `js/related.js` (5.8KB → ~2KB)
- `js/state-map.js` (3.8KB → ~1.5KB)
- `script.js` (2.4KB → ~1KB)

**Fix:** Add build step with terser:
```bash
npm install terser --save-dev
npx terser js/resources.js -o js/resources.min.js -c -m
# Repeat for other files
```
Then update HTML references to use `.min.js` files.
**Complexity:** Requires work (build process setup)

---

### 2.4 Unminified CSS (62KB → ~44KB)
**Issue:** 29% larger than necessary
**Files:**
- `styles.css` (26.7KB)
- `css/article.css` (12.7KB)
- `css/resources.css` (11.6KB)
- `css/state-map.css` (5.4KB)

**Fix:** Add build step with cssnano:
```bash
npm install cssnano postcss postcss-cli --save-dev
npx postcss styles.css -o styles.min.css
```
**Complexity:** Requires work (build process setup)

---

### 2.5 55 Unguarded gtag() Calls
**Issue:** Will throw errors if Google Analytics fails to load
**Files:** Multiple (see list below)
**Fix:** Wrap all gtag calls:
```javascript
// Change from:
gtag('event', 'generate_lead', { method: 'Contact CTA' });
// To:
if (typeof gtag === 'function') {
  gtag('event', 'generate_lead', { method: 'Contact CTA' });
}
```

Files to update:
- `script.js:31,34`
- `contact/index.html:257,260`
- `about/index.html:189,192`
- `resources/index.html:155,158`
- `services/index.html:952,955`
- `faq/index.html:381,384`
- `calculator/index.html:958,961`
- All state pages (inline scripts)

**Complexity:** Requires work (many locations)

---

### 2.6 Missing Focus Styles on Interactive Elements
**Issue:** Keyboard users can't see which element is focused
**Files:** `css/resources.css:60-80`, `styles.css:255,290`
**Fix in `css/resources.css`:**
```css
.res-chip:focus,
.res-chip:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

.floating-state-btn:focus,
.floating-state-btn:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
```
**Fix in `styles.css`:** Replace `outline: none` with visible focus:
```css
/* Line 255 - .cta:focus */
.cta:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

/* Line 290 - .btn-primary:focus */
.btn-primary:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
```
**Complexity:** Quick fix

---

### 2.7 Render-Blocking CSS on 6 Main Pages
**Issue:** CSS blocks rendering, delays First Contentful Paint
**Files:**
- `index.html:17`
- `services/index.html:17`
- `about/index.html:17`
- `faq/index.html:17`
- `calculator/index.html:17`
- `contact/index.html:17`

**Fix:** Use the preload pattern from article template:
```html
<!-- Replace standard CSS link with: -->
<style>/* Inline critical CSS here */</style>
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
```
Critical CSS files already exist in `/css/critical/`.
**Complexity:** Requires work

---

### 2.8 Oversized SVG Logo (1.1MB)
**Issue:** Logo is 1.1MB - should be <50KB
**Files:** `images/Logo.svg`
**Fix:** Optimize with SVGO:
```bash
npm install svgo --save-dev
npx svgo images/Logo.svg -o images/Logo.svg
```
Or use online tool: https://jakearchibald.github.io/svgomg/
**Complexity:** Quick fix

---

### 2.9 Large JPG Fallback Images (17 files over 1MB)
**Issue:** Even with WebP, JPG fallbacks are downloaded by some browsers
**Files:** 17 images in `/images/` over 1MB each
**Fix Options:**
1. Compress JPGs to 80% quality (maintains compatibility)
2. Remove JPG fallbacks entirely (WebP support is 97%+)

Largest offenders:
- `hotel_park.jpg` (4.8MB)
- `insurance.jpg` (4.4MB)
- `event.jpg` (4.3MB)

**Complexity:** Requires work (image processing)

---

### 2.10 Duplicated Inline JavaScript
**Issue:** Nav toggle and analytics code duplicated across 5+ pages
**Files:**
- `about/index.html:163-195`
- `contact/index.html:231-263`
- `faq/index.html:355-387`
- `resources/index.html:129-161`
- `services/index.html:932-957`

**Fix:** Move to `script.js` and remove from individual pages:
```javascript
// Add to script.js
document.querySelectorAll('[data-contact-cta]').forEach(el => {
  el.addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', { method: 'Contact CTA' });
    }
  });
});
// Similar for calculator CTAs
```
**Complexity:** Requires work

---

## 3. Medium Priority Issues (Best Practices)

### 3.1 Delete Backup/Artifact Files
**Issue:** Unnecessary files deployed to production
**Files to delete:**
- `articles/flexible-parking-rules/index.backup.html`
- `css/article.backup.css`
- `metadata-audit.xlsx`
- `metadata-recommendations.xlsx`
- `images/rules.jpg` (corrupted - 2 bytes)

**Complexity:** Quick fix

---

### 3.2 Add Viewport Meta to Redirect Pages
**Issue:** 14 redirect pages missing viewport meta tag
**Files:**
- `about.html`
- `calculator.html`
- `services.html`
- `article-ai-vs-gates.html`
- `gate-arms.html`
- `lot-size.html`
- `stillwater-casestudy.html` (redirect to eau-claire-revenue-increase)
- `ai-vs-gates/index.html`
- `articles/index.html`
- `gate-arms/index.html`
- `lot-size/index.html`
- `parking-management-costs/index.html`
- `states/index.html`
- `stillwater-case-study/index.html` (redirect to eau-claire-revenue-increase)

**Fix:** Add to each:
```html
<meta name="viewport" content="width=device-width,initial-scale=1">
```
**Complexity:** Quick fix

---

### 3.3 Color Contrast Issues
**Issue:** Some text may fail WCAG AA contrast requirements
**Files:** `styles.css`
**Items to review:**
- Line 48: `opacity: 0.9` on text
- Line 437: `opacity: 0.15` on rules (nearly invisible)
- Line 475: `opacity: 0.7` on footer text
- `--muted: #64748b` usage throughout

**Fix:** Increase opacity values or use darker colors. Test with contrast checker.
**Complexity:** Requires review and testing

---

### 3.4 Calculator Tooltips Not Keyboard Accessible
**Issue:** Tooltip information hidden from keyboard users
**Files:** `calculator/index.html:146-161`
**Fix:** Add keyboard trigger and ARIA:
```html
<button type="button" class="tooltip-trigger" aria-describedby="tooltip-spaces">
  <span class="tooltip-icon">?</span>
</button>
<span id="tooltip-spaces" role="tooltip" class="tooltip-content">...</span>
```
**Complexity:** Requires work

---

### 3.5 Remove Unused submitForm Function
**Issue:** Dead code references non-existent form field
**Files:** `script.js:38-55`
**Fix:** Delete the entire `submitForm` function and its event listener attachment.
**Complexity:** Quick fix

---

### 3.6 Add prefers-reduced-motion to article.css
**Issue:** Animations not disabled for users with vestibular disorders
**Files:** `css/article.css`
**Fix:** Add media query:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
**Complexity:** Quick fix

---

### 3.7 Convert Redirect Pages to Cloudflare _redirects
**Issue:** JavaScript redirects less efficient than server-side
**Files:** Create `_redirects`, delete old redirect HTML files
**Fix:** Create `/_redirects`:
```
/about.html /about/ 301
/services.html /services/ 301
/calculator.html /calculator/ 301
/lot-size.html /articles/optimal-lot-size-profit/ 301
/gate-arms.html /articles/gate-arm-maintenance-costs/ 301
/article-ai-vs-gates.html /articles/ai-access-vs-gates/ 301
/stillwater-casestudy.html /articles/eau-claire-revenue-increase/ 301
/ai-vs-gates/* /articles/ai-access-vs-gates/ 301
/parking-management-costs/* /articles/real-costs-parking-management/ 301
/states/* /resources/states/ 301
/stillwater-case-study/* /articles/eau-claire-revenue-increase/ 301
/lot-size/* /articles/optimal-lot-size-profit/ 301
/gate-arms/* /articles/gate-arm-maintenance-costs/ 301
/articles /resources/ 301
```
Then delete the old HTML redirect files.
**Complexity:** Requires work

---

### 3.8 Remove Dead Navigation Toggle Code
**Issue:** Code references `.nav-toggle` element that doesn't exist
**Files:**
- `about/index.html:233-250`
- `contact/index.html:231-250`
- `faq/index.html:355-374`
- `resources/index.html:129-148`

**Fix:** Remove the entire nav toggle script block from each file.
**Complexity:** Quick fix

---

### 3.9 Add Keyboard Support to Filter Tabs
**Issue:** Filter buttons only respond to click, not keyboard
**Files:** `js/resources.js:78-87`
**Fix:** Add keydown handler:
```javascript
chips.forEach(chip => {
  chip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      chip.click();
    }
    // Arrow key navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const chips = [...document.querySelectorAll('.res-chip')];
      const currentIndex = chips.indexOf(chip);
      const nextIndex = e.key === 'ArrowRight'
        ? (currentIndex + 1) % chips.length
        : (currentIndex - 1 + chips.length) % chips.length;
      chips[nextIndex].focus();
    }
  });
});
```
**Complexity:** Quick fix

---

## 4. Low Priority Issues (Nice-to-Haves)

### 4.1 Add Web App Manifest
**Issue:** No PWA support
**Files:** Create `manifest.json`
**Fix:** Create `/manifest.json`:
```json
{
  "name": "Monetize Parking",
  "short_name": "Monetize",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/images/favicon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/images/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```
Add to HTML `<head>`:
```html
<link rel="manifest" href="/manifest.json">
```
**Complexity:** Quick fix

---

### 4.2 Add Preload Hints for Hero Images
**Issue:** Hero images could load faster with preload
**Files:** `index.html`, `services/index.html`
**Fix:** Add to `<head>`:
```html
<link rel="preload" as="image" href="/images/hero.webp" type="image/webp">
```
**Complexity:** Quick fix

---

### 4.3 Add State Page Cross-Linking
**Issue:** State pages don't link to other states
**Files:** All state landing pages
**Fix:** Add "See Also" section at bottom:
```html
<section class="related-states">
  <h3>Explore Other States</h3>
  <ul>
    <li><a href="/resources/states/colorado/">Colorado</a></li>
    <li><a href="/resources/states/minnesota/">Minnesota</a></li>
    <!-- etc. -->
  </ul>
</section>
```
**Complexity:** Requires work

---

### 4.4 Link FAQ to Related Articles
**Issue:** FAQ answers don't link to supporting content
**Files:** `faq/index.html`
**Fix:** Add relevant article links within FAQ answers.
**Complexity:** Requires content review

---

### 4.5 Add Subresource Integrity (SRI) to External Scripts
**Issue:** External scripts could be tampered with
**Files:** All pages loading Google Tag Manager
**Fix:** Add integrity hash (note: difficult with GTM as it changes):
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LGHS0L5WE8"
        integrity="sha384-..." crossorigin="anonymous"></script>
```
**Complexity:** Requires ongoing maintenance

---

### 4.6 Add BreadcrumbList Schema to Articles
**Issue:** Articles missing breadcrumb structured data
**Files:** `js/article.js`
**Fix:** Add BreadcrumbList to the JSON-LD generation:
```javascript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://monetize-parking.com/" },
    { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://monetize-parking.com/resources/" },
    { "@type": "ListItem", "position": 3, "name": article.title }
  ]
};
```
**Complexity:** Requires work

---

### 4.7 Add Footer Navigation Links
**Issue:** Footer only has LinkedIn link, no quicklinks
**Files:** All pages (footer section)
**Fix:** Add navigation links to footer:
```html
<footer class="site-footer">
  <nav class="footer-nav">
    <a href="/services/">Services</a>
    <a href="/resources/">Resources</a>
    <a href="/faq/">FAQ</a>
    <a href="/contact/">Contact</a>
  </nav>
  <!-- existing content -->
</footer>
```
**Complexity:** Quick fix but many files

---

## Implementation Order

### Phase 1: Critical Fixes (Do First)
1. Fix `js/related.js` data URL (1.1)
2. Create `_headers` with security headers (1.5)
3. Fix broken anchor link (1.6)
4. Fix image dimensions (1.8)
5. Fix form error accessibility (1.9)
6. Update sitemap generation for hidden articles (1.2)

### Phase 2: High Priority (This Week)
7. Add Open Graph tags to main pages (2.1)
8. Add caching headers (2.2)
9. Add focus styles (2.6)
10. Guard gtag() calls (2.5)
11. Optimize SVG logo (2.8)

### Phase 3: Accessibility (Next Week)
12. Add skip navigation links (1.3)
13. Create 404 page (1.4)
14. Fix footer placement (1.7)
15. Add aria-selected to filters (1.10)

### Phase 4: Performance (Following Week)
16. Minify JS (2.3)
17. Minify CSS (2.4)
18. Implement critical CSS (2.7)
19. Compress large images (2.9)
20. Consolidate inline scripts (2.10)

### Phase 5: Cleanup (Ongoing)
21. Delete backup files (3.1)
22. Convert to Cloudflare redirects (3.7)
23. Remove dead code (3.5, 3.8)
24. Low priority items as time permits

---

## Cloudflare-Specific Notes

Since you're using Cloudflare:

1. **`_headers` file** - Place in repo root, Cloudflare will apply these headers
2. **`_redirects` file** - Place in repo root for server-side redirects
3. **Caching** - Cloudflare has additional caching controls in dashboard
4. **Security** - Consider enabling these in Cloudflare dashboard:
   - Always Use HTTPS
   - Automatic HTTPS Rewrites
   - HSTS (can also be set via dashboard)
5. **Performance** - Cloudflare can auto-minify JS/CSS (Settings → Speed → Optimization)

**Questions for your Cloudflare setup:**
- Do you have Auto Minify enabled in Cloudflare? (If yes, skip items 2.3/2.4)
- Any existing Page Rules configured?
- Is Cloudflare caching enabled and at what level?

---

## Estimated Effort

| Priority | Items | Quick Fixes | Requires Work | Est. Hours |
|----------|-------|-------------|---------------|------------|
| Critical | 10 | 6 | 4 | 8-12 |
| High | 10 | 4 | 6 | 12-16 |
| Medium | 9 | 5 | 4 | 6-8 |
| Low | 7 | 4 | 3 | 4-6 |
| **Total** | **36** | **19** | **17** | **30-42** |

---

*Report generated from comprehensive audits of SEO, Performance, Accessibility, and Technical Infrastructure.*
