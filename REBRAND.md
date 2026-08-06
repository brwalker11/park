# Rebrand Working Document

This file changes constantly. It holds decisions and status for the rebrand.
Durable project rules live in `CLAUDE.md`.

Last updated: 2026-08-06
Target: Las Vegas conference, mid-September 2026

---

## Current pass

**Status:** Pass 1 (color and asset discovery) COMPLETE, run on `e9248d1`.
Findings below. Next up is Pass 2a, blocked on the canonical blue decision.

Update this line at the end of every pass. If you are starting a session and
this says a pass is in progress, ask me for the result before proceeding.

---

## Scope and direction

This is a full visual overhaul plus content repositioning, not only a color and
logo rebrand. Four workstreams:

1. **Visual overhaul.** Design direction documented in `docs/design-direction.md`
   (pending), motion in `docs/motion-spec.md` (pending). Reference points cited:
   getonyx.ai and airgarage.com.
2. **Brand asset rollout.** Logo, favicons, OG image.
3. **Content repositioning** to three co-equal service pillars: parking revenue,
   solar lighting, EV charging. Solar lighting currently has NO presence on the
   site. EV has scattered articles and some services mentions. Positioning stays
   vendor-neutral; ClearWorld is not named as the provider.
4. **Information architecture.** Evaluating a two-axis nav (what we do / who we
   serve) modeled on airgarage.com, using existing segment keywords: churches,
   hotels, offices, stadiums, municipalities.

**Scope rule:** everything being promoted at the Las Vegas conference must have a
credible page on the site. That is the bar, not an even content split.

Homepage stays parking-weighted through Vegas to protect the Google Ads
conversion path. Rebalancing happens post-conference once lighting content earns
traffic.

Lighting page copy is owned by Ben, not Claude Code.

### Visual direction

Hybrid dark confirmed. Not full dark. Deep navy is the frame color. Article body
content keeps light backgrounds.

Navy applies to: header, footer, homepage hero, CTA bands, calculator, video
library cards.

Light stays on: article body content, state pages body content, FAQ body.

Rationale: 70+ articles on dark backgrounds is a readability and dwell-time
risk, and every existing inline image and chart in those articles assumes a
light background.

---

## Approved visual reference

**`docs/preview/homepage.html` is the approved visual reference for the
rebrand.** Approved 2026-08-06. It is the standard every other page is built
against.

**Hero variant 1 was selected:** the split layout with the layered site
assessment diagram. Variants 2 (typographic monolith) and 3 (immersive field
scene) were rejected and have been deleted, along with the prototype hero
switcher control, its CSS, and its JS. The file now contains only the approved
design.

Every other page must be built to match the prototype on four dimensions:

1. **Section rhythm.** The band system and its vertical cadence: alternating
   page, card, sunken, and navy bands on the `--space-section` scale, with
   compressed `band--sm` strips used to demote secondary content rather than
   giving every section equal weight.
2. **Layering.** Elements that cross band boundaries instead of stacking flat.
   The prototype has two: the proof card pulled up over the hero's bottom edge,
   and the data card extending past the navy band onto the light band below.
   Card-behind-card depth in the hero visual follows the same principle.
3. **Motion.** Staggered entrance reveals driven by IntersectionObserver, and
   the stat count-up. Both are gated behind the `is-motion` class that JS adds
   only when JS runs and reduced motion is not requested, so nothing is ever
   hidden when JS fails or reduced motion is set. Final values stay in the HTML.
   Any new motion follows this same never-hide-by-default pattern.
4. **Component treatment.** The button system with its on-dark gradient primary,
   the eyebrow with its uppercase tracking, the silver display headings, the
   card and border and shadow treatments, the icon stroke weight, and the
   typographic category-color thumbnails that stand in for stock imagery.

The prototype is self-contained by design: it imports nothing from `styles.css`
and nothing imports it. Token values in its `:root` come from
`docs/design-direction.md` and remain subject to the color decisions below.
Treat the prototype as authoritative for layout, rhythm, layering, motion, and
component treatment, not as the source of truth for color. Color still resolves
through the tokens file once it exists.

Photography slots are marked inline in the file as `PHOTO SLOT` comments. Each
one names the designed no-photography fallback currently in place and the shot
that would replace it. The fallbacks are complete work, not placeholders, so no
page is blocked on photography.

Inter is loaded from a CDN in the prototype only. The production build
self-hosts the same variable font.

---

## Color decisions

Do not hardcode any of these. They become tokens in Pass 2 and the tokens file
is the source of truth from that point forward.

| Role | Decision | Status |
|---|---|---|
| Primary brand | Blue, exact value TBD from logo sampling | Not set |
| Dark surface | Deep navy, exact value TBD from logo background | Not set |
| Dark surface (provisional) | `#010d20`, eyedropper-sampled from the logo background. Currently used only as `theme_color` and `background_color` in `images/site.webmanifest`. | **PROVISIONAL** |
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

**On the provisional dark surface:** `#010d20` was sampled by eyedropper, not
programmatically. It must be confirmed or replaced when the design direction pass
samples the logo files programmatically. Do not tokenize it or use it in CSS
until then. For reference it is considerably darker than any dark value currently
in the stylesheets; the closest existing value is `#0f172a`.

`#010d20` now appears in rendered HTML as `<meta name="theme-color">` on all 150
pages, as well as `theme_color` and `background_color` in
`images/site.webmanifest`. If the provisional value changes it must be updated in
all three places, not just the tokens file. It is browser chrome tint only and
affects no page rendering.

---

## Logo assets

| Asset | Status |
|---|---|
| Horizontal lockup, transparent PNG | **COMPLETE** - `assets/brand/MP_Logo.png` (1200x480) and `assets/brand/MP_Logo_400.png` (400x160), both real alpha |
| MP mark alone, transparent PNG | **COMPLETE** - `assets/brand/MP_mark.png` (1024x905) and `assets/brand/mp_mark_512.png` (512x453), both real alpha |
| Favicon set | **COMPLETE and LIVE** - referenced by all 150 pages, plus `images/site.webmanifest` |
| Solid dark variant for light backgrounds | Outstanding |
| Tagline lockup | Outstanding. `assets/brand/MP Logo & tagelines.png` is opaque RGB with no alpha |
| ClearWorld co-brand lockup | Outstanding. `assets/brand/MP - CW Co-brand.png` is opaque RGB with no alpha |
| OG image 1200x630 | Not started |
| Vector (AI/SVG/EPS) for print and embroidery | Freelance redraw, $150-$400 |

Vector is needed for booth graphics, banners, table throws, and embroidery. It is
NOT needed for the website. High-res transparent PNGs are sufficient for web.

**`images/Logo.svg` must be replaced.** It is what all 148 pages currently load.
It is an auto-traced bitmap: 1858 paths, 1250 flat fills, with an opaque
background baked in as a full-bleed rectangle. It cannot be recolored and is
307 KB. Replace it with `assets/brand/MP_Logo_400.png` during the header pass.
The vector redraw is still needed for print and embroidery but is no longer a
website blocker.

**`images/logo.png`** (1.2 MB, referenced by nothing) is a deletion candidate.

---

## Pass 1 findings

Full report run on commit `e9248d1`. Key findings:

- Three competing brand blues in simultaneous use: `#007bff` (350 uses),
  `#0a68ff` (232), `#0b6efd` (175). 757 total occurrences of what should be one
  color. Canonical blue must be decided before any token work.
- 175 distinct color values, 5310 occurrences. 36 custom properties across four
  disconnected `:root` blocks, with 301 raw literals bypassing them. Roughly 63
  percent of color usage ignores existing tokens.
- Near-duplicate groups: 16 whites (1514 uses), 10 border greys (663), 5 inks
  (274), 96 distinct shadow values, 20 border-radius values.
- Header and footer: 148 pages byte-identical, 2 bespoke consultation pages. 78
  distinct edit points total, not 150.
- Runtime color literals a CSS-only rebrand would miss: `js/state-map.js:109`
  hardcodes `rgba(13,110,253,0.08)`. `js/related.js` and `js/resources.js` carry
  duplicated and drifted category color tables containing `#273d9a`, `#0a7c6b`,
  `#3b3a3f`, none of which appear in any stylesheet. `#0a7c6b` is a green and
  must be checked against the green-scoping rule.
- `INLINE_CTA_COPY` in `js/article.js` uses first-person language, violating the
  content rules. Flagged, not yet fixed.
- Six unrationalised breakpoints: 1024, 768, 860, 640, 960, 600.
- Two competing container widths (1100px and 1300px) and two competing button
  systems (`.btn` and `.cta`).

---

## Pass plan

- **Pass 2a:** establish the token layer, no visual change. One `:root` in
  `styles.css` as single source of truth, collapsing the four parallel naming
  schemes with old names aliased. Verifiable as pixel-identical.
- **Pass 2b:** consolidate near-duplicates. Resolve three blues to one, 16 whites
  to three, 10 greys to one, 96 shadows to four, 20 radii to four. Small
  deliberate visual change, needs sign-off on which blue wins.
- **Pass 2c:** sweep inline `<style>` across 119 pages. Scriptable for the 45
  uniform ones, manual for the 4 bespoke.
- **Consultation pages** deferred to their own pass, after Google Ads bidding is
  switched off Maximize Clicks.

**Sequencing note:** decide the canonical blue before writing any token, since
every downstream decision depends on it.

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

## Environment configuration

- **GitHub:** repo `brwalker11/park`. A ruleset on `main` requires a pull
  request. Direct pushes are refused with GH013, including for the repo owner.
  Verified by test on Aug 4 2026.
- **Cloudflare Pages:** project `monetize-parking`. Production branch `main`,
  deploying to monetize-parking.com, www.monetize-parking.com, and
  monetize-parking.pages.dev. Preview branches restricted to `rebrand` only,
  deploying to rebrand.monetize-parking.pages.dev. No build command is
  configured; Cloudflare serves committed files as-is. `npm run build` runs
  locally and generated output is committed.
- **Cloudflare Zero Trust Access:** a self-hosted application gates
  rebrand.monetize-parking.pages.dev. Policy allows specific emails only.
  Per-commit hash preview URLs are NOT covered by this policy and rely on the
  noindex guard plus obscurity. Do not share a hash URL publicly.
- **Local:** repo at `/Users/ben/Documents/MP/park`. Auth via macOS keychain,
  pushes do not prompt.

---

## Merge day checklist

- [ ] Revert commit `187bfbd` to remove analytics hostname gating (149 pages plus
  `js/article.js`)
- [ ] Revert commit `3596d3d` to remove the noindex guard (150 pages plus
  `js/article.js:149`)
- [ ] Confirm Google Ads bidding already switched off Maximize Clicks
- [ ] Merge `rebrand` into `main` via pull request, since direct push is blocked
- [ ] Verify production tracking fires: GA4 collect requests and the Ads
  conversion on `consultation/thank-you/`
- [ ] Verify production robots meta reads `index,follow`, not `noindex`
- [ ] Delete the Cloudflare Zero Trust Access application for the preview URL
- [ ] Fold any still-relevant findings from `REBRAND.md` into `CLAUDE.md` before
  deleting
- [ ] Delete `REBRAND.md` from the repo
- [ ] Annotate the deploy date in GA4 and Google Ads

**Not a revert item:** the favicon `?v=2` cache-busting query stays permanently.
It appears on the icon links, the manifest link, and inside
`images/site.webmanifest`. Do not strip it on merge day.

## Post-Vegas backlog

Not rebrand work. Do not start any of these before the conference.

- CSP scoping fix. The policy in `_headers` is scoped to `/*.html` and is
  enforced on no rendered page. Fixing it requires its own testing cycle against
  Google Fonts, Calendly, Formspree, and YouTube embeds.
- `articles/parking-today-small-lots/index.html` rendering bug. No `content`
  field in its `resources.json` entry, so the runtime renders a not-found state
  over its own content.
- Stale asset cleanup: nine dead stylesheets (four `.min`, four `critical/`, and
  `css/style.css`), `postcss.config.js` with no npm script, `tools/build.js`
  unwired, and `images/logo.png` at 1.2 MB referenced by nothing.
- `images/Logo.svg` deletion once the header no longer references it.
- Vector logo redraw for print and embroidery.
- Transparent versions of the tagline lockup and ClearWorld co-brand lockup.
- `sitemap.xml` lists `/ask-the-experts.html`, which 308-redirects.
- `docs/website-audit-action-plan.md:609` proposes a superseded `/manifest.json`
  at the repo root with a conflicting `theme_color: #2563eb`, and would send a
  reader to a 404. The shipped manifest is `images/site.webmanifest`.
- `package-lock.json` has three uncommitted `"peer": true` markers from npm
  11.6.2. Commit separately when a noisy diff does not matter.
- `INLINE_CTA_COPY` in `js/article.js` uses first-person language against the
  content rules.
- Content rebalancing toward genuine three-pillar parity once lighting content
  earns traffic.
- Webflow migration evaluation, if in-house editing without a repo becomes a
  requirement.
