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

**The counts are 152 noindex and 151 gtag, and both include
`templates/article-index.html`.** There are 151 rendered pages; the template is
the 152nd file carrying the blocks. `404.html` is the one guarded file with no
gtag gate. A checker that enumerates rendered pages only reports 151/150 and
looks like a regression. The expected totals are asserted in the script, not
merely reported, so an enumeration bug fails loudly.

> **These numbers have now moved twice, and both moves were file additions.**
> Do not read the current values as permanent; read the rule under them.
>
> - **2026-08-12: 150/149 to 151/150.** `services/solar-lighting/index.html`
>   added. This file had stated 150/149 as a fixed fact, which was true only
>   because every pass up to then edited existing files.
> - **2026-08-13: 151/150 to 152/151.** `services/ev-charging/index.html`
>   added, built from the solar page as a structural donor so both guard blocks
>   are byte-identical to it by construction.
>
> **A file addition is the only situation in which raising these numbers is
> correct.** If they move for any other reason, a guard block has been disturbed
> and the right response is to find out why, not to recapture. Follow the gated
> recapture below every time, including the diff assertion: it is what makes a
> recapture safe rather than merely convenient.

### Recapturing the baseline after adding a page

`node tools/guards.js capture` rewrites the whole baseline, so on its own it
would happily absorb an unrelated drift in some other file. The recapture must
therefore be gated, not just run:

1. `verify` first, to prove the tree is clean before anything changes.
2. Copy the guard blocks into the new page from an existing page rather than
   authoring them, so they are byte-identical by construction.
3. Update `EXPECT_NOINDEX` and `EXPECT_GTAG`.
4. `capture`.
5. **Diff the new baseline against the old and require exactly one added entry,
   zero removed, and zero changed hashes among the pre-existing files.** This is
   the check that makes the recapture safe; without it the baseline is being
   taken on trust.
6. Commit the page, the constants and the baseline together, with the reason.

That sequence was followed for the solar page (150 pre-existing hashes compared,
all identical, one entry added) and again for the EV charging page (151
compared, all identical, one added). In both cases the new page's guard hashes
were additionally asserted equal to the donor page's, which is the check that
proves the blocks were copied rather than authored.

## Conversion integrity check

`tools/conversion-guard.js` is a **separate** checker for the `/consultation/`
ad landing path. It is separate from `guards.js` on purpose, and the two must
not be merged.

```bash
node tools/conversion-guard.js capture
```

```bash
node tools/conversion-guard.js verify
```

`guards.js` protects blocks that are **deleted on merge day**; a failure there
means a revert will conflict. This one protects blocks that must **survive
forever**; a failure means Google Ads has stopped counting conversions on the
only paid landing page on the site. Merging them would mix those two meanings
and would move the 152 / 151 / 303 totals quoted throughout this file.

Four hashed blocks: the Google Ads conversion snippet and the
`ppc_callback_conversion` handler on `consultation/thank-you/`, and the Calendly
`postMessage` listener and `ppc_phone_click` handler on `consultation/`. Plus 11
substring assertions covering the Ads tag, the conversion label, value and
currency, the Calendly booking path and `hide_gdpr_banner`.

Two deliberate exemptions, both of which exist so the guard does not block
intended work:

1. **The Calendly embed `<div>` is not hashed.** Its `data-url` carries
   `background_color` and `primary_color`, hand-matched to the CSS behind the
   iframe, so a redesign has to change them or a visible rectangle appears
   around the widget. The booking path and `hide_gdpr_banner` are asserted
   individually instead, leaving the colour parameters free.
2. **The Formspree form is asserted conditionally.** The rebrand replaces it
   with Calendly plus a phone number, so "a form exists" is not an invariant.
   IF a Formspree form is present it must use the landing page's own endpoint
   (`mqegwawp`, not the shared `xdkwwvdz`) and carry both `_gotcha` and
   `_replyto`. When the form goes, the conditional set skips and says so.

The baseline is `tools/conversion-guard.baseline.json`, captured from `f2b1b14`
before the `/consultation/` rebrand began, and committed. The checker was
validated against eight tamper tests: six that must fail (conversion label,
booking path, honeypot removal, GDPR flag, a whitespace-only edit inside a
hashed block, conversion value) and two that must still pass (retuning the embed
colour parameters, removing the form entirely). A guard that has never been
shown to fail proves nothing.

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

## Measuring rendered CSS in a browser

`python3 -m http.server` sends no `Cache-Control`, so the browser serves a
stale stylesheet after any edit and a measurement taken against it is wrong
while looking completely normal.

**Do not verify by re-injecting stylesheets into the live document.** Removing
the `<link>` elements and appending cache-busted copies has produced wrong
readings **three times in this project, in both directions**, and every failure
was silent:

1. A footer CTA on `/about/` read `#0000EE`, the browser default link colour,
   while two matching author rules declared valid colours. On a clean load it
   was `#C4D0E2`.
2. A secondary CTA on `/calculator/` read a `#cbd5f5` border mid-swap. The
   settled value was `#e6e8ee`.
3. A whole-page blue audit reported 62 elements at the UA default that were not.

The failure mode is reading during the window where the old sheet has been
detached and the new one has not applied. It does not throw, it does not warn,
and the numbers look plausible.

**The standard:**

1. Write a temporary copy of the target page with cache-busted subresource
   URLs, inside the target directory so any path-derived logic still matches:
   `cp page.html __verify.html` with `/styles.css` rewritten to
   `/styles.css?v=<timestamp>`.
2. Load that copy as a real document and measure there.
3. Delete it, and run `node tools/guards.js verify` to prove it is gone. The
   copy carries the guard blocks, so a forgotten one inflates the counts and
   fails loudly. That is the point.

**Assert control elements alongside whatever changed.** The method is not what
makes a measurement trustworthy; unrelated values proving they did not move is.
Pick several elements the change must not affect, read them in the same pass,
and state them in the commit. Every real defect found in this project was
confirmed by a control disagreeing with an expectation, and every false reading
was caught the same way.

Contrast figures reported in commits must be computed from **rendered** colours
read out of `getComputedStyle`, never from the values in the stylesheet.

Two known quirks of the in-app browser pane, neither of them page bugs:
`document.hidden` is `true`, so `IntersectionObserver` never fires and
fragment auto-scroll does not happen; and screenshots come back blank at scroll
positions above 0, so measure tall pages with a tall viewport instead.

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

**This is a THREE-stage pipeline, not two.** Template, then generator, then
runtime. The middle stage is easy to miss because its output is committed and
looks hand-written.

`tools/generate-article-pages.js` performs **17 build-time substitutions** on
the template per article: canonical, a `<link rel="preload" as="image">` for
the hero injected before `</head>`, `<title>`, meta description, `og:title`,
`og:description`, `og:url`, `og:image`, `twitter:title`, `twitter:description`,
`twitter:image`, hero `src` and `alt`, the `.eyebrow` category, the hero `h1`,
the breadcrumb title, and `data-article-slug`.

> **Corrected 2026-08-11: the count is 17, not 14.** This file said 14 when the
> section was first written, from a miscount of the `.replace()` chain rather
> than from a change in the code. Nothing in the generator changed. The number
> is recorded here rather than quietly edited, because 14 is in the commit
> history at `3fdbb24` and would otherwise look authoritative later. Recount
> with the command below, which scopes the count to the template chain. A bare
> `grep -c '\.replace('` over the whole file returns 23, because `escapeHtml`
> uses five and `normaliseImage` one.
>
> ```bash
> sed -n '/let html = template/,/fs.writeFileSync/p' tools/generate-article-pages.js | grep -c '\.replace('
> ```

### Three hard constraints on the article template

These are architectural, not rebrand details. Anyone restructuring
`templates/article-index.html` will hit them, and two of the three fail
silently or catastrophically.

**1. `.article-hero` MUST stay inside `#article`.**
`js/article.js:114` finds the hero with `container.querySelector('.article-hero')`
where `container` is `#article`, then writes to `hero.style` at line 125 with no
null check. Move the hero outside `#article` and the lookup returns `null`, line
125 throws `TypeError: Cannot read properties of null (reading 'style')`, and
`init()`'s `try/catch` converts that into `renderNotFound()`. **Every article
page renders "We couldn't load this article right now."** The hero may be a
full-width band; it just has to be a descendant. `#article` is currently the
outer wrapper for exactly this reason.

**2. Nothing may be placed inside `#article-meta`.**
`js/article.js:133` does `metaEl.textContent = buildMetaLine(article)`, which
destroys every child of that element on every render. Icons or markup put
inside it disappear. A **sibling** outside the element survives, which is how
the clock icon in the meta row works.

**3. `background-image: none !important` on `.article-hero` is load-bearing.**
`js/article.js:125` writes `hero.style.backgroundImage` unconditionally. That is
an inline style, so a normal declaration cannot beat it and the article
photograph paints as a full-bleed backdrop behind the navy hero. The
`!important` in `css/article.css` and in the inline payload suppresses it. **Do
not remove it as a stray `!important` during a cleanup.** The redesign uses the
image as a contained panel instead, and the only alternatives are editing
`js/article.js`, which carries both guards, or shipping the defect.

All three exist because `js/article.js` is deliberately not edited. See the
rebrand guardrails.

**The generator's anchors are brittle.** Several match literal strings rather
than structure, so a cosmetic template edit silently stops the substitution and
the generator still exits 0:

- `src="/images/default-guide.webp"`
- `alt="Parking lot revenue guide"`
- `<p class="eyebrow">Resource</p>`
- `<h1 id="article-title">Loading…</h1>` (note the ellipsis character)
- `<li id="breadcrumb-title" aria-current="page">Loading…</li>`
- `<title>Loading article… | Monetize Parking</title>`
- `data-article-slug=""`

Change the alt text, the eyebrow word, the placeholder copy, or the ellipsis
character and that field goes unpopulated on all 72 generated pages with no
error. **Any template change must satisfy the generator, the runtime, and the
CSS.** After editing the template, rebuild and diff a generated page to confirm
every field still populated, rather than trusting the exit code.

`<p class="eyebrow">Resource</p>` is the anchor most likely to be lost, because
it is a whole element rather than an attribute and a redesign may not want a
category kicker. It survives in the current design as the category tag on the
hero image panel. If a future design genuinely has no place for it, change the
generator in the same commit rather than deleting the element.

**Substitutions 12 and 13 are first-match.** `String.replace` with a non-global
regex replaces the first occurrence only, so `src="/images/default-guide.webp"`
and `alt="Parking lot revenue guide"` must belong to the hero image and the hero
image must stay the first `<img>` in the document. Adding any image above it in
the markup silently redirects both substitutions to the wrong element.

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

**There is no inline CTA on any article page.** This file previously said one is
inserted before the third sub-heading. Corrected 2026-08-11.

`insertInlineCta()` at `js/article.js:169` still builds that markup, but nothing
calls it. `enhanceBody()` at line 158 sets lazy loading and backfills `alt`, and
carries the comment "Mid-article CTA removed - only bottom CTA should appear".
`INLINE_CTA_COPY`, the `inline` key in `CTA_EVENTS`, and the `.cta-inline` rules
at `css/style.css:50-76` are all reachable only through that dead function.
`setRobots()` at line 505 is dead the same way; the robots meta is set inline at
line 149 and in `renderNotFound()`.

Removing any of it means editing the file that carries both rebrand guards, so
it is deferred. See the post-Vegas backlog in `REBRAND.md`.

Bottom CTAs always render two buttons: primary consultation, secondary
calculator.

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
loads everywhere `css/article.css` does. Corrected 2026-08-07 during the Inter
activation pass. Do not list it as a deletion candidate and do not delete it
without first removing that import and confirming nothing regresses. Note the
`@import` also means it is fetched as a second, serialized request after
`article.css` parses.

**The reach is 104 files, not 103, and the resources hub is not one of them.**
Corrected 2026-08-11. `grep -rl "css/article.css" --include="*.html" .`:

| Count | What |
|---|---|
| 73 | `articles/{slug}/index.html` |
| 30 | `resources/videos/{slug}/index.html` |
| 1 | `templates/article-index.html` |

`resources/index.html` does **not** load `css/article.css` and never did.

**The 30 video pages share more than the stylesheet.** They also carry
`<body class="article-page">` and use `.article`, `.article-summary`,
`.article-footer`, `.cta-actions`, `.breadcrumb` and `.back-link`. So neither
the body class nor any of those class names can be used to target article
pages, and restyling any of them bare silently restyles the video library.

**Article pages carry a second body class, `article-read`, and that is the
scoping hook.** Everything in the article reading design is scoped under it.
The rules above that block in `css/article.css` belong to the video pages and
must stay byte-identical. Classes that are genuinely article-only, and safe to
restyle freely, are `.article-hero`, `#article`, `#hero-image`,
`#related-list`, `.aside-heading` and the `.related-*` family.

The article template deliberately does **not** use `class="article"`,
`class="article-summary"`, `class="article-footer"` or `class="cta-actions"`,
so the legacy rules never match rather than being fought with overrides. One
consequence worth knowing: `renderNotFound()` writes a bare `h1` and two
paragraphs into `#article`, which used to inherit a measure from `.article`.
`css/article.css` styles `#article > h1` and `#article > p` to cover that, and
those selectors match only in the not-found state.

Additionally, 119 of 150 pages carry inline `<style>` blocks in 15 distinct
payloads, holding roughly half the site's CSS. `consultation/index.html` alone
carries 18.3 KB inline. Any CSS change that only edits the four authoritative
files will miss about half the styling.

**The 4,757-byte chrome block is the most widely shared payload on the site.**
It is a prefix of the inline `<style>` on **114 files**: 73 article pages, 28
state subpages, the map page, the 4 state hubs, 7 top-level pages, and
`templates/article-index.html`. Its hash is `00f299a9`.

Every pass that touches a payload must keep it byte-identical, and must assert
that rather than assume it. Diverging it would split an 114-file group
permanently and leave a future chrome sweep with no single anchor. Both the
article port and the state pass carry a gate for exactly this.

```bash
node -e "const fs=require('fs'),c=require('crypto');const s=fs.readFileSync(process.argv[1],'utf8');const m=s.match(/<style[^>]*>([\s\S]*?)<\/style>/);console.log(c.createHash('sha1').update(m[1].slice(0,4757)).digest('hex').slice(0,8))" <file>
```

### Two shared-CSS landmines

**`css/state-map.css` redefines three `styles.css` aliases in its own
`:root`:** `--ink`, `--muted` and `--border`. It loads after `styles.css`, so
it wins on the 29 pages that load it. The values resolve identically today
(`var(--text-1)`, `var(--text-3)`, `var(--border-1)`) and the file says so in a
comment, so nothing is visibly wrong. **It breaks silently if either side
moves**: retarget the alias in `styles.css` and the state pages keep the old
value, or edit the state-map copy and only those pages change. Change both or
neither.

**`.back-link` is defined in two files and is not private to either.**
`css/article.css:200` and `css/state-map.css:22` both style it, and it is used
by 63 pages: the map page, the 4 state hubs, the 28 state subpages, and all 30
video pages. Article pages no longer use it; the redesign dropped it as a
duplicate of the first breadcrumb crumb. Do not treat either definition as
file-private, and do not delete either without checking all 63.

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
2. **The consultation pages are no longer an exception.** They were rebuilt on
   `styles.css` and the band system on 2026-08-14 and now use the self-hosted
   Inter like every other page. **No page on the site references
   `fonts.googleapis.com` or `fonts.gstatic.com`.** If either string appears,
   something has regressed.

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
├── consultation/index.html     # Ad landing page. Conversion plumbing is
│                               # hash-guarded by tools/conversion-guard.js;
│                               # run it before and after any edit here
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
