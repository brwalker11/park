# Article URL Migration Notes

## Pretty URL structure
- Every resource article is now served from `/articles/{slug}/` and backed by `/articles/{slug}/index.html`.
- The shared layout lives at [`templates/article-index.html`](../templates/article-index.html) and is copied to each slug directory by [`tools/generate-article-pages.js`](../tools/generate-article-pages.js).
- [`js/article.js`](../js/article.js) derives the slug from the path segment (`/articles/{slug}/`) so no query string is required.

## Adding a new article
1. Write the body fragment under [`/articles/`](../articles/) (e.g. `/articles/my-new-article.html`).
2. Add the full metadata object to [`data/resources.json`](../data/resources.json).
3. Run `node tools/generate-article-pages.js` to refresh `/articles/{slug}/index.html` for every slug.
4. Run `node tools/update-sitemap.js` so [`sitemap.xml`](../sitemap.xml) contains the pretty URL.
5. Commit the JSON change, body fragment, regenerated index pages, and sitemap update together.

## Sitemap and robots
- [`tools/update-sitemap.js`](../tools/update-sitemap.js) now outputs `<loc>https://monetize-parking.com/articles/{slug}/</loc>` with `<lastmod>` sourced from `lastmod` (fallback `date`).
- [`robots.txt`](../robots.txt) already advertises the sitemap and requires no changes for this migration.

## Redirects and canonicals
- [`article.html`](../article.html) remains online to catch `?slug=` links, immediately setting the canonical to `/articles/{slug}/` and redirecting visitors.
- Legacy landing pages (for example [`ai-vs-gates/index.html`](../ai-vs-gates/index.html)) issue a refresh redirect and canonical to the matching pretty article URL.
- If an article needs a bespoke canonical, set `canonicalOverride` in the JSON; the runtime will apply it across `<link rel="canonical">`, Open Graph, Twitter, and JSON-LD tags.

## Image path rules
- Hero images, thumbnails, inline images, and social previews must live under `/images/`.
- [`js/article.js`](../js/article.js) normalises JSON image values to `/images/...` and converts them to absolute URLs for Open Graph, Twitter, and JSON-LD tags.
