# Design Direction: Critical Audit

Audit of `docs/design-direction.md`, written 2026-08-05 against the current
`rebrand` branch. The document under audit is not modified by this pass.

---

## Verdict

The document describes the same website in a much better coat, with a genuinely
new chrome bolted on. Of the nine homepage sections proposed in section 7, one
is new, three are restructured (two of those are the header and footer), and
five are today's sections in today's order with new paint; nothing is removed
and nothing is reordered. Six of the eight problems the document itself
diagnoses as the source of the flatness survive a pure application of its token
system, which means the differentiation depends entirely on the component and
structural work scheduled for weeks 2 through 5, and the two ingredients most
likely to make the result read as an overhaul at first glance, imagery and the
homepage's structural drama, are respectively an unsourced external dependency
and a single negative margin. The token, color, and typography work is
excellent and rigorously verified; it is also the part that cannot, on its own,
answer the brief. If the header pass, the homepage seam, real Inter, and the
field stills all land, this reads as an overhaul. If the stills slip, which is
the likeliest slip in the plan, it is a reskin with a good navy.

---

## Task 1: Structural comparison

Current `index.html`, top to bottom:

1. **Header** (`.site-header`): white 120px bar, 90px auto-traced logo, seven
   flat links, outlined blue Contact button.
2. **Hero** (`#hero .hero-bg`): field-footage video, black gradient overlay,
   H1, subtitle, two buttons (contact, calculator).
3. **Social proof** (`.social-proof`): full-bleed dark band (`#1e2a3a`), Eau
   Claire label, three stats, case-study link.
4. **How It Works** (`.section.how`): three numbered timeline steps with
   micro-CTAs.
5. **Approach** (`.approach-section`): two-column, `camera_lot.webp` beside
   three emoji feature bullets and a CTA button.
6. **Featured Resources** (`.featured-resources`): heading, view-all link,
   three article cards.
7. **Footer CTA** (`.footer-cta`): headline plus one button.
8. **Footer** (`.footer`): four links, copyright line, five social icons.

Proposed in section 7, side by side:

| # | Proposed section | Job | Maps to current | Classification |
|---|---|---|---|---|
| 1 | Header (navy, dropdowns, two CTA buttons) | Reframe brand, route three pillars | Header | **RESTRUCTURED**: new IA (two dropdowns, two buttons), new height, new logo asset. Materially different form and job. |
| 2 | Hero (navy scrim, eyebrow, rewritten lede) | Convert parking traffic | Hero | **RESTYLED**: same video, same H1, same two buttons, same job. Adds an eyebrow, swaps the overlay color, rewrites one paragraph. |
| 3 | Proof band (overlap seam, count-up) | Immediate verified proof | Social proof | **RESTYLED** (borderline): identical content, identical position, identical job. The full-bleed band becomes a floating card pulled up by a negative margin. The overlap is the one structural gesture, and it is a margin. |
| 4 | What We Do (three pillar cards) | Establish three-pillar positioning | none | **NEW**: does not exist today. Carries the entire repositioning. |
| 5 | How It Works (sunken band) | Reduce perceived effort | How It Works | **RESTYLED**: same three steps, same micro-CTAs, copy de-first-personed, background token swapped. |
| 6 | Approach and credibility (field still, quote) | Communicate vendor neutrality | Approach | **RESTRUCTURED** (borderline): same two-column layout, but the job shifts from feature bullets to differentiation plus a named quote. The restructure is achieved by copy and one quote, not by layout. |
| 7 | Featured Resources (plus video card) | Signal depth, feed funnel | Featured Resources | **RESTYLED**: same three-card grid, one card slot added. |
| 8 | CTA band (navy, glow) | Last conversion | Footer CTA | **RESTYLED**: same headline-plus-button pattern, navy background, radial glow. |
| 9 | Footer (four-column sitemap) | Full-site routing | Footer | **RESTRUCTURED**: four-link row becomes a four-column navigation footer with a different job (routing and second-axis readiness). |

**Counts: 1 NEW, 3 RESTRUCTURED, 5 RESTYLED, 0 REMOVED.**

Verdict in one sentence: at the section level this is a reskin of the homepage
body wrapped in a genuinely restructured chrome, and the document's own closing
line in section 7, "none are lost," is the confession: nothing removed, nothing
reordered, the same skeleton in a new suit. Site-wide the ratio is starker: 147
of 150 pages receive tokens, header, and footer only, which the document states
plainly for state pages ("reskinned... but not restructured") and leaves
implicit everywhere else.

---

## Task 2: The flatness diagnosis

Section 4 diagnoses eight problems. For each: source in the current code, the
proposal, the change type, and whether applying every token in sections 2 and 3
with no structural change would fix it.

**1. No tonal contrast between sections.**
Source: `styles.css:2` (`--bg:#f8fafc`, `--card:#ffffff`), `.social-proof` at
`styles.css:954` (`background:#1e2a3a`, the orphan navy).
Proposal: navy frame plus alternating band pattern (section 4, "Section
rhythm").
Type: structural. Tokens define the surfaces; assigning navy to the hero, CTA
bands, and stat treatments requires per-section markup and CSS assignment.
Fixed by tokens alone: **No.** A pure token pass recolors the one dark band
navy and leaves the page white-on-white.

**2. Flat rhythm.**
Source: `styles.css:52` (`.section{padding:64px 0}` uniformly).
Proposal: two-tier `--space-section` (section 4).
Type: token plus component. The tokens exist, but the tiering only exists when
someone assigns major versus secondary per section.
Fixed by tokens alone: **No.** One remapped value keeps uniform rhythm.

**3. Framework-default color.**
Source: `--brand:#0b6efd` in the inline critical CSS of `index.html:27` and
`styles.css:2`; `#007bff` on `.contact-btn` in the same inline block; 757
occurrences site-wide per Pass 1.
Proposal: `#004FC8` family (section 2).
Type: token change.
Fixed by tokens alone: **Yes.**

**4. The header.**
Source: `index.html:27` inline critical CSS (`.header-inner{height:120px}`,
`.logo{height:90px}`, `.contact-btn{border:3px solid #007bff}`),
`images/Logo.svg` (307 KB auto-trace) at `index.html:117`.
Proposal: 72px navy sticky bar with dropdowns and two buttons (section 5).
Type: component and markup change across 78 edit points plus template rebuild.
Fixed by tokens alone: **No.**

**5. Emoji as iconography.**
Source: `index.html:224`, `index.html:230`, `index.html:236`
(`.approach-icon` holding the three emoji).
Proposal: inline Lucide SVG system (section 4).
Type: markup change.
Fixed by tokens alone: **No.**

**6. 96 shadow values with no hierarchy.**
Source: 35 `box-shadow` declarations in `styles.css` alone, 96 distinct values
site-wide per Pass 1 (e.g. `.cta` in the inline critical CSS).
Proposal: four navy-tinted tokens with assignment rules (section 5).
Type: token change plus component assignment.
Fixed by tokens alone: **No, strictly.** Collapsing 96 values to 4 reduces
noise, but "elevation communicates nothing" is only fixed when the assignment
rules (resting sm, hover md, overlap lg) are applied to components, which is
component work.

**7. System font at default tracking.**
Source: 117 files declare Inter, nothing outside `/consultation/` loads it
(CLAUDE.md, Typography); the site renders in the system font.
Proposal: self-hosted variable Inter via `@font-face` in `styles.css`, negative
tracking in the type scale (section 3).
Type: stylesheet change, effectively token-tier (one file, zero per-page
edits).
Fixed by tokens alone: **Yes.**

**8. No layering.**
Source: every `.section` is a self-contained stripe; nothing in `styles.css`
crosses a section boundary.
Proposal: seam overlaps via negative margins, two to three per page
(section 4).
Type: structural.
Fixed by tokens alone: **No.**

**Count: six of the eight diagnosed problems survive a pure token
application.** Only the color swap and the font activation are guaranteed by
the token layer. The document's own diagnosis is structural; its
highest-confidence deliverable (sections 2 and 3) fixes two of eight. This does
not make the document a reskin by itself, because the fixes for the other six
are specified and scheduled (weeks 2, 3, and 5), but it means the overhaul
claim rests entirely on the passes most exposed to schedule pressure, and if
those compress, what ships is the reskin.

---

## Task 3: Imagery

**1. What is proposed, quoted.** Section 4: "The imagery source is stills
exported from the company's field-visit video footage: real lots, real
installs, real site walks." Treatment: "16:10 or 21:9 crops, `--radius-lg`
corners, a bottom navy scrim... and a 1px `--border-dark`-equivalent hairline
on light surfaces." Fallback: "Where footage does not cover a topic, the
fallback is typographic and data-graphic treatment on navy... never stock."

**2. Executable, or a description of a direction?** The treatment is
executable: anyone can apply those crops and scrims. The sourcing is a
description of a direction. There is no shot list, no count, no named footage
source, no resolution requirement, no export owner, and no delivery mechanism.
The repo contains exactly one piece of field footage: `images/home_video.mp4`,
45 seconds, plus its poster frame. The asset table says "exported from Ben's
site-visit video," singular, by week 3. Nobody could read this document and
know which stills to pull, how many, of what subjects, or whether compressed
video frames survive a 21:9 hero crop at 1200px wide. This is the single
largest unresolved dependency in the document and it gets one sentence of
specification and one row in a table.

**3. What exists in the repo.** 137 files in `images/` (the brief said 135;
verified count is 137, plus 70 generated thumbnails in `images/thumbs/`).
Usable in the proposed system: the hero video and poster (explicitly kept),
the 70 thumbnails (article cards keep them), favicons and manifest assets, and
`og-image.png` (being rebuilt anyway). Everything else is article-hero stock
or stock-adjacent imagery: `church.webp`, `stadium.webp`, `airport.webp`,
`beach.webp`, `hotel_park.webp`, and so on. Note the contradiction the
document does not confront: section 8 prohibits stock photography as "the
fastest route back to template-land," while the Featured Resources grid on the
new homepage will surface three of these existing stock-style thumbnails
inside the new system, and the article-image refresh is explicitly deferred
post-conference. The rule bans acquiring new stock while the design keeps
displaying the old stock in the homepage's only image grid.

**4. The actual gap.** Images that need to exist and do not:

- Homepage approach-section field still (week 3), the section the document
  calls the credibility replacement for logo walls.
- Solar lighting pillar hero plus at least one supporting install image
  (week 4, conference-critical page).
- EV charging pillar hero (week 4, conference-critical page).
- Parking revenue pillar hero (week 4, if the page survives the cut).
- Services hub imagery for three pillar summary blocks (week 4).
- Named-quote headshot (week 3, permission pending, founder fallback).
- New `og-image.png` (week 4; buildable from existing assets, genuinely
  covered).

That is six to nine images, of which zero exist and one is buildable without
new photography.

**5. If no new imagery arrives.** The homepage is: the existing hero video
(the only photography on the page), a typographic navy panel where the
approach still should be, and three stock-style article thumbnails. Every
navy band is text on a dark field. The page will be typographically handsome
and will read as a well-set text document. The approach section, the one the
document designates as the credibility centerpiece, becomes its least visual
section. A visitor comparing it to airgarage.com will register the difference
immediately, and the difference is photography. The fallback is honest and
better than stock, but "honest and empty" is exactly the failure mode
leadership already named.

---

## Task 4: The inline style problem

**1. Concrete plan or deferral?** The document addresses the mechanism in one
paragraph (week 3, Pass 2c): "scripted sweep of the uniform inline `<style>`
payloads... scriptable for the uniform groups, manual for the 4 bespoke
pages." That is a schedule slot and a method claim, not a plan. No target
payload is defined for any of the 15 groups: what the swept inline block
should contain, what gets deleted versus tokenized, or how each group is
verified.

**2. The four bespoke pages:**

- **`consultation/` (17.9 KB measured):** explicitly excluded from Pass 2c and
  from the alias table. What happens to it: nothing. See Task 5.
- **`calculator/` (15.0 KB measured):** falls under "manual for the 4
  bespoke" with no page-level specification anywhere in the document. Section
  1 assigns navy to "the calculator results panel," and that phrase is the
  entire design of the second-largest inline payload on the site. No week
  owns it, no component spec covers its multi-step controls or its report
  modal.
- **`services/` (11.0 KB measured):** the only bespoke page with a real plan,
  and it is implicit: the week 4 restructure into the What We Do hub rewrites
  the page, which replaces its inline CSS as a side effect. Reasonable, but
  the document never says it.
- **State landing pages (6.6 KB each, four pages):** "reskinned (tokens,
  header, footer) but not restructured" (section 6), plus one specified JS
  literal fix (`js/state-map.js:109`). A sentence and a line number, not a
  spec for 26 KB of bespoke CSS.

**3. Plan or acknowledgement?** An acknowledgement with a calendar slot. Two
things make this worse than a normal deferral. First, "scriptable" is asserted
but unproven: it is credible for the uniform groups precisely because the
payloads are byte-identical, but the script's target output is undefined, so
the scriptable claim cannot be scheduled at four days versus ten. Second, and
this is a defect the document misses entirely: **the inline payloads are the
site's critical CSS.** `index.html:29` and the article template load
`styles.css` asynchronously via the preload-onload trick; the inline block is
everything the visitor sees at first paint. Pass 2c's stated intent to delete
"rules now covered by `styles.css`" would reintroduce a flash of unstyled
content on every swept page unless the deletion logic distinguishes
first-paint rules from duplication. The document treats the inline CSS as debt
to be cleared; part of it is load-bearing performance infrastructure, and no
line of the plan acknowledges the distinction.

---

## Task 5: The consultation pages

**1. What is proposed.** Deferral, three times: section 2 (its `:root` is
"NOT aliased or touched"), section 3 (keeps Google Fonts "until their own
deferred pass"), section 9 ("nothing in this plan touches them... Its
eventual pass reuses the token layer and swaps its self-contained `:root` for
the canonical one"). The dual-brand exposure through the conference is
explicitly accepted as "the correct trade."

**2. Treated as temporary?** No. The deferral is written as open-ended:
"after Google Ads bidding changes," with no trigger condition, no owner, no
window, and no distinction between "frozen for three more weeks" and "frozen
until winter." The one sentence about the eventual pass is a mechanism note
(swap the `:root`), not a plan. The document treats the freeze as a boundary
of scope rather than as a schedule variable that could move during the
project.

**3. If the freeze lifts in three weeks, is a plan ready?** No. A new plan
would be needed, and the open decisions are not trivial: does the page adopt
the shared navy chrome or keep its minimal conversion-optimized `lp-header`
with the phone number (a real LP design decision nobody has made); what does
the white Calendly iframe sit on in a navy system; how do its 13 custom
properties (`--navy:#0f1c2e`, `--blue:#0b6efd`, the grey ladder) map to
canonical tokens; when do its Google Fonts links switch to the self-hosted
files; and, most importantly, what is the regression-verification protocol
for the only page on the site that fires the Ads conversion event. Week 3 of
the rebrand would be exactly the moment with the least slack to absorb an
unplanned bespoke-page pass. The document should contain a contingency
paragraph and does not.

**4. What a visitor experiences if everything else ships and these do not.**
Exposure is narrower than it sounds, and the document deserves credit for
framing it accurately: `/consultation/` is `noindex`, and zero pages outside
its own path link to it (verified by grep; the article bottom CTAs labeled
"Book a Free Consultation" point at `/contact/`). Only paid ad traffic and
direct links see it. What that paid visitor sees: a page whose navy
(`#0f1c2e`) is visibly a different navy than the brand navy (`#010D20`),
whose blue (`#0b6efd`) is the exact framework blue the rebrand exists to
kill, whose logo treatment and header pattern match nothing else, and whose
fonts load from Google while the rest of the site self-hosts. One click on
the header logo takes them to the rebranded homepage, so the brand switch
happens mid-session, in one click, on the most expensive traffic the company
buys. The trade is still probably correct (the page converts and carries live
tracking), but the document accepts it without describing it, and leadership
should see the description before agreeing.

---

## Task 6: The nav decision

**1. Where do the state pages live?** They are in the proposed nav, under
the Resources dropdown as "State Guides" (section 5, repeated in footer
column 3). Not orphaned. But the document never says what "State Guides"
links to; a `/resources/states/` hub exists and is currently reachable
through a floating button on `/resources/`, and whether the nav item targets
the hub or the map is unspecified. Placement under Resources frames the state
pages as content, not as an audience axis, which is consistent with what they
are: geographic SEO landing pages.

**2. Interaction with a future Who We Serve.** Segments (churches, hotels,
offices, stadiums, municipalities) and states are orthogonal axes, industry
versus geography, so absorption is not automatic. The risk is duplication of
intent: a visitor asking "who is this for" will find one answer in a top-level
Who We Serve dropdown and a second, geographic answer buried under Resources.
The nav with both is What We Do, Who We Serve, Resources, About, plus two
buttons: five zones, viable at 1024px and up, already tight in the 768 to
1024 band where the document drops the Calculator button today. The document
is silent on whether State Guides stays under Resources permanently or
migrates under Who We Serve when that axis ships. That silence is a deferred
nav redesign; the decision should be recorded now, and the defensible answer
is that states stay under Resources as content and segment pages own the
audience axis.

**3. Design decision or content-capacity decision?** Content-capacity, and
the document half-admits it: the stated reasons are that segment pages would
"compete for the same writing time as the solar page," would be
"doorway-quality" if rushed, and that the segment keywords currently land on
the frozen `/consultation/`. Those are a writing-capacity constraint and an
ads-strategy constraint, not design judgments. The design contribution is
real but small: the nav reserves a slot so the axis is a component change
later. The document should label the deferral as a capacity call explicitly,
because that routes the decision to Ben and leadership (who own writing time
and ads strategy) rather than presenting it as settled design rationale.

---

## Task 7: What is missing entirely

| Gap | Status in document | Matters before conference? |
|---|---|---|
| **Calculator interface** | Absent except three words in section 1 ("calculator results panel"). No component spec, no scheduled week. Yet the nav gives Calculator a persistent button and the hero's secondary CTA points at it. | **Yes, high.** It is one click from every CTA on the site; a dated calculator inside a new brand is the most visible seam a conference visitor can hit. |
| **Form design beyond atomic inputs** | Section 5 covers inputs, selects, textareas, errors. Nothing on the calculator's multi-step flow, its "Get Your Free Revenue Report" modal, progress indication, or the contact form's layout. | **Yes.** Calculator and contact are the two conversion surfaces. |
| **Video library page layout** | Card spec exists (section 5); the page-level design of `ask-the-experts.html` (hero, band structure, filtering) does not. | **Yes, medium.** It is a named nav item ("Video Library"). |
| **Loading and skeleton states** | Absent. The article template already ships a skeleton system (`.skeleton-card`, `.skeleton-thumb`, 31 references in `templates/article-index.html`) with hardcoded grey literals; articles are client-rendered, so the loading state is on the critical reading path. Pass 2c will sweep those literals with no spec for what they become. | **Yes, medium.** Articles are the SEO asset; their first paint includes these states. |
| **404 page** | Absent. `404.html` shares the site chrome so it inherits the header/footer pass, but its body payload is unspecified. | Marginal. One sweep pass covers it; conference attendees do mistype URLs. |
| **Dark and light mode handling** | Absent. The hybrid is author-assigned; no stance on `prefers-color-scheme`, either direction. | No, but the document needs the one-sentence stance ("no user theming; the hybrid boundary is authorial") so nobody improvises one later. |
| **Empty states** | Absent. `js/resources.js` renders `.res-empty` for both filter-no-results and load failure; it is styled in `css/resources.css` today and unaddressed in the new system. | Marginal before; real after. |
| **Error states beyond forms** | Absent. `renderNotFound()` in `js/article.js` is a full-page state (and is live today on the known `parking-today-small-lots` bug). | After. |
| **Print styles** | Absent, and none exist in any stylesheet. `calculator/report/index.html` is a report page users plausibly print or save to PDF. | Borderline: the report page only. |
| **Email template alignment** | Absent. Formspree notifications and any autoresponders live outside the repo. | After. |
| **Favicon and OG treatment** | Mostly covered: favicons are live (REBRAND.md), `og-image.png` is scheduled week 4 with a buildable spec. Uncovered: per-article OG images remain the old stock heroes after the rebrand ships. | Covered enough for the conference. |
| **ClearWorld co-brand lockup usage** | Covered at the exclusion level: section 8 confines the lockup to conference collateral and bans naming ClearWorld as provider. No spec for the collateral itself, which is out of web scope; the transparent lockup asset is still outstanding (REBRAND.md). | Covered for the site. |
| **Anchor offsets under the new sticky header** | Absent, and concrete: `/services/` anchor IDs are explicitly preserved (section 6), `.service-card` carries `scroll-margin-top:100px` tuned to the 120px header (`styles.css:566`), and the header is becoming 72px. Every preserved anchor needs retuned scroll margins or targets land wrong. | Yes, small but certain. |
| **Any visual comp at all** | The entire direction is prose. Leadership approving section 7 as text will each imagine a different page, and the text, as Task 1 shows, describes the current page order. | **Yes.** See closing recommendation 1. |

---

## Task 8: Effort honesty

Per major recommendation: files touched, scriptable or manual, verification
mode, and a working estimate for one implementer.

| Recommendation | Files | Scriptable? | Verification | Estimate |
|---|---|---|---|---|
| Pass 2a: tokens, aliases, `@font-face`, font files | 1 to 2 files plus assets | Manual authoring, small | Automated (pixel-diff screenshots) | 2 to 3 days |
| Pass 2b: 757 blues, whites, greys, 96 shadows, radii, weights, JS tables | `styles.css`, 3 CSS files, 3 JS files | Largely scriptable | Grep plus visual spot-check | 2 to 3 days |
| Header/footer/nav pass | New dropdown component with focus management (does not exist today; `script.js` is a simple toggle), 78 edit points, template rebuild of 72 pages | Component manual, propagation scripted | Manual (a11y, focus trap, real devices) plus grep | 4 to 6 days |
| Homepage rebuild (section 7) | 1 page plus styles | Manual | Visual review | 3 to 4 days |
| Pass 2c: inline sweep, 15 payloads, 119 pages | 119 pages | Scriptable for uniform groups, but target payloads are undefined and the critical-CSS constraint (Task 4) is unanalyzed | Screenshot diff per payload group plus grep | 4 to 5 days, the most underestimated line in the plan |
| Pillar pages x3 plus services restructure | 4 pages | Manual, external copy dependency | Visual review | 4 to 5 days plus copy wait |
| Icon sweep (emoji, pseudo-elements) | Homepage plus scattered pages | Partially scriptable | Visual | 1 to 2 days |
| Motion | `docs/motion-spec.md` does not exist and no week writes it; then one IntersectionObserver module | Manual | Visual, reduced-motion check | 2 to 3 days including writing the spec |
| Imagery placement | Homepage, pillar pages | Manual | Visual | 1 to 2 days, gated on stills that have no delivery date |
| QA week (contrast automation, Lighthouse, devices, greps) | Site-wide | Mixed | Mixed | 3 to 4 days |

Total: roughly 26 to 37 working days, which is 5.5 to 7.5 weeks of
single-person execution against a 6-week calendar that also contains the
week 1 approval latency on five decisions, the solar page integration, the EV
consolidation content work, and a week 6 that is supposed to be buffer and
freeze, not work. **The plan fits only if nothing slips, and two named
dependencies (solar copy, field stills) are outside the implementer's
control. Honest answer: not achievable as written.**

What should be cut, specifically:

1. **Cut `/services/parking-revenue/`.** The document already designates it;
   treat the cut as decided now, not as a week 4 option, and point the nav
   item at `/services/#parking` from the start. Saves 1 to 2 days and one
   copy dependency.
2. **Split Pass 2c and ship only half.** Conference-required half: a scripted
   literal-for-literal recolor of the inline payloads (old blues and greys to
   new values) with zero rule deletion, preserving the critical-CSS behavior
   untouched. Post-Vegas half: tokenization and duplicate-rule removal. This
   saves 2 to 3 days, removes the first-paint regression risk identified in
   Task 4, and loses nothing visible.
3. **Reduce the motion spec to one pattern.** A single section-reveal
   (opacity plus translate) and the nav underline; cut the count-up and
   per-child stagger if week 5 compresses. Motion polish is the first thing
   nobody at a conference booth will miss.
4. **Spend the recovered 4 to 6 days on a minimal calculator reskin**: shared
   chrome, tokens, the navy results panel, and the modal brought into the
   form system. This converts the largest unaddressed visible surface (Task
   7) from a liability into coverage, using time the cuts above free up.

---

## Closing

### 1. Three changes to `docs/design-direction.md` most likely to make leadership react positively to the result

1. **Add one homepage comp.** A single static mock, even greyscale with the
   navy bands and the seam overlap drawn, before week 2 starts. Leadership
   called the site flat; they will judge the fix with their eyes, and section
   7 in prose describes the current page order (Task 1). A comp forces the
   "is this different enough" conversation while it costs a day, not after it
   costs six weeks.
2. **Replace the imagery sentence with a shot list.** Number of stills,
   subjects, the source footage they come from, the export owner, a delivery
   date, and a decided answer for what the approach section shows if stills
   miss the date. Imagery is the difference between overhaul and reskin at
   first glance, and it currently has one sentence and no owner-date pair.
3. **Add a per-surface coverage matrix and a calculator section.** One table:
   homepage, article, state page, services, calculator, video library,
   contact, 404, consultation, with what changes on each. The matrix makes
   the reskin/overhaul boundary explicit per surface, and writing it forces
   the calculator gap (the largest uncovered conversion surface) to be
   resolved rather than discovered in week 5.

### 2. The single biggest risk that the site ships on time and still gets called flat

The field-footage stills. Every structural bet the document makes that a
visitor can feel in the first ten seconds (the approach section, the pillar
heroes, the services hub) degrades to "typographic treatment on navy" if the
stills do not arrive, and the stills have no shot list, no owner deadline, and
no verified source beyond one 45-second video. In that scenario the site ships
as dark, elegant, well-set text with the same section order it has today, and
"it's still flat, just darker" is a one-sentence leadership reaction the
current plan cannot rebut.

### 3. What was tempting to defend rather than examine, and what examination found

- **The hybrid dark decision.** It carries the longest defense in the
  document, and the temptation was to point at that defense as evidence of
  rigor. Examined: the decision itself holds (the readability and asset
  arguments are sound), but the pattern it reveals is the document's real
  weakness: it argues hardest where it is already right and is thinnest where
  it is most exposed. Hybrid gets four bullet points; the calculator gets
  three words; imagery sourcing gets one sentence. The rigor is real but it
  is distributed by comfort, not by risk.
- **Section 7's "none are lost" framing.** The temptation was to read it as
  continuity discipline protecting the ads funnel. Examined: it is also the
  admission that the homepage restructure is not a restructure. The funnel
  argument justifies keeping the hero and CTA bands intact; it does not
  require keeping all nine sections in the current order, and no alternative
  order was ever evaluated.
- **"Scriptable" as an effort answer for Pass 2c.** The temptation was to
  accept it because the uniform payloads genuinely are byte-identical.
  Examined: scriptable describes the mechanism, not the work; the script's
  target output is undefined, and the sweep as described would delete the
  site's critical CSS (Task 4). The word was doing scheduling work it cannot
  support.
