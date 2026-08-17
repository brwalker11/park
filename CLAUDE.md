# CLAUDE.md

Guidance for Claude Code when working in this repository.

**This file is about 1,500 lines. Do not read it front to back.** It is part rules
and part reference, and the two are used differently: read the rules, then consult
the reference sections that bear on what you are actually doing. Splitting the
reference out into `docs/architecture.md` is item 36 in `BACKLOG.md`.

## Session start

1. Run `git branch --show-current` and report the result. **If it is `main`, STOP
   and tell me before doing anything else.** All work happens on a feature branch;
   see "The working pattern" under Branch and deployment rules.
2. **Read `BACKLOG.md`. It is the only place outstanding work is recorded**:
   deferred tasks, known defects, and decisions nobody has taken. Check it before
   proposing new work, because the thing you are about to suggest may already be on
   it with reasoning attached.
3. **Read the rules in this file.** Six sections, 320 lines together:

   - **Branch and deployment rules**, including the working pattern and the
     permanent hostname gates
   - **Do not touch without explicit instruction**
   - **Working method**
   - **Brand and color**
   - **Content and copy rules**
   - **Minified and critical CSS**

4. **Consult the reference sections as the work requires them, not in advance.**
   Architecture, Build, the two integrity-check sections, Local Testing, Measuring
   rendered CSS, File Organization, the sweep and gate scripts. **Architecture is
   772 lines and nobody needs all of it**; go to the subsection that matches what
   you are touching. If you are about to edit an area, it is worth a grep of this
   file for the relevant class, file or token name first, because most of the
   painful findings in here were expensive to discover and cheap to re-break.

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

`tools/guards.js` hashes the two hostname gates on every page and compares them
against a committed baseline, so any sweep that disturbs them is caught.

**As of 2026-08-17 these are permanent infrastructure, not rebrand guardrails
awaiting a revert.** See "The hostname gates are permanent infrastructure" under
Branch and deployment rules. A failure here is a live defect on the preview, not
a future merge conflict.

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

**Both scripts now protect permanent blocks**, since the hostname gates stopped
being merge-day casualties on 2026-08-17. They stay separate anyway, for two
reasons that outlived the original one: they cover different files and different
block counts, and merging them would move the 155 / 154 / 309 totals quoted
throughout this file. A `conversion-guard.js` failure has the sharper
consequence: Google Ads has stopped counting conversions on the only paid landing
page on the site.

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

**`tools/rebrand/` was deleted on 2026-08-17, at the end of the rebrand.** It held
the per-pass sweep and verification scripts with their fixtures. Every gate script
in it was a point-in-time diff against a specific base commit and none could pass
again: measured before deletion, they failed 9, 3, 3 and 2 gates respectively, and
`gates-commit2.js` said so in its own header. Nothing invoked them and no npm
script referenced them. `git show` retrieves any of them if a future sweep wants a
worked example.

**The house style below is the durable part and is why this section stayed.** It
was learned from those scripts and applies to any sweep across many files, rebrand
or not.

Every sweep script follows this shape and any new one should too:

- **Anchor on a regex, never on leading whitespace.** Eight pages indent
  `<header class="site-header">` with four spaces and the other 139 with two;
  an edit anchored on the literal two-space form silently skips the homepage.
- **Hash-verify each matched block before replacing it**, so a block that has
  drifted fails instead of being rewritten.
- **Assert exact expected counts and abort before writing anything** if any
  count is off.
- **Dry run by default**, apply only with `--write`.

### Strip comments before any substring assertion

**A gate that greps raw file text will match the comment explaining the gate.**
This has now happened five times in this project, always the same way: the
replacement names the bad value in order to record why it is bad, and the
"the bad value is gone" check finds it in its own prose.

- the services split gate matched a comment it had just written
- the calculator payload gate counted hex literals that were commented out
- the About gate matched the phrase "folded out of the old `.cta-inline`"
- the fallback-colour gate matched `#6DB133` inside the comment explaining
  why `#6DB133` was rejected
- the logo gate matched `/images/Logo.png` inside the comment explaining that
  `/images/Logo.png` 404s

Default to stripping comments first:

```js
const decomment = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
```

The same failure has a wider form: **assert against the construct, not the raw
string.** Related misses that comment-stripping alone would not have caught:

- `\brequired\b` matched the visible note "Fields marked * are required"
  inside the form it was counting. Count `<input ... required>` elements.
- `is-active` matched the CSS rule `.res-chip.is-active` in the inline
  payload, not just the one active button. Count `<button ... is-active>`.
- a "no en dashes" gate matched its own examples; a "no first person" gate
  matched the nav label "What We Do".
- `\bsection\b` matched inside `section-head`, and a hyphen is a word
  boundary, so `\b` does not protect a class-name check.

When a gate fails, check whether it is failing on its own prose before
assuming the edit is wrong. Three of the five above cost a debugging cycle
each.

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

Sorted by shared tags, then same service, then same category, then recency.
Articles never recommend themselves. Always filled to five. **The rail is built by
`js/article.js`, not `js/related.js`.** That second file is loaded by zero pages
and is kept only so the two copies do not drift.

**The tag key is not actually ranking anything, and the second key is doing the
work.** `overlapCount` in `js/article.js` is an exact-match count over raw tag
strings, and of the 305 unique tags in `data/resources.json`, **278 appear on
exactly one record**. Ninety-one percent of the vocabulary can never overlap with
anything, so nearly every candidate pair ties at 0 or 1 and whichever key sits
second decides the rail.

That is why `sameService` was inserted above `sameCategory` on 2026-08-17. Until
then `sameCategory` was the deciding signal by accident, and because the nine EV
articles all shared a category value no other record used, it acted as a topical
firewall. Giving them real content types removed the firewall and **36 of 56
parking rails immediately filled with EV articles**; one Parking guide ended up
with five items and no parking content. Ranking on service restored the boundary on
the axis that means topic.

**Treat the service key as a mitigation, not a fix.** The tags are too specific to
overlap: they read as one-off SEO phrases rather than a controlled vocabulary. The
real fix is a tag vocabulary pass, which is in `BACKLOG.md`. Until then, do not
assume changing a record's `category` is cosmetic; it moves rails.

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

#### Asset paths are CASE-SENSITIVE in production and not locally

**macOS is case-insensitive. Cloudflare Pages is not.** A path that loads
perfectly on `python3 -m http.server` can 404 on the live site, and nothing
local will tell you.

This is not hypothetical. `js/article.js` and the homepage `Organization`
block both referenced `/images/Logo.png`. The file is `logo.png`, lowercase.
Locally both returned 200. In production:

```
/images/Logo.png   404
/images/logo.png   200
```

It went undetected long enough to reach the homepage's structured-data logo,
which is the one Google explicitly recommends marking up. Fixed in `97648df`.

**Verify any new or changed asset reference against production, not the dev
server.** `curl -o /dev/null -w '%{http_code}' https://monetize-parking.com/<path>`
is a read-only GET on a public file and is the only check that actually
answers the question. `fs.existsSync()` in a gate has the same blind spot as
the browser: it runs on macOS.

For a whole-tree check, sweep every `src` and `href` pointing at a local asset
and assert the target exists:

```bash
node -e 'const fs=require("fs"),{execSync}=require("child_process");const files=execSync("grep -rl . --include=*.html .").toString().trim().split("\n");const miss=new Set();for(const f of files){const s=fs.readFileSync(f,"utf8");for(const m of s.matchAll(/(?:src|href)="(\/(?:images|assets)\/[^"?]+)"/g)){if(!fs.existsSync("."+m[1]))miss.add(m[1]+"  <- "+f)}}console.log(miss.size);[...miss].forEach(x=>console.log(x))'
```

**Run once on 2026-08-16 and it came back clean: zero missing targets.** That
catches deletions and typos. It does NOT catch a case mismatch, for the same
reason everything else local does not, so it is a complement to the production
check rather than a replacement for it.

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

These tags are hostname-gated, permanently. See "The hostname gates are permanent
infrastructure" under Branch and deployment rules, including the `www` hostname
problem that has to be settled before the merge.

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
it is deferred. See `BACKLOG.md`.

Bottom CTAs always render two buttons: primary consultation, secondary
calculator.

### Structured Data

Organization and VideoObject schema on `index.html`. Article and BreadcrumbList
generated per-article in `js/article.js`.

FAQPage schema can be added to pages with Q&A content. `/services/` has none;
that is item 39 in `BACKLOG.md`, which carries the caution that `faq/index.html`
duplicates every answer between the JSON-LD and the visible accordion.

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

#### Cache lifetimes, and when a version bump is required

Three asset classes in `_headers` behave very differently after a change, and the
difference decides whether a version bump is optional or mandatory.

| Asset | `Cache-Control` | Stale for | Version bump |
|---|---|---|---|
| `/js/*` | `max-age=31536000, immutable` | **up to a year** | **MANDATORY**, by hand on the `<script>` src |
| `/images/*` | `max-age=31536000, immutable` | **up to a year, and longer on social platforms** | **MANDATORY when bytes change at the same filename** |
| `/css/*`, `/styles.css`, `/script.js` | `max-age=86400` | up to a day, and a **broken** render not an old one | **Purge on deploy.** See `BACKLOG.md` item 41 |

**`/js/*` is immutable for a year, so a JS change without a bump never reaches a
returning visitor.** Not "reaches them late", never. Bump the query on the
`<script>` src in `templates/article-index.html` in the same commit as the JS
change, then `npm run generate:articles`. The convention is a short descriptive
slug, not a timestamp: `?v=logo-404`, then `?v=service-crumb`, then
`?v=rail-service`. **A year-long stale window is never acceptable.**

**`/images/*` is also immutable for a year, and this bites whenever an image's
bytes are replaced without its filename changing.** Normally that never happens,
because a new image gets a new name. The exception is the fixed-name assets: the
favicon set, `images/site.webmanifest`, and `images/og-image.png`. **Replacing the
bytes at an unchanged URL does not reach anyone already holding it.**

The og-image is the worst case, because **social platforms cache OG images by
URL** on top of the browser cache. Facebook, LinkedIn, X and Slack will keep
rendering the previous card until each is re-scraped, and the whole purpose of the
asset is to be shared. A silent year of the wrong card is the default outcome.

**The convention is `?v=` on the reference, and it is already in use.** The
favicons, the manifest link and the manifest's own contents carry `?v=2`
permanently; `og:image` and `twitter:image` carry `?v=2` on all 80 pages that use
the default card, 160 references, added 2026-08-17 when the card was rebranded.
Neither is a revert item. **Do not strip either as tidying.**

**Any future og-image change needs the version bumped.** All 80 pages **and** both
substitution regexes in `tools/generate-article-pages.js`, in the same commit,
then `npm run generate:articles`. The regexes match the versioned URL literally,
so if the template moves and they do not, the substitution stops firing and every
article page ships the default card instead of its own hero. That failure is
invisible on the page and surfaces only when someone shares a link.

#### `_headers` in the repo proves nothing about what production serves

**A zone-level Browser Cache TTL of 1 year sat in front of Pages and overrode
`_headers` for every value below a year. Found and fixed 2026-08-17. Read this
before trusting any cache header again.**

**The 24-hour window this file used to describe for `/styles.css` never existed on
production.** The `_headers` rules for `/styles.css` and `/script.js` have said
`max-age=86400` since long before the rebrand, and production served both at
`31536000` the whole time. So the exposure was never a day. It was **a year, for
every stylesheet and for `script.js`**, which is the real reason the merge deploy
rendered broken rather than merely stale: visitors were holding a stylesheet from
the previous design, not from the previous day.

**The fingerprint that gave it away.** The served value was
`public, max-age=31536000` **with no `immutable`**, and that string appears nowhere
in `_headers`. Every rule at a year carries `immutable`; every rule below a year was
being raised and emitted bare. Only sub-year values moved. `/data/*` at 3600
survived because `.json` is not edge-cached (`cf-cache-status: DYNAMIC`), and so did
HTML. **A value that matches no rule in the file is the signal that something
upstream is synthesising it**, not that a stale deployment is being served.

**The diagnosis method: compare `pages.dev` against the custom domain.**

```bash
for h in monetize-parking.com monetize-parking.pages.dev; do
  curl -sSI "https://$h/css/article.css" | grep -i '^cache-control'
done
```

Both hostnames serve the **same Pages deployment**, but they sit in **different
zones**: the custom domain is in the `monetize-parking.com` zone and inherits its
settings, while `*.pages.dev` does not. So the two agreeing means `_headers` is
authoritative end to end, and **the two disagreeing isolates the fault to the zone**
with one command. That is what identified this: `pages.dev` returned the correct
`86400` while the custom domain returned `31536000`, which proved the repo, the
deployment and the `_headers` parsing were all fine.

**Purging the Pages cache cannot fix a zone override, which is why two purges
changed nothing.** The rewrite happens in front of Pages.

**Where it lives, and both are dashboard-only.** Caching, Configuration, **Browser
Cache TTL**, which must be **"Respect Existing Headers"**; or a **Cache Rule** with
a Browser TTL override. Neither is visible from the repo and neither is under
version control, so nothing in a commit can catch a regression here.

**Verified after the fix**, 2026-08-17: all nine asset classes agree between the two
hostnames, HTML is still `max-age=0, must-revalidate`, and the `/*` security headers
are still applied on both. Re-run the loop above after any Cloudflare caching change.

**`/css/*` was immutable for a year and is now 86400, matching `/styles.css`.**
Changed 2026-08-17. Before that, `css/article.css` (184 links across 107 pages),
`css/state-map.css` (58 links, 29 pages), `css/resources.css` (7 links, 6 pages)
and `css/style.css` (reached via `@import` inside `article.css`) were pinned for a
year with **no version query on any link**, so a change to any of them never
reached a returning visitor at all.

**Why 86400 rather than versioning the links.** Versioning would have meant a
query on four separate links plus one inside an `@import`, and then a convention
saying when to bump each. That convention has to be remembered on every stylesheet
change by whoever is making it, and the `/js/*` bump has only held because it is
enforced by a single `<script>` src in one template. Five scattered links have no
such choke point. **Dropping the header instead means one operational rule, purge
on deploy, covers every stylesheet on the site**, and there is nothing to forget
per-file.

The cost is real and accepted: these files are no longer cached for a year, so
returning visitors refetch them daily. They are small, they are behind Cloudflare's
edge, and the alternative was a class of bug that is invisible until someone
reports a broken page.

**This does NOT change `/js/*`, which keeps `immutable` and its bump convention.**
Two reasons. JS changes here are less frequent than CSS changes, so the cost of
remembering is paid less often. And the convention is established and working: the
bump lives on one `<script>` src in `templates/article-index.html`, it has been
exercised three times (`?v=logo-404`, `?v=service-crumb`, `?v=rail-service`), and
each time the regeneration propagated it to every article page automatically. A
working convention with a single choke point is worth keeping; five scattered ones
were not worth creating.

**`/styles.css` is one day, and its failure mode is the worst of the three.**
**PURGE THE CLOUDFLARE CACHE AFTER ANY DEPLOY THAT CHANGES `styles.css`.** This is
a standing post-deploy step, not a judgement call. `BACKLOG.md` item 41 holds the
detail and the permanent fix.

The mechanism: **HTML is not cached** (`_headers` sets no `Cache-Control` under
`/*.html`, so Cloudflare serves it `max-age=0, must-revalidate`) while
`/styles.css` is cached for a day. A deploy therefore hands visitors **new HTML
against a stylesheet up to 24 hours old.**

**That is not a page rendering with old styling. It is a page rendering broken.**
Old markup plus new CSS degrades gracefully, because the rules still exist and only
their values moved. New markup plus old CSS does not: the classes in the HTML have
**no matching rules at all**. Every structural change on this site is exposed this
way, the band system and `.page-*` payload blocks most of all, and the effect is
unstyled or collapsed layout rather than a stale colour.

**This file previously said the 24-hour window was "usually acceptable" and
"self-heals within a day". That was wrong and it cost a broken production render on
the merge deploy, 2026-08-17.** The reasoning had been about *value* changes, where
an old stylesheet still produces a coherent page. It does not hold for markup
changes, which is what most deploys here are.

Adding a version query to the `styles.css` link removes the window permanently and
**has not been done**: the link appears in all **119** pages carrying inline
critical CSS, so it is a 119-file change plus a regeneration. Deferred for that
reason, and the deferral is what makes the purge mandatory in the meantime. The
favicon and og-image `?v=` conventions are the precedent for doing it.

For `/js/*` and for a fixed-name image there is nothing to judge either: a missed
bump there never reaches a returning visitor at all.

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

### Inline payload rules

Several pages carry an inline `<style>` payload as well as `styles.css`. Two rules
govern them and they are easy to get backwards.

**`var()` in a HEAD-level payload is a first-paint bug. `var()` in a BODY-level
payload is fine.** The deciding factor is head or body, not page or payload.

A head-level payload exists to paint correctly before the async `styles.css`
lands, so a `var()` there resolves to nothing until the stylesheet arrives, which
is the exact flash the payload exists to prevent. Head payloads are hex literals
only. A body-level payload is parsed after the `styles.css` link, so every token
it references is already defined; the calculator's block carries 29 `var()`
references safely. **Do not "fix" a body payload to match a head one, and do not
copy a body payload's approach into the head.**

**The head chrome payload defines only 13 tokens:** `--brand`, `--brand-blue`,
`--ink`, `--muted`, `--card`, `--bg`, `--border`, `--space-section`,
`--space-block`, `--max-text`, `--h1`, `--h2`, `--h3`. Anything outside that list
is unavailable at first paint no matter which block references it.

**No page overrides a `styles.css` token from an inline block any more.** Four did
until 2026-08-13, all with a second `<style>` in the **body** that won the cascade
permanently and rendered `--muted` as `#6b7280` against the authoritative
`#64748b`: `contact/index.html`, `contact/thank-you/index.html`,
`calculator/index.html`, `calculator/report/index.html`. All four are clean now.
**The reason this matters is the failure it enabled:** rewriting a token name in
`styles.css` escaped the override, because the body block defined the old name and
not the new one, so those pages silently changed colour. If a body-level `:root`
override is ever reintroduced, that trap comes back with it.

### Cross-file token references need literal fallbacks

`styles.css` is the single source for shared primitives and the other stylesheets
reference them, which creates a load-order dependency that is **not safe bare**.

**Every cross-file reference carries a literal fallback equal to today's value:
`var(--primitive, #literal)`.** The fallback is a degradation value, playing the
same role the inline critical CSS literals play. It is not a second source of
truth.

Measured browser behaviour, which is worse than it sounds: a custom property whose
value is `var(--undefined)` becomes guaranteed-invalid, and the consuming
declaration falls back to **inherit**, not to anything sensible. A probe with a red
parent rendered `rgb(200,0,0)` where `#0f172a` was intended.

On four pages the window is deterministic rather than a race:
`resources/states/{colorado,minnesota,texas,wisconsin}/index.html` load
`css/resources.css` **synchronously** while `styles.css` loads **async**, so
`resources.css` is guaranteed to apply while `styles.css` may not have, on every
single load. Elsewhere it is a size race that a congested link can lose.

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

### The band section system, and why everything is scoped

**Nothing in the section or motion system is a bare global class**, and that is a
hard constraint rather than caution. Four class names were already in use before
the system existed, and a bare global rule on any of them would have broken
existing pages:

| Class | Already used by | A bare global rule would |
|---|---|---|
| `.eyebrow` | the article template, so all article pages | restyle every article hero eyebrow |
| `.stat` | `services/index.html` | restyle the services stats |
| `.icon` | 12 bare uses on calculator, contact/thank-you, calculator/report | resize existing icons |
| `.btn` | calculator and contact inline payloads | add height and padding their blocks do not override |

So the section system is scoped to `.band`, a class with zero prior consumers, and
the motion system keys off `data-*` attributes, which collide with nothing. **Keep
it that way.**

A page opts in per section:

```html
<section class="band band--page">
  <div class="band__inner">
    <span class="eyebrow">Section label</span>
    <h2 class="h2">Heading</h2>
    <p class="lede">Supporting sentence.</p>
  </div>
</section>
```

`.band--page`, `.band--card`, `.band--sunken` and `.band--navy` are the four
surfaces; `.band--sm` compresses the rhythm. **`.band__inner` is 1200px and is not
`.container`, which is 1100px and consumed by every other page.** `.band--navy`
re-tints the eyebrow, lede, stat label, secondary button and focus ring on its own,
so a navy section needs no extra classes. `.band :focus-visible` gives a 2px ring,
blue on light and white on navy, because band content otherwise fell back to a UA
ring that is not reliably visible on navy.

Grid, tile, button, stat and icon classes are all band-scoped. Adjacent sections
should not share a surface.

### The motion system

Code lives in `script.js` (loaded `defer`) and `styles.css`. **Nothing is inline on
any page.** Exported as `window.MPMotion`.

| Attribute | Effect |
|---|---|
| `data-reveal` | entrance reveal, fades and rises 16px |
| `data-reveal-group` | staggers the `[data-reveal]` children beneath it, `i * 70ms` capped at 420ms |
| `data-count-to="178"` | counts a number up over 900ms at 40% visibility |

Only `opacity` and `transform` are animated.

**The never-invisible technique, and do not replace it with a global hiding
class.** The prototype added `is-motion` to `<html>` and hid every reveal target
beneath it, which means content paints visible, gets hidden, then fades in. Instead
JS arms elements one at a time and **only ever arms an element currently off
screen**. An element already in the viewport is marked handled and never hidden.
What that buys:

- JS absent, blocked, slow or throwing: nothing is armed, so nothing is ever
  hidden. Verified with scripts blocked: 27 reveal targets, 0 armed, 0 at zero
  opacity, counters showing final values.
- `styles.css` arriving late cannot produce a flash, because an armed element is
  off screen anyway.
- `prefers-reduced-motion: reduce`: JS arms nothing, and a CSS media query
  neutralises the armed state as a second line of defence.

Count-up targets carry their final value as text in the HTML, so a JS failure shows
the real number.

### The YouTube embed on video pages is untouchable from CSS

Styled entirely by inline attributes: a 350px wrapper, a `padding-bottom:177.78%`
aspect box (9:16 vertical, all 30 pages), and `position:absolute; inset:0` on the
iframe. Exactly one stylesheet rule anywhere targets an iframe,
`.res-thumb.video-wrapper iframe` in `styles.css`, and it does not reach these:
that selector belongs to the cards on `ask-the-experts.html`. **Do not expect a
stylesheet change to affect the embeds.**

### Team photo display ceiling

**`.page-about .team-photo` renders at 100px and 100px is the ceiling. Anyone
raising it reintroduces a soft image.** Moved here from the post-Vegas backlog on
2026-08-17: it is a standing constraint, not a task, and it was the only closed
item on that list.

`images/dax.jpg` and `images/dax.webp` are both 200x200. `dave.jpg` and
`dave.webp` are both 800x800. **There is no larger Dax source in the repo and the
photograph cannot be re-shot**, so the resolution mismatch is permanent and the
fix is the render size rather than the source. At the old 140px, Dax's 200x200
gave only 1.43x and was soft on any retina display. At 100px it is exactly 2x and
therefore retina-correct; Dave's 800x800 is 8x at the same size. Measured
2026-08-14 at `devicePixelRatio` 2.

**If the display size ever needs to grow, a new photograph has to come first.**
The rule in `about/index.html` carries a comment saying so. That comment points
here.

Also fixed in that pass, recorded so it is not re-introduced: Dave's `<img>`
declared `width="200" height="200"` against an 800x800 file, now corrected to the
true intrinsic size. Same class of defect as the case study image in `d320799`.

### Header sizing constraints

Measured 2026-08-17 while raising the logo from 44/38 to 48/44. **Every number
here was measured in a browser, not calculated.** The header is the most
duplicated block on the site, so getting this wrong is expensive to undo.

**The logo asset is 400x160, so rendered width is always 2.5x the height.** That
ratio, not the bar height, is what constrains the logo. Every 1px of height
costs 2.5px of horizontal room.

**The desktop ceiling is 50px, and it is bound at a 769px viewport**, the
narrowest desktop layout, one pixel above the mobile breakpoint. At that width
the bar holds brand 110px, a 32px gap, nav 360px, 48px of slack, and actions
172px, with the Calculator button already hidden below 1025px. The 48px of slack
buys 19px of height. At 1025px the ceiling is about 104px and at 1280px about
174px, so **769px is the only width that binds.** Do not check this at desktop
widths and conclude there is room.

**The failure mode is a silent nav wrap, not an overflow.** At 51px,
"What We Do" wraps to two lines and its trigger grows from 48px to 76px tall.
`scrollWidth` never exceeds `clientWidth`, no scrollbar appears, and the page
does not overflow, so every overflow check passes while the header looks broken.

**Free-space arithmetic gives a FALSE ceiling of 56px. Do not use it.** The gap
between nav and actions stops shrinking at 32px because `.site-nav` has
`margin-right: auto` and a default `flex-shrink: 1`: once the auto margin is
spent, the nav absorbs the pressure by compressing and wrapping rather than by
reducing the measured gap. The number stays reassuring while the thing it is
supposed to protect breaks.

**The check that catches it is nav trigger height at a 769px viewport:**

```js
[...document.querySelectorAll('.site-nav .nav-trigger, .site-nav .nav-link')]
  .map((t) => Math.round(t.getBoundingClientRect().height))
```

Three values of `48` is correct. Anything larger means a label has wrapped.

**48px is deliberately 2px under the 50px ceiling.** The margin is not caution
about the measurement, it is headroom for the nav labels: a fourth nav item, or
"What We Do" becoming anything longer, would put a logo sitting exactly on the
ceiling into a silent wrap. **Anyone raising the logo above 48px is spending
that headroom and must re-measure at 769px.**

**The mobile ceiling is 52px and it is vertical, not horizontal.** The bar is
64px, so 52px leaves 6px above and below. Horizontally mobile has no constraint
worth naming: at a 320px viewport with a 56px logo there is still 96px of clear
space before the hamburger, because the nav is collapsed.

Sharpness is not a constraint at these sizes, unlike the team photographs. The
asset is 400px wide, so 48px renders at 2.5x and 44px at 3.6x.

#### The mobile menu panel hardcodes the mobile header height

**`.site-nav { position: fixed; inset: 64px 0 0 0 }`** in the `max-width: 768px`
block. That `64px` is the mobile bar height, repeated as a literal. **Change the
mobile header height and this must change with it**, or the menu panel overlaps
the header, or leaves a gap showing the page scrolling behind it.

Nothing links the two numbers. They are in the same media query but tens of
declarations apart, the panel value looks like a positioning detail rather than a
derived one, and no comment connects them. Verify after any mobile header change
with `getComputedStyle(nav).top === barHeight + 'px'`.

#### Two competing scroll-offset conventions, 88px and 96px

Both encode "desktop header height plus breathing room" against a 72px bar, and
they disagree about the breathing room. **If the desktop header height ever
changes, all of these move**, and missing one is not subtle: the anchor target
lands under the sticky header and the reader sees the wrong content with no
error anywhere.

| Value | Where | Reading |
|---|---|---|
| `scroll-padding-top: 88px` | `styles.css:259`, on `html` | 72 + 16. Governs **every** in-page anchor jump site-wide |
| `scroll-margin-top: 88px` | `styles.css:995` `.service-card`, `styles.css:2388` `.page-services .pillar[id]` | 72 + 16 |
| `scroll-margin-top: 96px` | `css/article.css:867`, `css/article.css:874`, `css/state-map.css:381`, `css/state-map.css:394` | 72 + 24 |
| `position: sticky; top: 96px` | `css/article.css:1147`, and inline in **77 HTML files** | article rail |

`.site-header { position: sticky; top: 0 }` itself needs no change at any header
height, which is why the sticky behaviour looks safe when it is not.

**Reconciling 88 and 96 to one token is worth doing and was not done here.** It
is a real change to anchor landing positions on every page, so it needs its own
pass rather than riding along with a logo resize.

#### The header CSS is duplicated across 119 files plus `styles.css`

The full header block is inline critical CSS in **119 HTML files** and again in
`styles.css`. In every file the inline `<style>` sits **before** the `styles.css`
link, so at equal specificity **`styles.css` wins the cascade** and the inline
copy governs only first paint.

That means editing `styles.css` alone changes what renders, and leaving the
inline copies stale produces a visible jump on first paint. **Edit both, always.**

Of the 119: **75 are generated** from `templates/article-index.html`, so edit the
template and run `npm run generate:articles` rather than touching them.
`articles/parking-today-small-lots/index.html` carries the block but is
hand-written and skipped by the generator, so it needs a direct edit. The
remaining 42 are hand-edited pages. **44 direct edits plus a regeneration**, not
119 direct edits.

A header size change lands in `styles.css`, which is cached for a day with no
version query, so returning visitors get a one-day reversion flash: the new size
paints from the fresh inline CSS, then the stale stylesheet overrides it. See
"Cache lifetimes, and when a version bump is required" under Headers and
Redirects for the rule and how it differs from `/js/*`.

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
└── BACKLOG.md
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

### The working pattern, for this and any future project

Five parts, and they only work together. This grew out of the rebrand but is not
specific to it: **use it for any piece of work large enough to want a preview.**

1. **Create a feature branch.** `main` is protected and requires a pull request;
   direct pushes are refused with GH013, including for the repo owner.
2. **Cloudflare Pages builds a preview for the branch.** **Preview branches are
   restricted, not automatic. Check the Cloudflare project settings before assuming
   a new branch builds.** The restriction has been set to a single named branch,
   so a new one produces no preview until it is added.
3. **A Cloudflare Zero Trust Access application gates the preview URL.** It is
   **permanent.** This is the outer wall. Note that per-commit hash preview URLs are
   **not** covered by the Access policy and rely on the noindex guard plus
   obscurity, so never share a hash URL publicly.
4. **The hostname gates keep analytics, ads and indexing off any non-production
   hostname.** A `noindex` script fires wherever the hostname is not production, and
   GA4 and Google Ads initialise only on production. They are **permanent and must
   not be removed.** This is the inner wall, and it is what makes the preview safe to
   browse and to share internally.
5. **`tools/guards.js` and `tools/conversion-guard.js` protect the tracking blocks.**
   **Run both before and after any pass that touches HTML.** `guards.js` covers the
   noindex and gtag blocks; `conversion-guard.js` covers the Ads and GA4 conversion
   plumbing on the two `/consultation/` pages, where a break stops conversions
   counting with no visible symptom.
6. **The gates assume exactly one hostname serves HTML.** Any future production
   hostname must **301 to the apex**, or both gates have to learn about it. See the
   `www` case below, which already caught this out.

**Access and the guards are two walls for one job, deliberately.** Access can be
misconfigured, expire, or be deleted by someone tidying up; a link can be shared
past it. The guards do not depend on Access being correct, and Access does not
depend on the guards being present. Losing one should not put real analytics data
or a duplicate indexed site at risk.

### Environment configuration

- **GitHub:** repo `brwalker11/park`. A ruleset on `main` requires a pull request.
  Direct pushes are refused with GH013, including for the repo owner.
- **Cloudflare Pages:** project `monetize-parking`. Production branch `main`,
  deploying to `monetize-parking.com`, `www.monetize-parking.com` and
  `monetize-parking.pages.dev`. **Preview branches are restricted to a named branch
  list**, so a new branch produces no preview until it is added. No build command is
  configured: Cloudflare serves committed files as-is, `npm run build` runs locally,
  and generated output is committed.
- **Cloudflare Zero Trust Access:** a self-hosted application gates the preview
  hostname, policy allowing specific emails only. **Per-commit hash preview URLs are
  NOT covered by that policy** and rely on the noindex guard plus obscurity. Do not
  share a hash URL publicly.
- **`www` 301s to the apex** via a Cloudflare wildcard redirect rule, path and query
  preserved. This is what makes the single-hostname assumption in the gates correct.

### Rules

- Never commit directly to `main`. `main` is protected and deploys to production.
- Analytics and ad tags stay gated to the production hostname. **Permanent.**
- A `noindex` meta tag must apply on any non-production hostname. **Permanent.**
- Do not remove either gate without me asking.
- The Cloudflare Zero Trust Access application on the preview URL is
  **permanent** for the same reason.

### The hostname gates are permanent infrastructure

**They were built to be reverted when the rebrand merged, and that was wrong. They
are permanent. The revert items were removed from the merge-day checklist on
2026-08-17 and must not be re-added.**

The reasoning is that a preview environment is ongoing rather than a
rebrand-only artifact. As long as any non-production hostname serves this site,
that hostname must not be indexed and must not fire analytics or ad conversions.
Deleting the gates on merge day would have removed exactly the protection the
preview needs from that day onward. So:

- **The noindex guard stays on every page**, marked
  `<!-- Preview noindex guard - PERMANENT, do not remove. Reasoning in CLAUDE.md -->`.
  Reworded 2026-08-17; it previously read "remove on merge day", which was stale
  and was the most likely thing to get someone to delete the guard by following
  its own instruction.
- **The gtag hostname gate stays on every page**, and carries the same note as the
  first line inside its `<script>`, so the note is covered by the hash and cannot
  be stripped without the guard failing.

**Rewording either comment is a baseline recapture, and the noindex one has a
trap.** That comment string is *also* `NOINDEX_MARKER` in `tools/guards.js`, the
string the scanner searches for. Change it on the pages without changing the
constant and every block becomes undiscoverable: the count drops to zero rather
than mismatching, which reads like a broken scanner rather than an unguarded site.
Change both in the same commit, regenerate the 75 article pages so the template's
copy propagates, then recapture and gate the result: exactly the expected hashes
changed, none added, none removed.
- **`tools/guards.js` changes meaning.** It no longer protects blocks that are
  about to be deleted. It now protects **permanent** blocks, the same standing as
  `tools/conversion-guard.js`. A failure is a live defect, not a future merge
  conflict.

#### `git revert` of the two guard commits was tested and does not apply

The gates were added by `187bfbd` (gtag hostname gate) and `3596d3d` (noindex
guard), both 2026-08-04, and the plan was to revert both on merge day. **Dry-run in
a throwaway worktree on 2026-08-17, in both orders, and neither applies:**

| Revert | Conflicts | Cause |
|---|---|---|
| `187bfbd` first | **149 of 150 files** | `3596d3d` inserted the noindex block directly above the gtag block in every `<head>`, so reverting the older commit collides with the newer one everywhere |
| `3596d3d` first | **74 files**, the article pages plus the template | the adjacent `article.js` script tag was bare then and now carries a `?v=` query |

The guard blocks themselves are byte-identical, which `guards.js` proves, so every
conflict is context rather than content. That still means 149 files of hand
resolution.

**And the reverts would have missed five files**, because those postdate both
commits: the three solar articles and both service pillar pages. A revert-based
merge day would have shipped `noindex, nofollow` **live on both pillar pages**,
silently.

**Recorded because the instruction looked safe and was not.** Anyone reaching for
`git revert` on a `<head>` change made a hundred commits ago will hit the same wall.
If these blocks ever do need removing, **script the excision against the known block
bytes and verify with `guards.js` reporting zero**, rather than reverting.

#### Both gates match one hostname exactly, and that is now correct. RESOLVED

```js
window.location.hostname === 'monetize-parking.com'
```

**This comparison is correct as written, because the apex is the only production
hostname that ever serves HTML.** `www.monetize-parking.com` 301s to the apex via
a **Cloudflare wildcard redirect rule**, so no page load ever reports `www` as its
hostname and neither gate can misfire on it. Do not add `www` to the comparison;
it would be dead code.

Verified 2026-08-17 after the rule was added:

```
https://www.monetize-parking.com/                    301 -> https://monetize-parking.com/
https://www.monetize-parking.com/faq/                301 -> https://monetize-parking.com/faq/
https://www.monetize-parking.com/consultation/       301 -> https://monetize-parking.com/consultation/
https://www.monetize-parking.com/resources/?service=EV%20Charging
                                                     301 -> https://monetize-parking.com/resources/?service=EV%20Charging
```

The wildcard preserves both path and query string, which matters for
`/resources/?service=` and for any Ads landing URL carrying parameters.

**What this was.** Before the rule, `www` served the site directly: HTTP 200, zero
redirects, verified on more than one path, with both hostnames configured as
production domains in Cloudflare. That made the comparison above wrong for `www`,
and because the gates are permanent the bug would have been permanent too: on
`www` the noindex guard fires and the analytics gate does not, so `www` would have
been `noindex, nofollow` **and invisible to GA4 and Google Ads conversion
tracking.** The analytics half was the expensive one, since a conversion arriving
on `www` would not have been counted at all, on a campaign already running below
the volume Ads wants for bidding.

**It never shipped.** It was found on 2026-08-17 while making the gates permanent,
before the merge, and while production was still `main`, which carries neither
gate. Recorded because the failure mode was invisible from inside the repo: every
page, every test and both guard scripts would have passed, and the symptom would
have surfaced weeks later as missing conversions and a deindexed hostname.

**The standing rule this leaves:** the gates assume exactly one hostname serves
HTML. **If another production hostname is ever added to Cloudflare, it must
redirect to the apex, or both gates have to learn about it.** Adding a domain that
serves directly reintroduces this silently. `_redirects` cannot do host redirects;
that is a Cloudflare redirect rule.

**Still verify `www` after the merge**, as a redirect rather than as a page: one
`curl -sI` confirming a 301 to the apex.

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

**A pass is not complete until it is committed and pushed.** Verification
against the working tree proves the code is correct. It does not prove the
preview will serve it, because the preview deploys from the branch, not from
the working tree. A verified, uncommitted change is invisible to everyone but
the session that made it.

- Always report the commit hash, and confirm the push actually landed.
- When work is verified but not committed, **say so explicitly and say it
  prominently**, not as a closing aside. "Nothing is committed" at the end of a
  report reads as housekeeping. "This is verified but uncommitted, so the
  preview will not show it" is the actual state.
- The check is `git status -sb`: no ahead marker, nothing modified, nothing
  untracked. Run it after pushing and report the result rather than assuming
  the push covered everything.

This cost a debugging cycle on 2026-08-16, when three solar articles were built
and verified end to end in the browser and then reported as done. Every runtime
check passed against `localhost`. Nothing had been committed, `origin/rebrand`
was still at the commit from before the session, and the articles were missing
from the deployed preview.

- Always run a read-only discovery pass before modifying files. Report findings
  and wait for confirmation.
- Treat any "Do NOT Change" section in a prompt as absolute.
- Bundle related fixes touching the same file into a single change.
- End every task with a verification step using grep where possible, and report
  results.
- Give a prioritized list of what changed, not a narrative walkthrough.
- If something is ambiguous, ask rather than assume.

## Brand and color

**The token layer in `styles.css` is the source of truth.** Never hardcode a hex
value; always reference a token. If a token you need does not exist, stop and ask
rather than inventing one. Do not treat a hex value found in git history or in an
older document as authoritative.

Brand blue is the `#004FC8` family. The dark surface is `#010D20`.

**Green is scoped to solar, EV, sustainability and success content. It is not a
general brand colour.** If green spreads into general UI the site starts reading as
a solar company. When in doubt, use blue.

**One deliberate exception: the "What We Do" nav panel is not green.** Solar
Lighting and EV Charging used to render green there while All Services and Parking
Revenue did not, and two coloured items among four read as arbitrary rather than as
a taxonomy: the panel gives a reader no context for what the colour signals.
Removed 2026-08-15.

**`.scope-green` is still in the chrome markup on all 151 files, deliberately. Do
not tidy it up.** Only the rule in `styles.css` was removed. Stripping the class is
a 151-file sweep across frozen chrome that changes the chrome hash, which is far
larger than the decision warrants, and the class is the hook: if this is ever
revisited, restoring green in the panel is one rule rather than another 151-file
sweep.

**Silver wordmark caution.** The silver gradient wordmark disappears on light
backgrounds. Any logo placed on a light surface must use the solid dark variant, not
the gradient one. The `.silver` display treatment carries a solid inverse fallback
first for the same reason, so text is never invisible.

**`#010D20` lives in three places outside the tokens file** and all three move
together if it ever changes: `<meta name="theme-color">` on every page, and
`theme_color` plus `background_color` in `images/site.webmanifest`.

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

### Dated claims, and the one with a review cadence

**The site has no mechanism for dated claims.** Nothing carries a "verified as of"
marker by default, no review cadence exists, and `data:resources.json` records a
publish date but nothing about whether the content is still true. That is how an
expired tax credit survived six weeks on the homepage. The audit of rate-pinned
figures is in `BACKLOG.md`; two articles hold nine between them.

**One claim has a hard annual cadence. Review it every July.**
`articles/ada-compliance-paid-parking.html` carries ADA Title III civil penalty
maxima, which DOJ adjusts for inflation. Current state, verified 2026-08-16:
**$118,225** first violation, **$236,451** each subsequent, effective 3 July 2025,
authority 28 CFR 85.5.

The figures appear in **three places and all three must move together**: the article
lede, the "Who Can Impose These Penalties" section including its verified-as-of
sentence, and the `excerpt` for that slug in `data/resources.json`, which duplicates
the lede and renders on cards and in meta descriptions.

**There was no 2026 adjustment, and that is not an oversight.** DOJ deliberately
continued 2025 levels through 2026. The adjustment is calculated from BLS CPI-U data
for October of the prior year, and BLS never produced October 2025 because of the
appropriations lapse; the statute allows no alternative method, so OMB directed
agencies to hold. Recorded because the natural reaction to "effective July 2025"
seen later is to assume nobody checked.

**The qualifier must never be dropped.** Only the Attorney General can seek these
penalties; a private individual cannot trigger one, and a private suit produces
injunctive relief and fees rather than damages. **The ceiling must never appear
without who can reach for it**, which is why both the lede and the card excerpt
state them in the same sentence: so the figure cannot travel alone into a card, a
search result or a social preview. The section points at state law without naming a
state or an amount, deliberately in both directions.

### Settled content decisions, recorded so they stop being reopened

**There is no `/services/parking-revenue/` page and this is not to be revisited.**
`/services/` is already the parking page: its title and meta description lead with
parking, and it receives more internal links than anything but the homepage.
Splitting parking onto a new URL takes substance out of a page that ranks and moves
it to one that does not, targeting the identical query, which is textbook
cannibalisation. The asymmetry with solar and EV is the point: solar got a page
because no solar content existed, EV got one because scattered articles had no
centre, and parking has neither problem. **Consequence accepted deliberately:** the
What We Do dropdown is mixed, two pages, one anchor, one hub. `/services/#parking`
is the permanent answer, not a stopgap. If it is ever reopened, what would settle it
is a Search Console export for `/services/` over 90 days, not more reasoning.

## Documentation

- **`BACKLOG.md` - outstanding work. Deferred tasks, known defects, and untaken
  decisions. This is the ONLY place outstanding work is recorded.** Read it before
  proposing anything new, and add to it rather than to this file. Items that turn
  out to be standing rules belong here in `CLAUDE.md` instead, and get deleted from
  `BACKLOG.md` when they move.
**Live:**

- `/docs/articles-dynamic.md` - article system guide
- `/docs/url-migration.md` - URL structure and routing notes. Overlaps this file's
  URL Structure section; merge candidate
- `/docs/design-direction.md` - the settled token values and the category gradient
  palette. **Cited by live code**, so do not delete it: `styles.css` in three
  places, plus `js/resources.js` and `js/related.js` for the gradient palette

**Historical, kept as a record and not authoritative.** Both are headed with a note
saying so, and both reference a `REBRAND.md` that no longer exists:

- `/docs/design-direction-audit.md` - the critique that shaped the rebrand plan
- `/docs/website-audit-action-plan.md` - January 2026 audit. Every finding is
  resolved except the stale manifest proposal, which is now self-contained as
  `BACKLOG.md` item 13, so this file is no longer load-bearing and can go whenever
  someone decides to

**Deleted 2026-08-17**, at the end of the rebrand. Recorded so nobody looks for
them: `REBRAND.md`, `docs/execution-plan.md`, `docs/page-speed-optimization-plan.md`,
`docs/preview/` (three approved prototypes), `SEO_TODO.md`, `optimize_images.py`,
and all 17 files under `tools/rebrand/`. Live work from the two plan documents was
extracted to `BACKLOG.md` items 37 to 40 first. Everything else is in git history.

**`REBRAND.md` was the rebrand working document. It was folded into this file and
deleted on 2026-08-17, before the pull request**, so the merge commit carries
finished documentation rather than a file describing work in progress. Its durable
content is here, its outstanding work is in `BACKLOG.md`, and the rest is in git
history. Do not recreate it.
