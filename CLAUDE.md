# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Session start

1. Run `git branch --show-current` and report the result. If it is not
   `rebrand`, STOP and tell me before doing anything else. Do not work on
   `main` under any circumstances.
2. Read `REBRAND.md` in the repo root. It holds current rebrand decisions and
   pass status and changes frequently. This file holds only durable rules.

## Project Overview

Static marketing website for Monetize Parking, a parking lot revenue
optimization service. Vanilla HTML/CSS/JavaScript with a dynamic article system.

**Domain**: https://monetize-parking.com

**Deployment**: Cloudflare Pages, connected to this GitHub repo.
- `main` branch deploys to production
- `rebrand` branch deploys to a Cloudflare preview URL

The site was previously on GitHub Pages. It is not anymore. `_headers` and
`_redirects` are Cloudflare Pages formats and are live. There is no CNAME file.

## Build

```bash
npm install          # required once; node_modules is not committed

npm run build        # thumbnails -> articles -> sitemap, in that order
```

Individual scripts:
- `npm run generate:thumbnails` - 400px WebP thumbnails (quality 80) from
  `/images/` into `/images/thumbs/`, skipping logos, icons, favicons, and
  `default-guide*`. Uses sharp.
- `npm run generate:articles` - copies `templates/article-index.html` to
  `/articles/{slug}/index.html` for every entry in `data/resources.json`
- `npm run generate:sitemap` - regenerates `sitemap.xml` from article data

`tools/build.js`, `tools/compress-images.js`, and `tools/seo-audit.js` exist but
are not wired to any npm script. Do not run them without asking.

### The sitemap side effect of `npm run build`

`npm run build` runs `generate:sitemap`, so **every build rewrites
`sitemap.xml` whether or not any article content changed.** Two separate
mechanisms, worth knowing apart because only one is content-driven:

1. **8 static routes** (`/`, `/about/`, `/ask-the-experts.html`, `/calculator/`,
   `/contact/`, `/faq/`, `/resources/`, `/services/`) get `lastmod` set to
   **today, unconditionally**, from `new Date()` at
   `tools/update-sitemap.js:141`. These change on every single run.
2. **State and video pages** derive `lastmod` from the **file mtime**
   (`getFileModifiedDate`, `tools/update-sitemap.js:41`). Any sweep that
   rewrites those files, even a one-line `<head>` insertion, moves their
   `lastmod` to the sweep date.
3. **Article entries are safe.** They take `lastmod` from the `date` or
   `lastmod` field in `data/resources.json`, so they only move when the content
   record moves.

A measured example: the Inter activation pass (`38e017b`) touched 40 static and
state pages and changed **71 of the 139** `lastmod` values, 8 unconditionally
and 63 from mtime. The other 68 stayed put.

**Rule during the rebrand:** after any rebuild, revert `sitemap.xml` unless
article content actually changed.

```bash
git checkout -- sitemap.xml
```

The rebrand rewrites the `<head>` of nearly every page without changing what a
reader sees. Letting that propagate into `lastmod` tells search engines the
whole site changed on one day, which invites a full recrawl and devalues the
signal on the pages that genuinely did change. `sitemap.xml` is on the
do-not-touch list for exactly this reason; the freeze means "not as an
incidental side effect of a rebuild," not that the file can never be updated
when article content warrants it.

**Generated output is committed to the repo.** After any change to
`templates/article-index.html`, run `npm run build` and commit the regenerated
pages in the same commit.

## Guard integrity check

`tools/guards.js` hashes the two rebrand guardrails on every page and compares
them against a committed baseline. Both are reverted on merge day, so any sweep
that disturbs them turns a clean revert into a conflict.

```bash
node tools/guards.js capture
```

```bash
node tools/guards.js verify
```

Run `capture` **before the first edit of a pass**, and `verify` after every
sweep commit. Both print the number of files scanned and the number of blocks
found; `verify` prints the number of hashes compared and exits non-zero listing
every difference on any mismatch.

The baseline lives at `tools/guards.baseline.json` and is committed. Both the
script and the baseline used to be session-local scratchpad files and were lost
when a container was recycled, which left no way to tell an already-edited tree
from a clean one. Recapture only when a guard block changes for a real, stated
reason, in the same commit as that change.

**The counts are 150 noindex and 149 gtag, and both include
`templates/article-index.html`.** There are only 149 rendered pages; the
template is the 150th file carrying the blocks. `404.html` is the one guarded
file with no gtag gate. A checker that enumerates rendered pages only reports
149/148 and looks like a regression. The expected totals are asserted in the
script, not merely reported, so an enumeration bug fails loudly.

## Rebrand sweep and gate scripts

`tools/rebrand/` holds the per-pass sweep and verification scripts, with their
fixtures in `tools/rebrand/fixtures/`. They are committed for the same reason
the guard baseline is: a scratchpad copy is lost when the container is
recycled, and re-deriving one from an already-edited tree is not the same
thing.

Every sweep script follows the same shape and any new one should too:

- **Anchor on a regex, never on leading whitespace.** Eight pages indent
  `<header class="site-header">` with four spaces and the other 139 with two;
  an edit anchored on the literal two-space form silently skips the homepage.
- **Hash-verify each matched block before replacing it**, so a block that has
  drifted fails instead of being rewritten.
- **Assert exact expected counts and abort before writing anything** if any
  count is off.
- **Dry run by default**, apply only with `--write`.

The headline verification is the **deliberate-diff gate**: it reverses the
pass's intended substitutions on every touched file and requires the result to
equal the file at `HEAD` byte for byte. Anything that moved outside the
intended edit fails it. Write a new one per pass against that pass's actual
surface. Do not reuse a gate from an earlier pass: the 2a fallback checker was
reused after the surface moved under it and silently went from covering 15
declarations to 15 of 106, still reporting PASS. Every gate must print the
count it checked, so a gate that inspected nothing cannot be mistaken for one
that passed.

## Local Testing

```bash
python3 -m http.server 8000
```

Do not open HTML files directly via `file://`. Root-relative paths break.

## Architecture

### Dynamic Article System

Content is driven by JSON rather than individual static HTML files.

**Key files**:
- `/data/resources.json` - single source of truth for article metadata, SEO,
  and content paths
- `/templates/article-index.html` - shared template for ALL article pages
- `/articles/{slug}.html` - HTML body fragments (content only, no wrapper)
- `/js/article.js` - runtime that loads article data and renders the template
- `/tools/generate-article-pages.js` - generates `/articles/{slug}/index.html`

**How it works**: the generate script copies the template to each article
directory. At runtime `js/article.js` extracts the slug from the URL, fetches
`data/resources.json`, finds the matching article, loads the body HTML from the
`content` path, and renders it. SEO tags (title, meta description, canonical,
Open Graph, Twitter, JSON-LD) are generated client-side from the JSON.

**Rebrand implication**: all article page chrome lives in ONE template. A header
or footer change is a single file edit plus a rebuild, not 147 edits.

**Generator coverage**: `npm run generate:articles` writes 72 pages, not 73.
`articles/parking-today-small-lots/index.html` is hand-written and is skipped by
the generator because its `resources.json` entry is `"type": "external"` (a
syndicated link with no body fragment). Any bulk operation across
`articles/*/index.html` must account for this file separately. Do not assume
every article directory is generated.

**Known issue**, pre-existing and unrelated to the rebrand:
`articles/parking-today-small-lots/index.html` has no `content` field in its
`resources.json` entry, so `loadArticleBody(undefined)` fetches a 404 and
`renderNotFound()` replaces the page content with "We couldn't find that
resource." This is established by code reading, not by observing the rendered
page. Needs separate investigation. Do not fix during the rebrand.

**Adding a new article**:
1. Create the body fragment at `/articles/my-new-article.html`
2. Add a complete entry to `data/resources.json`
3. Run `npm run generate:articles`
4. Run `npm run generate:sitemap`
5. Commit the JSON, fragment, generated index page, and sitemap together

### Hiding Articles

To hide an article from listings while keeping it reachable, set
`"hidden": true` in its `data/resources.json` entry. The article stays
accessible by direct URL but does not appear in the resources grid or in
related articles. Several articles currently use this flag. Do not clear it on
an existing entry without asking.

### State Resources

- `/data/state-resources.json` - metadata for Colorado, Minnesota, Texas,
  Wisconsin
- `/resources/states/{state}/` - state landing pages
- `/js/state-map.js` - interactive map on `/resources/`

### Related Articles

Ranked by shared tags (highest weight), then matching category, then recency.
Articles never recommend themselves. Up to 5 shown. Implemented in
`/js/related.js`.

### Article Series Navigation

Series config is duplicated in two places and must stay in sync:
- `/js/article.js` - `SERIES_CONFIG` object
- `/js/resources.js` - `SERIES_CONFIG` array

### Image Path Rules

All image references must start with `/images/`. Applies to hero images
(`image`), thumbnails (`thumbnail`), inline body images, and social card images.
The runtime converts relative paths to absolute URLs for social meta tags.

Convert JPGs to WebP locally, quality ~85, under 200KB. Never commit raw JPGs.
Always include `width`, `height`, and `alt`. Use `loading="lazy"` below the fold.

### URL Structure

- Homepage `/`
- Articles `/articles/{slug}/`
- State pages `/resources/states/{state}/`
- Other `/services/`, `/about/`, `/faq/`, `/calculator/`, `/contact/`,
  `/consultation/`

All pretty URLs. Each article directory needs an `index.html` for routing.

### Canonical URLs

By default canonical URLs follow `https://monetize-parking.com/articles/{slug}/`.

To override, set `canonicalOverride` in the article's `data/resources.json`
entry. The override propagates to all four places:
- `<link rel="canonical">`
- Open Graph `og:url`
- Twitter card metadata
- JSON-LD schema

It is read by `js/article.js` at runtime and by `tools/update-sitemap.js` when
building `sitemap.xml`, so a change affects both the page and the sitemap.

### Analytics

GA4 `G-LGHS0L5WE8` and Google Ads `AW-18066534348`, loaded via gtag. Tags are
duplicated per page with no shared include. 149 of 150 full pages carry their
own copy in `<head>`; `404.html` has none.

The Google Ads tag exists in only three places, all on the consultation path:
`consultation/index.html` (config), and `consultation/thank-you/index.html`
(config plus the conversion event, `send_to`
`AW-18066534348/dpBlCNapw5YcEMzf5aZD`, value 1.0 USD).

Events: `page_view` (automatic), `generate_lead` (contact form and consultation
CTAs), `calculator_start`, `state_map_click`.

Event calls: 111 inline `gtag('event', ...)` sites across the HTML pages, only 4
of which have a `typeof gtag` guard. Three fire on page load rather than from a
click handler: `consultation/thank-you/index.html`,
`contact/thank-you/index.html`, `calculator/report/index.html`. External JS
event calls live in `script.js`, `js/article.js`, and `js/state-map.js`, all
guarded. `js/resources.js` has no analytics code.

During the rebrand these tags are hostname-gated. See `REBRAND.md` for the
mechanism and the merge-day revert requirement.

### Inline CTAs

Article inline CTAs are inserted before the third sub-heading (h2 or h3) by
`js/article.js`. Markup and copy are in the `INLINE_CTA_COPY` constant. Bottom
CTAs always render two buttons: primary consultation, secondary calculator.

### Structured Data

Organization and VideoObject schema on `index.html`. Article and BreadcrumbList
generated per-article in `js/article.js`.

FAQPage schema can be added to pages with Q&A content. See `SEO_TODO.md`.

### Headers and Redirects

`_headers` sets security headers, a Content Security Policy, and cache control.
`_redirects` holds 301s from legacy URLs.

**CSP constraint**: `_headers` defines a Content Security Policy, but it is
scoped to `/*.html` and is NOT enforced on any rendered page. Cloudflare Pages
308-redirects `.html` paths to pretty URLs and attaches the CSP only to the
redirect response. Verified live: `/`, `/consultation/`, and every pretty URL
return 200 with no CSP header.

Consequence: external resources currently load freely. Two pages already load
Google Fonts from `fonts.googleapis.com` and `fonts.gstatic.com` despite
`style-src 'self' 'unsafe-inline'`. Do not assume the CSP protects anything, and
do not assume a new external resource is safe merely because it works. If the
CSP is ever correctly scoped to `/*`, anything added in the meantime may break.
Fixing this is a post-Vegas task requiring its own testing cycle.

Never edit `_redirects` without asking. Existing 301s protect SEO equity.

### Stylesheets

Authoritative stylesheets are `styles.css`, `css/article.css`,
`css/resources.css`, and `css/state-map.css`.

**`css/style.css` is NOT an orphan.** This file previously documented it as one.
It is pulled in by `@import url('/css/style.css')` at `css/article.css:1`, so it
loads on the 103 pages that load `css/article.css`, which is every article page
plus the resources hub. Corrected 2026-08-07 during the Inter activation pass.
Do not list it as a deletion candidate and do not delete it without first
removing that import and confirming nothing regresses. Note the `@import` also
means it is fetched as a second, serialized request after `article.css` parses.

Additionally, 119 of 150 pages carry inline `<style>` blocks in 15 distinct
payloads, holding roughly half the site's CSS. `consultation/index.html` alone
carries 18.3 KB inline. Any CSS change that only edits the four authoritative
files will miss about half the styling.

The two consultation pages do not load `styles.css` at all. They are fully
self-contained with their own `:root`, their own font variables, the only Google
Fonts links on the site, the only Calendly embed, and header and footer markup
that diverges from the other 148 pages.

### Typography

**Inter is self-hosted and active as of 2026-08-07.** Two `@font-face` rules at
the top of `styles.css` load the Inter variable font (latin subset, roman and
italic, `wght 100 900`, `font-display: swap`) from `assets/fonts/`. Because 147
of 149 rendered pages load `styles.css`, this reaches the site without per-page
font declarations. See `assets/fonts/README.md` for source and license.

What this replaced: `styles.css` previously carried an `@font-face` for Inter
whose `src` was `local('Inter'), local('Inter-Regular')` only. It named no file,
so it resolved only for visitors with Inter installed on the OS and was a no-op
for everyone else. Every page declared Inter and almost none received it. Do not
reintroduce a `local()`-only `src`.

Two things that must stay true:

1. **Inter must be first in every font stack.** `--font-sans` in
   `css/article.css` previously listed Inter sixth, behind `ui-sans-serif` and
   `system-ui`, so article body copy rendered in the system font even with the
   webfont loaded. That token is duplicated into the inline `:root` of all 73
   article pages, and the inline copy wins at first paint, so a fix in
   `css/article.css` alone changes nothing on those pages. Both must move
   together.
2. **The consultation pages are exempt.** They are frozen, do not load
   `styles.css`, and still load Inter from Google Fonts. They are the only pages
   permitted to reference `fonts.googleapis.com` or `fonts.gstatic.com`. They
   switch to the self-hosted files during their own deferred pass.

The roman file is preloaded on the 113 pages that load `styles.css` through the
async preload-onload pattern, where the `@font-face` is not discovered until
after first paint. The 34 pages that load `styles.css` synchronously get no
preload; the rule is discovered during the initial CSS parse there.

`css/article.min.css` and `css/critical/critical-article.css` still carry the
old Inter-sixth `--font-sans`. They are unloaded and out of scope per the
minified-CSS rule.

## File Organization

Stylesheets and scripts are the files most likely to be touched during the
rebrand, so they are listed in full.

```
/
├── index.html                  # Homepage
├── 404.html
├── ask-the-experts.html
├── styles.css                  # MAIN GLOBAL STYLESHEET, loaded site-wide; holds the Inter @font-face
├── assets/
│   ├── brand/                  # Logo and mark PNGs
│   └── fonts/                  # Self-hosted Inter variable woff2; see its README.md
├── script.js                   # Global JS (navigation, analytics)
├── robots.txt                  # Search engine directives
├── sitemap.xml                 # Generated from data/resources.json
├── _headers                    # Cloudflare security headers, CSP, caching
├── _redirects                  # Cloudflare 301s from legacy URLs
├── postcss.config.js           # See "Minified and critical CSS"
├── package.json
├── css/
│   ├── article.css             # Article page styles
│   ├── resources.css           # Resources listing page styles
│   ├── state-map.css           # Interactive state map styles
│   ├── style.css              # Loaded via @import at css/article.css:1. NOT an orphan
│   ├── article.min.css         # See "Minified and critical CSS"
│   ├── resources.min.css       # See "Minified and critical CSS"
│   ├── state-map.min.css       # See "Minified and critical CSS"
│   └── critical/               # See "Minified and critical CSS"
│       ├── critical-base.css
│       ├── critical-article.css
│       ├── critical-resources.css
│       └── critical-state.css
├── js/
│   ├── article.js              # Article runtime: loads data, renders template
│   ├── related.js              # Related-articles ranking implementation
│   ├── resources.js            # Resources listing page logic
│   ├── state-map.js            # Interactive state map
│   └── *.min.js                # See "Minified and critical CSS"
├── data/
│   ├── resources.json          # Article metadata, single source of truth
│   └── state-resources.json    # State landing page data
├── templates/
│   └── article-index.html      # Shared template for ALL article pages
├── articles/
│   ├── {slug}.html             # Body fragments, edit these
│   └── {slug}/index.html       # Generated, do not edit
├── images/                     # WebP preferred; thumbs/ is generated
├── tools/
│   ├── generate-article-pages.js
│   ├── update-sitemap.js
│   ├── generate-thumbnails.js
│   ├── build.js                # Not wired to npm, ask before running
│   ├── compress-images.js      # Not wired to npm, ask before running
│   └── seo-audit.js            # Not wired to npm, ask before running
├── services/index.html
├── about/index.html
├── faq/index.html
├── calculator/index.html
├── contact/index.html
├── consultation/index.html     # Active ad conversion tracking, do not touch
├── resources/                  # Resource hub and state pages
├── docs/
│   ├── articles-dynamic.md
│   └── url-migration.md
└── SEO_TODO.md
```

## Minified and critical CSS (do not touch)

`css/` and `js/` contain parallel `.min.css` and `.min.js` files. `css/critical/`
contains four critical-CSS files. `postcss.config.js` exists at the repo root.

No npm script builds any of them.

`index.html` and `templates/article-index.html` load the unminified originals
(`/styles.css`, `/css/article.css`, `/script.js`, `/js/article.js`), so the
minified copies appear stale and unused.

The authoritative files to edit are the unminified originals. Do not edit,
regenerate, or delete the minified or critical files without asking, and do not
assume they are in sync with the originals.

`js/article.min.js` contains an ungated reference to `G-LGHS0L5WE8`. The
unminified `js/article.js` was hostname-gated; the minified copy was not and has
drifted further out of sync. Nothing loads it. Do not gate or edit it.

## Branch and deployment rules

- Never commit directly to `main`. `main` is protected and deploys to production.
- All rebrand work happens on `rebrand`.
- Analytics and ad tags must stay gated to hostname `monetize-parking.com` only
  while the rebrand branch is active.
- A `noindex` meta tag must apply on any non-production hostname.
- Do not remove either guardrail without me asking.

## Do not touch without explicit instruction

- `/consultation/` structure, form position, CTA copy, or the Calendly embed.
  This page carries active ad conversion tracking.
- The GA4 or Google Ads tags themselves. Gating when they load is fine when
  asked. Altering or removing them is not.
- Formspree endpoints.
- `_redirects`.
- Any `/articles/{slug}/index.html` file directly. These are generated. Edit
  the template or the body fragment instead.
- Minified and critical CSS/JS files. See the section above.

## Working method

- Always run a read-only discovery pass before modifying files. Report findings
  and wait for confirmation.
- Treat any "Do NOT Change" section in a prompt as absolute.
- Bundle related fixes touching the same file into a single change.
- End every task with a verification step using grep where possible, and report
  results.
- Give a prioritized list of what changed, not a narrative walkthrough.
- If something is ambiguous, ask rather than assume.

## Brand and color

Color values are IN FLUX during the rebrand. Do not treat any hex value found in
this repo, in git history, or in your own assumptions as authoritative.

Source of truth for color, in order:
1. CSS custom properties in the tokens file, once it exists
2. `REBRAND.md`, for decisions not yet implemented
3. Me. Ask.

Never hardcode a hex value. Always reference a token. If a token you need does
not exist, stop and ask rather than inventing one.

## Content and copy rules

Applies to all site copy, meta descriptions, and any text you generate:

- No first-person language ("we", "our", "I")
- No em dashes, in site copy or in your responses to me
- No superlatives ("best", "leading", "premier", "unmatched")
- No fabricated statistics. Only verified case study figures (Eau Claire,
  Stillwater). If you need a number you do not have, ask.
- Vendor-neutral tone. The company is technology-agnostic.

## Documentation

- `/docs/articles-dynamic.md` - article system guide
- `/docs/url-migration.md` - URL structure and routing notes
- `SEO_TODO.md` - pending SEO tasks
- `REBRAND.md` - live rebrand decisions and pass status
