# Rebrand Working Document

This file changes constantly. It holds decisions and status for the rebrand.
Durable project rules live in `CLAUDE.md`.

Last updated: 2026-08-06
Target: Las Vegas conference, **Monday Sep 14 2026 (CONFIRMED)**

---

## Current pass

**Status:** Pass 1 (color and asset discovery) COMPLETE, run on `e9248d1`.
Findings below. Next up is Pass 2a, blocked on the canonical blue decision.

Update this line at the end of every pass. If you are starting a session and
this says a pass is in progress, ask me for the result before proceeding.

---

## Schedule

**Conference start is confirmed: Monday Sep 14 2026.** The execution plan was
built on an assumed start of Saturday Sep 12, so the confirmed date recovers two
calendar days, Sat Sep 12 and Sun Sep 13, which were previously conference days.

**Merge day stays Thursday Sep 10.** The recovered days are held as schedule
slack, not spent on a later merge or a longer soak.

| Item | Was (assumed Sat Sep 12 start) | Now (confirmed Mon Sep 14 start) |
|---|---|---|
| Freeze | End of day Tue Sep 8 | Unchanged |
| Pre-merge verification | Wed Sep 9 | Unchanged |
| **Merge day** | **Thu Sep 10** | **Unchanged, Thu Sep 10** |
| Fri Sep 11 | Production soak, half day, last day before the conference | Working day: soak plus the fix window for anything the soak surfaces |
| Sat Sep 12, Sun Sep 13 | Conference days | **Slack. Unallocated.** |

Rationale for holding Thursday: a Friday merge would push any fix surfaced by
the soak into the weekend immediately before the conference. Merging Thursday
keeps Friday as a working day for those fixes and leaves the weekend as genuine
buffer rather than as scheduled work.

The slack is not soak time and not a place to add scope. It exists to absorb
overrun. Nothing is scheduled into Sat Sep 12 or Sun Sep 13, and the site is
expected live, verified, and finished on Friday Sep 11 exactly as before.

Nothing earlier in the plan moves. Weeks 1 through 5 keep their existing dates
and the week 3 checkpoint stays Friday Aug 21.

---

## Typography: COMPLETE

**Inter is self-hosted and active site-wide as of commit `38e017b`.** This was
the "font loading is inconsistent" problem: 117 files declared Inter, two loaded
it, and the site rendered in the system UI font almost everywhere.

What shipped:

| Item | State |
|---|---|
| Font files | `assets/fonts/inter-v20-latin-roman.woff2` (73,016 bytes) and `inter-v20-latin-italic.woff2` (79,744 bytes). Inter v20 latin subset, `wght 100 900`, `opsz 14 32` |
| License | `assets/fonts/OFL.txt`, SIL Open Font License 1.1, committed alongside the files as the license requires |
| `@font-face` | Two rules, roman and italic, at the top of `styles.css`, `font-display: swap`. Replaced a `local()`-only rule that named no file and so resolved only for visitors with Inter already installed |
| Preload | Roman file preloaded on the 113 pages that load `styles.css` through the async preload-onload pattern. The 34 synchronous pages are deliberately skipped; they discover the rule during the initial CSS parse |
| `--font-sans` | Inter moved from sixth to first, in `css/article.css` and in **74 inline `:root` blocks** (73 article pages plus `templates/article-index.html`). The inline copy wins at first paint, so both had to move together |
| Caching | `_headers` gains `/assets/*` at `max-age=31536000, immutable`. Font filenames carry the version, so this is safe. Also closes a gap where the brand PNGs had no cache header |

Verified in a browser, not by grep: article body copy measured at 468.07px in
the Inter stack against 454.18px in the same stack without Inter, which proves
glyphs are rasterizing in Inter rather than the cascade merely resolving. One
font request, confirming `crossorigin` on the preload is correct.

**The two consultation pages are unchanged.** They are frozen, do not load
`styles.css`, and still load Inter from Google Fonts. They remain the only pages
on the site permitted to reference `fonts.googleapis.com` or
`fonts.gstatic.com`. They move to the self-hosted files during their own pass,
which is bound up with the deferred freeze decision above.

Note for Pass 2b: the variable font makes `font-weight: 850` and `900` render as
true instances rather than browser synthesis. Both were left in place
deliberately and still consolidate to 800 in 2b.

---

## Solar photography

**Decided: no shoot is planned.** The solar lighting page is designed
typographically and carries no photography dependency. The `PHOTO SLOT`
fallbacks in the approved prototype are the shipping state for that page, not
placeholders waiting on a shoot. Build it, verify it, and consider it finished
without images. `docs/execution-plan.md` is reconciled with this decision: the
shoot slot is removed from its schedule, shots 3 and 4 are struck from its shot
list, and its risk 1 no longer covers the solar page.

Photos may be requested from ClearWorld through leadership. If any arrive they
are an upgrade to a page that already works, never a dependency, and never a
reason to hold the page or leave a gap in the layout.

Two questions are open and both must be answered before any supplier-provided
photo goes on the site:

1. **Vendor neutrality.** Positioning is technology-agnostic and ClearWorld is
   not named as the provider. Supplier photography shows identifiable supplier
   hardware, so publishing it risks reading as a ClearWorld product page even
   without a credit line. Unresolved.
2. **Usage rights.** No license, term, territory, or credit requirement has been
   established for any ClearWorld image. Unresolved. Nothing gets published
   without written permission on file.

Until both are resolved, treat supplier photos as unusable, whatever arrives and
whenever it arrives.

---

## Google Ads bidding and the `/consultation/` freeze

**Unresolved.** Conversions are running below the 15 to 20 threshold the bidding
switch needs, so the switch off Maximize Clicks is unlikely to happen before the
conference. Every part of the plan that was conditioned on the switch should now
be treated as not happening rather than as pending.

**The `/consultation/` freeze decision is deferred.** Three options are under
consideration and none is chosen:

1. **Leave it frozen.** No visual change, no data disruption. The page ships
   through the conference on the old brand.
2. **Rebrand it anyway and accept the data cost.** The page matches the rest of
   the site, at the cost of disturbing the conversion path while bidding is
   still on Maximize Clicks.
3. **Pause the campaign during the change.** Rebrand with no live traffic
   crossing the change, at the cost of paused spend and a gap in the data.

**Why this matters more than a normal frozen page:** `/consultation/` is the
sole landing page for the ads, and it is the only route to a Calendly booking
anywhere on the site. Leaving it un-rebranded means the one paid landing page,
and the only booking path, still looks like the old company while every other
page carries the new brand. Conference traffic arriving through an ad lands on
the old design.

Note also that the two consultation pages do not load `styles.css` and are
fully self-contained, so they will not pick up any part of the rebrand
incidentally. Whatever is decided has to be done deliberately.

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
- 175 distinct color values, 5310 occurrences. **37** custom properties across
  four disconnected `:root` blocks, with 301 raw literals bypassing them.
  Roughly 63 percent of color usage ignores existing tokens.

  **Corrected 2026-08-07:** this line read 36. The verified count is 37:
  `styles.css` 13, `css/article.css` 12, `css/resources.css` 5,
  `css/state-map.css` 7. `css/style.css` defines none. All 37 live in `:root`;
  no stylesheet defines a custom property in any other selector.
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

## Pass 2a: what shipped

Twelve primitives in the `styles.css` `:root`, each at today's value:
`--blue-brand`, `--blue-alt-tmp`, `--blue-accent-tmp`, `--blue-deep`,
`--text-1`, `--text-2`, `--text-3`, `--surface-page`, `--surface-card`,
`--surface-dark`, `--border-1`, `--border-2-tmp`. Seven aliases in the same
file, fifteen cross-file references with literal fallbacks. No selector was
edited, no inline payload was touched.

### The `-tmp` convention

`grep -- -tmp styles.css css/*.css` returns **exactly the set Pass 2b
eliminates**, and nothing else. Three names carry it:

| Name | Value | Why it exists | 2b |
|---|---|---|---|
| `--blue-alt-tmp` | `#0A68FF` | was `--brand-blue` | folds into `--blue-brand` |
| `--blue-accent-tmp` | `#2563eb` | was `--clr-accent` | folds into `--blue-brand` |
| `--border-2-tmp` | `#cbd5e1` | was `--state-inactive` | folds into `--border-1` |

They exist only because the alias table collapses these onto targets that hold
a different value, which cannot be done while the pass is pixel-identical. When
the grep returns nothing, that part of 2b is finished.

### Scheduled for 2c: rename `--blue-brand` to `--blue`

The canonical blue could not be named `--blue` in 2a. `contact/index.html`,
`contact/thank-you/index.html`, and `calculator/report/index.html` define
`--blue: #1a73e8` in their body-level `<style>`, which permanently outranks
`styles.css`. Simulated in a browser at the real cascade position: defining
`--blue` in `styles.css` and aliasing `--brand` to it flipped `--brand` from
`#0b6efd` to `#1a73e8` on those pages, reaching rendered output through
`.skip-link` and `.footer-links a:hover`.

**2c task, do not lose this:** when the inline payloads are rewritten and the
colliding `--blue` definitions are removed, rename `--blue-brand` to `--blue`
across `styles.css`, `css/resources.css`, and `css/state-map.css`. Until then
the name stays. This is the one place the shipped token layer deviates from the
naming scheme in `docs/design-direction.md`.

### Token count goes UP in 2a, and that is expected

2a adds 12 primitives and keeps all 22 old names as aliases, while the inline
payloads keep every literal they had. Total token count therefore rises, and
the diff reads as more complexity, not less.

This is the intended shape. The simplification lands later: 2b removes the three
`-tmp` primitives by collapsing values, and 2c removes the aliases and tokenises
the inline payloads. Anyone reviewing the 2a diff expecting a reduction should
read this paragraph first. A pass that reduced the count now would not be
pixel-identical.

---

## Token layer findings, recorded before Pass 2a

Established by read-only discovery on 2026-08-07, on `dc1b490`. Several of these
constrain Pass 2a and Pass 2b directly.

### 1. Four pages override `styles.css` permanently, from the body

`contact/index.html`, `contact/thank-you/index.html`, `calculator/index.html`,
and `calculator/report/index.html` each carry a **second** inline `<style>`
block in the **body**, far below the `styles.css` link in the head. Being later
in document order, it wins the cascade permanently. This is not a first-paint
flash; it is the settled state.

Verified in a browser on `/contact/`: `--muted` resolves to `#6b7280` and
`--bg` to `#f7f8fb`, not the authoritative `#64748b` and `#f8fafc`.

Consequences:

- **The site renders two different greys today.** Any `styles.css` rule using
  `var(--muted)` produces `#6b7280` on these four pages and `#64748b`
  everywhere else. Pre-existing, not introduced by the rebrand.
- **Pass 2a cannot change these pages by editing `styles.css`.** That is
  convenient for pixel-identity: they are immune. Do not treat their unchanged
  rendering as evidence the token layer works.
- **Pass 2b and 2c must handle them explicitly.** Rewriting `var(--muted)` to
  `var(--text-3)` inside `styles.css` would escape the inline override, because
  the body block defines `--muted` but not `--text-3`. Those four pages would
  silently change colour. Any such rewrite needs these pages checked by hand or
  the body block updated in the same commit.

### 2. Inline `--blue` is defined at two values under one name

| Value | Pages |
|---|---|
| `#1a73e8` | `contact/`, `contact/thank-you/`, `calculator/report/` |
| `#0b6efd` | `calculator/` |

Both drive `.btn-primary`, so the same component renders in two different blues
depending on which page it is on. `--blue-600` splits the same way, `#1557b0`
against `#005CE6`.

This is inline-only and has no authoritative counterpart, so it is not a Pass 2a
conflict. It matters at **2c**, because `--blue` is also the name of the target
canonical primitive. When the inline payloads are finally tokenised, these four
definitions collide with the real `--blue` and must be renamed or removed rather
than merged.

### 3. Broken `@media` in the inline critical CSS on 39 pages

The `@media` keyword is missing before the 768px breakpoint:

```
@media(max-width:1024px){...}}(max-width:768px){...}
```

The parser drops the entire block. Confirmed in a browser on `/contact/`: the
first inline sheet exposes exactly one media query, `(max-width: 1024px)`, and
the 768px rules are absent from the CSSOM.

The dropped rules include `.nav-toggle{display:flex}` and the whole mobile nav
panel, so **on narrow viewports the mobile nav is unstyled until `styles.css`
arrives**, which on these pages is async.

Affected: 33 state pages, plus `services/`, `resources/`, `faq/`, `contact/`,
`about/`, and `articles/parking-today-small-lots/`. The 72 generated article
pages are clean; the template does not carry the defect.

**Assigned to Bundle B**, which already rewrites these payloads. The fix is
inserting five characters. Pre-existing, and explicitly NOT Pass 2a work.

**Warning for the Pass 2a verification:** the first-paint check with
`styles.css` blocked will surface this and it will look like a regression the
pass caused. It is not. Baseline it before 2a starts.

### 4. Cross-file token references need literal fallbacks

Pass 2a makes `styles.css` the single source for shared primitives, with the
other stylesheets referencing them. That creates a load-order dependency, and
the dependency is not safe bare.

Measured browser behaviour: a custom property whose value is `var(--undefined)`
becomes guaranteed-invalid, and the consuming declaration falls back to
**inherit**, not to anything sensible. A probe with a red parent rendered
`rgb(200,0,0)` where `#0f172a` was intended. The same probe written
`var(--text-1, #0f172a)` resolved correctly.

The window is real, and on some pages it is deterministic rather than a race:

- `resources/states/{colorado,minnesota,texas,wisconsin}/index.html` load
  `css/resources.css` **synchronously** while `styles.css` loads **async**. A
  sync sheet blocks rendering; the async one applies whenever it lands. So
  `resources.css` is guaranteed to be applied while `styles.css` may not be, on
  every single load of those four pages.
- Elsewhere it is a size race. `styles.css` is 40,661 bytes against
  `css/article.css` at 13,234, so the smaller file can win on a congested link.
- If `styles.css` ever fails outright, bare references turn a graceful
  degradation into a visible colour regression.

**Rule for 2a:** every cross-file reference carries a literal fallback equal to
today's value, `var(--primitive, #literal)`. The fallback is a degradation
value, playing the same role the inline critical CSS literals already play, not
a second source of truth. A verification step asserts every fallback matches its
primitive's current value so 2b cannot drift them apart silently.

---

## Pass plan

- **Pass 2a:** COMPLETE. Token layer established, no visual change. One `:root`
  in `styles.css` is the single source of truth for colour; the other three
  stylesheets keep the names their own rules consume but reference the
  primitives. 22 colour names collapsed onto 12 primitives, all at today's
  values. Verified pixel-identical. Details below.
- **Pass 2b:** consolidate near-duplicates. Resolve three blues to one, 16 whites
  to three, 10 greys to one, 96 shadows to four, 20 radii to four. Small
  deliberate visual change, needs sign-off on which blue wins.
- **Pass 2c:** sweep inline `<style>` across 119 pages. Scriptable for the 45
  uniform ones, manual for the 4 bespoke.
- **Consultation pages** deferred to their own pass. This was gated on Google Ads
  bidding switching off Maximize Clicks. That switch is now unlikely before the
  conference and the freeze decision is deferred. See "Google Ads bidding and the
  `/consultation/` freeze" above.

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
- `/consultation/` visual changes remain on hold. The original condition was the
  Google Ads bidding switch off Maximize Clicks, which is now unlikely before the
  conference. The hold stands until the freeze decision is made. Do not touch
  these pages on the assumption that the switch is coming.

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
- [ ] Confirm Google Ads bidding status. Do not treat this as a blocker. The
  switch off Maximize Clicks is unlikely to have happened, and the merge proceeds
  either way. Record the actual state and whichever `/consultation/` option was
  taken
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
- Stale asset cleanup: eight dead stylesheets (four `.min`, four `critical/`),
  `postcss.config.js` with no npm script, `tools/build.js` unwired, and
  `images/logo.png` at 1.2 MB referenced by nothing.

  **Corrected 2026-08-07:** `css/style.css` was previously listed here as a
  ninth dead stylesheet. It is not dead. `css/article.css:1` pulls it in with
  `@import url('/css/style.css')`, so it loads on 103 pages. Deleting it would
  have broken them. Removed from this list.
- `images/Logo.svg` deletion once the header no longer references it.
- Vector logo redraw for print and embroidery.
- Transparent versions of the tagline lockup and ClearWorld co-brand lockup.
- `sitemap.xml` lists `/ask-the-experts.html`, which 308-redirects.
- **Decide how `sitemap.xml` should be generated.** Two questions, one pass.
  First, should `generate:sitemap` stay wired into `npm run build`, given that
  every rebuild rewrites the file whether or not content changed. Second, and
  the more substantive one, should `lastmod` be derived per URL from actual
  content change rather than rewritten wholesale. Today 8 static routes take
  `lastmod` from `new Date()` on every run and the state and video pages take it
  from file mtime, so any `<head>` sweep moves dates on pages whose content is
  untouched. Only the article entries, which read `data/resources.json`, behave
  correctly. During the rebrand the workaround is to revert the file after each
  rebuild; see the sitemap section in `CLAUDE.md`.
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
