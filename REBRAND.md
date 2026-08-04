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

- Analytics and ad tags gated to hostname `monetize-parking.com` only
- `noindex` meta tag active on any non-production hostname
- Cloudflare Access password on the preview URL
- `/consultation/` visual changes on hold until Google Ads bidding is switched
  off Maximize Clicks

## Merge day checklist

- [ ] Remove analytics hostname gating
- [ ] Remove noindex gating
- [ ] Confirm Ads bidding already switched off Maximize Clicks
- [ ] Merge `rebrand` into `main` via pull request
- [ ] Annotate deploy date in GA4 and Google Ads
- [ ] Verify tags firing on production
