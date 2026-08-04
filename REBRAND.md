# Rebrand Working Document

This file changes constantly. It holds decisions and status for the rebrand.
Durable project rules live in `CLAUDE.md`.

Last updated: 2026-08-04
Target: Las Vegas conference, mid-September 2026

---

## Current pass

**Status:** Pass 1 (color and asset discovery) not yet run

Update this line at the end of every pass. If you are starting a session and
this says a pass is in progress, ask me for the result before proceeding.

---

## Direction

Hybrid, not full dark. Deep navy is the frame color. Article body content keeps
light backgrounds.

Navy applies to: header, footer, homepage hero, CTA bands, calculator, video
library cards.

Light stays on: article body content, state pages body content, FAQ body.

Rationale: 70+ articles on dark backgrounds is a readability and dwell-time
risk, and every existing inline image and chart in those articles assumes a
light background.

---

## Color decisions

Do not hardcode any of these. They become tokens in Pass 2 and the tokens file
is the source of truth from that point forward.

| Role | Decision | Status |
|---|---|---|
| Primary brand | Blue, exact value TBD from logo sampling | Not set |
| Dark surface | Deep navy, exact value TBD from logo background | Not set |
| Body background | Unchanged from current light | Confirmed |
| Body text | Unchanged | Confirmed |
| Accent green | Scoped to solar, EV, sustainability, success states ONLY | Confirmed |
| Error / validation | Unchanged, functional not brand | Confirmed |

**Green rule:** Green appears in the ClearWorld co-brand and in the tagline
lockup. It is not a general brand color. If green spreads into general UI the
site starts reading as a solar company. When in doubt, use blue.

**Silver wordmark caution:** The silver gradient wordmark disappears on light
backgrounds. Any logo placed on a light surface must use the solid dark variant,
not the gradient one.

---

## Logo assets

| Asset | Status |
|---|---|
| Horizontal lockup, transparent PNG @3x | Requested |
| MP mark alone, transparent PNG @3x | Requested |
| Solid dark variant for light backgrounds | Requested |
| Tagline lockup | Have PNG, needs transparent version |
| ClearWorld co-brand lockup | Have PNG, needs transparent version |
| Favicon set (512, 180, 32, 16) | Not started |
| OG image 1200x630 | Not started |
| Vector (AI/SVG/EPS) for print and embroidery | Freelance redraw, $150-$400 |

Vector is needed for booth graphics, banners, table throws, and embroidery.
It is NOT needed for the website. High-res transparent PNGs are sufficient
for web.

---

## Pass log

Record the outcome of each pass here as it completes.

### Pass 1: Color and asset discovery (read only)
Status: Not run
Result:

### Pass 2: Tokenize colors (no visual change)
Status: Not started
Result:

### Pass 3: Apply brand to frame surfaces
Status: Not started
Result:

### Pass 4: Mobile and conference path
Status: Not started
Result:

---

## Guardrails currently in place

These must stay until merge day. Do not remove without me asking.

- Analytics gating (commit `187bfbd`). Hostname check around the gtag init block
  only, with a no-op `gtag` defined in the else branch. Covers 149 pages plus
  `js/article.js:513`.

  Deliberate limitations:

  1. The gtag.js loader tag is NOT gated. It cannot be made conditional in place
     without dynamic injection. The script still downloads off-production, but
     no `gtag('js')` or `gtag('config')` is queued, so no measurement hit is
     created. Residual is a network request carrying the measurement ID.
  2. Roughly 107 inline `gtag('event', ...)` sites are unguarded and were left
     untouched. The no-op else is what makes them safe.

  Off-production, gtag calls silently do nothing rather than throwing. The
  preview is not a perfect behavioral mirror of production.

  Merge day: this is a 149-page revert, not a one-line change. Reverting commit
  `187bfbd` is the intended mechanism. Any rebrand commit that touches a gated
  page's `<head>` will complicate that revert. If a conflict arises, the target
  state is `function gtag(){dataLayer.push(arguments);}` with no wrapper and no
  else branch.
- Noindex safeguard (commit `3596d3d`). Inline `<head>` script on all 150 pages,
  placed immediately above the gtag gate block, that creates or updates
  `meta[name="robots"]` to `noindex, nofollow` when the hostname is not
  `monetize-parking.com`. Covers 150 pages plus `js/article.js:149`. Each block
  carries the marker `<!-- Preview noindex guard - remove on merge day -->`.

  On production the script does nothing at all: no tag creation, no attribute
  writes, no DOM reads beyond the hostname comparison.

  `js/article.js:149` previously forced `index,follow` on every successful
  article render, which would have overwritten the guard on all 73 article
  pages. It is now gated to production. The value it sets is unchanged.

  The four pages that already carry a static `noindex, nofollow`
  (`consultation/index.html`, `consultation/thank-you/index.html`,
  `contact/thank-you/index.html`, `calculator/report/index.html`) are
  overwritten with the identical value off-production and are untouched on
  production. No static robots meta value was changed anywhere.

  Merge day: revert commit `3596d3d`. Like the analytics gating this is a
  150-page revert, not a one-line change, and the same conflict warning applies
  to any rebrand commit that touches a gated page's `<head>`.
- Cloudflare Access password on the preview URL
- `/consultation/` visual changes on hold until Google Ads bidding is switched
  off Maximize Clicks

## Merge day checklist

- [ ] Revert commit `187bfbd` to remove analytics hostname gating (149 pages
  plus `js/article.js`, see guardrails above)
- [ ] Revert commit `3596d3d` to remove the noindex safeguard (150 pages plus
  `js/article.js`, see guardrails above)
- [ ] Confirm Ads bidding already switched off Maximize Clicks
- [ ] Merge `rebrand` into `main` via pull request
- [ ] Annotate deploy date in GA4 and Google Ads
- [ ] Verify tags firing on production

## Post-Vegas backlog

Not rebrand work. Do not start any of these before the conference.

- CSP scoping fix and testing. `_headers` scopes the policy to `/*.html`, which
  matches no rendered page. Rescoping to `/*` will start enforcing it for the
  first time and may break external resources that currently load freely. Needs
  its own testing cycle.
- `parking-today-small-lots` rendering bug. The `resources.json` entry has no
  `content` field, so the article runtime falls into `renderNotFound()`.
- Stale minified and critical CSS cleanup. `css/` and `js/` carry unused
  `.min.*` files and `css/critical/`, none built by any npm script and none
  loaded by any page.
- `sitemap.xml` lists `https://monetize-parking.com/ask-the-experts.html`, which
  308-redirects to `/ask-the-experts`.
