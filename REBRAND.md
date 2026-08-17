# Rebrand Working Document

This file changes constantly. It holds decisions and status for the rebrand.
Durable project rules live in `CLAUDE.md`.

Last updated: 2026-08-11
Target: Las Vegas conference, **Monday Sep 14 2026 (CONFIRMED)**

---

## Current pass

**Status: the nav and footer sweep is complete and pushed. The What We Do menu is finished.**
Bundle B, Pass 2b-b, the homepage, the 73 article pages, the 28 state subpages,
the 30 video pages, `/services/`, `/services/solar-lighting/` and
`/services/ev-charging/` are all done. All three pillars now have real pages or
a settled answer: solar and EV have pages, parking keeps the `#parking` anchor
permanently by decision.

The 30C tax credit claims are removed site-wide. The credit expired June 30
2026 and the article at that URL is now a retrospective.

The nav and footer sweep has run. All four What We Do destinations are settled:
three pages and one anchor, every surface agreeing. See the settled-destinations
table in the services section.

**Next: the calculator reskin**, week 5 in the execution plan.

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

**SUPERSEDED 2026-08-14.** This paragraph used to say the two consultation
pages were frozen, did not load `styles.css`, and were the only pages permitted
to reference `fonts.googleapis.com` or `fonts.gstatic.com`. All three are now
false. Both pages load `styles.css`, both use the self-hosted Inter, and **there
are now zero Google Fonts references anywhere on the site.** Any check that
expects to find two is wrong.

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

## Google Ads bidding and the `/consultation/` rebrand

**Bidding: unresolved.** Conversions are running below the 15 to 20 threshold
the bidding switch needs, so the switch off Maximize Clicks is unlikely to
happen before the conference. Every part of the plan that was conditioned on the
switch should be treated as not happening rather than as pending.

**The freeze decision is DECIDED and DONE, 2026-08-14: option 2, rebrand with
the campaign live.** No pause, no gap in spend. The deploy date is to be
annotated in both Google Ads and GA4 so the before-and-after is readable later;
that is on the merge-day checklist below, and it is the only thing that makes
the data cost recoverable. The three options previously listed here are closed.

Both pages are now on `styles.css` and the band system. They were the last two
on the old design, and they carried the last two Google Fonts links on the site;
there are now zero.

### The page was inverted, and that reversed my own recommendation

The audit recommended keeping Calendly and demoting the callback form to a line
of text, on the reasoning that a booked meeting beats a task in someone's inbox
and that offering two conversion mechanisms side by side converts worse than
offering one. The form was cut on that basis in `33d7191`.

**That recommendation was wrong, and it was wrong because it was made without
conversion data.** The form converts better than Calendly on production. It was
restored in `b8fa637` as the PRIMARY mechanism, in the hero, with Calendly
demoted below the proof strip as the alternative for people who would rather
book a time directly.

The general principle still holds: one primary mechanism, not two competing
ones. What was wrong was picking which one, from the armchair, when the answer
was already sitting in the account. **Anyone revisiting this should check the
conversion data before changing which mechanism leads.**

### Fold positions, measured

The whole point of the restructure. Everything below is measured in a browser,
not estimated.

| | Before | After |
|---|---|---|
| Calendly section, 1440 | 4,332px | **888px** |
| Calendly section, 375 | 6,091px | 1,280px |
| Page height, 1440 | 5,917px | 3,874px |
| Contrast failures | 6 | 0 |

Then the page was inverted, so the number that matters became the form, not
Calendly. After the inversion and the mobile disclosure:

| Viewport | Form submit button | Fold | Result |
|---|---|---|---|
| 1440x900 | 756px | 900 | clears |
| 768x1024 | 692px | 1024 | clears |
| 375x812 | 772px | 812 | **clears by 40px** |

At 375 the submit was 148px BELOW the fold before the disclosure. Calendly now
sits at 1,347px at 1440 and 1,805px at 375, which is the expected cost of
putting the form first and is not a regression.

### The mobile disclosure

Below 768px the two optional fields, email and property type, collapse behind an
"Add email or property type" toggle, so the fold shows Name, Phone, Submit.
Above 768px the toggle is not rendered and all four fields are visible.

**Collapsed fields still submit.** `display:none` suppresses layout, not
submission; only `disabled` would stop them. Verified by intercepting a submit
at 375 with the pair collapsed: all seven fields present, `_replyto` and
`property_type` empty, required fields carrying values. Do not "fix" this by
adding `disabled`, and do not move the required pair inside the wrapper.

### Copy and keywords

The h1 was "Your Parking Lot Is Sitting on Untapped Revenue", which restated the
searcher's own premise. It is now "Parking Revenue Consultants for Property
Owners". Of the 18 phrase-match keywords, five management-intent terms
(parking consultant, parking lot management company, office/hotel/private lot
parking management) previously had nothing on the page to match. "Consultants"
answers them. "Charging for parking" carries the two how-to terms verbatim.

`e33c0a5` added an LPR and enforcement tile: "LPR parking system" and "parking
enforcement solutions" were being bought against a page where "enforcement"
appeared once, inside a statistic, and "LPR" appeared not at all. The tile
states the acronym as well as the expansion, because a phrase-match buy on "LPR
parking system" does not match "license plate recognition".

First person went from 17 instances to zero. Body copy 542 to roughly 470 words.

### Open items on this page

- **CLOSED 2026-08-16: "nationwide service" in the hero trust ticks is
  substantiated.** Confirmed by Ben. **This is no longer an open item and
  should not be re-flagged.** It is recorded here rather than deleted because
  the claim was carried as unsubstantiated across several passes, on the
  reasoning that the only verified case study is one lot in Wisconsin, and the
  next audit that greps the hero copy will otherwise raise it again. Same
  treatment as the "$2,500" referral figure on the video page. It remains
  ungated, which was always deliberate, so the copy stays a content decision
  rather than a gate failure.
- **There is no revenue share number anywhere on the page, and the number is
  now with leadership.** A skeptical owner asks how the company makes money
  before anything else, and on a paid landing page that silence is louder than
  a number would be. The page says "no upfront cost" four times over and never
  says what the arrangement is. **Status as of 2026-08-16: pending a decision
  from leadership.** Still the single biggest remaining credibility gap on the
  page, but it is no longer waiting on anyone here; it is waiting on that
  decision, and the wording follows once the number is settled.
- **The `_next` relative value is unverified against Formspree.** Both `_next`
  and the JS redirect were changed from an absolute production URL to
  `/consultation/thank-you/`, so a preview submission no longer navigates to the
  live site and fires a real Ads conversion. The JS handles every normal
  submission, so `_next` only matters with JavaScript disabled. Confirming
  Formspree accepts a relative value needs a live no-JS submission, which would
  fire a real conversion, so it has not been done.

Note that the pages no longer stand outside the design system: they load
`styles.css` like everything else. Their header and footer still diverge from
the frozen chrome on the other 150 pages, deliberately, because a landing page
should not offer navigation away from itself.

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

## NEXT SESSION STARTS HERE: the services hub restructure

**State: Bundle B is COMPLETE and pushed. Pass 2b-b went with it.** Scope was
held in full; no cuts were taken. The dropdowns and the nav restructure both
shipped.

Next scheduled work is the homepage rebuild, then the services hub restructure
(which owes `/services/` its `#solar` block and anchor).

Read first, in this order:

1. This section, then "Bundle B: the four commits" below for what shipped.
2. `docs/preview/homepage.html`, the approved visual reference.
3. `docs/execution-plan.md` weeks 3 and 4.

**Tooling now lives in the repo, not the scratchpad.** `tools/guards.js` with
its committed baseline at `tools/guards.baseline.json`, and the per-pass sweep
and gate scripts in `tools/rebrand/`. Run
`node tools/guards.js capture` **before the first edit of a session** only if a
guard block is being changed deliberately; otherwise run
`node tools/guards.js verify` after every commit. See `CLAUDE.md` for the
sweep-script conventions and the deliberate-diff gate pattern.

**The guard counts are 151 noindex and 150 gtag, and both include
`templates/article-index.html`.** There are 150 rendered pages; the template is
the 151st file carrying the blocks. A checker that enumerates rendered pages
only reports 150/149 and looks like a regression. This cost one false alarm
already, so the totals are asserted in the script rather than merely printed.

Raised from 150/149 on 2026-08-12 when `services/solar-lighting/index.html` was
added, the first file addition of the rebrand. See the recapture procedure in
`CLAUDE.md`; the short version is that `capture` must be gated on a diff showing
exactly one added entry and zero changed hashes, or it will quietly absorb an
unrelated drift.

### Bundle B: the four commits

| # | Contents | State |
|---|---|---|
| 1 | `@media` keyword fix (39 pages) + `.nav-toggle` specificity fix (114 pages) | **DONE `3c81447`** |
| 2 | Navy chrome, header/footer markup on 148 files, logo swap with `width`/`height`, nav restructure with dropdowns, `/services/` anchors, scroll-offset move, mobile panel to navy | **DONE `fe0d420`** |
| 3 | Inline payload recolor (886 literals, 117 pages, hex only) + `--blue` to `--btn-blue` in the 4 body blocks + `--blue-brand` to `--blue` | **DONE `4cac959`** |
| 4 | Pass 2b-b primitive retarget: 15 values changed, 23 primitives deleted | **DONE** |

Counts that differed from what this file predicted, all reconciled:

- **Header, footer and nav markup were byte-identical across all 148 files**,
  one hash group each, so each was a single substitution rather than a
  per-group sweep. The inline header rules were likewise one contiguous
  1675-byte region identical across all four payload groups.
- **7 head payloads, not 9.** The nine counted the two consultation payloads,
  out of scope at the time. Commit 3 touched seven. (Both consultation pages
  were rebuilt on 2026-08-14 and now carry `.page-consultation` payloads; this
  bullet records the count as it stood for that commit.)
- **`--blue-brand` had 17 occurrences, 3 of them in comments.** Code-only count
  is 14.
- **37 references were repointed in 2b-b, not 34.** 38 references exist to the
  21 flat folded names; one is a `--blue-accent-tmp` stop inside the hero
  gradient and is consumed by the gradient fold, leaving 37.

Commits 2 to 4 are pushed together. Rules that still apply: every scripted edit
anchored whitespace-insensitively with an exact expected-count assertion that
fails loudly; every gate prints the count it checked; the first-paint gate is
**rewritten as a deliberate-diff gate**, never reused from 2a.

**The 8-page indentation variance is live.** `index.html`, `about/`, `faq/`,
`resources/`, `contact/`, `contact/thank-you/`, `calculator/`,
`calculator/report/` indent `<header class="site-header">` with four spaces; the
other 139 use two. A script anchored on the literal two-space form silently
skips the homepage.

### Bundle B: approved dropdown implementation

Approved as specified. The prototype's own version is **not** the contract: it
ships bare `<button class="nav-trigger">` elements, so with JS off both menus
are dead controls and `/services/` is unreachable from the nav.

**Markup shipped to 147 pages, which is itself the no-JS fallback:**

```html
<div class="nav-item">
  <a class="nav-trigger" href="/services/" data-nav-panel="panelWhat">
    What We Do
    <svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
  </a>
  <div class="nav-panel" id="panelWhat" hidden>
    <a href="/services/">All Services</a>
    <a href="/services/#parking">Parking Revenue &amp; Management</a>
    <a href="/services/#solar" class="scope-green">Solar Lighting</a>
    <a href="/services/#ev" class="scope-green">EV Charging</a>
  </div>
</div>
```

A real `<a href>`, upgraded in place by JS, **not** a `<button>` and **not**
swapped at runtime. Rationale: element surgery on 147 pages risks a load-time
layout shift and leaves a window where the control is neither; upgrading in
place means that if `script.js` throws anywhere before the nav block, the
trigger degrades to a working link. `hidden` is toggled rather than a class, so
the no-JS state and the closed state are the same mechanism and panel links stay
out of the tab order when closed. The `All Services` row exists so the parent
page stays reachable once JS intercepts the trigger.

On init each `.nav-trigger` gets `aria-expanded="false"`, `aria-controls`,
`aria-haspopup="true"`.

| Input | Behaviour |
|---|---|
| Click / `Enter` | `preventDefault()`, toggle panel, focus stays on trigger |
| `Space` | `preventDefault()` to stop scroll, toggle |
| `ArrowDown` on trigger | open, move focus to first panel link |
| `ArrowUp` / `ArrowDown` in panel | move between links, wrapping |
| `Home` / `End` in panel | first / last link |
| `Escape` | close, return focus to the trigger |
| `focusout` of `.nav-item` | close, handles Tab-out |
| Click outside `.nav-item` | close |
| Hover | open, **gated to `(hover:hover) and (min-width:769px)`**, 150ms close delay |

One panel open at a time. At **≤768px the panels render inline as an accordion**
rather than absolutely positioned, and the hover handlers are **not bound**.

Lives in `script.js`, which is loaded `defer` by **147 of 149** pages; the two
that do not are the two consultation pages, which have no dropdown. Roughly
60 lines. `script.js` today is 44 lines with no focus, key or disclosure
handling of any kind, so this is entirely net-new.

**Verification.** Automated: `aria-expanded` flips, `hidden` toggles, exactly
one panel open at a time, every trigger has a matching panel id, `node --check`.
Manual: keyboard-only traversal of both menus, `Escape` from an open panel,
Tab-out, and **the no-JS case tested by blocking `/script.js`**, where the
trigger must navigate to `/services/`.

Cut line 1 if the pass overruns, per the standing cut order.

### `What We Do` is a deliberate exception to the first-person rule

**Decided. Do not flag this again.** The nav label `What We Do` contains "We"
and so reads as a violation of the no-first-person content rule in `CLAUDE.md`.
It is not. That rule targets body copy; `What We Do` is a menu label, not prose,
and it is the wording in the approved prototype and in the approved dropdown
markup above. It ships as written, in the header nav and in the footer column
heading.

The rule is otherwise unchanged and still applies to every piece of body copy,
meta description, and generated text.

### Known soft link: `/services/#solar` CLOSED

**Resolved 2026-08-12.** The services restructure gave the solar pillar card
`id="solar"` with `scroll-margin-top: 88px`, and `/services/solar-lighting/`
now exists behind it. All three anchors verified behaviourally. This entry is
kept rather than deleted so the history of the deadline is legible; the issue
itself is closed.

### Finding: `.nav-toggle` was hidden by source order, on 114 pages

Fixed in `3c81447`. Recorded because the mechanism is not obvious and the same
shape may recur elsewhere in the payloads.

In the inline critical CSS the base rule `.nav-toggle{display:none;…}` sits at
byte 2072, **after** the `@media(max-width:768px)` block at byte 1615 that sets
`display:flex`. Both selectors are `(0,1,0)`, so the later one won and the
hamburger never appeared at first paint. `styles.css` has the correct order,
which is why the bug was first-paint only and invisible once the async
stylesheet landed.

**Fixed by specificity, not reordering:** `.site-header .nav-toggle{display:flex}`
is `(0,2,0)` and wins regardless of position. Reordering the payload would have
been a much larger and riskier diff.

**It was masked by the malformed `@media`** and only became visible once that was
fixed: with the block being dropped entirely, the ordering never mattered. It
affected **all 114 pages carrying the rule, zero were correct**, not just the 39
with the malformed keyword. The expected-count assertion caught the difference,
which is the argument for asserting counts rather than trusting a regex.

### Blocked on `assets/brand/MP_Logo_dark.png`

Ben is producing the solid dark variant and committing it separately. Until it
lands, both of these stay as they are, deliberately:

- **JSON-LD still points at `images/Logo.svg` on 33 pages, not one.** This entry
  previously named `about/index.html:47` only. That was an undercount, found
  during Bundle B commit 2 when a gate asserted the wrong number and failed.
  The full set:

  | Pages | Schema field |
  |---|---|
  | `about/index.html` | `LocalBusiness` → `logo` |
  | `ask-the-experts.html` | `publisher` → `logo` |
  | `contact/index.html` | `logo` |
  | 30 pages under `resources/videos/*/index.html` | `Organization` → `logo` → `ImageObject` → `url` |

  Every one is a structured-data value consumed by search engines and rendered
  **on white**. `MP_Logo_400.png` is a silver gradient on transparent and is
  close to invisible on white, so repointing any of them would be worse than
  leaving it. The prototype's own logo note reasons only about placements on
  that page and concludes the dark variant does not block the web build; that is
  correct for the page and wrong for structured data.
- **`images/Logo.svg` is NOT deleted**, because the JSON-LD still references it.

**Every `<img>` reference is now gone, including the last two.** Bundle B commit
2 swapped the header and footer to `MP_Logo_400.png` on all 148 files. The two
consultation pages were the only survivors and were fixed in `f2b1b14`.

**But `Logo.svg` is still referenced 33 times in JSON-LD**, as the `logo` and
`url` values on `about/`, `contact/`, `ask-the-experts.html` and 30 video pages.
Those are structured-data values, not rendered images, and they are the reason
the asset cannot be deleted yet. Do not read "the img references are gone" as
"the old logo is gone"; the sweep below is still outstanding.

Once the asset is committed: repoint the JSON-LD on all 33 pages to the
absolute production URL for the new file, then delete `Logo.svg`, then confirm
zero remaining references. This is a 33-page sweep, not the one-line edit this
section used to imply.

**If Bundle B is otherwise complete and the asset has not landed, say so rather
than working around it.**

---

## Homepage rebuild: the reusable systems

The homepage was ported from `docs/preview/homepage.html` on 2026-08-10. The
port itself matters less than the two systems it establishes. Both are built to
be inherited by the services hub, the article template and the state pages.
Anything still homepage-specific is scoped to `.page-home` and is expected to
be rewritten or promoted later.

### Why everything is scoped, and what that buys

Nothing in either system is a bare global class. That is not stylistic caution,
it is a hard constraint discovered during discovery:

| Class | Already used by | A bare global rule would |
|---|---|---|
| `.eyebrow` | `templates/article-index.html:176`, so all 73 article pages | restyle every article hero eyebrow |
| `.stat` | `services/index.html` | restyle the services stats |
| `.icon` | 12 bare uses on calculator, contact/thank-you, calculator/report | resize existing icons |
| `.btn` | calculator and contact inline payloads | add height and padding their blocks do not override |

So the section system is scoped to `.band`, which is a new class with zero
existing consumers, and the motion system keys off `data-*` attributes, which
collide with nothing.

### Section system: how a page opts in

```html
<section class="band band--page">
  <div class="band__inner">
    <span class="eyebrow">Section label</span>
    <h2 class="h2">Heading</h2>
    <p class="lede">Supporting sentence.</p>
  </div>
</section>
```

| Class | What it is |
|---|---|
| `.band` | the section wrapper and the opt-in. Vertical rhythm from `--band-y` |
| `.band--sm` | compressed rhythm, `--band-y-sm`, for demoted sections |
| `.band--page` `.band--card` `.band--sunken` `.band--navy` | the four surfaces |
| `.band__inner` | the 1200px container. **Not** `.container`, which is 1100px and consumed by every other page |
| `.eyebrow` `.eyebrow--green` | uppercase tracked label. Green variant is scoped to solar and EV per the green rule |
| `.h2` `.h3` `.h4` `.lede` `.section-head` | type scale inside a band |
| `.silver` | the silver gradient display treatment, with a solid inverse fallback first so text is never invisible |
| `.stat-num` `.stat-rule` `.stat-label` | the stat display |
| `.tile` `.tile--flush` | the shared card treatment. `a.tile` lifts on hover |
| `.band-grid` `--2` `--3` `--4` | responsive grids, collapsing at 1024, 768 and 640 |
| `.btn` `--primary` `--secondary` `--ghost` `--lg` | the button system, band-scoped |
| `.icon` `.icon--sm` | inline SVG sizing |

`.band--navy` automatically re-tints the eyebrow, lede, stat label, secondary
button and focus ring for a dark surface, so a navy section needs no extra
classes.

**Focus rings.** `.band :focus-visible` gives a 2px ring, blue on light
surfaces and white on `.band--navy`. Bundle B covers the chrome separately.
Without this rule band content fell back to the UA ring, which is not reliably
visible on navy.

### Motion system: effects, opt-in, and where it lives

Code lives in `script.js` (loaded `defer` by 147 of 149 pages) and `styles.css`.
Nothing is inline on any page. Exported as `window.MPMotion`.

| Attribute | Effect |
|---|---|
| `data-reveal` | entrance reveal: fades and rises 16px into place |
| `data-reveal-group` | staggers the `[data-reveal]` children beneath it, `i * 70ms` capped at 420ms |
| `data-count-to="178"` | counts a number up to its final value over 900ms at 40% visibility |

Only `opacity` and `transform` are animated.

**The never-invisible technique. There is no global hiding class.** The
prototype added `is-motion` to `<html>` and hid every `.reveal` beneath it,
which means that on a slow connection content paints visible, then gets hidden,
then fades in. Instead, JS arms elements one at a time and **only ever arms an
element that is currently off screen**. An element already in the viewport is
marked handled and is never hidden. The consequences:

- JS absent, blocked, slow or throwing: nothing is ever armed, so nothing is
  ever hidden. Verified by loading the page in a sandboxed frame with scripts
  blocked: 27 reveal targets, 0 armed, 0 at zero opacity, counters showing
  their final values.
- `styles.css` arriving late: an armed element is off screen anyway, so the
  hiding rule cannot produce a visible flash.
- `prefers-reduced-motion: reduce`: JS arms nothing, and a CSS media query
  neutralises the armed state as a second line of defence.

Count-up targets carry their final value as text in the HTML, so a JS failure
shows the real number.

### Late-arriving content, which is what the article pass needs

`js/article.js` runs `init()` on `DOMContentLoaded`, then awaits a fetch, then
assigns `#article-body.innerHTML`. Anything registered at parse time sees zero
targets on an article page, and any node observed inside `#article-body` is
destroyed by the swap.

The mechanism is a **MutationObserver on `document.body`** (`childList`,
`subtree`), coalesced with a 50ms timer, which rescans for unhandled
`[data-reveal]` and `[data-count-to]`. Plus `window.MPMotion.scan(root)` for an
explicit call.

**It requires no change to `js/article.js`**, which is the property that
matters: that file carries both the gtag gate and the noindex guard, and any
edit there complicates the merge-day reverts. The article template opts in by
adding `data-reveal` to its markup and nothing else.

**Use a timer, not `requestAnimationFrame`, for the coalescer.** The first
implementation used rAF and stalled: rAF does not fire in a hidden or
background tab, and the `pending` flag latched, so every later mutation was
ignored even after the tab became visible. Caught in verification when injected
content was never armed. `clearTimeout`/`setTimeout` is self-healing.

Verified against the real article shape: an `innerHTML` assignment into an
off-screen container armed both new elements, and a second `innerHTML` swap into
the same container armed the replacement too.

---

## Article pages: PORTED

**`docs/preview/article.html` is the approved visual reference for article
pages.** Approved 2026-08-11, ported the same day. It holds the same status for
the 73 article pages that `docs/preview/homepage.html` holds for the homepage:
the standard the pages are built against, authoritative for layout, rhythm,
typography and component treatment, not for colour. Colour resolves through the
`styles.css` primitives.

Same self-contained rule as the homepage prototype: it imports nothing and
nothing imports it. Keep it that way, and update it first when the article
design changes.

`docs/preview/article-snapshot.html` is the evidence it was designed against and
stays with it.

### What shipped

| File | Change |
|---|---|
| `templates/article-index.html` | new `<main>`, new body class, article half of the inline payload rewritten. Head, both guards, Bundle B header and footer byte-identical |
| `css/article.css` | append only, everything new scoped under `.article-read` |
| `script.js` | append only, `window.MPArticle` for the table of contents |
| `articles/{slug}/index.html` | 72 regenerated, plus `parking-today-small-lots` hand-ported |

`styles.css`, `css/style.css`, `js/article.js`, every body fragment,
`data/resources.json` and `sitemap.xml` were not touched.

### Decisions and constraints from the port

Three permanent constraints came out of this and are recorded in `CLAUDE.md`
rather than here, because they outlive the rebrand: `.article-hero` must stay
inside `#article`, nothing may live inside `#article-meta`, and the
`background-image: none !important` on the hero is load-bearing.

Two more, specific to this pass:

- **The reading-progress rule was not ported.** It lived inside `.site-header`
  in the preview, and the Bundle B header is frozen. Shipping the JS for an
  element that does not exist would have been more dead code, so it was left
  out entirely. The scrollspy's active-section highlight is the position signal
  instead. Revisit if the header is ever reopened.
- **The bottom CTA still renders first-person copy.** `js/article.js:136`
  overwrites `#article-footer-copy` at runtime, so the compliant copy in the
  template never appears. Deliberate: that file is not edited for copy alone.
  Already on the post-Vegas backlog.
- **Related cards do not animate, by decision.** `buildRelatedCard()` never adds
  `data-reveal`, so the `data-reveal-group` on `#related-list` had zero targets.
  The attribute was removed rather than adding `data-reveal` in `js/article.js`.
  Adding it there buys a staggered fade on four cards below the CTA band, at the
  cost of editing the file carrying both guards. Not worth it on a reading page.
  Revisit only if that file is being opened for another reason.

### RESOLVED: the standalone CTA paragraphs in the fragments

Decided and done 2026-08-11. **Delete the `/contact/` ones, keep and normalise
the `/calculator/` ones.**

Rationale: the contact ask is already made twice on every article, by the sticky
rail and the navy CTA band, so a third copy in the prose was redundant. The
calculator paragraphs are the only body-level path to the calculator, which is
otherwise reachable only from the header and the CTA band, so they earn their
place.

| | Before | After |
|---|---|---|
| Standalone `/contact/` CTA paragraphs | 10 | **0** |
| Standalone `/calculator/` CTA paragraphs | 12 | **12** |
| Of those, using first person | 13 of 21 | **0** |

Nine were clean whole-paragraph deletions. **One could not be deleted:**
`articles/what-is-parking-monetization.html` carried both links in a single
sentence ("Use our parking revenue calculator ... **or** schedule a
consultation"), so removing the paragraph would have taken out a calculator CTA
that was meant to stay. The contact clause was dropped and the calculator half
kept.

Checked before deleting, and clean in all nine cases: none carried a
cross-article link, and every one was preceded by a paragraph that stands on its
own, so no section was left empty and no transition sentence was left dangling.
Three of the nine were the last line of their file with a blank line above, so
the trailing blank was reclaimed to keep the single-newline EOF.

The 12 calculator paragraphs were rewritten against the house style the 8
compliant EV articles already used: no first person, second-person framing, a
specific next step. Mostly "our" to "the". Two got more: the
`paid-parking-seasonal-destinations` copy lost "based on comparable seasonal
markets", which described a calculator method that is not verified anywhere,
and `dynamic-pricing-guide` gained the specificity its one-line version lacked.

**Option 2 from the original question, restyling them as a distinct inline
component, was not taken and should stay untaken.** It would mean adding a class
to 12 fragments and would reintroduce the mid-article interruption that
disconnecting `insertInlineCta()` removed.

### The original preview record

`docs/preview/article-snapshot.html` is the evidence it was built on. Article
markup exists in no source file, so the preview was designed against a settled
DOM captured from `/articles/flexible-parking-rules/` after `js/article.js`
finished its fetch and its `innerHTML` assignment. That article was chosen
because it is the only one that exercises the series path, `.series-box`,
`.series-cards`, `hr`, `ol`, `ul`, `strong`, `br` and the related-card markup
at once. Two more were captured for coverage: `dynamic-pricing-guide` for the
default five-card rail and the longest page, `when-to-start-charging-parking`
for `.formula`, `pre`/`code` and the no-image fallback.

### The pipeline is three stages, not two

See the generator section in `CLAUDE.md`. Any template change has to satisfy
the generator's 14 literal-string substitutions, the runtime, AND the CSS.

### Five reading tokens added, additive

`--read-size` `1.125rem`, `--read-lh` `1.72`, `--read-measure` `39rem`,
`--read-wide` `46rem`, `--read-rhythm` `8px`. New names only, so the Pass 2b-b
list of 15 retargets and 23 deletions is untouched. Nothing consumes them yet;
they land ahead of the port so the port itself is CSS only. No new colour was
introduced by the article design.

**`ch` is not a reliable measure unit with Inter.** Both `--max-text` (68ch)
and `--max-w-article` (70ch) are ch-based and both lie: the live article at
672px/16px measures **87 real characters per line**, and a 68ch column at 18px
measures 81. Counted by walking the text node and recording where the line top
changes. `--read-measure` is a rem length for that reason and lands at 72 to
74 characters. Do not "simplify" it back to a ch value.

### Approved structural changes

| Change | Why |
|---|---|
| Related articles move OUT of the rail into a full-width band after the CTA | The rail was `position:static` and 1307px tall against a 9527px article on `dynamic-pricing-guide`, leaving roughly 8000px of dead gutter. A sticky rail full of dead space is worse than no rail |
| The rail carries a table of contents instead | Genuinely useful on long articles. `dynamic-pricing-guide` is 9527px with 9 `h2` sections and no way to see its shape |
| Article moves FIRST in the DOM, rail second and to the right | Also fixes a screen-reader defect: today the aside is the first grid child, so five related-article cards are announced before the headline |
| Hero becomes navy chrome, type first, image a contained 16:10 panel | Title legibility no longer depends on the stock photograph underneath it, and first body text moves from y=650 to y=539 in a 900px viewport |
| `h3` becomes ink, not `--clr-muted` | Today `h3` renders at 20px/600 in `#475569`, lighter than the 16px body text it introduces. A hierarchy inversion |

Moving `#related-list` needs **no** `js/article.js` change: the runtime finds
it by id, and `renderSeriesSidebar()` and `renderRelated()` both emit through
the same `buildRelatedCard()`.

### What the port still owes

- **The TOC builder belongs in `script.js`, not `js/article.js`.** It has to
  run after the runtime writes `#article-body`, and `script.js` already runs a
  MutationObserver for the motion system. Same reasoning as the motion system:
  `js/article.js` carries both guards and every edit there complicates the
  merge-day reverts.
- **`#article-meta` gets one joined string** from `buildMetaLine()`. The design
  reads it as discrete facts. Deferred; the joined string is accepted for now
  rather than editing `js/article.js` for presentation.
- **`#article-footer-copy` first-person copy stays for now.** Already on the
  post-Vegas backlog. Bundle it with the TOC builder work only if that pass is
  touching `script.js` anyway. **Do not touch `js/article.js` solely for copy.**

### Motion on articles: deliberately almost none

Eight `[data-reveal]` targets, all past the end of the prose: the CTA band's
four children through `data-reveal-group`, and the four related cards. Nothing
on any heading, paragraph, list, the hero, the rail, the TOC or the series
boxes. A reading page that animates while it is being read is an irritation.

### Extends to video pages for free, not to state pages

The 30 pages under `resources/videos/` already use `.article` and
`.article-footer` and already load `css/article.css`, so they inherit the body
typography with no extra work. State subpages use `.state-content` with their
own 7,167-byte inline payload across 33 pages; the reading column, TOC and rail
port cleanly but that payload has to be rewritten.

### Hero double-image defect

`js/article.js:125-126` sets the hero image **twice**, once as
`hero.style.backgroundImage` and once as `heroImage.src`. The `<img>` sits at
`z-index:0` and covers the element completely, so the `background-image` never
renders at all. Same URL, so it costs no extra request, but the inline style is
dead weight and the `background-size`/`background-position` rules in
`css/style.css:3-4` and the inline payload style nothing. The redesign drops
the background entirely. Do not preserve it when porting.

---

---

## Services restructure and the solar page

Done 2026-08-12, in two commits so the halves stay separately revertible. The
restructure was the higher-risk half: 305 links point at that page.

### `/services/` rebuilt on the band system

The last major page on the old bespoke design language. Six sections mapped to
bands in the homepage rhythm: navy hero, page (three pillars), compressed
sunken (process), navy (evidence), card (starting points), navy (CTA).

The five-card Revenue Streams grid became **three co-equal pillars**. Digital
Advertising and Operational Consulting moved into the starting-points band.
Nothing was deleted. Parking stays the primary conversion path by being first,
by being the only `.pillar--primary`, and by being the only card with a metric.

"How We Work" became "How an engagement runs". The nav-label exception for
first person covers menu labels, not body copy, so an `h2` had to change.

**The hero photograph is gone.** `/images/services.webp` was a 3992px generic
stock lot and the only photograph on an otherwise typographic site. It is a
deletion candidate on the post-Vegas list, not deleted yet.

Payload 8,088 to 4,064 bytes, all 46 bespoke `.services-*` selectors retired.

### The pillar component was promoted

`.page-home .pillar*` became `.band .pillar*`. Scoped to `.band`, not global,
per the rule that nothing in the section system is a bare global class.
Specificity is identical either way, so cascade order could not shift, and the
block moved to sit after `.band .tile`, which is what it extends.

**Proven inert on the homepage by 11,360 computed-style assertions**, 10
elements by 568 properties by 2 (element and `::before`), comparing a page
loading the old stylesheet against one loading the new. Zero differences,
bounding rects identical, `index.html` byte-identical.

**A false alarm worth knowing about.** An early run of that gate reported three
`box-shadow` differences. They were a settle artifact on the 0.2s `box-shadow`
transition, not a cascade change: the two iframes were sampled at different
points in their transitions. Comparing both under identical settle conditions
resolved it to zero. If this gate is ever rerun, wait long enough.

**`.step` was deliberately NOT promoted.** Four lines of flexbox and a numbered
badge is not a branded component, so `/services/` defines its own. Promoting it
would have cost a second before-and-after gate for almost no reuse. Promote it
if a third consumer appears.

### `/services/solar-lighting/`

Built from Ben's approved copy with the three agreed edits: the multi-day
reserve claim kept and its VERIFY marker removed, the smart-applications list
kept with no pricing added, and no incentives claim anywhere on the page.

Seven bands. The enforcement section, the one part no competitor's solar page
can carry because it depends on already running parking operations, gets a navy
band so it reads as the turn in the argument rather than another feature list.

Prose sits at 624px and 72 characters per line, matching the article surface.

The page is `<body class="page-services page-solar">`, inheriting the services
hero, CTA and button compositions and adding only prose rules. It was built by
copying `services/index.html` as a structural donor, so the head, both guard
blocks, the chrome block, the Bundle B header and the footer are byte-identical
by construction rather than by care.

**Claims held out, as the copy's verification notes require:** the 180 MPH
hurricane rating, the 12-year battery life, the carbon offset figures, the
Dallas deployment numbers, and the eleven years of testing. A gate checks all
eight excluded patterns on every build. ClearWorld is never named.

**The enforcement section sits directly after the hero**, per the copy's own
verification notes. Approved and moved 2026-08-12.

It is `band--card`, not `band--navy`. It had been navy so it would read as the
turn in the argument, but directly after a navy hero a second navy band merges
into it with no seam. White against navy is the hardest edge on the page, so the
section keeps its emphasis, and being read second is now doing the work colour
was doing. Band rhythm after the move, with no two adjacent surfaces alike:

    navy      #010D20   hero
    card      #FFFFFF   the part most property owners miss
    page      #F8FAFC   why lighting gets deferred
    card      #FFFFFF   how retrofit solar works
    sunken    #F1F5F9   what it changes for the property
    card      #FFFFFF   how the recommendation gets made
    navy      #010D20   closing CTA

Moving it to a light surface improved its prose contrast from 12.47:1 to
17.85:1. It is now above the fold at 1280x900, so its styling matters at first
paint; the payload already carried it.

**A case study would be worth more than the entire capability section.** The
copy says so and it is right. If any client has a solar installation in the
ground, a short account of what it replaced and what it now costs to run should
replace or precede the capability content.

### `#solar` now exists

The known soft link is closed. All three anchors carry `scroll-margin-top: 88px`
and were verified behaviourally: navigating to each hash lands the target at
top=88 against a 73px sticky header, with the heading visible. The 305 links per
anchor across 153 files are unchanged, 915 total.

> **Superseded 2026-08-13 for `#solar` and `#ev`.** The nav and footer sweep
> repointed both at their pillar pages, so those two anchors now have **zero**
> inbound links. The IDs and the `scroll-margin-top` rule stay: they cost
> nothing, they cover inbound external links and bookmarks, and removing them
> would break silently. `#parking` keeps all 309 of its links. See the sweep
> entry below for the current figures.

### `.scope-green` was inert at rest

Done 2026-08-13. One rule in `styles.css`, no markup change.

Reported as "Solar Lighting and EV Charging both carry `.scope-green` but only
EV Charging renders green". Measured in the browser, the asymmetry did not
exist: **at rest all four dropdown links rendered `#C4D0E2`**, and on hover
**both** green-scoped links rendered `#6DB133`, identically. The likely origin
of the report is a pointer resting on EV Charging, which is the last row and the
one a mouse travelling down the panel stops on.

The real defect is that the class did nothing until hovered. A CSSOM enumeration
of every loaded sheet found exactly **one** rule mentioning `scope-green`, and
it was `:hover, :focus-visible` only. The class existed solely to override the
white that `.nav-panel a:hover` sets, so the green scoping was invisible in the
state the nav spends all of its time in.

Fixed by adding the base selector to that rule. It has to stay one rule listing
all three states: `.site-header .nav-panel a:hover` also sets `color` and sits
at equal specificity earlier in the file, so a bare `.scope-green` rule would be
beaten on hover and the item would flip to white under the pointer.

Contrast, measured: **6.53:1** on the desktop panel (`--navy-900`), **5.43:1**
on the hovered row (`--navy-800`), **7.4:1** in the mobile drawer, where the
panel is transparent and the backdrop is `#010D20`. Contrast was never the
reason the rule was hover-scoped.

Not touched: the Bundle B panel markup, which is byte-identical across 150 files
and needs none of this. The inline chrome payload carries `.nav-panel a` but no
`scope-green` rule; it does not need one either, because the panel is `hidden`
until `styles.css` has long since loaded, so there is no first-paint flash.

### The dedicated solar page is reachable from one link

`/services/solar-lighting/` is linked from exactly one place on the site: the
`.pillar-cta` inside the `#solar` tile on `/services/`. The nav dropdown's
"Solar Lighting" points at `/services/#solar`, the anchor, not the page. All
four "What We Do" items target `/services/`. Recorded, not changed: the markup
is Bundle B frozen chrome.

### `/services/ev-charging/`

Added 2026-08-13 from Ben's copy. Second file addition of the rebrand.

**Ben's copy reframed two of the five bands, and the reframe is the important
part of this page.** The spec asked for band 4 "how the deal is structured" and
band 5 "what it changes on the operating statement". Neither could be written
honestly: Monetize Parking does not structure EV agreements and holds no
operating data from any completed installation. Copy in those slots would have
described a service that is not delivered, which is the exact failure the
vendor-neutral position exists to prevent, and the kind of claim that collapses
in a conversation at a booth.

So this is a **qualification page, not a service page**. It answers "should I do
this at all", which is the question a property owner arrives with. Revised
slots: band 4 became "what to ask before signing anything", a question list
rather than a description of terms the company does not set; band 5 became "what
the service is", stated narrowly as assessment plus introductions.

That makes it a thinner page than the solar one, deliberately. The alternative
was overpromising.

**Zero incentive claims, by construction.** Written as though the incentive
column is zero, because after 30C expired it is. Gated on 7 incentive patterns,
6 pricing patterns, a named-provider pattern and a statistic pattern, all 0
hits. There are no figures on the page at all.

**The state count was left as "some states."** The copy's verification note says
one source puts it at thirteen states with enacted EV charging installation
requirements, but the figure moves and was not independently confirmed. The
`[VERIFY]` marker did not ship. Do not replace the phrase with a number unless
the number is checked. The accessibility framing is deliberately "generally
treated as" rather than a flat compliance statement; do not tighten it without
advice.

**Structure.** Seven bands, navy hero, card, page, card, compressed sunken,
card, navy CTA. No two adjacent bands share a surface. Built from
`services/solar-lighting/index.html` as a structural donor, so both guard
blocks, the 4757-byte chrome payload (`00f299a9`), the Bundle B header and the
footer are byte-identical by construction rather than by care.

**`.page-ev` duplicates `.page-solar`.** The solar block is generic pillar-page
prose styling; nothing in it is solar-specific except the green eyebrow, which
EV is equally entitled to. It was duplicated rather than promoted to a shared
hook because these payloads are per-page inline: promotion saves no bytes and
would mean editing a page that shipped four days ago. **Recorded as a Pass 2c
consolidation candidate.** The only addition is list styling, which solar had no
need of.

**Guard constants raised 151/150 to 152/151.** Same gated recapture as the solar
page: exactly one entry added, zero removed, all 151 pre-existing hashes
byte-identical, and the new page's guard hashes equal the donor's exactly.

**Not yet linked from anywhere.** The nav and footer sweep is the next pass and
was deliberately held: repointing Solar now and EV later would mean two sweeps
of 150 frozen-chrome files for one outcome.

**Worth more than bands 3 through 5 combined:** a completed client EV
installation, if one ever exists. The page should be restructured around it.

### SETTLED 2026-08-13: all four "What We Do" destinations

The nav and footer sweep ran, and the What We Do menu is now finished. Three
pages and one anchor. Nothing here is pending.

| Item | Destination | Kind |
|---|---|---|
| All Services | `/services/` | hub |
| Parking Revenue and Management | `/services/#parking` | **anchor, permanently** |
| Solar Lighting | `/services/solar-lighting/` | page |
| EV Charging | `/services/ev-charging/` | page |

**Why the state is mixed, and why that is correct rather than unfinished.**
Solar got a page because no solar content existed, so the page created
something. EV got a page because 9 articles and 7,502 words were scattered with
no centre, so the page consolidates something. Parking has neither problem, and
a parking page would compete with `/services/` for its own query. See the
decision entry below. Anyone reading the dropdown later and seeing three pages
and one anchor should read this table, not assume a page is missing.

**Every surface now agrees.** Nav panel, footer column, homepage pillar cards
and the `/services/` tile CTAs all point to the same four destinations. The one
deliberate exception: the `/services/` parking tile CTA still reads "Read the
parking guides" and points at `/resources/?category=Articles`, because there is
no parking page for it to point at. The EV tile CTA moved off the same resources
category onto the new page and now reads "Explore EV charging", matching the
solar tile.

**Link counts, measured before and after:**

| href | Before | After |
|---|---|---|
| `/services/#parking` | 309 | **309, unchanged** |
| `/services/#solar` | 309 | **0** |
| `/services/#ev` | 309 | **0** |
| `/services/solar-lighting/` | 1 | **310** |
| `/services/ev-charging/` | 0 | **310** |
| `/services/` | 313 | **313, unchanged** |

620 links in, 620 out. Solar: 309 anchors lost plus the 1 pre-existing tile CTA.
EV: 309 lost plus the 1 tile CTA the sweep created.

**All three anchor IDs survive on `/services/`** with `scroll-margin-top: 88px`,
even though two of them now have no inbound links anywhere on the site. They are
kept for inbound external links, bookmarks and anything already indexed with a
fragment. Fragments are not separately indexed, so keeping them costs no SEO and
removing them would fail silently. Verified: all three still land at exactly
top=88 against the 73px sticky header with the heading fully visible.

**Scope, corrected.** The sweep was scoped as "the 150 byte-identical chrome
files". It was **151** by the time it ran, because the EV page added one. Two
blocks moved in lockstep across those 151 files: the nav panel
(`84c536c5` to `eb24d21d`) and the footer What We Do column (`73456eb4` to
`f1eef8cf`). 156 files in total, including the two `docs/preview/` copies with
their own indentation, `tools/rebrand/fixtures/main.html` alongside the homepage,
and the literals in `tools/rebrand/sweep-commit2.js`.

### DECIDED 2026-08-13: no `/services/parking-revenue/` page. Do not revisit.

`/services/ev-charging/` is approved and will be built. A parallel parking
revenue pillar page was considered against it and **rejected**. This entry
exists so the question stops being reopened every time the dropdown looks
lopsided.

**`/services/` is already the parking page.** Its `<title>` is "Parking Revenue
Consultancy | Monetize Parking Services" and its meta description leads with
parking. Splitting parking onto its own URL does not create a page; it takes the
substance out of one that already ranks and moves it to one that does not, and
leaves `/services/` as a table of contents holding a 0.9 sitemap priority.

**The two cases are not symmetrical, and the asymmetry is the point.** Solar got
a page because no solar content existed anywhere, so the page created something.
EV gets a page because 9 articles and 7,502 words are scattered with no centre,
so the page consolidates something. Parking has neither problem: 64 non-EV
articles, 28 state subpages, 30 videos and the calculator are already reachable
through `/resources/?category=Articles`, and a page whose only job is to link to
them duplicates the resources index.

**The SEO argument is the decisive one.** `/services/` receives **309 internal
links from 155 files**, the most-linked page on the site after the homepage. A
new parking URL would start at zero and target the identical query, which is
textbook keyword cannibalisation: the old page keeps ranking on its link equity,
the new page ranks on nothing, and the split costs months for no gain. The EV
page has the opposite profile. It targets terms `/services/` barely competes for
(revenue share against ownership, idle fees, Level 2 against DC fast) and it
gives the 9 EV articles somewhere internal to point.

**Actual ranking data was not available and is not what this rests on.** There
is no Search Console or analytics export in the repo and `gtag` is hostname
gated off outside production, so no claim about current rankings was made. If
this is ever reopened, the thing that would settle it is a Search Console query
and page export for `/services/` over 90 days, not another round of reasoning.

Note that `docs/design-direction.md:708` reached the same conclusion
independently: it lists `/services/parking-revenue/` as "conference-desirable"
and names it "the one to cut" if week 4 is tight, with the `#parking` anchor as
the stated fallback. That fallback is now the permanent answer, not a stopgap.

**Consequence, accepted deliberately.** The dropdown ends up mixed: two items
pointing at pages, one at an anchor, one at the hub. Ben accepted this trade
explicitly. An inconsistent dropdown is cheaper than a page that competes with
`/services/` for its own query.

---

## Video pages: measure fixed, reading treatment deferred

Done 2026-08-11. **One token changed in each of the 30 files** under
`resources/videos/`, and nothing else.

### What shipped

The container carried an inline `max-width:70ch`, which measured **80.8 real
characters per line** at 1024 and above. Same `ch` error the article port
diagnosed: with Inter the zero glyph is wide enough that a ch-based measure
always overstates how much text fits.

    max-width:70ch   ->  max-width:38rem
    704px container      608px
    672px prose          576px
    80.8 characters      69.7 characters

**38rem was chosen by measurement, not arithmetic.** Candidates were rendered
on a real page and every wrapping paragraph walked to find where the line top
changes: 41rem gave 77.3, 39rem gave 72.6, 38rem gave 69.7, 37rem gave 68.9.

**This is deliberately NOT the article's 39rem.** Video prose renders at 16px
and article prose at 18px, so the same rem value yields more characters here.
38rem at 16px matches the article surface's measured 69 to 74. Matching the
result, not the token.

It is an inline style, so no stylesheet could override it without
`!important`. That is why it was edited in place rather than in CSS.

### 1. The full reading treatment was considered and deferred

Measured across all 30: **82 to 106 words of prose per page, median 94, in 3
paragraphs.** The single longest text block on the page measured is 33 words.
Structure is uniform: 3 `h2` sections, 3 related links, one 47-word summary.
The embed is 622px tall against a 1,771px article, so the video is the page and
the text around it is caption length.

An 18px/1.72 treatment exists to make thousands of words comfortable. Here it
would restyle roughly 90 words.

**There is also no scoping hook.** `<body class="article-page">` is shared with
the 73 article pages, and every other class on the page (`.article`,
`.article-summary`, `.back-link`, `.breadcrumb`, `.cta-actions`, `.res-tag`) is
shared with another family. A hook would have to be added to all 30 files by
hand, since there is no template and no generator: `tools/` has nothing for
videos and `data/` has no video file. Thirty hand-maintained files, same
position as the state subpages.

**Revisit if the transcripts are ever filled.** That is the one change that
would turn these into genuine long-form pages.

### 2. All 30 transcripts are placeholders

Every one reads "Transcript will be available once the video is published."
Zero of 30 carry a real transcript.

**This is a content and SEO gap, not a design gap.** These pages currently
offer roughly 94 words of indexable text each against a full page of chrome,
and the section meant to carry the substance is empty everywhere. Transcripts
would also make the video content accessible to anyone not watching, and would
be the single highest-value content addition available on these pages.

### 3. The only content pages with no inline payload

The 30 video pages carry **no `<style>` block at all**, the only content pages
on the site without one, and they load both stylesheets render-blocking:

```html
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/css/article.css">
```

No critical-CSS payload, no `rel="preload" onload` pattern, and therefore no
copy of the shared 4,757-byte chrome block. **A performance difference, not a
defect:** render-blocking CSS means no flash of unstyled content, at the cost
of a slower first paint. Worth knowing before anyone assumes every page follows
the async pattern. They do `preconnect` to youtube.com and googletagmanager.

### What reaches them from css/article.css

27 rules, enumerated from the live CSSOM: `:root`, `.article`,
`.article h1/h2/p/ul,ol/li/em`, `.article-summary`, `.article-footer`,
`.cta-actions`, `.btn`, `.btn-primary`, `.btn-secondary`, `.breadcrumb*`,
`.back-link*`, `.site-footer`. All legacy, all pre-port.

**Zero `.article-read` rules reach them**, verified by matching every rule in
both stylesheets against the live DOM. The article port is fully isolated, and
the 27 legacy rules are exactly why `css/article.css` could not be restyled in
place during that pass.

### The embed is untouchable from CSS

The YouTube embed is styled entirely by inline attributes: a 350px wrapper, a
`padding-bottom:177.78%` aspect box (9:16 vertical Shorts, all 30), and
`position:absolute; inset:0` on the iframe. Exactly one stylesheet rule
anywhere targets an iframe, `.res-thumb.video-wrapper iframe` in `styles.css`,
and it does not apply here: that selector belongs to the cards on
`ask-the-experts.html`.

Verified unchanged at 375, 768, 1024 and 1440 after the measure change.

---

## State pages: reading typography ported, TOC and rail deferred

Done 2026-08-11. **CSS only. No state page markup was edited.**

### What shipped

| File | Change |
|---|---|
| `css/state-map.css` | append only, everything new scoped under `.state-detail` |
| 28 state subpages | inline payload rewritten: map CSS out, reading CSS in |

The 4 state hubs, the map page, `js/state-map.js` and `styles.css` were not
touched.

Both markup variants are handled: `.content-body` on Colorado and Wisconsin,
`.article-body` on Minnesota and Texas. The Minnesota and Texas pages also
carry an `.article-cta` block, used by those 14 subpages and nothing else on
the site, which is restyled as a card rather than left to fight the reading
column.

### The subpage payload lost the map

The 7,167-byte payload was the shared 4,757-byte chrome block plus a
2,410-byte state half, and that half carried the **entire map layout**:
`.state-map-section`, `.state-layout`, `.map-container`, `.state-selection`,
`.selection-desc`, `.state-grid`, `.state-pill`, `.state-abbr`, `.state-name`,
two media queries for them, and `--state-inactive` / `--state-bg` which only
those rules consumed. None of it exists on a subpage.

    7,167 -> 6,633 bytes per subpage
    chrome block  4,757  unchanged, hash 00f299a9
    state half    2,410 ->  1,876
    map CSS out   1,687 bytes/page, 47 KB across the 28
    reading in    1,153 bytes/page

`.state-content` was **added** to the payload. It had lived only in
`css/state-map.css`, which loads async, so the content section had no padding
at first paint.

The map page and the 4 hubs keep the old 7,167-byte block, so the payload now
splits three ways under `resources/states/`: 28 subpages on the new block, 5
pages on the old one, 4 hubs additionally carrying their own 1,070-byte block.

### TOC and rail: considered, deferred

Both were evaluated against the article design and neither is worth doing on
these pages yet.

**TOC.** Only **22 of 28** subpages have the 4 or more `h2` the builder needs.
Five Texas subpages have **zero** body headings, and `minnesota/value-add-strategy`
has three. `MPArticle` also keys off `document.getElementById('article-body')`,
and these pages have `class="article-body"` on 14 of them, `class="content-body"`
on the other 14, and no id anywhere, so it needs a different hook. Worth
revisiting only after the content gap below is closed.

**Rail.** It depends on a hero image and a category, and state subpages have
neither. Their hero is a light gradient with a back-link, an `h1` and a
one-line summary. There is also no breadcrumb on any of the 28.

**The reason both are expensive: there is no template and no generator for
state pages.** `templates/` holds only `article-index.html`. Every markup
change costs 28 hand edits with no `npm run build` to verify against, which is
why this pass was scoped to CSS. Any future markup work here should probably
start by building a generator.

---

### Homepage payload group: unchanged at six files

`index.html` shares a 4757-byte critical payload with `about/`, `calculator/`,
`contact/`, `faq/` and `services/`. **That block was not touched.** The homepage
carries a **second** `<style>` block of 3462 bytes for its own critical CSS,
exactly as `services/index.html` already does with its 8088-byte block.

The group therefore still spans the same six files, and a future chrome sweep
still needs one anchor and one count assertion rather than two. Diverging the
shared block would have split it permanently.

The homepage block is hex literals only, asserted by a gate. A `var()` there
would resolve only once the async `styles.css` lands, which is the exact flash
the payload exists to prevent.

### Four tokens added, additive

`--blue-wash` `#EFF6FF`, `--gradient-silver`, `--shadow-sm` and `--shadow-md`,
all settled `docs/design-direction.md` values. New names only, so the Pass 2b-b
list of 15 retargets and 23 deletions is untouched.

**`--space-section` was deliberately NOT redefined.** The prototype wants
`clamp(4rem, 8vw, 7rem)`; the token holds `clamp(3.5rem, 6vw, 5.5rem)` and is
consumed by the `.resources-*` rules on the resources hub, so changing it would
have moved another page's spacing. The band rhythm uses new `--band-y` and
`--band-y-sm` instead. **Standing rule: do not redefine a token another page
consumes. Add a new name.**

### Two content decisions recorded so they stop being re-flagged

1. **The quote card is not built.** The approved prototype carries a named
   client quote card in the approach band, containing placeholder text
   (`[Named client quote pending permission...]`). No quote and no permission
   exist, and placeholder text does not ship. The slot is real and the design
   accommodates it; build it when a genuine quote and written permission exist.
   Do not invent a founder quote.
2. **"$3,000 to $8,000 or more per month" stays.** It is current production
   copy, live in the hero and in the homepage meta description, and it is a
   stated earnings range rather than a case-study statistic. The
   no-fabricated-statistics rule targets invented case results. **The source is
   unverified and is worth substantiating post-conference.**

Every other figure on the page is an Eau Claire figure: 178 percent revenue
increase, 45 to 90 percent compliance, $240,000 property value lift.

### Image slots on the homepage

Three `PHOTO SLOT` comments mark them inline. All three ship in their designed
fallback state; none is a placeholder.

| Slot | Ships as | Intended photograph |
|---|---|---|
| Hero visual | layered SVG site plan with LPR, solar and EV callouts | shot #2, 21:9 monitored-lot still, or a frame from `home_video.mp4` |
| Approach | two-bar compliance graphic, 45 to 90 percent | shot #1, site walk or install in progress, 16:10, min 1600px |
| Resource thumbs | typographic category-colour gradients | existing generated thumbnails, once the imagery refresh lands |

### What the old homepage lost

The hero `<video>` and its bespoke loading script, `camera_lot.webp`, and the
three emoji icons in the approach section. The `.hero-bg__*` rules in
`styles.css` are now dead: nothing references them. They were left in place
rather than deleted, since stale-asset cleanup is a post-Vegas item, but they
are safe to remove whenever that pass runs.

---

## Pass 2b-a: COMPLETE at `2d677a1`

229 raw colour literals converted to `var()` references across the five
authoritative stylesheets. **Zero raw colour literals remain in any rule.**
Every primitive holds the exact value its literal held, so the pass is verified
pixel-identical; 2b-b moves the values.

The `styles.css` `:root` grows from 12 primitives to 98. That is the intended
shape and it reverses later: 12 names end in `-tmp` and are deleted at 2b-b when
values collapse; the aliases go at 2c.

**Out of scope by design:** `box-shadow` and `text-shadow` colours, 52
declarations, all byte-identical to the previous commit. They move with the rest
of the geometry work in 2b-2.

### Pass 1 undercounted the blues by a factor of four

Pass 1 recorded three brand blues. **The real count is eleven** solid blues:
`#0b6efd`, `#007bff`, `#0a68ff`, `#2563eb`, `#0958d9`, `#005ce6`, `#0b5fff`,
`#1d4ed8`, `#1e40af`, `#0856c9`, `#2f6bff`, plus `#1a73e8` and `#1557b0` in
`styles.css` and a dead `#0B63F6` (now removed).

**The largest single group is `rgba(13,110,253,…)` at 25 occurrences across 12
alpha steps, and it has no solid counterpart anywhere on the site.** It is
Bootstrap blue surviving only in transparency. A second, drifted base
`rgba(11,110,253,…)` accounts for 6 more. Neither would have been found by
grepping for the three solid blues Pass 1 named.

All of them are now tokens, which is what makes 2b-b a value-only edit.

### 2b-b: COMPLETE, shipped with Bundle B commit 4

It was never blocked on anything technical, only on sequencing: 1,208 old-blue
occurrences lived in inline `<style>` payloads across 118 pages, so retargeting
the primitives first would have made every async page paint old blue and then
repaint on every load. The recolor therefore shipped as commit 3 and the
retarget as commit 4, in the same session and the same push. The site changed
colour exactly once.

Verified in a browser with a freshness assertion on every measurement: on the
homepage, services, an article, a state page and the resources hub, the inline
critical CSS and `styles.css` resolve to the same blue, so there is no flash.

**Residue deliberately left to 2b-2:** 24 blue-tinted `box-shadow` declarations
across `styles.css`, `css/article.css`, `css/resources.css`,
`calculator/index.html` and `contact/index.html`, plus one
`scrollbar-color: rgba(13,110,253,0.3)` in `css/resources.css`. Shadows were
always out of 2b-b scope. **The scrollbar one is not a shadow and is a genuine
2b-a miss**: that pass reported zero raw colour literals in any rule, and this
is one. It is a single declaration and a one-line fix whenever 2b-2 runs.

### 2b-b scope, exactly

**2b-b changes the value of 15 primitives, deletes 23 by folding, and does
nothing else.** No literal is touched, no selector is edited, no new primitive is
added. The lists below are the whole pass. `#004FC8` is `rgb(0,79,200)`, so every
blue tint keeps its alpha and only changes base.

**A. 15 primitives change value, names stay:**

| Primitive | Old | New |
|---|---|---|
| `--blue-brand` | `#0b6efd` | `#004FC8` |
| `--blue-deep` | `#0958d9` | `#0043B3` |
| `--ok` | `#22c55e` | `#10B981` |
| `--blue-tint-0` | `rgba(13,110,253,0)` | `rgba(0,79,200,0)` |
| `--blue-tint-04` | `rgba(13,110,253,0.04)` | `rgba(0,79,200,0.04)` |
| `--blue-tint-05` | `rgba(13,110,253,0.05)` | `rgba(0,79,200,0.05)` |
| `--blue-tint-08` | `rgba(13,110,253,0.08)` | `rgba(0,79,200,0.08)` |
| `--blue-tint-10` | `rgba(13,110,253,0.1)` | `rgba(0,79,200,0.1)` |
| `--blue-tint-12` | `rgba(13,110,253,0.12)` | `rgba(0,79,200,0.12)` |
| `--blue-tint-20` | `rgba(13,110,253,0.2)` | `rgba(0,79,200,0.2)` |
| `--blue-tint-25` | `rgba(13,110,253,0.25)` | `rgba(0,79,200,0.25)` |
| `--blue-tint-30` | `rgba(13,110,253,0.3)` | `rgba(0,79,200,0.3)` |
| `--blue-tint-40` | `rgba(13,110,253,0.4)` | `rgba(0,79,200,0.4)` |
| `--blue-tint-50` | `rgba(13,110,253,0.5)` | `rgba(0,79,200,0.5)` |
| `--blue-tint-95` | `rgba(13,110,253,0.95)` | `rgba(0,79,200,0.95)` |

**B. 23 primitives are deleted, every reference repointed:**

The 13 `-tmp` names:

| Deleted | Value now | Folds into |
|---|---|---|
| `--blue-alt-tmp` | `#0A68FF` | `--blue-brand` |
| `--blue-accent-tmp` | `#2563eb` | `--blue-brand` |
| `--blue-check-tmp` | `#0284c7` | `--blue-brand` |
| `--blue-cta-tmp` | `#0b5fff` | `--blue-brand` |
| `--blue-cta-inline-tmp` | `#2f6bff` | `--blue-brand` |
| `--blue-inline-tmp` | `#1a73e8` | `--blue-brand` |
| `--blue-ui-tmp` | `#007bff` | `--blue-brand` |
| `--blue-hover-tmp` | `#005ce6` | `--blue-deep` |
| `--blue-inline-deep-tmp` | `#1557b0` | `--blue-deep` |
| `--blue-ask-tmp` | `#0856c9` | `--blue-deep` |
| `--blue-hero-a-tmp` | `#1d4ed8` | `--gradient-brand` |
| `--blue-hero-c-tmp` | `#1e40af` | `--gradient-brand` |
| `--border-2-tmp` | `#cbd5e1` | `--border-1` |

Plus 10 more that the `-tmp` grep does NOT catch (see the warning below):

| Deleted | Value now | Folds into | Authority |
|---|---|---|---|
| `--blue-brand-tint-08` | `rgba(11,110,253,0.08)` | `--blue-tint-08` | becomes identical |
| `--blue-brand-tint-12` | `rgba(11,110,253,0.12)` | `--blue-tint-12` | becomes identical |
| `--blue-accent-tint-08` | `rgba(37,99,235,0.08)` | `--blue-tint-08` | becomes identical |
| `--border-grey-2` | `#e5e7eb` | `--border-1` | 10 greys to one |
| `--border-grey-3` | `#e6e8ee` | `--border-1` | 10 greys to one |
| `--border-grey-4` | `#e6e9ee` | `--border-1` | 10 greys to one |
| `--border-grey-5` | `#e6ebf2` | `--border-1` | 10 greys to one |
| `--border-grey-6` | `#eef1f5` | `--border-1` | 10 greys to one |
| `--neutral-700` | `#334155` | `--text-2` | design direction |
| `--neutral-800` | `#1f2937` | `--text-2` | design direction |

**Warning: `grep -- -tmp` is no longer a complete exit test for 2b-b.** It
catches 13 of the 23 deletions. The three drifted tint tokens become
byte-identical to their `--blue-tint-*` counterparts once the base moves, and
the five border greys and two neutrals fold on design-direction authority
rather than on a temporary-name marker. The exit test for 2b-b is this list,
not the grep. The grep remains valid as a *necessary* check, not a sufficient
one.

### 2b-b is not yet fully mechanical: 23 primitives still lack a target

The lists above are decided. These are not, and each needs a value before 2b-b
can honestly claim to touch nothing outside a fixed list:

- **12 pale blues:** `--blue-pale-2` through `-8`, `--blue-pale-bg`,
  `--blue-pale-border`, `--blue-wash-1`, `--blue-wash-2`, `--blue-wash-border`.
  The design direction supplies exactly one target, `--blue-wash` `#EFF6FF`, for
  twelve current values. Collapsing 12 to 1 is a design decision, not a mapping.
- **5 soft borders:** `--border-soft-10/18/20/30` and
  `--border-soft-cbd5e1-70`. Slate alphas; `--border-dark` in the design
  direction is for dark surfaces and does not apply.
- **5 neutrals:** `--neutral-400`, `-600`, `-750`, `-850`, `-950`. Only `#334155`
  and `#1F2937` have approved destinations; these five do not.
- **`--surface-dark-alt`** `#1e2a3a`. Needs to become a specific `--navy-*` step.

`--surface-sunken` already holds `#f1f5f9`, which matches the design direction
target exactly, so it needs no change.

The scrims (`--scrim-*`, 11) and slate tints (`--slate-*`, 5) are transparency
effects, not brand colour, and go to 2b-2 with the shadows. They are correctly
outside 2b-b.

**So 2b-b as specified covers 15 value changes and 23 deletions. The remaining
23 primitives need a decision first, or they stay at today's values and get
picked up in 2b-2.** Either is defensible; leaving them is the smaller change
and keeps 2b-b mechanical.

### A verification gate silently stopped covering its subject

The fallback-integrity checker written for 2a matched only
`--name: var(--x, LITERAL)`, that is, custom-property *definitions* carrying a
fallback. That was the whole surface at the time: 15 cross-file references, all
of them in `:root`.

2b-a moved the surface. Fallbacks now appear in ordinary declarations
(`background: var(--blue-wash-1, #f0f9ff)`), and there are **106 of them**. The
2a checker still ran, still reported PASS, and was **checking 15 of 106, about
14 percent**. Nothing in its output said so; a passing gate looked like a
passing gate.

The extended checker covers every `var(--x, LITERAL)` in the four dependent
files, asserts each fallback equals its primitive, and separately asserts no
bare cross-file reference exists. It caught three real defects on first run:
`--scrim-black-30`, `-55` and `-60` were referenced but never defined, which
would have broken two gradients. Those came from hand edits made after the
conversion script ran, exactly the case a script-only check misses.

**Rule going forward: a gate written against a moving target must be
re-verified against the new surface, not reused.** Before trusting any gate
carried over from an earlier pass, confirm what it actually matches and print
the count it checked. A gate that cannot say how much it inspected cannot be
distinguished from one that inspected nothing.

### Pre-existing bug found and fixed: EV articles mislabelled

`js/related.js` built its `DEFAULT_IMAGES` table from three categories, omitting
`EV Charging`, while `js/resources.js` had all four. Both files then run
`clone.category && DEFAULT_IMAGES[clone.category] ? clone.category : 'Articles'`.

Because `DEFAULT_IMAGES['EV Charging']` was undefined in `related.js`, **all
nine EV Charging articles were relabelled "Articles"** in the related-articles
rail on every article page. The category tag rendered wrong and the
same-category ranking in `pickRelated()` scored them against the wrong bucket.

Fixed in `2d677a1` by adding the missing entry. **Pre-existing and unrelated to
the rebrand**; it was found only because 2b-a reconciled the two drifted tables.
The colour half of that reconciliation renders nothing today, since every
`resources.json` entry has a thumbnail and the fallback SVGs never build, but
the category half was always visible.

### What 2b-a deferred rather than decided

`#0284c7`, `#94a3b8`, `#4a5568`, `#374151`, `#0b0b0b`, `#1e2a3a` and the white
and black alpha scrims have no approved target in `docs/design-direction.md`.
They were tokenised at their current values under descriptive names rather than
folded into brand colours on a value match. The naming records the intent
(`--blue-check-tmp` folds into `--blue-brand`; `--neutral-*` and `--scrim-*`
await 2b-2). No brand value was invented.

`--surface-dark` and `--text-1` remain separate despite both holding `#0f172a`;
the conversion routes `#0f172a` by role, to `--surface-dark` on background,
fill, border and outline, and to `--text-1` on text.

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

**All four are now off the list.** Updated 2026-08-13.

No page on the site overrides a `styles.css` token from an inline block any
more, so a token rewrite can no longer silently change colour anywhere. The
landmine is closed.


| Page | `:root` override | Status |
|---|---|---|
| `calculator/index.html` | removed | **off**, in the reskin at `03707ae` |
| `calculator/report/index.html` | removed | **off**, in the reskin below |
| `contact/index.html` | removed | **off**, in the reskin at `564a0bb` |
| `contact/thank-you/index.html` | removed | **off**, same commit |

All four now take the authoritative token values, so they render `#64748b`
where they used to render `#6b7280`.

#### The payload `var()` convention is inconsistent, and both halves are correct

Recorded 2026-08-13, during the calculator reskin. **This is not a bug and not
a precedent. It is two different situations that happen to look like one.**

| Payload | Level | `var()` count |
|---|---|---|
| `services/index.html` | head | **0** |
| `services/solar-lighting/index.html` | head | **0** |
| `services/ev-charging/index.html` | head | **0** |
| `calculator/index.html` | **body** | **29** |

**The pillar-page payloads are hex-literals-only because they are head-level.**
They exist to paint correctly before the async `styles.css` lands. A `var()`
reference there resolves to nothing until the stylesheet arrives, which is the
exact flash the payload exists to prevent. Their comments say so.

**The calculator's block carries 29 `var()` references and that is safe,
because it is body-level.** It is parsed after the `styles.css` link, so every
token it references is already defined by the time it is applied. Same
mechanism that makes it override `styles.css` permanently, read the other way.

**The rule to take from this:** the deciding factor is head or body, not page
or payload. `var()` in a head-level payload is a first-paint bug. `var()` in a
body-level payload is fine. Do not "fix" the calculator to match the pillar
pages, and do not copy the calculator's approach into a head-level payload.

One caveat that bit during the reskin: **the head chrome payload defines only
13 tokens** (`--brand`, `--brand-blue`, `--ink`, `--muted`, `--card`, `--bg`,
`--border`, `--space-section`, `--space-block`, `--max-text`, `--h1`, `--h2`,
`--h3`). Anything outside that list, `--ok` included, is unavailable at first
paint no matter which block references it.

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
- **Pass 2b:** split into three, because colour is verifiable by resolved value
  while geometry moves layout on 150 pages and the two cannot be told apart if
  bundled.
  - **2b-a: COMPLETE at `2d677a1`.** Convert colour literals to tokens, values
    unchanged, pixel-identical.
  - **2b-b: COMPLETE**, shipped with Bundle B commit 4. 15 values changed,
    23 primitives deleted. See below.
  - **2b-2:** geometry. Shadows, radii, container widths, breakpoints, and the
    neutral-scale decisions 2b-a deferred.
- **Pass 2c:** sweep inline `<style>` across 119 pages. Scriptable for the 45
  uniform ones, manual for the 4 bespoke.
- **Consultation pages: DONE 2026-08-14.** Both rebuilt on `styles.css` and the
  band system, the last two pages on the old design. This was originally gated on
  Google Ads bidding switching off Maximize Clicks; that switch did not happen
  and the pass went ahead anyway, with the campaign live and no pause. See
  "Google Ads bidding and the `/consultation/` rebrand" above for the decision,
  the fold measurements, and the open items.

**Sequencing note:** decide the canonical blue before writing any token, since
every downstream decision depends on it.

---

## Resources: split by service, not by content type

**Done 2026-08-15.** The chips were a category error: `All`, `Case Studies`,
`Guides`, `Articles`, `EV Charging` mixed three FORMAT labels with one TOPIC
label. They are now a service axis: **All, Parking, Solar Lighting, EV
Charging**. Content type survives as the card badge and gets no filter.

**`service` is a NEW field, added alongside `category`.** Renaming `category`
would have collapsed two axes into one field again, which is the error being
fixed. `category` still means content type and every consumer of it is
untouched. Backfill: EV-category records became the EV service, everything else
Parking. 9 EV Charging, 64 Parking across all 73; 9 and 56 among the 65 visible.

**Type is badge-only on purpose.** A type filter would offer chips returning 4
results (Guides) and 1 (Case Studies). Revisit if Guides passes ten.

**The "All" bucket holds nothing of its own.** Before deciding whether
cross-cutting content needed a home, the set was measured: of 65 visible
articles, 49 mention parking, 5 mention EV, 10 mention both, and exactly **one**
mentions neither (`occupancy-vs-compliance`). Topics that look cross-cutting by
title, ADA compliance, tax implications, insurance, "is it legal to charge for
parking", are every one of them scoped to paid parking specifically. There is no
orphan set, so "All" is a view over everything rather than a home.

### The coercion that had to be fixed first

`js/resources.js` used to do:

```js
const category = clone.category && DEFAULT_IMAGES[clone.category]
  ? clone.category : 'Articles';
```

The image fallback table was the gatekeeper for which category values were
allowed to exist. Adding `"Solar Lighting"` to a record would have silently
filed it under Articles, so the Solar chip would have stayed empty forever while
the article sat in the wrong bucket, with no error anywhere. Fixed in `2e2afb6`
before anything else: unknown values pass through and warn once per value.

### The Solar empty state, and why it needs no maintenance

Solar has zero articles and ships with a real message plus a link to
`/services/solar-lighting/` rather than a blank grid. It renders only on the
`!visible.length` branch, so **the first record carrying
`service: "Solar Lighting"` removes it automatically.** No code change, no
config change, no chip change.

Proved rather than asserted: a probe copy of the script differing from the
shipped one by the data URL and nothing else, pointed at a JSON containing one
synthetic solar record, rendered a card and no empty state.

### Two cache problems this pass exposed

Both pre-existing. The first would have broken the feature on deploy.

1. **`/js/*` is `max-age=31536000, immutable`** and scripts are referenced with
   no version query. A returning visitor keeps the old `resources.js` for up to
   a year, and the old one filters on `category` against chips that now say
   Parking/Solar/EV, so **every chip except All returns nothing.** Fixed for the
   one file this pass depends on: `/js/resources.js?v=service-axis`.
   `js/article.js` is deliberately NOT versioned, because a stale copy emits
   `?category=` and the alias map absorbs it.
   **Anyone changing a JS file's behaviour must bump its query or it does not
   reach returning visitors.** This is the general rule; this pass is the first
   time it mattered enough to bite.
2. **`/data/*` is `max-age=3600`**, so for up to an hour after a deploy a
   visitor runs new JS against JSON with no `service` field. The fallback
   derives service from category rather than defaulting flat to Parking, which
   keeps the 9 EV articles in the right bucket during that window.

### The fallback gradient prefers service over category

`normaliseImage()` looks up `DEFAULT_IMAGES[service] || DEFAULT_IMAGES[category]
|| DEFAULT_IMAGES.Articles`. Closed in the commit after the split: the Solar
entry added in `2e2afb6` was keyed by category, but a solar article carries
`category: "Articles"` and `service: "Solar Lighting"`, so it would have got the
Articles gradient, which is the thing that entry existed to prevent.

**`DEFAULT_IMAGES` deliberately has NO `Parking` key, and must not gain one.**
That absence is what makes the precedence safe: the service lookup misses for
parking content, the category gradient wins, and 56 records keep an accurate
"Article" / "Guide" / "Case Study" label instead of a service label that says
less. Adding a Parking entry would silently replace all of them.

Verified with four thumbnail-less probe records, each carrying the realistic
`category: "Articles"` or `"Guides"`:

| probe | service | gradient |
|---|---|---|
| PROBE Solar | Solar Lighting | **Solar Lighting**, #2D7A0E |
| PROBE EV | EV Charging | EV Charging, #2D7A0E |
| PROBE Parking | Parking | Article, #071B38 |
| PROBE Parking Guide | Parking | Guide, #0E2A52 |

Still reached zero times by real data: all 65 visible records have a thumbnail.
The script query was bumped to `?v=service-axis-2` anyway, per the rule above. A
stale script cannot break anything today, but a solar article published months
from now sits well inside the one-year immutable window, and that is precisely
the case this closes.

---

## Green is scoped, with one exception: navigation

**Green (`--green-500`, `--green-700`) is scoped to solar, EV and
sustainability content everywhere on the site EXCEPT the nav dropdown.**

In the "What We Do" panel, Solar Lighting and EV Charging used to render green
while All Services and Parking Revenue rendered in the normal panel colour. Two
coloured items among four read as arbitrary rather than as a scope: the panel
gives a reader no context for what the colour is signalling, so it looks like
emphasis or like a mistake instead of like a taxonomy. Removed 2026-08-15.

**The `.scope-green` class is deliberately still in the chrome markup on all 151
files.** Only the rule in `styles.css` was removed. Do not "tidy up" the class:

- Stripping it is a 151-file sweep across Bundle B frozen chrome, which changes
  the chrome hash and is a far larger operation than the decision warrants.
- The class is the hook. If this is ever revisited, restoring green in the panel
  is one rule, not another 151-file sweep.

Verified after the change: all four panel items compute `rgb(196, 208, 226)`,
and green still renders on `/services/solar-lighting/` and
`/services/ev-charging/` (eyebrows at `#6DB133` and `#2D7A0E`).

---

## Guardrails currently in place

These must stay until merge day. Do not remove without me asking.

**Exception, and read this before assuming everything here is temporary:
`tools/conversion-guard.js` is NOT a merge-day guardrail and must NOT be removed
on merge day.** It is a separate tool with the opposite lifecycle to
`tools/guards.js`, and the two must not be merged:

| | `guards.js` | `conversion-guard.js` |
|---|---|---|
| Protects | noindex guard, gtag gate | Ads and GA4 conversion plumbing |
| Lifetime | deleted on merge day | permanent |
| A failure means | a revert will conflict | conversions may have stopped counting |
| Scale | 152 files, 303 hashes | 2 files, 5 blocks, 11 assertions |

It hashes five blocks: the Ads conversion snippet and the
`ppc_callback_conversion` handler on `consultation/thank-you/`, and the Calendly
`postMessage` listener, the callback form submit handler and the
`ppc_phone_click` handler on `consultation/`. The two form handlers are covered
because each performs the redirect that causes the Ads conversion to fire; break
either and leads stop being counted with no visible symptom.

Two things are deliberately NOT hashed, so the guard cannot block intended work.
The Calendly embed `div` is exempt because its `data-url` carries
`background_color` and `primary_color`, hand-matched to the CSS behind the
iframe, which any redesign has to change; the booking path and
`hide_gdpr_banner` are asserted individually instead. The Formspree form is
asserted conditionally, because it was cut once and restored once already.

Every block was proven with tamper tests before being trusted, including cases
that must still PASS. A guard that has never been shown to fail proves nothing.

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
  either way. Record the actual state. The `/consultation/` question is already
  answered: option 2, rebranded with the campaign live, done 2026-08-14
- [ ] Merge `rebrand` into `main` via pull request, since direct push is blocked
- [ ] Verify production tracking fires: GA4 collect requests and the Ads
  conversion on `consultation/thank-you/`
- [ ] Verify production robots meta reads `index,follow`, not `noindex`
- [ ] Delete the Cloudflare Zero Trust Access application for the preview URL
- [ ] Fold any still-relevant findings from `REBRAND.md` into `CLAUDE.md` before
  deleting
- [ ] Delete `REBRAND.md` from the repo
- [ ] **Annotate the deploy date in BOTH Google Ads and GA4.** Not optional and
  not cosmetic. `/consultation/` was rebranded with the campaign live and no
  pause, so there is no gap in the data to mark where the page changed. Without
  an annotation on both sides, a later reading of conversion rate across
  2026-08-14 compares two different pages and looks like a performance change.
  The page was also inverted on the same day, form promoted over Calendly, so
  the mechanism mix shifts as well
- [ ] **Create the phone-click conversion action in the Google Ads UI**, then
  import or map `ppc_phone_click` to it. The event fires today as a GA4 event
  only, so ad-driven phone calls are invisible to Ads bidding. Creating the
  conversion action requires the Ads interface and cannot be done from this
  repo. This matters most while conversions sit below the 15 to 20 threshold:
  untracked phone conversions are the cheapest ones to recover

**Not a revert item:** the favicon `?v=2` cache-busting query stays permanently.
It appears on the icon links, the manifest link, and inside
`images/site.webmanifest`. Do not strip it on merge day.

## ADA penalty figures need review every July

**`articles/ada-compliance-paid-parking.html` carries two dollar figures that
change most years.** Fixed in `b3b35ca` from the 2014-era $75,000 / $150,000 to
the current maxima. The article now states its own verification date, which is
the thing that was missing and the reason the old figure survived so long.

Current state, verified 2026-08-16:

| | |
|---|---|
| First violation | **$118,225** |
| Each subsequent violation | **$236,451** |
| Effective | **3 July 2025** |
| Authority | 28 CFR 85.5 |

**Review each July.** DOJ adjusts Title III civil penalty maxima for inflation
under the Federal Civil Penalties Inflation Adjustment Act. The figures appear
in three places and all three must move together:

1. the article lede, `articles/ada-compliance-paid-parking.html:1`
2. the "Who Can Impose These Penalties" section, same file, including the
   verified-as-of sentence
3. the `excerpt` for `ada-compliance-paid-parking` in `data/resources.json`,
   which duplicates the lede and renders on cards and in meta descriptions

### There was NO 2026 adjustment, and that is not an oversight

**Do not read the July 2025 effective date as a missed year.** DOJ is
deliberately continuing the 2025 levels through 2026. The annual adjustment is
calculated from Bureau of Labor Statistics CPI-U data for October of the prior
year, and BLS never produced the October 2025 figure because of the October to
November 2025 lapse in appropriations. The statute allows no alternative
calculation method, so OMB directed agencies to hold at 2025 levels.

This is recorded because the natural reaction to "effective July 2025" seen in
2027 is to assume nobody checked in 2026. Somebody did. The answer was that
nothing changed, and the reason it did not change is unusual enough that it
will not be obvious later.

### What the qualifier is doing, and why it must not be dropped

The number without the qualifier is misleading, and the qualifier is the more
useful half for a property owner. **Only the Attorney General can seek these
penalties.** A private individual cannot trigger one. DOJ pursues systemic
violations rather than a single non-compliant lot. A private suit produces
injunctive relief and the plaintiff's legal fees, with no damages to the
plaintiff under federal law.

**The ceiling must never appear without who can reach for it.** Both the lede
and the card excerpt state them in the same sentence, deliberately, so the
figure cannot travel alone into a card, a search result or a social preview.

The section points at state law without naming a state or an amount. That is
deliberate in both directions: omitting it entirely would let "no damages under
federal law" read as "no financial risk", and naming figures would create a new
dated claim of exactly the kind this entry exists to prevent.

---

## Post-Vegas backlog

Not rebrand work. Do not start any of these before the conference.

- **About page: Dave and Dax should read their own bios.** Opened 2026-08-13
  with the About content pass. The bios describe how each of them actually
  works and both thirty-year figures are theirs, so they are the only people
  who can confirm them.

  **Dax's paragraph is written around qualifying people out rather than
  closing them.** That is deliberate: a sales bio sitting two bands below a
  section arguing vendor neutrality would undercut the argument, and the
  page is stronger if he is the person who says no. **If that is not how he
  actually works it needs rewriting**, because it should describe the real
  job rather than the convenient one.

  Also stated on the page and needing confirmation: **the company was founded
  in April 2025**, and **sixty years between them**. The founding date is
  deliberately stated rather than implied. Sixteen months is young, and a
  young company implying a longer history is the first thing a sceptical
  owner catches. The weight sits on individual experience and one verified
  result instead.

- **CLOSED, and now a standing constraint: the team photos render at 100px,
  and 100px is the ceiling.** `images/dax.jpg` and `images/dax.webp` are both
  200x200. `dave.jpg` and `dave.webp` are both 800x800. There is no larger Dax
  source in the repo and the photograph cannot be re-shot, so the resolution
  mismatch is permanent and the fix is the render size rather than the source.
  At the old 140px, Dax's 200x200 gave only 1.43x and was soft on any retina
  display. At 100px it is exactly 2x and therefore retina-correct; Dave's
  800x800 is 8x at the same size. Measured 2026-08-14 at `devicePixelRatio` 2.

  **Dax's photograph constrains the maximum display size to 100px. Anyone
  raising `.page-about .team-photo` above 100px reintroduces the soft image.**
  The rule in `about/index.html` carries a comment saying so and pointing here.
  If the display size ever needs to grow, the new photograph has to come first.

  The change cost 40px of card height at every width and altered nothing else:
  375px 585/480 to 545/440, 768px 400/374 to 360/334, 1280px and 1440px 453/453
  to 413/413. Cards are equal-height wherever they sit side by side, which is
  the two-column layout at 1024px and above; below that the grid is a single
  column and each card sizes to its own content, which was true before this
  change and is not a defect. Verified at all four widths with no overflow.

  Fixed in the same pass: Dave's `<img>` declared `width="200" height="200"`
  while the file is 800x800. Corrected to the true intrinsic size. Same class
  of defect as the case study image in `d320799`.

- **Contact form: two things pending Dave and Dax.** Opened 2026-08-13 with
  the form improvement pass. Neither is a defect; both change what arrives in
  their inbox, so neither is mine to decide.

  **1. City and State, recommended for removal, NOT done.** They are two of
  the six grid fields and neither is needed to reply to an enquiry. A property
  address is a conversation-two detail. Removing them would take the form from
  eight fields to six and from three rows to two, which is the single largest
  friction reduction still available on the page.

  **They were kept because removing them permanently changes what Dave and Dax
  receive.** Every notification would lose two lines. That is a standing
  operational change, not a design tweak, and it needs their agreement rather
  than a designer's judgement. If they say yes it is a fifteen minute change.

  **2. Field order changed, and it changes the notification email.** `message`
  now sits above `how_heard`, because the message is what the visitor came to
  write and the attribution dropdown is administrative. Formspree renders
  fields in submission order, so the email body order changed with it:

      before   name, email, phone, company, city, state, how_heard, message
      after    name, email, phone, company, city, state, message, how_heard

  Flagged so nobody thinks the template broke. It is an improvement, the
  message now sits directly under the contact details rather than below a
  dropdown, and it is reversible by moving one block back.

  **Also worth knowing: `how_heard` is now optional, and when left blank it is
  omitted from the email entirely rather than arriving empty.** The placeholder
  option is `disabled`, so a select with nothing chosen contributes no entry at
  all. Verified against a live submission. If Dave and Dax would rather see an
  explicit "not answered", that needs a non-disabled placeholder with a value.

- **Dated-claims audit.** Opened 2026-08-13, out of the 30C pass. Every finding
  below is a statutory, regulatory, or incentive claim carrying a date or a rate
  that may have lapsed or changed. **None of these were fixed.** They are
  recorded because a claim of this kind is only ever caught by someone happening
  to read the sentence, which is exactly how 30C survived six weeks past expiry
  on the homepage.

  **The structural finding, which matters more than any single item: the site
  has no mechanism for dated claims.** Nothing carries a "verified as of"
  marker, no review cadence exists, and `resources.json` records a publish date
  but nothing about whether the content is still true. Two articles hold **nine
  rate-pinned figures between them**, and neither has been re-read since it was
  written. Any fix worth doing here is a process, not a sweep.

  Highest risk, specific figures stated as settled fact:

  | File and line | Claim | Why it decays |
  |---|---|---|
  | `articles/ada-compliance-paid-parking.html:1` | ~~"penalties ranging from **$75,000** for first offenses to **$150,000** for subsequent violations"~~ **FIXED `b3b35ca`** | Was the 2014-era figure. Now $118,225 / $236,451 with the Attorney-General-only qualifier and a verified-as-of marker. **Needs annual review each July, see below.** |
  | `articles/parking-lot-revenue-tax-implications.html:16` | "Minnesota taxes nonresidential parking at **6.875%**. Texas applies **6.25%** at the state level, with local additions bringing the total to **8.25%** in most major cities. Wisconsin charges **5%** statewide. Colorado has a **2.9%** state rate" | Four state rates in one sentence. The state figures look right, but the sentence omits Minnesota metro transit taxes and Milwaukee city and county additions, so the effective rates it implies are low. Highest-count decay surface on the site. |
  | `articles/parking-lot-revenue-tax-implications.html:5` | "no self-employment tax (**currently 15.3%**)" | Correct today. "Currently" is a decay word with no review date attached to it. |
  | `articles/parking-lot-revenue-tax-implications.html:21` | "Even after UBIT (at the **21% corporate rate**)" | Correct today. Rate-pinned. |
  | `articles/parking-lot-revenue-tax-implications.html:13` | "**Bonus depreciation** or **Section 179** expensing may let you accelerate" | Written against pre-OBBBA rules. Bonus depreciation was restored by the same act that killed 30C. The hedge survives; the article has not been re-read. |
  | `articles/parking-lot-revenue-tax-implications.html:24` | "the Qualified Business Income deduction under **Section 199A**" | Was scheduled to expire after 2025 and was made permanent by OBBBA. Hedged with "potentially", so it survives, but for the wrong reason. |
  | `articles/ada-compliance-paid-parking.html:27` | "**ADA does not require free parking** for people with disabilities." | Correct federally, stated unqualified. Several states and municipalities do mandate free or extended parking for placard holders. Aimed directly at owners setting enforcement policy. |
  | `articles/ev-charging-parking-revenue.html:11` | "Level 2 chargers cost **$2,000 to $5,000** per unit installed" | Not statutory, same decay class, and it is the sentence the 30–50% incentive claim used to sit beside. |

  Checked and found **appropriately hedged**, listed so they are not re-flagged:
  `articles/is-it-legal-to-charge-for-parking.html` (all jurisdictional);
  `faq/index.html:539` (note each answer exists **twice**, once in the
  `FAQPage` JSON-LD and once in the visible accordion, so any edit is two
  places per answer); `articles/church-parking-revenue-guide.html:23` (UBI,
  "consult your accountant"); `articles/how-to-start-charging-for-parking.html:21`
  ("often legally required"); `resources/states/colorado/owner-faqs/index.html:275`
  (sign ordinances).

  One superlative found in passing that the existing superlative entry above
  does not list: `articles/ev-charging-parking-revenue.html:15`, the heading
  "Where EV Charging Parking Works **Best**". That makes five, not four.

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
  `@import url('/css/style.css')`, so it loads on 104 files: 73 article pages,
  30 video pages, and the template. Deleting it would have broken them. Removed
  from this list. **Count corrected 2026-08-11**, from 103 and "the resources
  hub", which does not load it.
- `images/services.webp` and `images/services.jpg`, the old /services/ hero
  photograph, referenced by nothing since the services restructure on
  2026-08-12. Generic stock and the last photograph on an otherwise
  typographic site. Deletion candidates.
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
- **Content pass over the 30 video pages.** Found 2026-08-11 while fixing the
  measure. Two items, both copy only:

  **First person: 46 occurrences across 22 of the 30 pages.** Mostly the CTA
  line, which is unique per page but almost always phrased "Let's talk",
  "Let's run the numbers", "Let's discuss your options". Also "our parking
  technology" and "our cameras" in several summaries. Same treatment as the
  article CTA pass: rewrite to second person against the house style the EV
  articles use.

  **All 30 transcripts are placeholders.** See the video section above. Filling
  them is the highest-value content work available on these pages and it also
  unblocks the deferred reading treatment.

  **NOT a violation: the "$2,500" referral figure** on
  `resources/videos/parking-referral-program/` ("Know someone with a parking
  lot? Refer them and earn up to $2,500."). **Confirmed accurate by Ben,
  2026-08-11.** It is a real programme figure, not a fabricated statistic, and
  it is deliberately recorded here so it does not get re-flagged by the next
  audit that greps for currency amounts. Leave it as written.

- **State-targeted Google Ads campaign, and whether it needs its own landing
  pages.** Recorded 2026-08-16. Planned, not scheduled. Two things have to be
  settled before anyone builds a page for it, and they pull in opposite
  directions.

  **The state content that exists is uneven.** Subpages exist for **Colorado,
  Minnesota, Texas and Wisconsin**, seven per state under
  `/resources/states/{state}/`. Colorado and Wisconsin are complete. **Several
  are too thin to take paid traffic**, and the specifics are already recorded
  in the entry directly below this one: five of the seven Texas subpages carry
  no `h2` at all, `texas/financial-impact` is the thinnest, and
  `minnesota/value-add-strategy` sits just under the threshold. Sending bought
  clicks to those is worse than sending them nowhere, because a thin page
  converts badly *and* takes the quality score down with it. **Texas is the
  state to fix first if Texas is a state being bid on.**

  **A state landing page that duplicates `/consultation/` puts two pages in
  competition for the same conversion.** `/consultation/` is the paid
  conversion path and is bid against 18 phrase-match keywords; see the
  `/consultation/` chapter above. A per-state clone of it would split the
  conversion signal across two URLs, give Ads two candidates for the same
  intent, and double the surface that has to stay in sync with whatever the
  revenue share number turns out to be. **The choice is between geo-modified
  copy on the single existing landing page and genuinely separate pages, and
  it needs making before the first one is built, not after.**

  Related and already open: the state TOC is blocked on the same thin content,
  and the four state tax rates in
  `articles/parking-lot-revenue-tax-implications.html:16` become a
  higher-exposure claim the moment paid traffic is aimed at those states. See
  the dated-claims audit above.

- **Five Texas state subpages have no body headings, and one is close to
  empty.** A content gap, not a design gap: the reading typography now applied
  to these pages has almost nothing to work on. Found 2026-08-11 while porting.

  `texas/financial-impact`, `texas/market-overview`, `texas/property-types`,
  `texas/seasonal-considerations` and `texas/technology-solutions` contain **no
  `h2` at all**. Their only heading below the `h1` is the `h3` inside the
  `.article-cta` block, which is CTA copy rather than a section, so the document
  outline jumps `h1` to `h3` and the body has no structure.

  `texas/financial-impact` is the thinnest: **1,503 bytes, five paragraphs, no
  headings, no lists.** For comparison the equivalent
  `colorado/financial-impact` runs eight `h2` sections.

  `minnesota/value-add-strategy` has three `h2`, just under the threshold a
  table of contents would need.

  This is a writing job, not a sweep. It also blocks the state TOC, which is
  why that was deferred rather than built.

- **Content pass over the 73 article body fragments.** Hand-written, predating
  the content rules. Inventory taken 2026-08-11 across `articles/*.html`.

  **The CTA paragraphs are DONE**, see the resolved section in the article
  chapter above: 10 contact CTAs removed, 12 calculator CTAs normalised, first
  person gone from all of them. What remains:

  **First person in the cross-link paragraphs.** At least 8 use "our guide" or
  "see our guide to X": `announce-paid-parking-guide`,
  `church-parking-revenue-guide`, `college-town-parking-revenue`,
  `dynamic-pricing-guide`, `first-90-days-paid-parking` (x2),
  `handling-parking-violations-disputes`, `how-to-start-charging-for-parking`,
  `medical-facility-parking-revenue`, `office-building-parking-revenue`,
  `parking-lot-insurance-requirements`. Mechanical fix: "our guide" to "the
  guide". Lower priority than the CTAs were, since these are mid-prose and read
  as editorial voice rather than as a sales ask.

  **Superlatives, 4.** "parking signage **best** practices"
  (`announce-paid-parking-guide`), "the **best** revenue share deals"
  (`ev-charging-revenue-share-vs-ownership`), "**top** amenity"
  (`hotel-ev-charging-guest-revenue`, `hidden-costs-ev-charging-installation`).

  **Unverified statistics.** None are Eau Claire or Stillwater figures, so none
  are covered by the case-study exemption. Headline examples: "revenue increases
  of **12 to 35%**" in the `dynamic-pricing-guide` lede, "**26%**",
  "**40 to 60%**", "**30%**" (EV articles), "**15 to 25%** revenue increase,
  **10 to 15%** occupancy improvement", "**80-90%** compliance", "**25%** in
  most major cities". Each needs a source or needs to go.
  **This is the substantive half of the remaining work** and needs
  Ben, not a mechanical sweep: every figure is either sourceable or not.

  **CORRECTION, 2026-08-13.** This entry previously read: *"The Section 30C
  '30% of installation costs' figure is statutory and is the one likely to
  survive as written."* That was wrong twice, and it is recorded rather than
  silently deleted because it is the kind of error that repeats.

  Wrong the first time on the number. 30% was never the rate for commercial
  property as such. The base credit was **6%** of eligible costs, capped at
  $100,000 per item; 30% was an enhanced rate available only where the project
  met prevailing wage **and** registered apprenticeship requirements, and only
  in an eligible census tract. Two articles quoted a bare "up to 30%" and one
  quoted a flat "30% to 50%" for federal and state incentives combined. Calling
  the figure statutory treated a conditional ceiling as a rate.

  Wrong the second time on durability. "Statutory" was read as "stable". The
  credit was terminated early by the One Big Beautiful Bill Act, which moved
  the expiry from December 31, 2032 to **June 30, 2026**. It was already dead
  when the note was written.

  The general lesson, which is the reason this correction is kept: **a citation
  to statute is not a source.** It fixes where a number comes from, not whether
  the number is current or whether the copy stated it correctly. Statutory
  figures belong in the dated-claims audit below, not in an exemption from it.

- `INLINE_CTA_COPY` in `js/article.js` uses first-person language against the
  content rules. So does the string written into `#article-footer-copy` at
  `js/article.js:136`. Both need the same pass. Do not touch that file for copy
  alone; fold it into a pass that has another reason to be there.
- **Dead code in `js/article.js`.** `insertInlineCta()` at line 169 is never
  called: `enhanceBody()` at line 158 only sets lazy loading and backfills
  `alt`, and carries the comment "Mid-article CTA removed - only bottom CTA
  should appear". `setRobots()` at line 505 is also never called; the robots
  meta is set inline at line 149 and in `renderNotFound()`. Removing either
  means editing the file that carries both guards, so this waits until after
  merge day. Note `INLINE_CTA_COPY` and the `inline` key in `CTA_EVENTS` are
  only reachable through the dead `insertInlineCta()`, so the first-person copy
  above is currently unreachable at runtime and cosmetic. It still goes.
- The `.cta-inline` rules in `css/style.css:50-76` style only what the dead
  `insertInlineCta()` would have produced. They go with it.
- **Four dead classes in `css/state-map.css`**, used by zero pages, verified by
  matching every class in the file against every HTML file on the site:
  `.article-placeholder` (and its `h3` and `p` rules), `.empty-state` (and its
  `h2`, `p`, `.btn` and `.btn:hover` rules), `.state-article-card` (and its
  `:hover`), and `.state-articles-grid`. Roughly 50 lines. Same situation as
  `.cta-inline` above and worth removing in the same pass, since both are
  "styles for markup that no longer exists" rather than genuinely orphaned
  files.
- **Four more dead files, added 2026-08-15 with the resources service split.**
  Same "worth removing in one pass, not four" situation as `.cta-inline` and the
  dead `.calc` block above. All verified referenced by **zero** pages:
  `js/related.js` (the related rail is built by `js/article.js`; `related.js`
  reads a `data-resource-category` attribute that exists on no page),
  `js/article.min.js`, `js/resources.min.js`, `js/related.min.js`. The three
  `.min.js` files also still carry the OLD blue `#0b6efd` palette, so if one
  were ever wired up it would ship the pre-rebrand colours. `js/related.js` got
  the same coercion fix as `js/resources.js` in `2e2afb6` so the two copies do
  not drift while it sits unused. `css/resources.min.css` is likewise
  unreferenced while `css/resources.css` is live.
- **`readTime` values contain en dashes.** Stored as the escape `\u2013`, so
  they render as "5–6 min" on every card. The content rules prohibit en dashes.
  Roughly 51 records. Deliberately not swept into the `service` backfill commit,
  because a data commit that also rewrites unrelated values is a commit nobody
  can review.
- **The resources filter and search are ANDed, and it is more confusing under a
  service axis.** `applyFilters()` in `js/resources.js` requires BOTH
  `matchesService` and `matchesSearch`, so typing a query while a service chip
  is active silently narrows twice, and the featured carousel and the series
  block both vanish on any search at all (they are gated on
  `state.filter === 'All' && !state.search`). Before the split this read as
  "search within Guides", which is at least guessable. Now it reads as "search
  within Parking", and a visitor searching for an EV term while Parking is
  active gets an empty grid with no explanation of why. Left alone deliberately:
  the search bar was explicitly out of scope for the service split, four weeks
  from the conference. The fix is a decision, not a bug fix: either searching
  resets the chip to All, or the empty state says which filter is suppressing
  the results.
- **`ada-compliance-paid-parking.html:27`: "ADA does not require free parking"
  is stated unqualified.** Its own pass, deliberately not folded into the
  penalty fix in `b3b35ca`, which was about a different claim in the same file.
  Federally the statement is correct. Several states and municipalities do
  mandate free or extended parking for placard holders, and the sentence gives
  an owner no signal that local law might override it. The article partly
  self-corrects two sentences later with "Some jurisdictions prohibit charging
  disabled placard holders. Check local laws before implementing payment
  requirements for accessible spaces", so the fix is likely a reordering rather
  than new research: lead with the qualifier instead of trailing it. Aimed
  directly at owners setting enforcement policy, which is what makes it worth
  doing properly rather than quickly.
- Content rebalancing toward genuine three-pillar parity once lighting content
  earns traffic.
- Webflow migration evaluation, if in-house editing without a repo becomes a
  requirement.
