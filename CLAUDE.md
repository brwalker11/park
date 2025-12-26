# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static marketing website for Monetize Parking, a parking lot revenue optimization service. The site is deployed via GitHub Pages and uses vanilla HTML/CSS/JavaScript with a dynamic article system.

**Domain**: https://monetize-parking.com

## Development Commands

### Article Generation
```bash
# Generate/update article index pages from data/resources.json
node tools/generate-article-pages.js

# Update sitemap.xml with latest articles
node tools/update-sitemap.js
```

After adding or modifying articles in `data/resources.json`, you must run both commands in sequence.

### Local Testing
Since this is a static site for GitHub Pages, use any local server:
```bash
python3 -m http.server 8000
# or
npx serve .
```

## Architecture

### Dynamic Article System

The site uses a template-based article system where content is driven by JSON data rather than individual static HTML files.

**Key Files**:
- `/data/resources.json` - Single source of truth for all article metadata, SEO, and content paths
- `/templates/article-index.html` - Shared template for all article pages
- `/articles/{slug}.html` - HTML body fragments (content only, no wrapper)
- `/js/article.js` - Runtime that loads article data and renders the template
- `/tools/generate-article-pages.js` - Copies template to `/articles/{slug}/index.html` for each article

**How it works**:
1. Article metadata lives in `data/resources.json` with fields like `slug`, `title`, `description`, `tags`, `category`, `image`, `content` (path to body fragment), etc.
2. The `generate-article-pages.js` script copies the template to `/articles/{slug}/index.html` for every entry
3. At runtime, `js/article.js` extracts the slug from the URL path, fetches `data/resources.json`, finds the matching article, loads the body HTML from the `content` path, and renders everything dynamically
4. SEO tags (title, meta description, canonical, Open Graph, Twitter, JSON-LD) are all generated client-side from the JSON data

**Adding a New Article**:
1. Create the body HTML fragment at `/articles/my-new-article.html` (no `<html>` wrapper, just content)
2. Add a complete entry to `data/resources.json` with all required fields
3. Run `node tools/generate-article-pages.js` to create `/articles/my-new-article/index.html`
4. Run `node tools/update-sitemap.js` to add the new URL to sitemap
5. Commit the JSON update, body fragment, generated index page, and sitemap together

### State Resources

State-specific landing pages use a similar pattern:
- `/data/state-resources.json` - Metadata for state pages (Colorado, Minnesota, Texas, Wisconsin)
- `/resources/states/{state}/` - State landing pages with sub-sections
- `/js/state-map.js` - Interactive state map on `/resources/` page

### Related Articles Algorithm

Related articles in the sidebar are ranked by:
1. **Shared tags** (highest weight)
2. **Matching category**
3. **Recency** (newer articles float up)

Articles never recommend themselves. Up to 5 related articles are shown.

### Article Series Navigation

Multi-part article series (e.g., "Flexible Parking Rules", "Dynamic Pricing 101") are configured in both:
- `/js/article.js` - `SERIES_CONFIG` object maps series to their articles
- `/js/resources.js` - `SERIES_CONFIG` array for the resources page

When viewing a series article, a contextual sidebar navigation appears showing all parts.

### Image Path Rules

**All image references must start with `/images/`**. This applies to:
- Hero images (`image` field in JSON)
- Thumbnails (`thumbnail` field)
- Inline images in article body HTML
- Open Graph and Twitter card images

The article runtime converts relative paths to absolute URLs for social meta tags.

### URL Structure

- **Homepage**: `/`
- **Articles**: `/articles/{slug}/` → `/articles/{slug}/index.html`
- **State pages**: `/resources/states/{state}/`
- **Other pages**: `/services/`, `/about/`, `/faq/`, `/calculator/`, `/contact/`

All article URLs are pretty URLs (no `.html` extension visible). The build script ensures each article has an `index.html` in its directory for GitHub Pages routing.

### Analytics Tracking

GA4 tracking is integrated via Google Tag Manager (ID: `G-LGHS0L5WE8`). Key events:
- `page_view` - Automatic for all pages
- `generate_lead` - Contact form submissions and consultation CTAs
- `calculator_start` - Revenue calculator clicks

Event tracking is handled in:
- `/script.js` - Global CTA tracking
- `/js/article.js` - Article-specific inline and footer CTAs

### Inline CTAs

Article inline CTAs are automatically inserted **before the third sub-heading** (`h2` or `h3`) by `js/article.js`. The CTA markup and copy are defined in the `INLINE_CTA_COPY` constant.

Bottom CTAs are always rendered with two buttons: primary consultation CTA and secondary calculator CTA.

### Structured Data (JSON-LD)

The site uses extensive schema.org markup:
- **Organization** schema on homepage (`index.html`)
- **VideoObject** schema for hero video (`index.html`)
- **Article** and **BreadcrumbList** schema dynamically generated for each article (`js/article.js`)

FAQPage schema can be added to pages with Q&A content (see `SEO_TODO.md`).

## File Organization

```
/
├── index.html              # Homepage
├── styles.css              # Main global stylesheet
├── script.js               # Global JS (navigation, analytics)
├── data/
│   ├── resources.json      # Article metadata (single source of truth)
│   └── state-resources.json # State landing page data
├── templates/
│   └── article-index.html  # Shared article template
├── articles/
│   ├── {slug}.html         # Article body fragments
│   └── {slug}/
│       └── index.html      # Generated from template
├── css/
│   ├── article.css         # Article-specific styles
│   ├── resources.css       # Resources page styles
│   └── state-map.css       # Interactive map styles
├── js/
│   ├── article.js          # Article runtime (loads data, renders content)
│   ├── resources.js        # Resources listing page logic
│   ├── related.js          # Related articles algorithm
│   └── state-map.js        # Interactive state map
├── images/                 # All images (WebP preferred for performance)
├── tools/
│   ├── generate-article-pages.js  # Build script for articles
│   └── update-sitemap.js   # Sitemap generator
├── services/index.html     # Services page
├── about/index.html        # About page
├── faq/index.html          # FAQ page
├── calculator/index.html   # Revenue calculator
├── contact/index.html      # Contact form
├── resources/              # Resource hub and state pages
├── sitemap.xml             # Auto-generated from data/resources.json
├── robots.txt              # Search engine directives
└── docs/                   # Development documentation
    ├── articles-dynamic.md # Article system documentation
    └── url-migration.md    # URL structure notes
```

## Important Patterns

### When Editing Articles

1. **Never edit `/articles/{slug}/index.html` directly** - it's auto-generated from the template
2. **Edit the body fragment** at `/articles/{slug}.html` instead
3. **Update metadata** in `data/resources.json`
4. **Regenerate** with `node tools/generate-article-pages.js`

### When Adding Images

1. Place images in `/images/` directory
2. Use WebP format when possible (see `SEO_TODO.md` for conversion guidance)
3. Always include `width`, `height`, and `alt` attributes
4. Use `loading="lazy"` for images below the fold
5. Reference with absolute paths starting with `/images/`

### Canonical URLs

By default, canonical URLs follow the pattern: `https://monetize-parking.com/articles/{slug}/`

To override, set `canonicalOverride` in the article's JSON entry. The runtime applies it to:
- `<link rel="canonical">`
- Open Graph `og:url`
- Twitter card metadata
- JSON-LD schema

### Hiding Articles

To hide an article from listings while keeping it accessible:
- Set `"hidden": true` in the article's JSON entry
- The article will still be accessible via direct URL
- It won't appear in the resources grid or related articles

## Documentation

See `/docs/` for detailed documentation:
- `articles-dynamic.md` - Complete article system guide
- `url-migration.md` - URL structure and routing notes

See `SEO_TODO.md` for pending SEO optimization tasks.

## Deployment

This site deploys automatically via GitHub Pages when pushing to the main branch. No build step is required beyond running the article generation scripts.

**CNAME**: The `CNAME` file contains the custom domain configuration for GitHub Pages.
