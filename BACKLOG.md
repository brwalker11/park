# Post-Vegas backlog

Work deferred past the Las Vegas conference (Mon Sep 14 2026). **Not rebrand
work.** This file was carved out of `REBRAND.md` on 2026-08-17, wholesale and
without triage, so that the backlog would outlive the working document it grew
up in. `REBRAND.md` is deleted at the end of the rebrand; this file is not.

Durable project rules live in `CLAUDE.md`, not here. If an item turns out to be a
standing constraint rather than a task, move it there and delete it from this
file. That happened once already: the 100px team photo ceiling, which was item 2
in the original list, is now in `CLAUDE.md` under "Team photo display ceiling".

**Nothing here has been re-validated since it was written.** Each item carries
the date it was opened. Check an item is still true before acting on it.

---

| # | Item | Kind |
|---|---|---|
| 1 | About page: Dave and Dax should read their own bios | Needs a person |
| 2 | Contact form: city/state removal and field order, pending Dave and Dax | Needs a person |
| 3 | Dated-claims audit, 8 rate-pinned figures, none fixed | Content |
| 4 | CSP scoping fix, needs its own testing cycle | Code |
| 5 | `articles/parking-today-small-lots/` renders a not-found state over itself | Bug |
| 6 | Stale asset cleanup: 8 dead stylesheets, unwired tooling, 1.2 MB orphan PNG | Cleanup |
| 7 | `images/services.webp` and `.jpg`, orphaned by the services restructure | Cleanup |
| 8 | `images/Logo.svg` deletion | Cleanup |
| 9 | Vector logo redraw for print and embroidery | Asset |
| 10 | Transparent tagline and ClearWorld co-brand lockups | Asset |
| 11 | `sitemap.xml` lists `/ask-the-experts.html`, which 308-redirects | Bug |
| 12 | Decide how `sitemap.xml` should be generated | Decision |
| 13 | `docs/website-audit-action-plan.md:609` points at a superseded manifest | Docs |
| 14 | `package-lock.json` peer markers to commit separately | Cleanup |
| 15 | Content pass over the 30 video pages: first person, placeholder transcripts | Content |
| 16 | A type axis on `/resources/`: whether content type earns a control | Decision |
| 17 | Tag vocabulary pass over 381 tag instances | Content |
| 18 | State-targeted Google Ads campaign and its landing pages | Decision |
| 19 | Five Texas state subpages have no body headings | Content |
| 20 | Content pass over the 73 article body fragments | Content |
| 21 | `INLINE_CTA_COPY` uses first person | Code |
| 22 | Dead `insertInlineCta()` in `js/article.js` | Cleanup |
| 23 | `.cta-inline` rules styling only dead code | Cleanup |
| 24 | Four dead classes in `css/state-map.css` | Cleanup |
| 25 | Four more dead files from the resources service split | Cleanup |
| 26 | `readTime` values contain en dashes | Content |
| 27 | Resources filter and search are ANDed, confusing under a service axis | Decision |
| 28 | ADA free-parking claim stated unqualified | Content |
| 29 | Content rebalancing toward three-pillar parity | Strategy |
| 30 | Webflow migration evaluation | Strategy |

**30 items.** The original list had 31; item 2 was the closed 100px team photo
constraint, which moved to `CLAUDE.md` and is no longer duplicated here. Numbering
above is this file's own and does not match the old `REBRAND.md` numbers.

**Items 1 and 2 are blocked on Dave and Dax** and cannot be actioned by whoever
inherits this list.

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

- **A type axis on `/resources/`: whether content type ever earns a control.**
  Recorded 2026-08-17. Open decision, not a settled deferral. Supersedes the
  "type is badge-only" line in the resources section above **only when the
  distribution changes**, which is the whole question.

  **The immediate defect is FIXED, in the same pass that opened this entry.**
  The nine EV articles carried `category: "EV Charging"`, a service value in the
  type field, so their badges read "EV Charging" while every other card read
  Article, Guide or Case Study, and that badge was redundant on a grid already
  filtered by service. Reassigned to real content types with `service` unchanged:
  five Guides, four Articles, no case studies. See the resources section above
  for the table and the consequences. **This entry is about the control, not
  about those records.**

  **Why a control is still deferred.** The numbers that argued against it were
  51 Articles, 4 Guides, 1 Case Study visible. Two things have moved since:
  the solar lighting guide landed, and the nine EV records were re-typed. The
  distribution is now **57 Articles, 10 Guides, 1 Case Study** across 68 visible.
  Guides has cleared the documented revisit threshold of ten. **Case Studies has
  not moved and is still one.** A chip row where one chip returns 1 result is a
  list pretending to be a filter, and re-typing the EV records did not and could
  not change that. So the blocker is no longer "everything is too small", it is
  "one axis works and one does not".

  **What would need to be true first.** Two things, neither of them a control.

  First, **the 57 Articles need auditing.** "Articles" is now the default any
  record falls into, and the nine EV records prove the type field was never
  applied with much care. Some of those 57 are guides by structure: procedural
  headings, checklists, a decision the reader is being walked through. Until
  someone reads them, the split between 57 and 10 measures filing habits rather
  than content.

  Second, **Case Studies holds one record while Eau Claire is the strongest
  asset on the site.** 178% is the only verified outcome figure available, it is
  covered by the case-study exemption, and it sits in a bucket of one. Either
  that bucket grows or the type axis will always have a dead chip. Stillwater is
  the obvious second and does not have a record.

  **Three implementation options, if it is ever built.**

  1. **A secondary chip row, both axes active at once**, with URLs like
     `?service=Parking&type=Guides`. Most capable and most expensive: two chip
     rows above one grid is a lot of control for 68 records, `hydrateFilterFromQuery`
     grows a second parameter, and every empty intersection needs an empty state.
  2. **A dropdown rather than chips.** Less visual weight than a second chip row
     and it suits a lopsided distribution, because a select showing "Case Studies
     (1)" reads as inventory where a chip returning one result reads as broken.
     Cheapest of the three that still offers a real filter.
  3. **Clickable type badges on the cards.** Adds no control to the page at all
     and scales on its own as the data grows. The badge is already rendered and
     already says the right thing; making it a link is close to free. Weakest
     discovery, since nothing advertises that the axis exists.

  **Recommended order when this is picked up:** the nine EV records first
  (**done**), audit the 57 Articles second, decide on a control third. **Do not
  add a control before the data supports it.** The chips were rebuilt once
  already because they mixed a topic label into three format labels; adding a
  type control over a distribution nobody has audited is the same mistake with
  the axes the other way round.

  Related: the reassignment broke the related-article rails, mitigated the same
  day by ranking on service. See the resources chapter above. **The underlying
  defect is still open and belongs on this list:**

- **Tag vocabulary pass over 381 tag instances.** Opened 2026-08-17 out of the
  rail work. 305 unique tags across 75 records, **278 of them on exactly one
  record**, so tag overlap ranks nothing and the related rails are effectively
  ordered by service, then type, then recency. Needs a controlled vocabulary of
  twenty to thirty terms with the existing values mapped onto it. Full reasoning
  and measurements in the resources chapter. This is the real fix; the sort
  change was a mitigation.

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
