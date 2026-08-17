# Design Direction: Monetize Parking Rebrand

> **Note added 2026-08-17: `REBRAND.md` no longer exists.** It was folded into
> `CLAUDE.md` and deleted at the end of the rebrand. This document references it
> throughout; those references are historical. Durable rules are now in
> `CLAUDE.md`, outstanding work is in `BACKLOG.md`, and the original text is in git
> history.

Status: PROPOSED. Written against commit state of 2026-08-05 on `rebrand`.
Companion documents: `REBRAND.md` (decisions and pass status), `docs/motion-spec.md` (pending).
This document specifies design decisions only. No code changes accompany it.

All color values below were sampled programmatically from the eight files in
`assets/brand/` using sharp (per-pixel histogram of opaque pixels, HSL-filtered
clusters, corner and center probes). Sampling method and raw findings are
summarized where each value is introduced.

---

## 1. Visual language derived from the logo

The logo artwork establishes four things:

1. **A deep navy field.** Every opaque lockup sits on a near-black navy that
   vignettes from about `#000512` at the corners to about `#000d20` at center.
2. **A blue vertical gradient** through the mark, running from a deep royal
   `#0043B3` through a dense central band at `#004FC8` to a bright top edge at
   `#0B80F9`.
3. **A metallic silver wordmark**, a neutral-to-cool gradient spanning
   `#F0F0F0` down through `#B0B0B0`, with cool grey-blue transition pixels
   (`#A0A0B0`, `#9090A0`) where it meets the navy.
4. **Dimensional depth.** The mark reads as a lit object on a dark field, not
   a flat icon.

The visual system that follows: the site is framed in that navy field, brand
moments use the blue gradient as a signature, silver is reserved for display
typography on navy, and depth comes from layered surfaces and a single
disciplined shadow scale rather than decoration.

### Dark, hybrid, or light

**Recommendation: hybrid. This confirms the decision recorded in REBRAND.md.**

Navy applies to the frame: header, footer, homepage hero, stat band, CTA
bands, calculator results panel, and video library cards. Light stays on all
long-form reading surfaces: article bodies, state page content, FAQ answers,
resources grid.

Defense of hybrid over full dark:

- 147 pages are long-form reading. Light-on-dark body text at reading length
  measurably increases fatigue for astigmatic readers (roughly 30 to 50
  percent of adults experience halation on dark backgrounds), and dwell time
  on the article library is a core SEO asset.
- Every existing inline article image and chart assumes a light background.
  A full-dark conversion would require re-treating dozens of embedded assets
  with no conference-timeline budget for it.
- The reference sites split the same way underneath the surface impression:
  getonyx.ai is dark because it sells a dark-UI product; airgarage.com is
  mostly light with dark accents. This company sells consulting outcomes and
  written expertise. The reading surface is the product demo.
- Hybrid delivers the dramatic first impression (navy header, navy hero,
  navy CTA bands are the first and last thing seen on every page) while the
  middle of every page stays optimized for its actual job.

The dark frame must be committed, not timid: the header goes fully navy on
all 148 shared-chrome pages, which also solves the logo problem, since the
existing silver-gradient transparent PNG (`assets/brand/MP_Logo_400.png`)
renders correctly on navy and the auto-traced `images/Logo.svg` can finally
be retired.

---

## 2. Color system

### Sampling results

| Source finding | Value | Where sampled |
|---|---|---|
| Modal saturated blue (gradient core) | `#004FC8` | Most frequent exact blue in `MP_mark.png` (largest transparent master), with the cluster `#004EC7`..`#0053CD` around it. Also the modal blue in `MP - Rectangle Logo.png`, and `#004FC6` in the tagline lockup. |
| Gradient dark end | `#0043B3` | Dense band in `MP_Logo.png` (`#0043B2`/`#0043B3`) |
| Gradient bright end | `#0B80F9` | Bright cluster `#097EF8`/`#0B80F9`/`#0C83FB` in both transparent masters |
| Navy background center | `#000D20` | Center-top probe of `MP - Rectangle Logo.png`; backgrounds vignette from `#000512` corners toward this center value |
| Brand green, bright | `#6DB133` | Modal green in tagline lockup (`#6DB133`/`#72B735` cluster, hue 92) |
| Brand green, deep | `#2D7A0E` | Dark end of the green gradient in the tagline lockup |
| Silver range | `#F0F0F0` to `#B0B0B0`, cool tint `#A0A0B0` | Wordmark pixels in all lockups |

### Canonical blue

**`#004FC8` is the canonical brand blue.** It is the single most frequent
exact saturated blue in the artwork and represents the dense core of the
logo gradient. None of the three competing site blues (`#007bff`, `#0a68ff`,
`#0b6efd`) match the artwork; all three are brighter and closer to framework
defaults than to the logo. All 757 occurrences resolve to `#004FC8` (or to
the tokens below where the occurrence is a hover, tint, or on-dark usage).

`#004FC8` also outperforms all three incumbents on accessibility: white text
on `#004FC8` measures 7.11:1 (AAA), where white on `#007bff` measures 3.5:1
(fails AA for normal text).

### Dark surface value

**`#010D20` is confirmed as the canonical dark surface.** Programmatic
sampling supports the eyedropper value: the background center of
`MP - Rectangle Logo.png` measures `#000D20`, and `#010D20` sits inside the
sampled vignette band (`#000512` to `#001024` across the opaque files). The
difference between `#000D20` and `#010D20` is one bit of red and is not
visually distinguishable. Keeping `#010D20` avoids touching the 150 deployed
`theme-color` tags and both manifest keys for zero perceptual gain.
REBRAND.md should record the provisional flag as resolved.

### Token set

Primitives:

```css
/* Brand blue (sampled from logo gradient) */
--blue:        #004FC8;  /* canonical brand blue; gradient core */
--blue-deep:   #0043B3;  /* gradient dark end; hover states */
--blue-bright: #0B80F9;  /* gradient bright end; large accents and gradients on dark */
--blue-sky:    #4DA3FF;  /* DERIVED, not sampled: link text on dark surfaces (see contrast) */
--blue-wash:   #EFF6FF;  /* callout and tip backgrounds on light */
--blue-tint:   rgba(0, 79, 200, 0.08);  /* hover fills, replaces rgba(13,110,253,0.08) */

/* Navy surfaces (sampled base, derived ladder at constant hue 215-217) */
--navy-950: #010D20;  /* page-level dark surface; theme-color */
--navy-900: #071B38;  /* raised surface on dark: cards, stat band */
--navy-800: #0E2A52;  /* highest surface: inputs on dark, hover fills, active states */

/* Green (sampled from tagline and co-brand lockups; SCOPED, see rule below) */
--green-500: #6DB133;  /* accents on dark surfaces, icons, large text */
--green-700: #2D7A0E;  /* text-safe green on light surfaces */

/* Light surfaces (unchanged from current, per REBRAND.md) */
--surface-page:   #F8FAFC;
--surface-card:   #FFFFFF;
--surface-sunken: #F1F5F9;  /* banded sections, pills, code/formula blocks */

/* Text on light */
--text-1: #0F172A;  /* headings and body */
--text-2: #475569;  /* secondary, ledes, captions with emphasis */
--text-3: #64748B;  /* meta, timestamps; minimum size 0.875rem */

/* Text on dark */
--text-inverse-1: #F8FAFC;
--text-inverse-2: #C4D0E2;
--text-inverse-3: #8FA3C0;  /* meta on dark; minimum size 0.875rem */

/* Borders and dividers */
--border-1:    #E2E8F0;                    /* all borders and dividers on light */
--border-dark: rgba(143, 163, 192, 0.22);  /* borders and dividers on dark */

/* Functional (NOT brand colors; unchanged where they exist today) */
--ok:       #10B981;  /* success icons and badges only, never text on light */
--ok-text:  #047857;  /* success text on light */
--err:      #DC2626;  /* error icons, borders, buttons */
--err-text: #991B1B;  /* error text; absorbs #9B1C1C */
--err-bg:   #FDE8E8;
--warn-text:#B45309;
--warn-bg:  #FEF3C7;

/* Signature gradients */
--gradient-brand:  linear-gradient(135deg, #0B80F9 0%, #004FC8 60%, #0043B3 100%);
--gradient-silver: linear-gradient(180deg, #F4F6F9 0%, #C9CFDA 55%, #AEB6C4 100%);
```

Usage notes:

- `--gradient-brand` is the signature treatment: primary CTAs on dark
  surfaces, the homepage stat underline, active nav indicators. Use sparingly;
  flat `--blue` is the default fill.
- `--gradient-silver` is reserved for display headlines on navy via
  `background-clip: text` with a solid `--text-inverse-1` fallback. It echoes
  the wordmark. Never use it on light surfaces (the silver wordmark caution
  in REBRAND.md applies to this treatment equally).
- `--blue-sky` is the one non-sampled blue. It exists because `--blue-bright`
  measures 4.47:1 on `--navy-900`, just under the 4.5:1 AA threshold for body
  text. `--blue-bright` remains correct for large text and graphics on dark.

### Green scoping

Green is confined to: solar lighting content, EV charging content,
sustainability messaging, and success states. It is not a general brand
color. Enforcement mechanics:

1. Only two green tokens exist (`--green-500`, `--green-700`), and no green
   appears in any component default in section 5. A component only becomes
   green when a page-level scope class (`.pillar--solar`, `.pillar--ev`) is
   applied. There is no green button variant and no green link style.
2. Success states use the functional pair `--ok`/`--ok-text`, which are
   deliberately different hues (emerald, hue 160) from brand green (hue 92),
   so success UI does not read as solar branding and vice versa.
3. Verification: after each pass, grep for `--green` outside files and
   sections tagged solar, EV, or sustainability; any hit is a defect. The
   same grep applies to raw literals `#6DB133`, `#2D7A0E`, `#72B735`.
4. **The `#0A7C6B` teal-green in the JS category tables violates the rule and
   is removed.** It is the "Guides" fallback-thumbnail gradient color in
   `js/related.js:143` and `js/resources.js:511`. Guides are not solar or EV
   content. The category fallback table becomes: Case Studies `--blue-deep`
   (#0043B3), Guides `--navy-800` (#0E2A52), Articles `--navy-900` (#071B38),
   EV Charging `--green-700` (#2D7A0E). EV Charging is the only category
   permitted green, and it is currently (incorrectly) blue. The two drifted
   copies of this table should be consolidated to one shared definition when
   touched. `js/state-map.js:109` changes `rgba(13,110,253,0.08)` to the
   `--blue-tint` value `rgba(0,79,200,0.08)`; recommended mechanism for all
   JS color needs is reading the token via
   `getComputedStyle(document.documentElement).getPropertyValue()` so CSS
   stays the single source of truth.

### Naming scheme and aliases

One flat scheme, as listed above: `--{family}-{step}` for primitives
(`--blue`, `--navy-950`, `--green-500`), `--{role}-{level}` for semantics
(`--text-1`, `--surface-card`, `--border-1`), plus `--radius-*`, `--shadow-*`,
`--space-*`, `--font-*`. No `--mp-` prefix; there is no third-party CSS to
collide with.

**This table describes the post-2b end state, not Pass 2a.** Annotated
2026-08-07. Read literally it collapses names that currently hold different
values into a single target: `--brand` (`#0b6efd`), `--brand-blue` (`#0A68FF`),
`--clr-accent` (`#2563eb`), and `--state-active` (`#0b6efd`) all point at
`--blue`, whose target is `#004FC8`. Likewise `--state-inactive` (`#cbd5e1`)
onto `--border-1` (`#E2E8F0`), `--state-hover` (`#0958d9`) onto `--blue-deep`
(`#0043B3`), and `--radius` (`14px`) onto `--radius-lg` (`16px`). Shipping the
table as written in 2a would recolour every `var(--brand)` use and the whole
state map.

Pass 2a is verified as **pixel-identical**, so it defines each new primitive at
**today's** value and aliases the old names onto it. Where names collapse to one
target at different values, 2a keeps them distinct behind temporary primitives.
Pass 2b then retargets values one line at a time, and it is at that point that
this table's mappings become true. Decision recorded in `REBRAND.md`.

The four existing schemes alias as follows (Pass 2a ships the alias structure so
nothing breaks; the values arrive in 2b; the aliases are removed after the Pass
2c sweep):

| Old name | Aliases to |
|---|---|
| `--brand`, `--brand-blue` (styles.css) | `--blue` |
| `--ink` | `--text-1` |
| `--muted` | `--text-3` |
| `--card` | `--surface-card` |
| `--bg` | `--surface-page` |
| `--border` | `--border-1` |
| `--clr-text` (article.css) | `--text-1` |
| `--clr-muted` | `--text-2` |
| `--clr-accent` | `--blue` |
| `--clr-border` | `--border-1` |
| `--state-active` (state pages) | `--blue` |
| `--state-hover` | `--blue-deep` |
| `--state-inactive` | `--border-1` |
| `--state-bg` | `--surface-page` |
| `--radius` (article.css, 14px) | `--radius-lg` (16px, at Pass 2b) |

**Not covered by this table, and needed before 2a can run:** the whole of
`css/resources.css`. `--res-muted`, `--res-chip`, and `--res-chip-active` map by
value onto `--text-3`, `--border-1`, and `--blue`. `--res-bg` (`#0f172a`) does
**not** map to `--text-1` despite the matching value: it is a dark **surface**,
not text, and the target scheme has no light-scheme equivalent. `--res-card-radius`
(`18px`) matches no radius step. Also unmapped: every non-colour token
(`--space-*`, `--h1` to `--h3`, `--max-text`, `--max-w-article`, `--font-sans`),
which carries across unchanged in 2a; scale rationalisation is 2b.

`--font-sans` is written with `Inter` as the first family, matching the shipped
`@font-face`. The `'InterVariable'` entry above is inert, since no font is
served under that family name.

The consultation pages' scheme (`--navy`, `--blue`, `--gray-*`) is NOT
aliased or touched. Those pages are deferred to their own pass and remain
self-contained until then.

Consolidation targets (Pass 2b): 16 whites resolve to `--surface-card`,
`--surface-page`, `--surface-sunken`. 10 border greys resolve to
`--border-1`. 5 inks resolve to `--text-1`. `#334155` and `#1F2937`
occurrences fold into `--text-2`; `#64748B` occurrences that carry meaning
stay `--text-3`.

### Contrast verification (WCAG 2.1, computed)

Text on light surfaces:

| Pairing | Ratio | Result |
|---|---|---|
| `--text-1` #0F172A on #FFFFFF | 17.85 | AAA |
| `--text-1` on #F8FAFC | 17.06 | AAA |
| `--text-2` #475569 on #FFFFFF | 7.58 | AAA |
| `--text-2` on #F8FAFC | 7.24 | AAA |
| `--text-3` #64748B on #FFFFFF | 4.76 | AA |
| `--text-3` on #F8FAFC | 4.55 | AA (meta only, never below 0.875rem) |
| `--blue` #004FC8 on #FFFFFF (links) | 7.11 | AAA |
| `--blue` on #F8FAFC | 6.80 | AA |
| `--blue-deep` #0043B3 on #FFFFFF | 8.56 | AAA |
| `--green-700` #2D7A0E on #FFFFFF | 5.38 | AA |
| `--ok-text` #047857 on #FFFFFF | 5.48 | AA |
| `--err` #DC2626 on #FFFFFF | 4.83 | AA |
| `--err-text` #991B1B on #FDE8E8 | 7.08 | AAA |
| `--warn-text` #B45309 on #FFFFFF | 5.02 | AA |

Text on dark surfaces:

| Pairing | Ratio | Result |
|---|---|---|
| `--text-inverse-1` on #010D20 | 18.59 | AAA |
| `--text-inverse-1` on #071B38 | 16.41 | AAA |
| `--text-inverse-1` on #0E2A52 | 13.64 | AAA |
| `--text-inverse-2` on #010D20 | 12.47 | AAA |
| `--text-inverse-2` on #071B38 | 11.01 | AAA |
| `--text-inverse-2` on #0E2A52 | 9.15 | AAA |
| `--text-inverse-3` on #010D20 | 7.56 | AAA |
| `--text-inverse-3` on #071B38 | 6.68 | AA |
| `--text-inverse-3` on #0E2A52 | 5.55 | AA |
| `--blue-sky` #4DA3FF on #010D20 (links) | 7.41 | AAA |
| `--blue-sky` on #071B38 | 6.54 | AA |
| `--blue-bright` #0B80F9 on #010D20 | 5.07 | AA (large text and graphics; 4.47 on navy-900, so body links use --blue-sky) |
| `--green-500` #6DB133 on #010D20 | 7.40 | AAA |
| `--green-500` on #071B38 | 6.53 | AA |
| `--ok` #10B981 on #010D20 | 7.67 | AAA |

Button fills:

| Pairing | Ratio | Result |
|---|---|---|
| #FFFFFF on `--blue` #004FC8 | 7.11 | AAA |
| #FFFFFF on `--blue-deep` #0043B3 (hover) | 8.56 | AAA |
| #FFFFFF on `--green-500` | 2.63 | FAIL. Rule: green is never a button fill. |
| #FFFFFF on `--blue-bright` | 3.84 | FAIL for text. Rule: --blue-bright is never a solid button fill; it appears only inside --gradient-brand where text sits on the mixed field, and the gradient's 60 percent stop keeps the average field at or below #004FC8 luminance behind text. |

Functional colors that stay functional and never become brand colors:
`#10B981`, `#DC2626`, `#991B1B` (absorbing `#9B1C1C`), `#FDE8E8`.

---

## 3. Typography

### Recommendation: keep Inter, actually load it, self-hosted. No second display face.

Reasoning:

- The wordmark is a heavy geometric sans. Inter at weights 700 to 800 with
  tight tracking is a close typographic relative; a second display face would
  compete with the wordmark rather than echo it, and every added family is
  added payload on a 150-page static site.
- 117 files already declare Inter. The cheapest credible move is making the
  declaration true, not replacing it in 117 places.
- Inter's tall x-height and tabular figures suit stat-heavy consulting
  content.

### Loading

**Self-host.** Add the Inter variable font (latin subset, roman and italic,
woff2, approximately 50 KB per file) at `assets/fonts/`, declared via
`@font-face` in `styles.css` with `font-weight: 100 900` and
`font-display: swap`. Because 148 pages already load `styles.css`, this
requires zero per-page edits to activate. Add `<link rel="preload">` for the
roman file in `templates/article-index.html` and the top static pages
(homepage, services, about, resources, contact, calculator) during their
respective passes; preload is an optimization, not a requirement.

Do not use Google Fonts links. The CSP in `_headers` declares
`style-src 'self' 'unsafe-inline'` and currently enforces nothing because it
is scoped to `/*.html`, which no rendered page matches. External font loading
works today only because of that misconfiguration. The CSP fix is a
post-Vegas task; self-hosting means typography cannot break when it lands.
The consultation pages keep their Google Fonts links untouched until their
own deferred pass, at which point they switch to the same self-hosted files.

The variable font also resolves the synthesized-weight problem: the 850 and
900 declarations currently render as browser-faked bold over the system
font. Under the consolidation below they are edited to 800; any stragglers
render as true instances instead of synthesis.

### Families and weights

```css
--font-sans: 'InterVariable', Inter, ui-sans-serif, system-ui, -apple-system,
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

One family. Weight policy (consolidating the current 600/800/700/500/850/900
spread):

| Weight | Use |
|---|---|
| 400 | Body copy, article text, form inputs |
| 500 | Nav links, footer links, secondary UI |
| 600 | Buttons, eyebrows, labels, tags, card CTAs |
| 700 | h3, h4, card titles, FAQ questions |
| 800 | h1, h2, display, stat numbers |

Existing 850 and 900 declarations consolidate to 800.

### Type scale

| Token | Size | Line height | Weight | Letter-spacing |
|---|---|---|---|---|
| `--type-display` | clamp(2.75rem, 2rem + 3.75vw, 4rem) | 1.05 | 800 | -0.03em |
| `--type-h1` | clamp(2.25rem, 1.8rem + 2.25vw, 3rem) | 1.12 | 800 | -0.025em |
| `--type-h2` | clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem) | 1.2 | 800 | -0.02em |
| `--type-h3` | clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem) | 1.3 | 700 | -0.01em |
| `--type-h4` | 1.125rem | 1.4 | 700 | 0 |
| `--type-lede` | 1.1875rem | 1.6 | 400 | 0 |
| `--type-body` | 1rem | 1.65 | 400 | 0 |
| `--type-body-article` | 1.0625rem | 1.75 | 400 | 0 |
| `--type-small` | 0.9375rem | 1.6 | 400 | 0 |
| `--type-eyebrow` | 0.8125rem | 1.4 | 600 | 0.12em, uppercase |
| `--type-stat` | clamp(2.5rem, 2rem + 2.5vw, 3.5rem) | 1.05 | 800 | -0.02em, tabular-nums |

`--type-display` is homepage hero only. Headings differ from body by weight
(700/800 vs 400), negative tracking (echoing the wordmark's tight geometry),
and color (`--text-1` or `--text-inverse-1`, full strength, never opacity-
faded). Body text never exceeds 70ch measure; the article measure stays
`70ch` as today.

---

## 4. What creates the visual impact

### Diagnosis of the current flatness

1. **No tonal contrast between sections.** `#FFFFFF` cards on `#F8FAFC` page
   is a 1.06:1 difference; sections visually run together into one long white
   page. The only dark moment (`.social-proof` at `#1e2a3a`) uses a navy that
   belongs to no palette, appears once, and vanishes.
2. **Flat rhythm.** Every section pads 64px top and bottom regardless of
   importance. Nothing breathes, nothing compresses, so nothing reads as a
   crescendo.
3. **Framework-default color.** `#007bff` is the Bootstrap 4 primary. Site
   visitors have seen this exact blue on ten thousand templates.
4. **The header.** A 120px-tall white bar with a 90px logo (a 307 KB
   auto-traced SVG) and an outlined bootstrap-blue Contact button is the
   single most dated element on the site, and it appears on every page.
5. **Emoji as iconography.** The homepage approach section uses 🔧 📊 🤝.
   Emoji render differently on every OS and read as placeholder work.
6. **96 shadow values with no hierarchy.** Everything floats slightly and
   identically; elevation communicates nothing.
7. **System font at default tracking.** Headings have no typographic
   relationship to the heavy geometric wordmark.
8. **No layering.** Every section is a self-contained horizontal stripe.
   Nothing overlaps a boundary, so the page reads as a stack of rectangles.

### The replacements

**Section rhythm.** Pages follow a band pattern: navy frame at top and
bottom, light bands alternating between `--surface-page` and
`--surface-card` (with `--surface-sunken` for utility bands like How It
Works). Section padding moves to `--space-section: clamp(4rem, 8vw, 7rem)`
for major bands and `clamp(2.5rem, 5vw, 4rem)` for secondary ones. The navy
bands compress content into tighter, higher-contrast moments; the light
bands open up. Rhythm is: dark, dense, bright, open, dark.

**Depth and layering.** Three moves, used deliberately:

1. Surface steps on dark: `--navy-950` page, `--navy-900` cards,
   `--navy-800` interactive fills, separated by `--border-dark` hairlines
   rather than shadows (shadows barely register on navy).
2. One shadow scale on light (specified in section 5), navy-tinted so
   elevation carries brand temperature.
3. Seam overlaps: the homepage stat band pulls up over the hero's bottom
   edge by a negative margin of `--space-8` (64px); featured cards on navy
   bands extend past the band edge onto the light section below. Two to
   three overlaps per page maximum.

**Spacing scale.** One 4px-based scale replacing ad hoc values:
`--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px,
`--space-5` 24px, `--space-6` 32px, `--space-7` 48px, `--space-8` 64px,
`--space-9` 96px, `--space-10` 128px. The existing `--space-section` and
`--space-block` names persist as fluid composites of this scale.

**Imagery direction.** Stock photography of parking lots is prohibited; it
is the fastest route back to template-land. The imagery source is stills
exported from the company's field-visit video footage: real lots, real
installs, real site walks. Treatment: 16:10 or 21:9 crops, `--radius-lg`
corners, a bottom navy scrim (`linear-gradient(transparent 40%,
rgba(1,13,32,0.7))`) when text sits on the image, and a 1px
`--border-dark`-equivalent hairline on light surfaces. Where footage does
not cover a topic, the fallback is typographic and data-graphic treatment on
navy (the category-gradient placeholder system already in the JS, recolored
per section 2), never stock. The hero keeps the existing field footage video
with the scrim recolored from black to navy.

**Motion and scroll behavior** (high level; `docs/motion-spec.md` governs
detail): entrance reveals on section children (opacity plus 12 to 16px
translate, 400 to 500ms, 60 to 80ms stagger) driven by a single
IntersectionObserver in vanilla JS; count-up on stat numbers, once, about
900ms, triggered at 40 percent visibility; no parallax, no scroll-jacking,
no animation libraries. Everything gates on
`prefers-reduced-motion: reduce`. This is all achievable in the current
stack; the reference sites' Webflow interactions are not the bar.

**Iconography.** One system: inline SVG, 24px grid, 1.75px stroke, round
caps and joins, `currentColor`, sourced from the open-source Lucide set
(ISC license, copied inline, no library, no external requests). Icons
inherit text color: blue in brand contexts, green only inside solar and EV
scoped sections. All emoji iconography is removed. The existing checkmark
pseudo-elements (`.services-list li::before`, `.trust-list`) convert to the
same system.

---

## 5. Component specifications

### Scales (replacing the current sprawl)

**Border radius**, replacing 20 values with four steps plus the pill:

```css
--radius-sm:   8px;   /* tags, small controls */
--radius-md:   12px;  /* buttons, inputs */
--radius-lg:   16px;  /* cards, callouts, images */
--radius-xl:   24px;  /* hero media, oversized panels */
--radius-full: 9999px; /* pills, circular badges */
```

(REBRAND.md's Pass 2b line says "20 radii to four"; this is four finite radii
plus the pill, which cannot be expressed as a finite step. Flagged in the
contradictions list.)

**Shadows**, replacing 96 values with four, all navy-tinted:

```css
--shadow-sm: 0 1px 2px rgba(1,13,32,0.06), 0 1px 3px rgba(1,13,32,0.08);
--shadow-md: 0 2px 4px rgba(1,13,32,0.05), 0 6px 16px rgba(1,13,32,0.08);
--shadow-lg: 0 4px 12px rgba(1,13,32,0.08), 0 16px 40px rgba(1,13,32,0.14);
--shadow-brand: 0 8px 24px rgba(0,79,200,0.28); /* primary CTA emphasis only */
```

Resting cards use `--shadow-sm`, hover and overlap moments use
`--shadow-md`, the mobile nav panel and seam-overlap bands use
`--shadow-lg`, and `--shadow-brand` appears on at most one element per
viewport (the primary CTA).

**Container**: one width, `--container: 1200px`, with `padding-inline: 20px`
(24px at 768px and up). This replaces both 1100px (content) and 1300px
(header); header and content align to the same grid edge, which they
currently do not. Article measure remains `70ch` inside the container.

**Breakpoints**: three, replacing six: `640px` (single column below),
`768px` (nav collapse boundary, two-column grids), `1024px` (full desktop:
sidebars, three-column grids). Mapping: 600 joins 640; 860 and 960 join
1024 (the article sidebar and state layout both collapse at 1024, which
they should; both are cramped between 860 and 1024 today).

### Buttons

One system, `.btn`, replacing both `.btn`/`.btn-primary` (article.css pill
style) and `.cta`/`.cta--primary`/`.cta--secondary` (styles.css), plus the
stray `.hero-btn`, `.cta-button`, and `.footer-cta__btn` variants.

Base: inline-flex, center-aligned, gap 8px, `--radius-md`, weight 600,
`--type-body`, transition 150ms ease on background, color, box-shadow,
transform. Sizes: `.btn--sm` 40px height with 16px padding-inline, default
48px with 24px, `.btn--lg` 56px with 32px (hero and CTA bands only).

| Variant | Default | Hover | Focus-visible | Active | Disabled |
|---|---|---|---|---|---|
| `.btn--primary` | `--blue` fill, white text | `--blue-deep` fill | 2px outline `--blue` at 2px offset, plus 4px ring rgba(0,79,200,0.25) | `--blue-deep`, translateY(1px) | 40% opacity, no pointer events |
| `.btn--primary` on dark | `--gradient-brand` fill, white text, `--shadow-brand` | gradient shifts to 100% `--blue-deep` stop dominance (background-position trick, no repaint jank) | white 2px outline, offset 2px | translateY(1px) | same |
| `.btn--secondary` | transparent, 1.5px `--blue` border, `--blue` text | `--blue-tint` fill | as primary | `--blue-tint`, translateY(1px) | same |
| `.btn--secondary` on dark | transparent, 1.5px rgba(255,255,255,0.35) border, white text | rgba(255,255,255,0.08) fill | white outline | same pattern | same |
| `.btn--ghost` | `--blue` text, arrow glyph, no box | underline, arrow translates 4px | outline as primary | none | same |

Transition plan: the new `.btn` rules are also applied to the legacy
selectors (`.cta`, `.btn-primary`, `.hero-btn`, `.cta-button`,
`.footer-cta__btn`) so all existing markup unifies visually at Pass 2b
without markup edits; markup migrates to `.btn .btn--*` classes during the
Pass 2c sweep and template touches, after which legacy selectors are
deleted.

Green is never a button fill (2.63:1 with white; see section 2). Solar and
EV CTAs use standard blue buttons; their sections carry green through
eyebrows, icons, and accents only.

### Cards

**Base card**: `--surface-card`, `--radius-lg`, 1px `--border-1`,
`--shadow-sm`, padding `--space-6`. Hover (only when the whole card is a
link): `--shadow-md`, translateY(-2px), 200ms. Focus-within shows the
button-style focus ring on the card.

**Article card** (resources grid, featured resources): image top at 16:9
with `--radius-lg` top corners only; body padding `--space-5`; category tag
(pill, `--surface-sunken`, `--text-2`, `--type-eyebrow` at 0.75rem); title
`--type-h4` weight 700, two-line clamp; excerpt `--type-small` `--text-2`,
three-line clamp; meta row `--text-3`. The fallback thumbnail system keeps
its generated-SVG mechanism with the recolored category table from
section 2.

**Video library card** (dark variant, per REBRAND.md): `--navy-900`
surface, `--border-dark`, thumbnail with centered play glyph (white circle
at 56px, `--blue` triangle), title `--text-inverse-1`, meta
`--text-inverse-3`. Hover: `--navy-800`, play glyph scales 1.06. These
cards sit on a navy band on the Ask the Experts page.

**Stat card / metric display**: number in `--type-stat` with
`font-variant-numeric: tabular-nums`; on navy, numbers render in
`--gradient-silver` clipped text with `--text-inverse-1` fallback; label in
`--type-small`, `--text-inverse-3` (dark) or `--text-3` (light). A 32px,
3px-tall `--gradient-brand` rule sits between number and label. Count-up
behavior per motion spec. Only verified figures (Eau Claire, Stillwater)
may populate these.

### Section headers with eyebrow

Structure: eyebrow, heading, optional lede, in that order.

- Eyebrow: `--type-eyebrow`, `--blue` on light, `--blue-sky` on dark.
  Inside solar or EV scoped sections only, the eyebrow may use
  `--green-700` (light) or `--green-500` (dark).
- Heading: `--type-h2`.
- Lede: `--type-lede`, `--text-2` or `--text-inverse-2`, max 60ch.
- Left-aligned by default; centered only on the homepage CTA band and hero.
  Current center-everything layout is part of the template feel.

### Navigation

**Desktop (1024px and up)**: navy bar, `--navy-950` at 95% opacity with
`backdrop-filter: blur(8px)`, 1px bottom border `--border-dark`, height
72px (down from 120px), sticky. Logo: `assets/brand/MP_Logo_400.png` at
44px height (replacing the 307 KB `images/Logo.svg`, per REBRAND.md). Links:
`--text-inverse-2` at weight 500, hover `--text-inverse-1` with a 2px
`--gradient-brand` underline animating in; current page carries the
underline persistently. "What We Do" is a dropdown (CSS-positioned panel,
vanilla JS for open state and focus management, `--navy-900` panel,
`--radius-lg`, `--shadow-lg`): three rows, each an icon, pillar name, and
one-line description, for Parking Revenue, Solar Lighting, EV Charging.
Remaining top-level items: Resources (dropdown: Articles and Guides, Video
Library, State Guides, FAQ), About, then right-aligned: Calculator as
`.btn--secondary` on dark at `--sm` size, and Get an Assessment as
`.btn--primary` on dark at `--sm` size, linking to `/contact/`.

**Mobile (below 768px)**: same bar at 64px; hamburger opens a full-height
`--navy-950` panel sliding from the right (240ms), body scroll locked;
groups render as accordions (What We Do, Resources) with singles (About)
between; the two CTA buttons pin at panel bottom, full width. The toggle
animates to an X as today. Focus is trapped in the panel; Escape closes.

Between 768 and 1024px, the desktop bar persists but drops the Calculator
button to fit.

### Footer

`--navy-950`, top border 1px `--border-dark`, padding-block `--space-9`
and `--space-7`. Four columns at 1024px and up (stacking to two at 768px,
one at 640px):

1. Brand: logo at 36px, one-sentence vendor-neutral positioning line,
   social icon row (existing five icons, `--text-inverse-3`, hover
   `--text-inverse-1`).
2. What We Do: Parking Revenue, Solar Lighting, EV Charging, Calculator.
3. Resources: Articles and Guides, Video Library, State Guides, FAQ.
4. Contact: email, Get an Assessment `.btn--primary`, response expectation
   line in `--text-inverse-3`.

Bottom bar: hairline `--border-dark`, copyright in `--text-inverse-3`. The
current footer's tagline ("Built for parking lot owners who want results")
is replaced with the vendor-neutral positioning line; final copy is owned
by Ben.

### Forms

On light surfaces: inputs at 48px height, `--surface-card` background, 1px
`--border-1`, `--radius-md`, `--type-body`, `--text-1`; placeholder
`--text-3`. Labels above, `--type-small` weight 600, `--text-1`. Focus: 1px
`--blue` border plus 4px ring rgba(0,79,200,0.25); no bare `outline: none`
anywhere. Error state: `--err` border, message below in `--err-text` at
`--type-small` with an inline icon; form-level errors in an `--err-bg`
panel with `--err-text`. Success confirmation: `--ok-text` with `--ok`
icon. Disabled: `--surface-sunken` fill, `--text-3`, no pointer. Textareas
min-height 120px. Selects share input chrome with a chevron icon. Submit
buttons are `.btn--primary`. Formspree endpoints are untouched.

---

## 6. Information architecture

### Navigation structure

Adopted structure (shipping for the conference):

```
What We Do ▾        Resources ▾        About        [Calculator]  [Get an Assessment]
  Parking Revenue     Articles & Guides
  Solar Lighting      Video Library
  EV Charging         State Guides
                      FAQ
```

### The two-axis evaluation

The airgarage.com two-axis model (What We Do / Who We Serve) fits this
business and the keywords already being bought, but only half of it is
buildable by the conference. Verdict:

- **What We Do: adopt now.** The three pillar pages exist or are being
  created (below), and the axis is required for the conference scope rule.
- **Who We Serve: adopt post-conference.** The segment keywords (churches,
  hotels, offices, stadiums, municipalities) currently land on
  `/consultation/`, which is frozen while Google Ads bidding is on Maximize
  Clicks. The existing state pages are geographic, not segment, pages and
  cannot masquerade as this axis. Launching five thin segment pages in the
  conference window would compete for the same writing time as the solar
  page and produce doorway-quality content. The nav is designed with a slot
  for the second axis so adding it later is a header component change (one
  template edit plus the static page sweep), not a redesign. Segment pages
  land at `/who-we-serve/{segment}/` when written.

### New pages required

| Page | Status | Notes |
|---|---|---|
| `/services/solar-lighting/` | NEW, conference-critical | No solar presence exists on the site. Copy is owned by Ben (per REBRAND.md); page design uses the pillar-page pattern: navy hero with field imagery, eyebrow in green scope, benefit grid, spec/approach section, CTA band. Needs copy delivered by end of week 3 (see section 9). |
| `/services/ev-charging/` | NEW, conference-critical | Consolidation hub: positions the EV service, then links the scattered EV articles (30C tax credit, charger articles) as a curated resource list. No article moves, no article URL changes. |
| `/services/parking-revenue/` | NEW, conference-desirable | Gives the flagship service a canonical pillar URL parallel to the other two. `/services/` remains the hub (see below). If week 4 is tight, this page is the one to cut; the nav's Parking Revenue item then links to `/services/#parking` as today's anchors do. |
| `/who-we-serve/{churches,hotels,offices,stadiums,municipalities}/` | Post-conference | Second nav axis. |

### Restructuring of existing pages

- `/services/` becomes the What We Do hub: three pillar summary blocks with
  links into the pillar pages, replacing the current single-service long
  scroll. The URL does not change. Existing anchor IDs (`#...`) are
  preserved so any inbound anchor links keep working.
- `/resources/` gains category filters that already exist; the EV Charging
  category becomes green-scoped per section 2. No URL change.
- Homepage restructures per section 7. No URL change.
- State pages are reskinned (tokens, header, footer) but not restructured.
- `ask-the-experts.html` keeps its current URL through the conference
  despite being the one non-pretty URL on the site; it is reachable as
  Video Library in the nav. Migrating it to `/ask-the-experts/` is a
  post-Vegas task because it requires a `_redirects` entry (currently
  sitemap lists a 308-redirecting variant; that cleanup is already on the
  post-Vegas backlog).

### URL and SEO consequences

**No existing URL changes in this plan.** All new pages are additive.
`_redirects` is not touched. `sitemap.xml` regenerates additively via the
existing generator. The only flagged risk: moving service detail content
from `/services/` onto new pillar pages redistributes that page's topical
depth; mitigation is that `/services/` retains substantive summaries (not
bare link stubs) and the pillar pages interlink back. Any future decision
to move article URLs (none proposed) would require `_redirects` entries and
is out of scope.

---

## 7. Homepage structure

Top to bottom. Parking remains the primary conversion path throughout; the
three-pillar section introduces the other services without diluting the
hero or CTA bands.

**1. Header.** Navy nav per section 5. Job: reframe the brand in the first
200ms and route returning visitors.

**2. Hero (navy).** Existing field-footage video retained; overlay changes
from black gradient to navy scrim (rgba(1,13,32,0.5) to rgba(1,13,32,0.85)
bottom, blending the video into the navy frame). Eyebrow:
"Vendor-neutral parking and property revenue consulting". H1 stays
"Parking Lot Revenue Solutions for Property Owners" (matches the page
title and ad relevance; silver-gradient display treatment). Lede rewritten
to comply with content rules (current copy uses first person):
"Most parking lots have untapped earning potential. Property owners earn
$3,000-$8,000+ per month with smart technology, no upfront costs, and full
support." Buttons: `.btn--lg .btn--primary` "Get a Free Revenue Assessment"
to `/contact/`, `.btn--lg .btn--secondary` on dark "Try the Revenue
Calculator". Job: convert paid and organic parking traffic; nothing about
solar or EV appears above the fold.

**3. Proof band (overlap seam).** The Eau Claire stats (178 percent, 45 to
90 percent compliance, $240K value lift) in a `--surface-card` panel with
`--shadow-lg`, pulled up over the hero's bottom edge. Count-up on scroll.
Source link to the case study. Job: immediate verified proof; this is the
replacement for the client logo wall the stack cannot have.

**4. What We Do (light).** Eyebrow "What We Do", h2 "Three ways a property
earns more", three cards: Parking Revenue and Management first (blue icon,
links to pillar page or `/services/#parking`), Solar Lighting (green-scoped
icon, links to new page), EV Charging (green-scoped icon, links to new
page). Parking card leads by position and carries the case-study metric as
its supporting line; all three cards are equal width (co-equal pillars,
order expresses priority). Job: establish the three-pillar positioning for
conference traffic without unbalancing the parking funnel.

**5. How It Works (sunken band).** The existing three steps, rewritten
without first person: "Free Assessment" / "Fast Setup" / "Revenue From
Month One" pattern, numbered badges in `--blue`, micro-CTAs kept. Job:
reduce perceived effort and risk for the parking path.

**6. Approach and credibility (light, two-column).** Field still from site
visits (navy scrim, `--radius-xl`) beside: eyebrow "The Approach", h2, three
checkmarked points (assessment before recommendation; technology from any
provider, chosen for the property; month-to-month terms), and a named quote
with photo if usage permission exists (founder quote as fallback). Job:
communicate vendor neutrality as the differentiator; this is the second
replacement for logo walls and product screenshots.

**7. Featured Resources (page background).** Existing three-card grid
restyled per section 5, plus a fourth slot as a dark video-library card
linking to Ask the Experts. Job: signal depth of expertise and feed the
content funnel.

**8. CTA band (navy).** Centered eyebrow plus h2 ("Find out what the
property could earn"), `.btn--lg` primary on `--gradient-brand`, secondary
ghost to the calculator. Background: `--navy-950` with a faint radial
`--blue-deep` glow at 8 percent opacity, echoing the logo's lit-object
depth. Job: last conversion opportunity.

**9. Footer.** Per section 5. Job: full-site routing, second-axis-ready.

Sections removed relative to today: none are lost; the social-proof band
moves up and becomes the seam overlap, and the approach section absorbs
the credibility job with real imagery replacing the emoji rows.

---

## 8. What NOT to do

Template tells (each of these would undo the differentiation):

- No stock photography of parking lots, handshakes, or skylines. Footage
  stills or typographic/data treatments only.
- No emoji as icons anywhere.
- No framework-default blues; after Pass 2b, `#007bff`, `#0a68ff`, and
  `#0b6efd` must not appear in any file, including JS.
- No purple-to-pink SaaS gradients, glassmorphism panels, floating 3D
  blobs, or dot-grid hero backgrounds. The only gradients on the site are
  `--gradient-brand` and `--gradient-silver`.
- No animation libraries (GSAP, Lottie, AOS) and no scroll-jacking or
  parallax. Motion stays within the vanilla spec.
- No hero carousels or rotating testimonial sliders.
- No dark article bodies. The hybrid boundary is fixed.
- No new external origins (fonts, embeds, widgets); the CSP will
  eventually be enforced and everything added meanwhile would break.

Vendor-neutrality breakers:

- No product UI screenshots or fabricated dashboard mockups. The company
  has no product; a mocked dashboard would imply one and would be the
  fastest way to look like every parking SaaS competitor.
- No client logo walls; usage rights are not established. Proof comes from
  verified case-study numbers and named quotes.
- No vendor logos presented as partnerships, and ClearWorld is not named
  as the provider in solar content (per REBRAND.md, positioning stays
  vendor-neutral; the co-brand lockup is for conference collateral, not
  general site chrome).
- Green never leaks out of solar, EV, sustainability, and success scope.
  If green becomes ambient, the site reads as a solar company.
- No superlatives, no first person, no em dashes, no fabricated numbers in
  any copy this direction generates. Only Eau Claire and Stillwater figures
  are citable.

---

## 9. Implementation sequence

Six weeks to the conference. Mapping onto the existing pass plan in
REBRAND.md (2a tokens, 2b consolidation, 2c inline sweep, consultation
deferred):

**Week 1: decisions and Pass 2a (token layer).**
Approvals needed on the five flagged decisions (canonical blue, `#010D20`
confirmation, typography approach, container/breakpoints, nav structure).
Then Pass 2a exactly as planned: one `:root` in `styles.css`, all tokens
from section 2 plus the scales from section 5, old names aliased per the
table, pixel-identical verification. Add the Inter variable font files to
`assets/fonts/` and the `@font-face` block in the same pass; font
activation is visible but isolated, and verifying it early de-risks
everything downstream. Update REBRAND.md: blue decided, `#010D20`
confirmed.

**Week 2: Pass 2b (consolidation) and the header/footer component pass.**
Blues to `#004FC8` and companions, 16 whites to 3, 10 greys to 1, 96
shadows to 4, radii to the section 5 scale, weights 850/900 to 800, the JS
category tables and `state-map.js` literal per section 2. Then the
header/footer pass across the 78 distinct edit points: navy chrome, new
nav structure (What We Do dropdown with pillar links pointing at
`/services/` anchors until pillar pages exist), `MP_Logo_400.png` replacing
`Logo.svg`, new footer. Template rebuild (`npm run build`) carries all 72
generated article pages. This is the visible-transformation week.
Warning from REBRAND.md applies: these commits touch gated `<head>`
regions on many pages; keep them clean of any edits to the noindex and
gtag blocks so the merge-day reverts of `187bfbd` and `3596d3d` stay
conflict-free.

**Week 3: homepage rebuild and Pass 2c (inline sweep).**
Homepage per section 7. Pass 2c: scripted sweep of the uniform inline
`<style>` payloads (the 15 distinct payloads across 119 pages; scriptable
for the uniform groups, manual for the 4 bespoke pages), replacing inline
literals with token references and deleting rules now covered by
`styles.css`. The two consultation payloads are excluded.

**Week 4: pillar pages and services restructure.**
`/services/` hub restructure, `/services/solar-lighting/` (hard dependency:
Ben's copy, needed by start of week 4), `/services/ev-charging/` hub,
`/services/parking-revenue/` if time allows (the designated cut if not).
Nav dropdown links repoint from anchors to pillar pages. New `og-image.png`
built and referenced. Sitemap regenerated.

**Week 5: polish and QA.**
Icon sweep (emoji and pseudo-element checkmarks to the SVG system),
field-footage stills placed, motion pass per the (by then written) motion
spec, state page and resources reskin verification, full QA: automated
contrast re-check of every text/background pairing, Lighthouse on
homepage, one article, one state page; mobile nav on real devices; grep
verifications (no legacy blues, no unscoped greens, no emoji icons, alias
usage down to zero in swept files).

**Week 6: buffer and freeze.**
Content fixes, stakeholder review on the preview URL, freeze by midweek.
Merge-day checklist per REBRAND.md (revert `187bfbd` and `3596d3d`, confirm
Ads bidding switched off Maximize Clicks, PR merge, production tracking and
robots verification).

**Conference-required versus deferrable:**

- Required: tokens, consolidation, typography, header/footer/nav, homepage,
  solar lighting page, EV charging page, og-image, QA.
- Deferrable: parking-revenue pillar page (anchors fallback), Who We Serve
  axis, `ask-the-experts.html` URL migration, article body-image art
  refresh, CSP scoping fix, consultation redesign.

**Consultation pages:** deferred to their own pass after Google Ads bidding
changes, per standing rule; nothing in this plan touches them. Explicit
consequence to accept: through the conference, ad traffic landing on
`/consultation/` sees the previous branding while every other page shows
the new system. This is the correct trade; the page carries live conversion
tracking and is measurably working. Its eventual pass reuses the token
layer and swaps its self-contained `:root` for the canonical one.

**Asset dependencies not yet in the repo:**

| Asset | Needed by | Blocking? |
|---|---|---|
| Inter variable woff2 files (latin, roman + italic) | Week 1 | Yes; freely downloadable, added during Pass 2a |
| Field-footage stills (exported from Ben's site-visit video) | Week 3 | Homepage approach section and pillar pages fall back to typographic treatment until delivered |
| Solar lighting page copy (Ben) | Start of week 4 | Yes, for the conference scope rule |
| New `og-image.png` 1200x630 | Week 4 | Buildable from existing assets: navy `#010D20` field plus the gradient logo; no new artwork required |
| Solid dark logo variant for light backgrounds | Not web-blocking | Header goes navy, so the web has no light-surface logo placement; still needed for print and co-brand contexts (already tracked in REBRAND.md) |
| Transparent tagline and co-brand lockups | Not web-blocking | Conference collateral; tracked in REBRAND.md |
| Named-quote permission (Eau Claire) | Week 3 | Founder quote is the fallback |

**Contradictions with REBRAND.md** (also summarized for approval):

1. Pass 2b is framed as "which blue wins" among the three incumbents. This
   direction selects a fourth, artwork-sampled value (`#004FC8`); all 757
   occurrences change rather than roughly two thirds.
2. Pass 2b says "20 radii to four"; this direction specifies four finite
   radii plus the pill token (five tokens).
3. REBRAND.md leaves the container widths and breakpoints as open findings;
   this direction resolves them to 1200px and 640/768/1024, meaning both
   incumbent widths (1100 and 1300) change.
4. The provisional `#010D20` is confirmed rather than replaced; the
   REBRAND.md color table row moves from PROVISIONAL to confirmed with no
   value change and no page edits.
5. Everything else aligns: hybrid dark is confirmed as recorded, the navy
   application list matches, `MP_Logo_400.png` replaces `Logo.svg` as
   already planned, and the consultation deferral is preserved.
