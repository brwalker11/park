# Dynamic Article System

This site now renders every resource article through the shared [`/article.html`](../article.html) template. Article content, metadata, and SEO signals are driven from `data/resources.json`, so updating that file is the single source of truth.

## Adding or Updating an Article
1. **Create the body file** under [`/articles/`](../articles/) using HTML fragments (no `<html>` wrapper). Name it after the slug, e.g. `/articles/my-new-article.html`.
2. **Add an entry in [`data/resources.json`](../data/resources.json)** with the full schema:
   - `slug`, `title`, `category`, `tags`
   - `date`, and optionally `lastmod`
   - `description` (~150 chars) and `excerpt`
   - `image`, `thumbnail`, and `imageAlt` (all beginning with `/images/`)
   - `content` (path to the body file)
   - `readTime`, `author`, optional `canonicalOverride`
3. **Keep image paths canonical.** Every image reference must start with `/images/`. Upload new assets there and reuse them for both hero and thumbnail sizes if unique artwork is not available.
4. Commit both the JSON update and the new article body.

The template will automatically pull in the hero image, author line, summary, body markup, inline CTA, and bottom CTAs.

## URL & Canonical Behaviour
- Primary article URLs use the query-string pattern: `/article.html?slug={slug}`.
- Legacy static pages under `/resources/...` and topic folders redirect to the dynamic route and advertise a canonical to the query-string URL.
- If a specific article must point elsewhere, set `canonicalOverride` in the JSON entry. The template will respect it for `<link rel="canonical">`, Open Graph, Twitter tags, and JSON-LD.

## Inline & Bottom CTAs
- The script inserts the standardized inline CTA *before the third sub-heading* (`h2`/`h3`) in the article body.
- Two bottom CTAs are always rendered: a primary consultation button and a secondary revenue calculator CTA. Both are wired to GA4 events (`generate_lead` and `calculator_start`).

## Related Articles
Related resources display in the sidebar with thumbnails and read times. The ranking combines:
1. Shared tags (highest weight)
2. Matching category
3. Recency (newer articles float up)

Articles never recommend themselves, and up to five matches are shown. To influence relevance, make sure tags are accurate and consistent across the JSON entries.

## SEO & Structured Data
- `<title>`, meta description, canonical, Open Graph, Twitter cards, and JSON-LD `Article` schema are generated dynamically for each slug.
- Valid articles are indexed (`index,follow`). Missing/invalid slugs show a friendly message and set `noindex,follow` automatically.

## Sitemap Automation
Run the helper script whenever `data/resources.json` changes:

```sh
node tools/update-sitemap.js
```

The script regenerates [`sitemap.xml`](../sitemap.xml) using all top-level routes plus every article URL with its `lastmod` date. `robots.txt` already references this sitemap.

## GA4 Tracking
The template records a `page_view` for the resolved article URL (query-string form by default). Inline and bottom CTAs send GA4 events using the existing naming conventions so reporting remains consistent.

