#!/usr/bin/env node
'use strict';

/*
 * ONE-OFF migration for the 2026-08-18 title and description pass.
 *
 * Adds `seoTitle` to the 31 records whose `title` exceeds 60 characters, and
 * rewrites the 37 `description` values that exceeded 160. Run once, verify,
 * then delete this file - it is a data migration, not a build step, and it is
 * deliberately NOT wired into npm run build.
 *
 * Why seoTitle rather than editing title: `title` drives the h1, the resource
 * card, the breadcrumb and the SERP string at once. Shortening it for the SERP
 * would have shortened the on-page heading too. See seoTitleFor() in
 * tools/generate-article-pages.js.
 *
 * Every value below is asserted against its limit before anything is written,
 * so a too-long string fails loudly instead of shipping truncated.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(path.resolve(__dirname, '..'), 'data', 'resources.json');

const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;

// slug -> seoTitle. Front-loaded, filler removed, no brand suffix.
const SEO_TITLES = {
  'ev-charging-property-value-noi': 'How EV Charging Raises Property Value and NOI',
  'hotel-ev-charging-guest-revenue': 'Hotel EV Charging: Guest Revenue and Bookings',
  '30c-ev-charger-tax-credit-property-owners': 'Section 30C EV Charger Tax Credit: What Changed',
  'level-2-vs-dc-fast-charging-property-owners': 'Level 2 vs DC Fast Charging: Which Fits Your Lot',
  'hidden-costs-ev-charging-installation': 'Hidden Costs of EV Charging Installation',
  'ev-charging-revenue-share-vs-ownership': 'EV Charging: Revenue Share vs Ownership',
  'ev-charging-idle-fees-session-limits': 'EV Charging Idle Fees and Session Limits',
  'questions-before-signing-ev-charging-contract': 'Questions to Ask Before an EV Charging Contract',
  'parking-lot-revenue-tax-implications': 'Parking Lot Revenue: Tax Implications for Owners',
  'gym-fitness-center-parking-revenue': 'Gym and Fitness Center Parking Revenue',
  'overnight-24-hour-parking-revenue': 'Overnight and 24-Hour Parking Revenue Strategies',
  'parking-during-construction-renovation': 'Parking Revenue During Construction and Renovation',
  'ada-compliance-paid-parking': 'ADA Compliance Requirements for Paid Parking Lots',
  'parking-lot-striping-layout-revenue': 'Parking Lot Striping and Layout for More Revenue',
  'winter-parking-revenue-strategies': 'Winter Parking Revenue: Snow, Liability, Pricing',
  'monthly-passes-vs-hourly-rates': 'Monthly Parking Passes vs Hourly Rates',
  'mixed-use-development-parking': 'Mixed-Use Development Parking Revenue',
  'brewery-bar-parking-revenue': 'Brewery and Bar Parking Revenue',
  'airport-proximity-parking-revenue': 'Airport Proximity Parking Lot Revenue',
  'municipal-parking-solutions': 'Municipal Parking Solutions for Cities',
  'parking-lot-security': 'Parking Lot Security: Cameras, Lighting, Monitoring',
  'medical-facility-parking-revenue': 'Medical Office and Clinic Parking Revenue',
  'retail-parking-revenue-guide': 'Retail Store Parking Revenue: A Guide for Owners',
  'college-town-parking-revenue': 'College Town Parking Revenue for Property Owners',
  'apartment-parking-revenue': 'Apartment Parking Revenue: What to Charge',
  'event-parking-revenue': 'Event Parking Rates for Game Days and Concerts',
  'parking-lot-insurance-requirements': 'Parking Lot Insurance for Paid Parking',
  'hotel-parking-revenue': 'Hotel Parking Revenue: Pricing Free Parking',
  'eau-claire-revenue-increase': 'Eau Claire Case Study: 178% Parking Revenue Lift',

  /* The two retargets. Both pages carry large impression counts against query
     families their current titles do not name.

     office-building-parking-revenue holds ~3,000 impressions at positions 2.5
     to 11 across the "parking garage revenue per square foot vs office" family
     and has never earned a click. The title never contained the phrase. Naming
     it will not fix the AI Overview absorption, but a page cited on that query
     should at least say what it is about.

     parking-validation-programs-guide holds 5,811 impressions, almost all of it
     consumer-definitional ("what does validate parking mean", "does the grove
     validate parking"). That audience does not buy. Retargeting the title at
     the tenant/owner side trades those impressions away deliberately. Expect
     the impression count on this URL to FALL, and treat that as the change
     working rather than as a regression. */
  'office-building-parking-revenue': 'Parking Revenue Per Square Foot vs Office Space',
  'parking-validation-programs-guide': 'Parking Validation for Retail Tenants Explained'
};

/* `title` is corrected rather than overridden for this one record: it carried a
   literal " | Monetize Parking" inside the title field, so the h1 on the page
   read "Eau Claire Case Study: 178% Revenue Increase | Monetize Parking". That
   is a data error visible to readers, not a SERP-length question. */
const TITLE_FIXES = {
  'eau-claire-revenue-increase': 'Eau Claire Case Study: 178% Revenue Increase'
};

// slug -> description, all within DESC_LIMIT.
const DESCRIPTIONS = {
  'what-parking-lot-lighting-costs': 'The fixture is the cheap part. Trenching, service capacity, permits and maintenance decide what a parking lot lighting project actually costs.',
  'solar-lighting-winter-performance': 'Solar lighting fails in winter for three reasons, all decided before installation: array sizing, battery autonomy and snow shedding.',
  'when-solar-lighting-is-wrong': 'Shade, pole condition, illuminance requirements and nearby power all disqualify sites from solar lighting. What to check before a proposal.',
  'ev-charging-property-value-noi': 'How EV charging revenue affects net operating income, cap rates and commercial property appraisals.',
  'hotel-ev-charging-guest-revenue': 'Hotel EV charging attracts higher-spending guests and adds a parking revenue stream. How to set it up on a hotel property.',
  '30c-ev-charger-tax-credit-property-owners': 'The federal 30C EV charger credit expired June 30, 2026. What it covered, why the 30% figure was often overstated, and how to evaluate charging now.',
  'parking-lot-revenue-tax-implications': 'How parking income is taxed, which expenses deduct, and whether your state charges sales tax. Schedule E vs Schedule C, depreciation and UBIT.',
  'paid-parking-increases-property-value': 'Parking revenue does more than add monthly income. How NOI multiplies into property value through cap rate math, and what lenders look for.',
  'gym-fitness-center-parking-revenue': 'Gyms create predictable peak-hour demand and long off-peak windows. Turn both into revenue with shared parking and automated enforcement.',
  'overnight-24-hour-parking-revenue': 'A lot that empties at 6 PM is monetized half the day. Overnight strategies for entertainment districts, transit hubs and residential overflow.',
  'stadium-arena-event-parking': 'Event-day parking revenue near stadiums and arenas: dynamic pricing, traffic management, season passes and venue partnerships.',
  'parking-during-construction-renovation': 'Hold parking revenue while construction reduces available spaces. Communication, alternative arrangements, pricing adjustments and recovery.',
  'ada-compliance-paid-parking': 'ADA requirements for paid parking lots: accessible space counts, van-accessible spaces, signage, payment systems and enforcement.',
  'parking-lot-striping-layout-revenue': 'Striping and layout decide capacity. Compact vs standard spaces, angle vs perpendicular, traffic flow, and when re-striping adds spaces.',
  'winter-parking-revenue-strategies': 'Hold parking revenue through winter with snow removal policies, liability protection, seasonal pricing and clear weather communication.',
  'monthly-passes-vs-hourly-rates': 'When monthly passes guarantee stable income, when hourly rates capture more, and how to run both without cannibalizing either.',
  'parking-revenue-analytics': 'Which parking metrics drive revenue decisions: utilization rates, compliance patterns, peak demand timing and the early warning signs.',
  'mixed-use-development-parking': 'Monetizing parking across retail, residential and office tenants. Time-sharing strategies, validation programs and revenue allocation.',
  'brewery-bar-parking-revenue': 'Parking revenue for breweries, bars and nightlife venues without adding liability. Evening pricing, rideshare partnerships and overnight policy.',
  'airport-proximity-parking-revenue': 'Competing with official airport parking on long-term rates and shuttle service. Pricing, security requirements and operating models.',
  'what-is-parking-monetization': 'Parking monetization turns underused lots into revenue. How property owners earn from existing spaces without gates, staff or upfront cost.',
  'qr-code-parking-payments': 'Scan-to-pay collects parking revenue with no meters, gates or hardware. How QR code payments work, what they cost, and how to start.',
  'church-parking-revenue-guide': 'Most church lots sit empty Monday through Saturday. How to earn weekday revenue with no hardware cost and no impact on Sunday services.',
  'medical-facility-parking-revenue': 'How medical offices and clinics balance patient access with parking income, and which technology keeps the two from conflicting.',
  'parking-validation-programs-guide': 'Give tenants and customers free parking without letting everyone else park free. How validation works, gated and gateless.',
  'announce-paid-parking-guide': 'Introducing paid parking without alienating customers. How to communicate the change and hold goodwill through the transition.',
  'is-it-legal-to-charge-for-parking': 'Charging for parking on private property: zoning, signage requirements, tenant considerations and the enforcement rules that apply.',
  'why-gateless-parking': 'Gateless parking removes barriers, cuts maintenance and improves the customer experience. Why owners are leaving traditional gate systems.',
  'how-to-start-charging-for-parking': 'The steps to set up paid parking, from assessing the property to choosing technology and launching without upsetting existing tenants.',
  'parking-lot-revenue-potential': 'What drives parking lot revenue, and how to estimate what a specific property could earn before committing to anything.',
  'event-parking-revenue': 'Property owners near venues can charge well above normal rates on event days. Finding nearby events, setting pricing and managing the rush.',
  'parking-lot-insurance-requirements': 'Charging for parking changes liability exposure. What coverage to have in place first, from garagekeepers to umbrella policies.',
  'hotel-parking-revenue': 'Free hotel parking leaves money on the table. How to add parking fees guests accept while capturing non-guest revenue too.',
  'handling-parking-violations-disputes': 'Enforcement without angry customers. Setting fair violation fees, building a simple dispute process and applying rules consistently.',
  'office-building-parking-revenue': 'What parking earns per square foot against office and retail rent, and how to monetize visitor, after-hours and weekend capacity.',
  'restaurant-paid-parking': 'Restaurant owners fear paid parking drives diners away. What the data shows, and how validation and pricing keep them coming back.',
  'dynamic-pricing-guide': 'Time-based, demand-based and event-based parking pricing: the strategies, the technology required, and how to roll it out in stages.'
};

function main() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const articles = JSON.parse(raw);
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const problems = [];

  // Assert everything BEFORE writing anything.
  for (const [slug, value] of Object.entries(SEO_TITLES)) {
    if (!bySlug.has(slug)) problems.push(`seoTitle: no record for slug "${slug}"`);
    if (value.length > TITLE_LIMIT) problems.push(`seoTitle too long (${value.length}): ${slug}`);
    if (/—|–/.test(value)) problems.push(`seoTitle contains a dash character: ${slug}`);
  }
  for (const [slug, value] of Object.entries(DESCRIPTIONS)) {
    if (!bySlug.has(slug)) problems.push(`description: no record for slug "${slug}"`);
    if (value.length > DESC_LIMIT) problems.push(`description too long (${value.length}): ${slug}`);
    if (value.length < 70) problems.push(`description too short (${value.length}): ${slug}`);
    if (/—|–/.test(value)) problems.push(`description contains a dash character: ${slug}`);
    if (/\b(we|our|us|I)\b/i.test(value)) problems.push(`description uses first person: ${slug}`);
  }
  for (const slug of Object.keys(TITLE_FIXES)) {
    if (!bySlug.has(slug)) problems.push(`title fix: no record for slug "${slug}"`);
  }
  if (problems.length) {
    problems.forEach((p) => console.error(`  ${p}`));
    throw new Error(`${problems.length} problem(s); nothing written.`);
  }

  let seo = 0;
  let desc = 0;
  let fixed = 0;
  for (const [slug, value] of Object.entries(TITLE_FIXES)) {
    bySlug.get(slug).title = value;
    fixed++;
  }
  for (const [slug, value] of Object.entries(SEO_TITLES)) {
    bySlug.get(slug).seoTitle = value;
    seo++;
  }
  for (const [slug, value] of Object.entries(DESCRIPTIONS)) {
    bySlug.get(slug).description = value;
    desc++;
  }

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(articles, null, 2)}\n`, 'utf8');
  console.log(`seoTitle added: ${seo}`);
  console.log(`descriptions rewritten: ${desc}`);
  console.log(`title fields corrected: ${fixed}`);

  const stillLong = articles
    .filter((a) => a.type !== 'external')
    .filter((a) => (a.seoTitle || a.title || '').length > TITLE_LIMIT);
  const stillWide = articles
    .filter((a) => a.type !== 'external')
    .filter((a) => (a.description || '').length > DESC_LIMIT);
  console.log(`remaining titles over ${TITLE_LIMIT}: ${stillLong.length}`);
  console.log(`remaining descriptions over ${DESC_LIMIT}: ${stillWide.length}`);
  stillLong.forEach((a) => console.log(`  ${a.slug}: ${(a.seoTitle || a.title).length}`));
  stillWide.forEach((a) => console.log(`  ${a.slug}: ${a.description.length}`));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
