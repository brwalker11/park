# Rebrand Execution Plan

Status: ACTIVE. Written 2026-08-05 (Wednesday) on `rebrand`, against
`docs/design-direction.md` and `docs/design-direction-audit.md`. Those two
documents are inputs and are not modified by this plan. Decisions listed under
"Settled decisions" below are final and are not reopened here.

---

## Does the plan fit

Yes, with cuts. The audit priced the design direction as written at 26 to 37
working days against roughly 27 available. This plan schedules 26 working days
of implementation between Thursday Aug 6 and Friday Sep 11 by making the
following changes: the EV consolidation page is cut entirely (nav entry and
light tidying only), Pass 2c shrinks to a scripted literal recolor with all
tokenization deferred post-conference, motion reduces to two patterns (section
reveal and nav underline; the stat count-up is cut), the calculator gets a
two-day reskin instead of a redesign, the inline recolor is bundled into the
same 148-page sweep as the header and footer so the site is swept once instead
of twice, and the week of approval latency in the design document's schedule
disappears because every flagged decision is already settled. Weekends, the
final Friday, and a defined cut list at the week 3 checkpoint are the buffer.
Nothing merges to `main` until merge day, Thursday Sep 10.

---

## Settled decisions (inputs, not open questions)

From the design direction: canonical blue `#004FC8`; `#010D20` confirmed as
the dark surface; Inter retained and self-hosted as a variable font, no second
face; one 1200px container with breakpoints at 640/768/1024; hybrid dark
(navy chrome, light article and state body content).

From the audit: Pass 2c splits into a pre-conference scripted recolor and
post-conference tokenization; motion reduces to one or two reveal patterns;
the calculator gets a minimal reskin.

Departing from the audit's cut list: the parking-revenue pillar page ships
(it is the core business and the keyword footprint). EV consolidation is cut
instead: no new EV page, only a nav entry pointing at `/services/#ev` and
light tidying of the EV block on the services hub. The solar lighting page is
non-negotiable; it is the conference gap.

Ownership: solar page copy and all photography are Ben. Everything else is
Claude Code, directed by Ben.

Success criterion: the site is live and correct on production by the
conference. There is no mid-flight demo; the preview URL only needs to be
presentable at the stakeholder review on Monday Sep 7.

---

## Calendar and capacity

Today is Wednesday Aug 5. Assumed conference start: Saturday Sep 12 (5.5 weeks
out; Ben confirms the exact date this week, decision 1 below). The site must
be live and verified by Friday Sep 11, so merge day is Thursday Sep 10.

Working days available Aug 6 through Sep 11: 27. Scheduled implementation: 26
days. Buffer: the unscheduled remainder of Friday Sep 11, all weekends, and
the checkpoint cut list (worth 3 recoverable days).

| Work item | Days |
|---|---|
| Pass 2a: tokens, aliases, `@font-face`, font files | 2 |
| Homepage greyscale comp | 0.5 |
| Pass 2b: consolidation (blues, whites, greys, shadows, radii, weights, JS tables) | 2 |
| Bundle B build: header, nav dropdowns, mobile panel, footer, recolor script | 3 |
| Bundle B propagation across 148 pages, rebuild, automated verification | 2 |
| Bundle B visual and accessibility verification | 1 |
| Homepage rebuild | 3 |
| Services hub restructure (including EV tidy block) | 1 |
| Solar lighting page build (copy from Ben) | 1 |
| Parking-revenue pillar page | 1 |
| Calculator minimal reskin | 2 |
| Bundle C: icon sweep plus motion (one template touch, one rebuild) | 1 |
| Imagery placement and og-image | 1 |
| QA: automated suite, Lighthouse, visual matrix, devices | 2 |
| Merge week: fixes, freeze, pre-merge verification, merge, production checks | 3.5 |
| **Total** | **26** |

Ben's solar copy (2 to 3 days of writing) and all photography run in parallel
and consume none of these 26 days.

---

## The critical CSS constraint, and how every pass respects it

The audit's key defect finding: the inline `<style>` payloads on 119 pages are
the site's critical CSS. `styles.css` loads asynchronously via the
preload-onload pattern, so the inline block is everything a visitor sees at
first paint. Deleting "rules now covered by `styles.css`" would reintroduce a
flash of unstyled content on every swept page.

This plan's handling, stated explicitly:

1. **Nothing is deleted from any inline payload before the conference.** The
   conference-scope inline work is a literal-for-literal recolor: old hex and
   rgba values are rewritten to the new values in place. Rule count, selector
   set, and payload structure are unchanged.
2. **The recolor writes hex literals, not `var()` references.** A `var()`
   inside inline critical CSS would resolve only after `styles.css` delivers
   `:root`, which is exactly the async load the pattern exists to hide. Token
   references in inline payloads would themselves cause a color flash.
   Tokenization of inline CSS is therefore structurally a post-conference
   task, not merely a deferred one. This contradicts the design document's
   Pass 2c wording and is listed in the contradictions section.
3. **The header redesign updates the inline payloads, it does not bypass
   them.** The current header's first-paint rules
   (`.header-inner{height:120px}` etc.) live inline. The new navy header's
   critical rules replace them inside each inline payload during the Bundle B
   sweep, so the new header renders at first paint with no flash. Non-critical
   header styles (dropdown panels, hover states) go to `styles.css` only.
4. **Verification is a first-paint test, not just a loaded-page test.** For
   one page per payload group (15 groups), the page is loaded with the
   `styles.css` request blocked and screenshotted. The post-sweep blocked
   screenshot must show a fully styled above-the-fold page in the new colors.
   Any unstyled flash fails the group and reverts it.

---

## Task 1: Photography plan

Photography is the critical path with the longest lead time. Sources: the
45-second field video in the repo (`images/home_video.mp4`, 1080p), the
Dayton field footage referenced in project history (not in the repo; Ben
locates and delivers it), and one new solar shoot (nothing in any existing
footage covers solar lighting).

### Shot list

| # | Image | Appears | Must show | Orientation | Source |
|---|---|---|---|---|---|
| 1 | Approach still | Homepage section 6 (approach, two-column) | A real site walk or install in progress on an actual client lot; a person or equipment in frame, not an empty lot | Landscape 16:10, min 1600px wide | Still pull: `home_video.mp4` or Dayton footage. Prefer Dayton, because the same hero video plays two sections above and a repeated frame reads as filler |
| 2 | Parking pillar hero | `/services/parking-revenue/` hero, reused as a smaller crop on the services hub parking block | A monitored lot: camera, signage, or payment tech visible | 21:9, min 1600px wide | Still pull: `home_video.mp4` or Dayton footage |
| 3 | Solar pillar hero | `/services/solar-lighting/` hero, reused on the services hub solar block | A solar lighting fixture on a lot pole; dusk or dark-sky framing is ideal because it drops straight into the navy scrim treatment | 21:9 or 16:10, min 1600px wide | **New shoot. No existing footage covers solar.** |
| 4 | Solar install detail | `/services/solar-lighting/` body | Close or mid detail of the fixture or panel; establishes the service is real, not rendered | Landscape 16:10, min 1200px wide | New shoot, same session as #3 |
| 5 | Quote headshot | Homepage section 6, beside the named quote | Head-and-shoulders of the Eau Claire contact | Square, min 480px | Supplied by client; gated on permission |
| 6 | og-image | Social cards site-wide | Navy `#010D20` field, gradient logo, wordmark | 1200x630 exactly | Built by Claude Code from existing brand assets. No photography needed |

The services hub needs no shots of its own: it reuses crops of #2 and #3, and
the EV block uses the icon and data-graphic treatment (no EV photography
exists and none is being commissioned).

### What existing footage plausibly covers

`home_video.mp4` is real field footage of lots and can plausibly yield #1 and
#2. The open question is whether compressed 1080p frames survive a 1600px
crop; that is answered this week, not in week 5: on Friday Aug 7 Claude
exports three candidate frames, processes them through the full pipeline, and
Ben judges them at size on the preview. The Dayton footage is the better
source if it is higher quality or steadier; Ben delivers it by Friday Aug 14
so its frames go through the same evaluation. #3 and #4 cannot come from any
existing footage.

### Latest dates

| Image | Ideal delivery | Absolute latest (blocks nothing before this) |
|---|---|---|
| #1 Approach still | Fri Aug 28 | Wed Sep 2, end of day (placement day is Thu Sep 3) |
| #2 Parking hero | Fri Aug 28 | Wed Sep 2, end of day |
| #3, #4 Solar images | Fri Aug 28 (shoot complete by Thu Aug 27) | Wed Sep 2, end of day |
| #5 Headshot | Fri Aug 21 (with permission answer) | Wed Sep 2, end of day |
| #6 og-image | n/a | Built Thu Sep 3 by Claude Code |

Nothing blocks earlier than these dates because every page that takes an
image is built fallback-first (below) and the image is a swap-in.

### Fallback design per slot

Fallbacks are designed components, not placeholders, and each page is built
in its fallback state first so a missing image looks intentional.

| Slot | Fallback |
|---|---|
| #1 Approach still | A data-graphic card on `--navy-900`: the Eau Claire compliance move (45 to 90 percent) drawn as a simple two-bar comparison with silver stat numerals and the `--gradient-brand` rule. Verified figures only. It does the same credibility job as the photo and matches the proof band visually. |
| #2 Parking hero | Navy hero with a faint radial `--blue-deep` glow, the 178 percent figure in `--gradient-silver` display treatment, eyebrow and lede over it. Same pattern as the homepage CTA band, so it reads as a system, not a gap. |
| #3 Solar hero | Same navy hero pattern with the green-scoped eyebrow and a large inline Lucide sun-and-pole icon composition at 15 percent opacity as the background motif. The page is designed dark-typographic-first; the photo upgrades it. |
| #4 Solar detail | The slot collapses; the benefit grid extends to full width. No empty region remains. |
| #5 Headshot | The quote renders as a typographic quote card with attribution line only; if permission itself is refused, the founder quote replaces it (decided fallback per the design document). No photo slot remains either way. |
| #6 og-image | None needed; buildable from committed assets. |

### Processing pipeline

- Export: `ffmpeg -ss <t> -i images/home_video.mp4 -frames:v 1` to PNG at
  native resolution; Dayton footage same treatment.
- Crop to the slot's aspect ratio, then convert with sharp (already a
  dependency) to WebP quality 85. Target under 200 KB per CLAUDE.md; heroes
  at 1600px wide, supporting images 1200px, headshot 480px.
- Naming: `images/field_{subject}.webp` following the existing
  `camera_lot.webp` convention (`field_sitewalk.webp`, `field_lot_camera.webp`,
  `field_solar_pole.webp`, `field_solar_detail.webp`).
- Location: `/images/`, referenced with root-relative `/images/...` paths,
  `width`/`height`/`alt` attributes mandatory, `loading="lazy"` below the
  fold. `npm run generate:thumbnails` will pick them up harmlessly.
- Never commit raw JPGs or PNG intermediates; WebP only.

---

## Task 2: Week-by-week schedule

Verification legend: A = automated (grep, hash, count, `node --check`,
scripted screenshot diff), V = visual review. Owner: BW = Ben, CC = Claude
Code.

### Week 1: Wed Aug 5 to Fri Aug 7 (3 days)

| Day | Item | Owner | Depends on | Verify | Days |
|---|---|---|---|---|---|
| Wed 5 | This plan; decision list issued to Ben | CC | none | n/a | 0 (today) |
| Wed 5 | Decisions 1 to 3 (conference date, solar shoot, Ads switch request); send quote-permission request; start locating Dayton footage | BW | none | n/a | parallel |
| Thu 6, Fri 7 | Pass 2a: single `:root` in `styles.css` with the full token set and scales, old names aliased, Inter variable woff2 files added at `assets/fonts/` with `@font-face` | CC | none | A (screenshot diff on 8 pages: pixel-identical except font rendering) + V spot check | 2 |
| Fri 7 | Still feasibility test: three frames from `home_video.mp4` through the full pipeline, staged on preview for Ben | CC | none | V (Ben judges Mon) | inside 2a days |
| Fri 7 | Solar copy outline started | BW | none | n/a | parallel |

### Week 2: Mon Aug 10 to Fri Aug 14

| Day | Item | Owner | Depends on | Verify | Days |
|---|---|---|---|---|---|
| Mon 10 | 2a verification wrap; homepage greyscale comp (static HTML mock on preview: navy bands, seam overlap, section order) | CC | 2a | V (Ben) | 1 |
| Tue 11 | Comp approved or corrected | BW | comp | V | parallel |
| Tue 11, Wed 12 | Pass 2b: 757 blues to the `#004FC8` family, 16 whites to 3, 10 greys to 1, 96 shadows to 4, radii to the 5-token scale, weights 850/900 to 800, JS category tables consolidated and recolored (removing `#0A7C6B` per the green rule), `js/state-map.js:109` literal fixed | CC | 2a | A (grep zero legacy literals in the four stylesheets and three JS files; `node --check`) + V spot check | 2 |
| Thu 13, Fri 14 | Bundle B build, days 1 and 2: navy header and footer components in `styles.css` and `templates/article-index.html`; dropdown with focus management; mobile panel; logo swap to `MP_Logo_400.png`; recolor script authored | CC | 2b | A + V in progress | 2 |
| Fri 14 | Dayton footage delivered | BW | none | V (frame quality, following week) | parallel |
| All week | Solar copy drafting | BW | none | n/a | parallel |

### Week 3: Mon Aug 17 to Fri Aug 21

| Day | Item | Owner | Depends on | Verify | Days |
|---|---|---|---|---|---|
| Mon 17 | Bundle B build day 3: component finished on homepage and template; recolor script tested against one uniform payload group with the first-paint (styles.css-blocked) check | CC | Bundle B build | A | 1 |
| Tue 18, Wed 19 | Bundle B propagation: scripted rewrite of header and footer markup, inline-payload header rules, inline recolor, anchor `scroll-margin-top` retune (100px to 88px for the 72px header), and font preload links, across all 148 shared pages including `404.html` and the hand-written `articles/parking-today-small-lots/index.html`; `npm run build`; 72 regenerated pages committed with the template change | CC | script tested | A (guard hash suite, recolor greps, byte-delta and rule-count assertions, rebuild determinism, FOUC check on one page per payload group) | 2 |
| Thu 20 | Bundle B visual and accessibility verification: focus trap, Escape, dropdown keyboard nav, real devices, the 768 to 1024 band; fixes | CC | propagation | V | 1 |
| Fri 21 | Homepage rebuild day 1 (structure per design direction section 7, emoji replaced with inline SVG as part of the rebuild) | CC | Bundle B, approved comp | V | 1 |
| Fri 21 | Solar copy delivered | BW | none | n/a | parallel |
| Fri 21 EOD | **CHECKPOINT** (defined below) | BW+CC | all above | n/a | n/a |

### Week 4: Mon Aug 24 to Fri Aug 28

| Day | Item | Owner | Depends on | Verify | Days |
|---|---|---|---|---|---|
| Mon 24, Tue 25 | Homepage rebuild days 2 and 3; verify | CC | week 3 | V (375 / 800 / 1280, seam overlap, scrim, proof band) | 2 |
| Wed 26 | Services hub restructure: three pillar summary blocks, anchors preserved, EV block tidied with curated article links | CC | homepage patterns | V + A (anchor IDs unchanged) | 1 |
| Thu 27 | Solar lighting page built from Ben's copy, fallback-first hero | CC | solar copy (hard gate Wed Aug 26) | V | 1 |
| Fri 28 | Parking-revenue pillar page (reuses the solar page's pillar pattern); nav items repointed from anchors to the two pillar pages | CC | solar page pattern | V + A (nav href grep across 148 pages) | 1 |
| Thu 27 | Solar shoot completed | BW | shoot decision (Aug 7) | n/a | parallel |
| Fri 28 | All photography delivered: solar images, approach still, parking hero selects | BW | shoot, footage evaluation | V | parallel |

### Week 5: Mon Aug 31 to Fri Sep 4

| Day | Item | Owner | Depends on | Verify | Days |
|---|---|---|---|---|---|
| Mon 31, Tue 1 | Calculator minimal reskin: shared navy chrome already applied by Bundle B; this pass tokens the layout surfaces, navy results panel, report modal brought into the form system. No flow changes | CC | Bundle B | V (full calculator run-through, report page, page-load gtag event untouched) | 2 |
| Wed 2 | Bundle C: remaining icon sweep (pseudo-element checkmarks, stray emoji outside the homepage) plus motion (single IntersectionObserver: section reveal, nav underline; `prefers-reduced-motion` gate). One template touch, one `npm run build`, 72 pages recommitted | CC | Bundle B | A (rebuild, guard hashes) + V (reduced-motion check) | 1 |
| Thu 3 | Imagery placement (swap fallbacks for delivered stills), og-image built and verified in meta tags | CC | photography (Wed Sep 2 latest) | V + A (og meta grep) | 1 |
| Fri 4 | QA day 1: full automated suite (guard hashes, legacy-blue grep, green-scope grep, contrast script over token pairs, alias-leak grep, `node --check`, rebuild determinism, `git diff` on `consultation/` must be empty), Lighthouse on homepage, one article, one state page | CC | all passes | A | 1 |
| Fri 4 | Solar copy last-resort gate: if copy never arrived, the cut-down solar page (hero, three benefits, CTA band) is locked as shipping content | BW | n/a | n/a | decision |

### Week 6: Mon Sep 7 to Fri Sep 11

| Day | Item | Owner | Depends on | Verify | Days |
|---|---|---|---|---|---|
| Mon 7 | QA day 2: visual matrix (pages listed in Task 5) at 375 / 800 / 1280, real devices; fix list executed. Stakeholder review opens on the preview URL | CC + BW | QA day 1 | V | 1 |
| Tue 8 | Review feedback fixes. **Freeze at end of day Tue Sep 8.** After freeze, content-only fixes | CC | review | V | 1 |
| Wed 9 | Pre-merge verification: guard hash suite final run; dry-run reverts of `187bfbd` and `3596d3d` on a scratch branch to surface `<head>` conflicts a day early; confirm Ads bidding switch status with Ben | CC | freeze | A | 1 |
| Thu 10 | **Merge day**, per the REBRAND.md checklist: revert `187bfbd`, revert `3596d3d`, confirm Ads bidding, PR `rebrand` into `main`, merge, verify production tracking (GA4 collect, Ads conversion on `consultation/thank-you/`), verify robots meta is `index,follow`, delete the preview Access application, annotate GA4 and Ads | CC + BW | Wed 9 clean | A + V | 1 |
| Fri 11 | Production soak: spot checks across the visual matrix on the live domain; buffer for anything found | CC | merge | V | 0.5 |

### Rules the schedule enforces

- Ben's solar work and all photography are parallel tracks; no CC day waits
  on them because every dependent page is built fallback-first.
- Template touches happen exactly twice (Bundle B, Bundle C), each followed
  by `npm run build` with the 72 regenerated pages committed alongside.
- The gtag gate (`187bfbd`) and noindex guard (`3596d3d`) are hash-verified
  after every sweep commit; any sweep script anchors its edits on the header
  and footer markup and the inline `<style>` blocks, never on the gated
  `<head>` region. Font preload links insert adjacent to the existing
  stylesheet preload, away from the guard blocks.
- `/consultation/` is frozen. The unfreeze is a scheduled decision point at
  the Friday Aug 21 checkpoint: if Google Ads bidding has switched off
  Maximize Clicks by then, a one-day consultation token alignment MAY be
  added to Wednesday Sep 2 using float; if not, the pages ship untouched and
  their pass stays post-conference. No part of this plan assumes the switch.
- Nothing merges to `main` before Thursday Sep 10.

### The week 3 checkpoint (Friday Aug 21, end of day)

Must all be true:

1. Tokens, aliases, and self-hosted Inter live site-wide (Pass 2a and 2b
   complete, verified).
2. Navy chrome (header, nav, footer, logo) live on all 148 shared pages on
   the preview, guard hashes clean, rebuild clean, inline recolor applied
   with zero legacy blues outside `consultation/` and the untouched
   minified/critical files.
3. First-paint check passed for all 15 payload groups.
4. Homepage rebuild underway with the approved comp.
5. Solar copy delivered (grace until Wednesday Aug 26).

If 1 to 3 are not all true, the following cuts execute immediately, in order,
recovering 3 days: the parking-revenue pillar page is cut (nav points at
`/services/#parking`; 1 day), the calculator reskin is cut to the recolor it
already received from Bundle B (2 days). If more is needed: motion is cut
from Bundle C (0.5 day) and the services hub restructure is cut to a
recolored current page with solar and EV link blocks (0.5 day). Week 4 then
contains only: finish chrome, homepage, solar page.

If only 5 is false, Claude drafts the solar page from Ben's outline on Monday
Aug 24 for Ben to edit in place.

---

## Task 3: The minimum shippable site

The minimum is: Bundle A (tokens, fonts) + Bundle B (chrome and recolor,
sweeping all 148 shared pages) + the homepage rebuild + the solar page +
guards intact + merged. Everything else is above minimum. This is the
fallback state if week 4 goes badly; the checkpoint cut list degrades toward
exactly this.

Page-by-page (groups sum to the site's ~150 rendered pages):

| Page group | Pages | In minimum? | What a visitor sees at minimum |
|---|---|---|---|
| Homepage | 1 | Yes, full rebuild | New chrome, navy hero, proof seam, What We Do cards, real Inter. The solar and EV cards link to `/services/` anchors if the pillar pages were cut |
| Solar lighting page | 1 (new) | Yes, non-negotiable | At worst the cut-down form: navy hero, three benefits, CTA band. Fallback-first design, so no gaps |
| Generated articles | 72 | Yes, via sweep | Navy header, nav, footer; new palette and Inter; light article body unchanged. Reads as fully on-brand because chrome and palette carry the brand |
| Hand-written article (`parking-today-small-lots`) | 1 | Yes, manual sweep edit | Same as generated articles. Its pre-existing rendering bug stays (per CLAUDE.md, not rebrand work) |
| Video pages (`resources/videos/*`) | 30 | Yes, via sweep | New chrome and palette on the existing layout |
| Resources hub + states hub | 2 | Yes, via sweep | New chrome; category colors recolored in JS; map tint fixed |
| State pages (4 hubs + 28 sub-pages) | 32 | Yes, via sweep | New chrome and recolored bespoke payloads; body layout unchanged, per the design direction anyway |
| Services | 1 | Yes, reduced | Recolored current layout with working anchors. The hub restructure is above minimum |
| Parking-revenue pillar | 1 (new) | **No** | Does not exist; nav points at `/services/#parking`. Nothing broken, nothing missing to a visitor |
| About, FAQ, Contact, contact thank-you | 4 | Yes, via sweep | New chrome and palette on existing layouts |
| Calculator + report | 2 | Yes, reduced | New chrome and recolored payload on the existing layout. The layout underneath is dated; this is the most visible seam in the minimum (see below) |
| Ask the Experts | 1 | Yes, via sweep | New chrome and recolored cards; page-level redesign was never in scope |
| 404 | 1 | Yes, via sweep | New chrome |
| Consultation pages | 2 | **No, by standing rule** | Old branding in full. Reached only by paid ads and direct links (noindex, zero internal links). Deliberate, documented, accepted |

Internal consistency verdict: the minimum is consistent, not half-rebranded,
because the three things a visitor reads as "the brand" (chrome, palette,
typeface) are delivered site-wide by Bundles A and B in a single sweep. No
page shows the old blue next to the new navy. The two honest seams:

1. The calculator's layout is dated under its new coat. In the minimum it is
   recolored and re-chromed but not reskinned. Acceptable: it is consistent
   in color and chrome, and dated-but-coherent beats inconsistent.
2. `/consultation/` shows the previous brand entirely. This is the standing
   freeze and is invisible to organic and conference traffic.

Neither seam produces the half-rebranded failure mode, so the minimum stands
without adjustment.

---

## Task 4: Sequencing and conflicts

Every place two workstreams touch the same files, resolved into single-pass
bundles:

**Bundle A: the token layer.** Files: `styles.css`, `css/article.css`,
`css/resources.css`, `css/state-map.css`, `js/related.js`, `js/resources.js`,
`js/state-map.js`. Contains Pass 2a and Pass 2b as consecutive commits in
weeks 1 and 2. No other workstream touches these files until Bundle B adds
header/footer component rules to `styles.css` (additive, no conflict). The
anchor `scroll-margin-top` retune waits for Bundle B so it lands atomically
with the header height change.

**Bundle B: the one big sweep.** Files: `templates/article-index.html` plus
all 148 shared pages. Contains, in a single propagation: header redesign, nav
restructure, logo swap, footer redesign, inline-payload header rules, inline
literal recolor, anchor retune, font preload links. These five workstreams
(header, footer, logo, nav, recolor) all touch the same header markup and the
same inline `<style>` blocks; running them as separate sweeps would mean
editing 148 pages five times with five chances to disturb the guards. They
run once, in week 3, with one rebuild and one 72-page regeneration commit.
The token layer does not conflict with the recolor because the recolor writes
literals into inline payloads while tokens live only in the linked
stylesheets (see the critical CSS section).

**Bundle C: template polish.** Files: `templates/article-index.html` (again),
`styles.css` (additive), `script.js` or a new small JS module. Contains the
motion observer and the remaining icon sweep. Motion touches the article
template, which regenerates 72 pages; bundling it with the icon sweep's
template touches means the second and final rebuild of the project, on
Wednesday Sep 2.

**Bundle D: bespoke single pages.** `index.html`, `services/index.html`, the
two new pillar pages, `calculator/index.html`, `calculator/report/index.html`.
Each is a single file owned by one scheduled slot; no cross-conflicts. Each
receives Bundle B's chrome first, then its own pass edits body content only,
leaving the swept header/footer/guard regions untouched (verified by the hash
suite after every one of these commits too).

**Not touched by anything:** `consultation/`, `_redirects`, Formspree
endpoints, minified and critical CSS files, `js/*.min.js`,
`articles/{slug}/index.html` directly (template-generated only).

Ordering dependency worth stating: Bundle B propagation must complete before
any Bundle D page pass, because each bespoke page needs its swept chrome in
place before its body pass, and before Bundle C, because motion classes hook
into swept markup. The schedule respects this: B finishes Thursday Aug 20;
D runs Aug 21 to Sep 1; C runs Sep 2.

---

## Task 5: Verification plan

### Automated suite (runs after every sweep and every Bundle D commit)

- **Guard integrity:** script extracts the noindex guard block (by its
  `<!-- Preview noindex guard - remove on merge day -->` marker) and the gtag
  gate block from every page, hashes each, compares against a baseline
  captured today. Counts must hold: 150 noindex blocks, 149 gtag gates
  (404.html has no analytics; the sweep script must handle that page's
  absent gtag block without error, which is why 404.html is in the visual
  matrix).
- **Recolor completeness:** `grep -rc` for `#007bff`, `#0a68ff`, `#0b6efd`,
  `#1e2a3a`, `rgba(13,110,253` returns zero outside `consultation/`, the
  minified/critical files, and git history.
- **Green scope:** grep for `--green`, `#6DB133`, `#2D7A0E`, `#72B735`,
  `#0A7C6B` outside solar and EV scoped files and sections; any hit is a
  defect.
- **Payload integrity:** per payload group, byte-delta equals the sum of
  literal-length differences and `{` count is unchanged (proves recolor
  deleted nothing).
- **First paint:** one page per payload group loaded with `styles.css`
  blocked; screenshot must be fully styled above the fold.
- **Rebuild determinism:** `npm run build` twice, `git status` clean; 72
  generated pages, no more, no fewer, plus the hand-written article untouched
  by the generator.
- **JS health:** `node --check` on every edited JS file.
- **Consultation freeze:** `git diff main...rebrand -- consultation/` shows
  changes from zero rebrand commits (the diff against the branch point stays
  empty for that path).
- **Contrast:** the design document's computed pairing table re-verified by
  script against the shipped token values.
- **Links:** grep-based check that nav hrefs are identical across all 148
  pages and that pillar links resolve to existing files.

### Visual matrix (before merge; at 375, 800, and 1280 wide)

| Page | Why it must be looked at |
|---|---|
| `/` homepage | The most-changed page: hero scrim, proof seam overlap, What We Do cards, band rhythm, motion. First impression of the entire rebrand |
| One generated article (highest-traffic slug) | Proves the template chrome, the recolored skeleton first paint, inline CTA styling, and the light-body boundary of the hybrid |
| `/articles/parking-today-small-lots/` | The one page the generator skips; proves the manual sweep edit landed and its known bug got no worse |
| `/resources/states/wisconsin/` | Bespoke 6.6 KB inline payload recolored; state layout at the new breakpoints |
| `/resources/` | JS category colors, map tint fix, card system, filters |
| `/calculator/` | Second-largest bespoke payload, the site's most-linked conversion surface, and the reskin. Full run-through including the report modal and `/calculator/report/` |
| `/consultation/` | Verified UNCHANGED: visual spot check on top of the empty-diff assertion, because this page carries live ad conversion tracking |
| `404.html` | Sweep edge case (no gtag block) and conference attendees mistype URLs |
| `ask-the-experts.html` | Dark video cards on a navy band; the one dark-card surface outside the homepage |
| `/contact/` | The form system on a real form; Formspree endpoint untouched |
| `/services/` + both pillar pages | Anchors still land correctly under the 72px sticky header; hub blocks link right; green scoping on the solar page |

The 800px width is specifically for the 768 to 1024 band where the nav drops
the Calculator button. Mobile nav (focus trap, scroll lock, Escape) is
checked on a real phone, not only in an emulator.

---

## Task 6: Risk register

| # | Risk | Trigger | Impact | Mitigation | Decision point |
|---|---|---|---|---|---|
| 1 | Photography does not materialise | Files absent at end of day Fri Aug 28 | Homepage approach section and pillar heroes ship typographic; the audit's "still flat, just darker" scenario | Fallback-first build means zero schedule impact; the fallbacks are designed data-graphic components, not empty panels. Feasibility test on Fri Aug 7 converts "will video stills work" from a week 5 surprise into a week 1 answer | Wed Sep 2: fallbacks lock as shipping state; later arrivals go post-conference |
| 2 | Critical CSS defect causes visible regressions | Any payload group fails the styles.css-blocked first-paint check during Bundle B (Tue Aug 18 to Wed Aug 19) | FOUC on up to 119 pages | Recolor deletes nothing and writes literals, not `var()`; per-group verification and per-group revert; tokenization deferred entirely | Wed Aug 19: any failing group reverts and ships with old-value-free recolor retried; if a group cannot pass, it ships un-recolored inline (still coherent, colors then corrected post-conference) |
| 3 | Solar page copy is late | Not delivered Fri Aug 21 | The single conference-critical new page slips | Grace to Wed Aug 26; then Claude drafts from Ben's outline Mon Aug 24 for Ben to edit; page is built fallback-first so late copy is a paste, not a rebuild | Fri Sep 4: cut-down solar page (hero, three benefits, CTA) locks as shipping content |
| 4 | A pass breaks the gtag or noindex guards | Guard hash suite mismatch after any commit | Merge-day reverts of `187bfbd` / `3596d3d` conflict; worst case, production launches noindexed or untracked | Sweep scripts anchor on header/footer/inline-style regions, never the gated `<head>` blocks; hash suite after every sweep and Bundle D commit; dry-run reverts on a scratch branch Wed Sep 9 | Immediate on any mismatch: fix before the next commit. Wed Sep 9: dry-run must apply cleanly or Thu Sep 10 is spent resolving, using Fri Sep 11 as the soak day |
| 5 | Google Ads bidding does not switch off Maximize Clicks | Not switched by Fri Aug 21 (first check) or Wed Sep 9 (final) | `/consultation/` stays frozen and dual-branded through the conference; a merge-day checklist item cannot be ticked | The plan never assumes the switch: consultation work is not scheduled, only optioned into Sep 2 float if the switch lands early. Ben files the request Fri Aug 7 so the lead time is 4 weeks, not 4 days | Fri Aug 21: optional consultation alignment goes in or stays out. Wed Sep 9: if unswitched, merge proceeds anyway with consultation untouched; that is already the accepted trade |
| 6 | Scope creep from leadership | Any new request after Fri Aug 21 | The 26-of-27-day schedule has no room for additions | Standing rule, agreed via this plan: post-checkpoint requests go to the post-conference backlog unless leadership names equal scope to remove. Ben enforces; the homepage comp on Tue Aug 11 exists partly to surface opinions early, while reacting is cheap | At each request, same day. The comp review Tue Aug 11 and the stakeholder review Mon Sep 7 are the two sanctioned feedback windows |
| 7 | Bundle B overruns | Propagation not verified by end of day Thu Aug 20 | Everything downstream stacks behind the sweep; the checkpoint fails | Bundle B carries the project's only new interactive component (the dropdown), built and tested on two pages before propagation; the propagation itself is scripted against byte-identical chrome, which Pass 1 verified | Fri Aug 21 checkpoint: cut list executes, recovering 3 days |

---

## Task 7: What is deliberately not being done

Each item: the cut, the reason, and where it lands afterward. This section
exists so no cut later reads as an oversight.

| Cut or deferral | Reason | Post-conference disposition |
|---|---|---|
| EV consolidation page (`/services/ev-charging/`) | Cut by decision: EV gets a nav entry to `/services/#ev` and a tidied hub block only. Writing a real consolidation hub competes with solar for the same window | Backlog: build when EV earns a content investment; nav repoint is then one Bundle-B-style sweep |
| Who We Serve axis and 5 segment pages | Capacity call (writing time) plus the segment keywords land on frozen `/consultation/`. Nav reserves the slot | Backlog, already recorded in the design direction |
| Pass 2c tokenization, alias removal, duplicate-rule deletion in inline payloads | The inline payloads are critical CSS; tokenizing them structurally requires the deferred inline/linked refactor, and `var()` in critical CSS causes color flash | Backlog: post-conference pass with its own first-paint test harness |
| Motion beyond section reveal and nav underline (stat count-up, per-child stagger, CTA glow animation) | Decision: one or two patterns. Motion polish is the first thing nobody at a booth misses | Backlog: motion pass with a written spec; `docs/motion-spec.md` is NOT being written before the conference |
| Calculator redesign (flow, steps, report layout) | Decision: minimal reskin only (chrome, tokens, navy results panel, modal into the form system) | Backlog: calculator UX pass |
| Consultation redesign | Standing freeze until Ads bidding switches; carries live conversion tracking | Own pass post-switch, reusing the token layer; the audit's open LP design questions get answered then |
| `ask-the-experts.html` URL migration and page-level redesign | Migration needs a `_redirects` entry (frozen file); the page-level design was never specced. Cards are recolored by the sweep | Backlog, already listed in REBRAND.md |
| Article body image refresh and per-article OG images | Explicitly deferred by the design direction; dozens of embedded light-background assets | Backlog: content imagery pass |
| CSP scoping fix | Post-Vegas per REBRAND.md; needs its own test cycle. Self-hosting Inter means typography cannot break when it lands | Backlog, already listed |
| Skeleton, empty, and error state redesign | Recolored literals only via the sweep; redesign has no spec | Backlog: absorbed into the inline tokenization pass |
| Print styles for `calculator/report/` | No print styles exist anywhere today; not a conference surface | Backlog |
| Email and Formspree notification alignment | Outside the repo | Backlog |
| `parking-today-small-lots` rendering bug | Pre-existing, unrelated, per CLAUDE.md | Separate investigation, already tracked |
| Stale asset cleanup (dead stylesheets, `Logo.svg` deletion, `images/logo.png`, unwired tools) | Zero visitor impact; deletion during the rebrand adds diff noise against the guards | Backlog, already listed in REBRAND.md |
| Vector logo redraw, tagline and co-brand transparent lockups | Print and collateral, not web-blocking | Tracked in REBRAND.md |
| State Guides nav placement | Recorded now to close the audit's open question: State Guides stays under Resources permanently as content; segment pages own the audience axis when Who We Serve ships. The nav item links to `/resources/states/` | Decision recorded; no work |

---

## Closing

### Three decisions Ben must make this week

1. **Confirm the conference start date**, which fixes merge day (planned
   Thursday Sep 10) and the whole calendar. Needed by Friday Aug 8.
2. **Commit to the solar photography plan**: name the shoot date (completing
   by Thursday Aug 27), or explicitly accept the typographic solar page as
   the shipping design. Needed by Friday Aug 8, because the shoot has the
   longest lead time of anything in the plan.
3. **File the Google Ads bidding-switch request** (off Maximize Clicks) with
   whoever controls the account, so the four-week lead lands before merge
   day rather than after it. Needed by Friday Aug 8.

(Also due this week but not a decision: send the Eau Claire quote-permission
request, so the answer exists by the Friday Aug 21 checkpoint.)

### The single item most likely to cause the plan to fail

The Bundle B chrome sweep. It is the largest single estimate (6 days across
build, propagation, and verification), it contains the only new interactive
component in the project (a keyboard-accessible dropdown that does not exist
in today's simple-toggle `script.js`), it touches all 148 pages, the inline
critical CSS, and the two guard regions in one operation, and every
downstream pass stacks behind it. Photography is the likeliest thing to
*slip*, but it has designed fallbacks and costs no schedule; a Bundle B
overrun consumes the checkpoint cut list and compresses everything after it.
That is why it gets the week 3 checkpoint, a tested-before-propagation
script, and the first claim on weekend buffer.

### Contradictions with `docs/design-direction.md` (so it can be corrected)

1. **Section 6 and section 9: `/services/ev-charging/` is cut.** No EV page
   ships. The What We Do dropdown's EV item points at `/services/#ev`; the
   asset table's EV pillar hero row is void.
2. **Section 6: the designated week 4 cut flips.** The parking-revenue pillar
   page ships; it is no longer "the one to cut". EV is the cut instead.
3. **Section 9, week 3 Pass 2c: no inline tokenization before the
   conference.** The sweep does not replace "inline literals with token
   references" and does not delete "rules now covered by styles.css"; both
   would break first paint. The conference-scope sweep writes new hex
   literals in place and removes nothing. Alias removal ("removed after the
   Pass 2c sweep") therefore also moves post-conference.
4. **Sections 4 and 7: motion shrinks.** Only the section reveal and the nav
   underline ship. The stat count-up (section 7, proof band; section 5, stat
   card), per-child stagger, and any further effects are cut, and
   `docs/motion-spec.md` will not be written before the conference; the two
   shipped patterns are specified by one paragraph in this plan.
5. **Section 9 schedule superseded.** The week-1 approval latency no longer
   exists (decisions settled), the header/footer sweep and the inline recolor
   merge into one pass, and the calculator reskin (absent from the design
   document, flagged by the audit) is scheduled at 2 days.
6. **Section 9 asset table dates superseded** by the photography plan in this
   document (Task 1), which adds the shot list, owner dates, and fallbacks
   the audit found missing.
