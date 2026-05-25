# Wedding Website — Planning Document

## Project Context

- **Couple**: Julia & Jon (juliajon.com — domain already owned)
- **Wedding date**: May 29, 2027
- **Venue**: Riverside Park & A Bear and Bison Inn, Canmore, AB
- **Timeline**: 6+ months out, no immediate rush
- **Goal**: Build a real wedding website while learning databases for the first time
- **Design vibe**: Warm / romantic — soft colors, nature-inspired, not too formal

---

## Non-Negotiable Requirements

- **Mobile-first**: Every page and every new feature must work well on mobile screens. Before any change is implemented, it must be assessed for mobile impact. If a change poses a risk to mobile layout or usability, this must be flagged explicitly before proceeding.
- **Known issue**: The top navigation is not mobile-friendly — it needs a hamburger menu or equivalent for small screens. This must be fixed before Phase 3 pages are considered complete.
- **No em dashes**: Never use em dashes (—) anywhere in site copy. Use a period, comma, or semicolon to break up sentences instead.
- **Venue name**: The reception venue is "A Bear and Bison Inn" (not "The Bear and Bison Inn"). Always use "A Bear and Bison Inn".
- **Update this doc**: After every meaningful change to the site, update PLANNING.md to reflect what was built, what changed, and the current status of each section. Keep it accurate so another agent or collaborator can pick up where work left off without needing conversation history.

---

## Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Database | Supabase | PostgreSQL + visual table editor, great for learning |
| Auth strategy | Name search (first + last) | No codes to remember or print; system finds the party by name |
| RSVP privacy | RSVP page only is gated | Other pages (FAQ, Registry, etc.) are public |
| Admin interface | Supabase dashboard | Visual table editor — edit data directly like a spreadsheet |
| Frontend framework | Next.js | Handles frontend + backend in one project |
| Styling | Tailwind CSS | Utility-first, fast to iterate |
| Hosting | Vercel | Free tier, one-click deploy from GitHub |
| Meal options | Dietary notes only | Free-text field — no fixed entree choices |
| RLS | Disabled | Security handled at the Next.js API route level instead |
| Guest list tier | A / B / C | A = Immediate Family + Family + Close Friend; B = Friend; C = everything else |
| Welcome dinner | A-list only (for now) | `invited_to_welcome_dinner = true` for all A-list parties by default |
| Family friend category | C list | Per Julia's instruction |
| Plus-one guests | Placeholder "Guest" rows | Named when confirmed; party size drives the count |
| Registry attribution | Session carry-over from RSVP | If they RSVPed in the same browser, skip name entry; otherwise prompt name search |
| Fund progress visibility | Public | Everyone can see total contributed vs. goal |
| RSVP "maybe" behavior | Hides + clears all other fields | When a guest selects "maybe" for the wedding, all follow-up questions hide and their existing responses for those fields are cleared |
| Registry guest name | Required, never null | `guest_name` must be present in `registry_contributions` — validated client-side (name search blocks submission) and server-side (API returns 400 if missing) |
| Shipping address privacy | Env var + identity gate | Address stored in `SHIPPING_ADDRESS` env var; returned from API route; only shown on page after guest identifies themselves |
| Registry layout | Funds first, then items | Funds displayed above items; purchased items greyed out and moved to an "Already taken" section at the bottom |
| Payment methods | Constants in page file | Venmo, PayPal, e-transfer details stored in `PAYMENT_METHODS` const at top of `app/registry/page.tsx` — edit there to update |

---

## Dates & Times — Master Reference

If any of these change, update **all** locations listed.

| Date / Time | What it is | Files to update |
|---|---|---|
| May 29, 2027 | Wedding date | `app/layout.tsx` (lines 27–28, 30–31, 57), `app/page.tsx` (line 24), `app/schedule/page.tsx` (line 24), `app/faq/page.tsx` (basics Q1), `app/rsvp/page.tsx` (line ~854), `app/components/Countdown.tsx` (line 5) |
| May 28, 2027 | Welcome dinner date | `app/schedule/page.tsx` (line 7), `app/rsvp/page.tsx` (line ~929) |
| 4:00 PM | Ceremony start time | `app/schedule/page.tsx` (line 32), `app/faq/page.tsx` (basics Q3) |
| March 1, 2027 | RSVP deadline | `app/rsvp/page.tsx` (line ~759), `app/faq/page.tsx` (basics Q4) |

---

## Phases

### Phase 1 — Database Setup ✓ COMPLETE
1. ✓ Created Supabase account and project
2. ✓ Learned what databases are: tables, rows, columns, foreign keys
3. ✓ Created schema: `parties`, `guests`, `rsvp_responses`
4. ✓ Added `list_tier` (A/B/C) and `invite_mailed` columns to `parties`
5. ✓ Loaded all 52 parties and 81 guests from guest list
6. ✓ Merged parties (Iwona & Waldemar, Johanne & Renault)
7. ✓ Made `last_name` optional (to be filled in later)
8. ✓ Added unique constraint on `rsvp_responses.guest_id` (enables upsert)
- **Still needed**: provide last names for guests who only have a first name
- **Still needed**: confirm welcome dinner list and update `invited_to_welcome_dinner` as needed

### Phase 2 — Landing Page + Site Structure ✓ COMPLETE
- ✓ Next.js project created (App Router, TypeScript, Tailwind CSS)
- ✓ Supabase connected via `lib/supabase.ts` — lazy getter pattern (avoids build-time env var errors on Vercel)
- ✓ Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` AND in Vercel dashboard
- ✓ Hero section: names, countdown, date, venue
- ✓ Navigation: Peanut (dog photo) as circular home icon, right-aligned links, RSVP pill button
- ✓ Footer: dark brown with names and date
- ✓ Color palette: sage, beige, brown + wildflower accents (mauve, lavender, gold, terracotta)
- ✓ Font: Playfair Display (serif headings) + Nunito (body)
- ✓ Favicon + nav icon: `public/dog.png` + `app/icon.png` (Peanut the Vizsla)
- ✓ All page skeletons created with consistent styling
- ✓ Deployed to Vercel (auto-deploys on push to main branch)
- ✓ DNS configured: Squarespace A record → Vercel IP, CNAME www → Vercel
- ✓ Vercel Deployment Protection: Standard Protection (custom domains are public)

### Phase 3 — Page Content ← IN PROGRESS

#### Mobile Nav (global — must be done first)
- ✓ Replaced the current nav with a responsive version: full nav on desktop, hamburger menu on mobile

#### Home (`/`) ← COMPLETE
- ✓ Hero copy finalized
- ✓ Peanut rain animation plays on first visit per browser session
- [ ] Add photos and fun elements (optional, can add later)

#### Gamification ← COMPLETE

**Philosophy**: Playful Peanut (the dog) reactions scattered throughout the site — no libraries, all Web Audio API (synthesized sounds, no files) and CSS keyframe animations.

**Home page (`app/page.tsx`, `app/components/PeanutRain.tsx`)**
- ✓ On first visit, 35 Peanut face images rain from the top of the screen — varying sizes, speeds, and gentle diagonal drift. Plays once per browser session (guarded by `sessionStorage`).

**RSVP page (`app/rsvp/page.tsx`, `app/globals.css`)**

Peanut assets live in `public/peanut/`. All sounds synthesized via Web Audio API — no audio files.

| Button | Trigger | Animation | Sound |
|---|---|---|---|
| Yes, I'll be there | Click | 70-particle canvas confetti burst erupts from button center; site palette colors (sage, gold, mauve, lavender, terracotta); fades over ~2s | None |
| Maybe | Click | `Maybe.png` boings out from center of screen (springy scale keyframe) | Deep wompey boing — triangle wave 310Hz → 68Hz with 150ms delay |
| Regretfully, no | Hover | `Regretfully no.png` appears small to the right of the button | None |
| Yes (welcome dinner) | Click | `Yes dinner.png` slides in from right, holds, slides back — pinned to bottom of screen | None |
| Obviously 🎉 (party) | Click | `Party.png` slides in from left, holds, slides back — pinned to mid-left | Beatbox: kick + snare + hi-hat pattern at 130 BPM |
| I'll slip out early | Hover | `Slip out early.png` appears to the right of the button | Continuous snore — looped noise through 160Hz low-pass + 0.6Hz LFO breathing rhythm; stops on mouse leave |
| Yep, booked! (flights) | Click | ✈️ emoji flies bottom-left → top-right diagonally | Rising bandpass whoosh — noise sweep 600Hz → 3500Hz |
| I'm driving | Hover | 🚐 emoji drives right → left across the bottom of the screen | None |

**CSS keyframes added to `app/globals.css`:**
- `yes-run` — diagonal translate + scale grow
- `maybe-boing` — springy scale-in, hold, fade out
- `yes-dinner-slide` — translateX in/hold/out from right
- `party-slide` — translateX in/hold/out from left
- `airplane-fly` — diagonal translate bottom-left to top-right
- `van-drive` — translateX right to left

**Nav (`app/components/NavBar.tsx`)**
| Trigger | Animation |
|---|---|
| Hover "FAQ" nav link (desktop) | `FAQ.png` slides in diagonally from top-right, overlaps nav bottom edge slightly |

**RSVP hero (`app/rsvp/page.tsx`)**
| Element | Trigger | Animation |
|---|---|---|
| "Please" bouncing text | Hover | `Please.png` drops down onto the text (spring scale-in) |

**Still to do / ideas:**
- [ ] More Peanut reactions on other pages (Registry, etc.)

#### Schedule (`/schedule`) ← MOSTLY COMPLETE
- ✓ Page redesigned (second pass): removed vertical spine timeline; now uses white rounded cards (`bg-white rounded-2xl shadow-sm`) matching FAQ/Travel aesthetic
- ✓ Day headers: handwritten colored labels ("friday" in lavender, "saturday" in mauve) + uppercase date, matching Travel section headers
- ✓ Each event in its own card with watercolor illustration as the visual focal point (360×270, fills card width on mobile), serif title, handwritten time in accent color, location link. No colored strips — artwork leads.
- ✓ Wildflower ✿ divider separates Friday and Saturday sections
- ✓ Friday May 28: Welcome Dinner (visible to everyone, "Kick off the weekend with us")
- ✓ Saturday May 29: Ceremony (4:00 PM), Reception (5:00 PM)
- ✓ Location names link to Google Maps
- ✓ Images in /public/illustrations/, cleaner paths
- [ ] Add cocktail hour if applicable
- [ ] Fill in Welcome Dinner time once confirmed

#### Travel (`/travel`) ← MOSTLY COMPLETE
- ✓ Page redesigned to match FAQ/Where-to-Stay aesthetic: hero (handwritten + bold serif + italic), white rounded cards, handwritten section labels with wildflower accent colors
- ✓ Two sections: "flying in" (primary) and "driving in" (secondary)
- ✓ Car rental grouped under flying section, framed as a requirement (not optional)
- ✓ Sage ✿ chip teasing arrival-time coordination feature for car sharing (Phase 4+ feature)
- ✓ Shuttle option removed
- [ ] Implement arrival time coordination feature (see Phase 4+ nice-to-haves)

#### Where to Stay (`/where-to-stay`) ← MOSTLY COMPLETE
- ✓ Page redesigned to match FAQ aesthetic: hero (handwritten + bold serif + italic), white rounded cards, handwritten section labels with wildflower accent colors
- ✓ Venue note: A Bear and Bison Inn has 10 rooms, all reserved for the wedding party; benchlands context + distance guidance
- ✓ Three hotel tiers (budget-friendly / our picks / the splurge):
  - Budget: The Canmore Hotel (~5 min drive / ~10 min walk to ceremony, ~7 min drive to reception)
  - Mid: Mountain View Inn (~8 min / ~12 min) + Georgetown Inn (~5 min walk / ~7 min), with room block teaser chip
  - High: The Malcolm Hotel (~5 min walk / ~7 min)
- ✓ Room block note (✿ sage chip): "working on securing a block at one or both mid options; will update when confirmed"
- ✓ Vacation rentals section (Airbnb/VRBO callout for groups)
- [ ] Update room block note when block is confirmed at Mountain View Inn and/or Georgetown Inn

#### FAQ (`/faq`)
- [ ] Write answers to common questions (dress code, kids, gifts, etc.)

#### Registry (`/registry`) ← MOSTLY COMPLETE

**What's built:**
- ✓ `registry_items` and `registry_contributions` tables created in Supabase
- ✓ Page layout: funds section first, then items. Completed items/funds float to the bottom of their section automatically.
- ✓ Fund cards: name, description, "Contribute →" button (gold), progress bar (if goal set), total contributed, per-guest contribution ("You've contributed $X ♡") for identified guests. Unlimited funds (no goal) show total contributed as text only — no bar. When goal is reached, button changes to "Goal reached ✓" and contributions are disabled.
- ✓ Item cards: name, description, price, "View →" button (opens external URL), "Mark as purchased" underline link. Images displayed at top of card if `image_url` is set.
- ✓ Item quantity limits via `max_quantity` column (see DB schema below). `null` = unlimited (never greys out, always purchasable). `1` = one buyer only. `N` = N buyers; shows "X of N purchased" progress. Sold-out items dim to 60% opacity, image goes greyscale, "Mark as purchased" button hidden. Purchaser names are never shown publicly.
- ✓ Multiple purchases supported: `registry_contributions` has no unique constraint — any number of rows per item are allowed.
- ✓ "Contribute →" opens in-page modal. Step 1: payment info (Venmo/PayPal/e-transfer). Step 2: "Let us know how much you contributed" with name search (if not identified) + amount input.
- ✓ "Mark as purchased" opens in-page modal showing who the purchase will be attributed to + confirm/cancel
- ✓ Click tracking: "View →" link saves `{ item_id, item_name, item_type, timestamp }` to `registry_pending_click` localStorage key, opens URL in new tab
- ✓ Return popup: on page load, checks localStorage for click within 2 hours → "Did you purchase [name]?" or "How much did you contribute?" modal
- ✓ Guest name is **required** for all contributions — identity step always runs if `guestDisplayName` is null; API validates and rejects if missing
- ✓ API route `GET /api/registry/items?guestId=xxx` — returns items enriched with `total_contributed`, `purchased`, `purchasers` (array of names, used server-side only), and `my_contribution` (per-guest, if guestId provided)
- ✓ API route `POST /api/registry/contribute` — saves to `registry_contributions`; rejects if `guest_name` is missing
- ✓ API route `GET /api/registry/shipping-address` — returns `SHIPPING_ADDRESS` env var
- ✓ Shipping address section at bottom: shows "View address →" button until guest is identified, then reveals address
- ✓ Page re-fetches items after any contribution to update UI live
- ✓ RSVP cell phone field: auto-formats as `(XXX) XXX-XXXX` with `+1` prefix badge; US/Canada only; shows inline error for incomplete numbers

**Still needed:**
- ✓ `registry_items` table populated
- ✓ `SHIPPING_ADDRESS` env var set in `.env.local` and Vercel dashboard
- ✓ Skydiving Fund goal set to $3,000
- ✓ Registry tile cards now have visible border (`border-beige-dark`) and `shadow-sm` — contrast was invisible against beige background before
- ✓ Fund card name font bumped to `text-base`, description font bumped to `text-sm` (was `text-xs`, too small on mobile)
- ✓ Item descriptions restored — item cards now show description with scroll animation (same `max-h-[4.5rem] overflow-hidden` + `desc-scroll-inner` pattern as funds; requires `fund-card` class on item cards for hover trigger)
- ✓ Description scroll animation fixed — only animates when text actually overflows container (JS overflow detection; short descriptions stay still). Applies to both fund and item descriptions.
- ✓ Fund progress bar: removed confusing "/" prefix from goal total (was "/$3,000", now "$3,000")
- ✓ Item cards: clicking any item card opens a larger modal (`max-w-md`) with full image (object-contain, not cropped), name, description, price, availability, "View on site →" and "Mark as purchased" buttons.
- ✓ Fund contribute modal: photo shown on left (desktop) / top (mobile) in a `max-w-lg` side-by-side layout; form content on right.
- ✓ All modals: clicking the backdrop closes the modal (backdrop `onClick={closeModal}`, inner div stops propagation).
- ✓ Item availability text: shows `qty/max purchased` counter (e.g. "4/5 purchased") on both grid tiles and view-item modal.
- ✓ Item tiles: "View →" button restored on tiles for items with an external URL; click goes directly to site without opening the modal (stopPropagation). Tapping elsewhere on the card still opens the detail modal.
- ✓ External URLs added for all registry items and funds
- [ ] Content review with Julia & Jon to finalize items, descriptions
- [ ] Minor UX tweaks

**SQL to populate registry_items** (run in Supabase SQL editor):
```sql
insert into registry_items (name, type, price, external_url, display_order) values
  ('East Fork Dinner Set',            'item', null,  null,                                                                   1),
  ('Honeymoon Fund',                  'fund', null,  null,                                                                   2),
  ('Boleslawiec Dinnerware',          'item', null,  null,                                                                   3),
  ('Handmade Blown Glass Glasses',    'item', null,  null,                                                                   4),
  ('House Fund',                      'fund', null,  null,                                                                   5),
  ('Skydiving Fund',                  'fund', null,  null,                                                                   6),
  ('Pottery Classes Fund',            'fund', 1000,  null,                                                                   7),
  ('Peanut''s Dog Feeder',            'item', null,  'https://www.houndsy.com/products/houndsy-kibble-dispenser',           8),
  ('Bed Frame',                       'item', null,  'https://www.nectarsleep.com/bed-frames/japanese-joinery-bamboo-bed',  9),
  ('Bike Fund',                       'fund', 3000,  null,                                                                   10),
  ('Sunrise Alarm Clock',             'item', null,  'https://risecentered.com/products/the-original-sunrise-alarm-clock',  11),
  ('Nebulizing Diffuser',             'item', null,  'https://moodandmoss.com/products/nebulizing-wood-glass-diffuser',     12);
```

**SQL to add descriptions** (run after inserting items):
```sql
update registry_items set description = 'We''re planning a 3-month trip through Asia — Singapore to Mongolia to the Stans, with a lot in between. If you want to support our gastro adventures, flights, a spa day, horseback riding, scuba diving, and probably a few doctor visits for upset stomachs — we would love it.' where name = 'Honeymoon Fund';
update registry_items set description = 'We don''t know where we want to settle down yet, but we''ve been saving for a house. The longer we save, the better house we''ll get to buy.' where name = 'House Fund';
update registry_items set description = 'We decided we''re gonna send it. Julia is terrified. Jonathan is stoked.' where name = 'Skydiving Fund';
update registry_items set description = 'We''ve been trying to get off our phones and into activities that quiet the mind. Jonathan fell in love with pottery after a lesson from Julia''s aunt in Poland. You''ll also notice some handmade ceramics in our items list — we love handmade things and natural materials.' where name = 'Pottery Classes Fund';
update registry_items set description = 'Jonathan resolved to learn how to ride a bike properly, and Julia decided she could use an upgrade from the one she bought in 2016. If Julia''s knees cooperate, we''re training for triathlons.' where name = 'Bike Fund';
update registry_items set description = 'Julia loves everything from East Fork. She already owns three of The Mug and could always use more. Big bowls especially.' where name = 'East Fork Dinner Set';
update registry_items set description = 'The peacock ones.' where name = 'Boleslawiec Dinnerware';
```

**Items still needing external URLs** (add in Supabase table editor):
- East Fork Dinner Set
- Boleslawiec Dinnerware
- Handmade Blown Glass Glasses
- Honeymoon Fund (Venmo / e-transfer link)
- House Fund (Venmo / e-transfer link)
- Skydiving Fund (Venmo / e-transfer link + confirm goal amount)
- Bike Fund (Venmo / e-transfer link)

#### RSVP (`/rsvp`) ← MOSTLY COMPLETE
- ✓ Name search → party lookup → per-guest form → submit
- ✓ API routes: `POST /api/rsvp/search`, `POST /api/rsvp/submit`
- ✓ "No" is final — existing "no" response shows a polite locked message, no re-edit allowed
- ✓ "Maybe" option — third button alongside Yes/No; shows a venue-size blurb asking for ample notice, plus "Anything you'd like us to know?" textarea; all other fields hide AND are cleared when maybe is selected
- ✓ Contact fields (email + cell) — pre-filled from `guests` table; submit patches `guests.email` and `guests.phone` if changed
- ✓ Travel mode question — "Have you booked your flights?" → `travel_mode`: `'flying_booked'` / `'flying_not_booked'` / `'driving'`
- ✓ "Party hard?" question — saves to `staying_late` boolean
- ✓ Flower garden visualization of responded/maybe counts shown after submit; hover (desktop) or tap (mobile) a flower to reveal guest initials (e.g. K.S.) — full names are computed server-side only and never sent to the client
- ✓ On successful submit, saves `rsvp_guest_id` AND `rsvp_guest_name` to localStorage (used by registry page for attribution)
- ✓ Email + cell fields stack vertically on mobile (fixed: was side-by-side and getting cut off)
- [ ] Test RSVP end-to-end on live site
- [ ] Add last names for single-name guests (needed for name search to work)
- [ ] Finalize welcome dinner invite list (`invited_to_welcome_dinner` in Supabase)
- [ ] Minor UX tweaks

##### RSVP Data Flow
All form fields live in React state (`responses: Record<guestId, RsvpEntry>`) until Submit is clicked. On submit, POSTed to `/api/rsvp/submit` → upserted to `rsvp_responses` (one row per guest). If tab is closed before submit, nothing is saved.

| Form field | Table | Column |
|---|---|---|
| Attending the wedding? | `rsvp_responses` | `wedding_attending_status` ('yes'/'no'/'maybe') |
| Attending welcome dinner? | `rsvp_responses` | `welcome_dinner_status` ('yes'/'no'/'maybe') |
| Flights booked? | `rsvp_responses` | `travel_mode` ('flying_booked'/'flying_not_booked'/'driving') |
| Ready to party? | `rsvp_responses` | `staying_late` (boolean) |
| Dietary notes | `rsvp_responses` | `dietary_notes` (text) |
| Anything you'd like us to know? | `rsvp_responses` | `maybe_reason` (text) |
| Email | `guests` | `email` |
| Cell | `guests` | `phone` |

---

## Tech Stack

```
Next.js (App Router)     ← the website framework
  └── Supabase           ← database (PostgreSQL)
  └── Tailwind CSS       ← styling
Vercel                   ← hosting (connected to this GitHub repo)
```

---

## Environment Variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel | Supabase service role key (never expose client-side) |
| `SHIPPING_ADDRESS` | `.env.local` + Vercel | Julia & Jon's mailing address — not in source code |
| `RESEND_API_KEY` | `.env.local` + Vercel | Resend API key — get from resend.com after domain verification |
| `FROM_EMAIL` | `.env.local` + Vercel | Sending address: `Julia & Jon <wedding@juliajon.com>` — requires juliajon.com verified in Resend |
| `ADMIN_EMAIL_JULIA` | `.env.local` + Vercel | Julia's email for RSVP admin notifications |
| `ADMIN_EMAIL_JON` | `.env.local` + Vercel | Jon's email for RSVP admin notifications |

---

## Database Schema

### `parties` table
One row per household / invitation unit.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, auto-generated |
| name | text | e.g. "Iwona & Waldemar" |
| list_tier | text | 'A', 'B', or 'C' — enforced by check constraint |
| invited_to_welcome_dinner | boolean | default false; true for A-list |
| invite_mailed | boolean | default false; mark true when physical invite is sent |
| address | text | optional — household mailing address |
| created_at | timestamp | auto-set |

### `guests` table
One row per individual person. Multiple guests can belong to one party.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| party_id | uuid | FK → parties.id |
| first_name | text | required |
| last_name | text | optional — to be filled in; needed for name-search RSVP |
| email | text | optional |
| phone | text | optional |
| created_at | timestamp | auto-set |

### `registry_items` table
One row per item or fund shown on the registry page.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | e.g. "KitchenAid Mixer", "Honeymoon Fund" |
| type | text | `'item'` or `'fund'` — enforced by check constraint |
| description | text | optional tagline shown on the card |
| price | numeric | for items: full price; for funds: goal amount (null = unlimited) |
| external_url | text | link to purchase site, Venmo, or e-transfer |
| image_url | text | optional product photo URL |
| display_order | int | controls sort order on the page |
| max_quantity | int | **items only** — null = unlimited (never sold out); 1 = one buyer; N = N buyers. Run `ALTER TABLE registry_items ADD COLUMN max_quantity integer;` to add. |
| is_active | boolean | default true; set false to hide without deleting |
| created_at | timestamp | auto-set |

### `registry_contributions` table
One row per guest action (item purchased or fund contribution).

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| registry_item_id | uuid | FK → registry_items.id |
| guest_id | uuid | FK → guests.id — nullable if guest not in DB |
| guest_name | text | **always required** — API rejects if missing; used as primary display name |
| contribution_type | text | `'purchased'` or `'contributed'` |
| amount | numeric | null for items; dollar amount for funds |
| created_at | timestamp | auto-set |

### `rsvp_responses` table
One row per guest, created when they submit their RSVP.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| guest_id | uuid | FK → guests.id |
| wedding_attending | boolean | legacy boolean — still set in parallel with status field |
| welcome_dinner_attending | boolean | legacy boolean — still set in parallel with status field |
| wedding_attending_status | text | 'yes' / 'no' / 'maybe' |
| welcome_dinner_status | text | 'yes' / 'no' / 'maybe' |
| maybe_reason | text | free text; only collected when wedding_attending_status = 'maybe' |
| travel_mode | text | 'flying_booked' / 'flying_not_booked' / 'driving' |
| staying_late | boolean | whether guest plans to stay for the late-night party |
| dietary_notes | text | free text: allergies, vegan, GF, etc. |
| submitted_at | timestamp | when they submitted |

---

## localStorage Keys

| Key | Set by | Used by | Value |
|---|---|---|---|
| `rsvp_guest_id` | RSVP page (on submit) | Registry page (contribution attribution) | guest UUID |
| `rsvp_guest_name` | RSVP page (on submit); Registry page (after name search) | Registry page (display + required for contributions) | guest's full name |
| `registry_pending_click` | Registry page (on "View →" click) | Registry page (on next load, triggers return popup) | `{ item_id, item_name, item_type, timestamp }` |

---

## RSVP Flow

1. Guest visits `/rsvp`
2. Types their first and last name
3. System searches `guests` table → finds their record → loads their party
4. Shows all party members — guest fills out attending + dietary notes for each
5. If party has `invited_to_welcome_dinner = true`, that section appears
6. Submit → saves one row per guest to `rsvp_responses`; saves `rsvp_guest_id` and `rsvp_guest_name` to localStorage

---

## Registry Flow

**Explicit contribution/purchase:**
1. Guest clicks "Contribute →" on a fund card → modal opens showing payment info (Venmo/PayPal/e-transfer)
2. If not identified: name search runs first; once identified, amount input appears
3. Guest enters amount → confirm → `POST /api/registry/contribute` → UI updates

**Explicit mark as purchased:**
1. Guest clicks "Mark as purchased" underline link on an item card → modal opens
2. If not identified: name search runs first
3. Modal shows "Marking as purchased by [Name]" → confirm → `POST /api/registry/contribute` → item moves to "Already taken"

**Return-visit popup (after clicking "View →"):**
1. "View →" click saves `{ item_id, item_name, item_type, timestamp }` to localStorage, opens URL in new tab
2. Guest returns to registry page within 2 hours → popup appears automatically
3. Item popup: "Did you purchase [name]?" → Yes / Just browsing
4. Fund popup: "How much did you contribute?" → dollar input + confirm
5. On confirm → `POST /api/registry/contribute` → UI updates

**Attribution (all flows):**
- If `rsvp_guest_name` is in localStorage → identity already known, skip name search
- Otherwise → name search modal (same first/last name lookup as RSVP)
- `guest_name` is required for all contributions — blocked client-side and validated server-side

**Shipping address:**
- "Shipping a gift?" section at bottom of page
- Not identified: shows "View address →" button → triggers name search modal → reveals address after identification
- Already identified: address shown immediately on page load

---

## Authentication

- **Public pages**: Landing page, FAQ, Registry, Where to Stay, Schedule, Travel
- **Private (name search required)**: RSVP page only
- **Soft identity gate**: Registry shipping address and per-guest contribution totals only shown after name identification
- **Admin access**: Julia logs into supabase.com directly to manage guest data

---

## Key SQL Patterns Learned

```sql
-- Merge two parties (move guests, delete empty party, rename)
update guests
  set party_id = (select party_id from guests where first_name = 'Person A')
  where first_name = 'Person B';
delete from parties where id not in (select distinct party_id from guests);
update parties set name = 'Person A & Person B'
  where id = (select party_id from guests where first_name = 'Person A');

-- Update a single cell
update parties set name = 'New Name' where name = 'Old Name';

-- Add a column
alter table parties add column list_tier text check (list_tier in ('A', 'B', 'C'));

-- Make a column optional
alter table guests alter column last_name drop not null;
```

---

## Phase 4 — Email / SMS ← IN PROGRESS

### Email (Resend) ← COMPLETE
- ✓ `resend` npm package installed
- ✓ `lib/resend.ts` — lazy Resend client singleton
- ✓ `lib/emails.ts` — two email functions: `sendGuestConfirmation` and `sendAdminNotification`
- ✓ `app/api/rsvp/submit/route.ts` — sends emails after every successful RSVP upsert
- ✓ Guest confirmation email — sent to each guest with an email on file; subject searchable by "Julia & Jonathan's Wedding"; contains ceremony/reception details (with Google Maps links), welcome dinner status if invited, dietary notes, travel mode, link to juliajon.com. Status bar color: sage (yes), terracotta (no), gold (maybe). "Maybe" variant has a streamlined header and closes with "Julia & Jonathan" on its own line.
- ✓ Admin notification email — sent to Julia and Jon on every RSVP submission; subject is "New RSVP: First Last & First Last" or "RSVP Changed: First Last (yes -> maybe)"; header shows guest first names joined with &; shows all guest response fields; flags status changes in terracotta; 5-column tally (yes wedding/dinner/party, maybe, no) filtered to `invite_mailed=true` parties; responds/pending count at bottom. When no invites have been mailed yet, falls back to current submission data for the tally.
- ✓ Email errors are caught and logged but never fail the RSVP submission.
- ✓ Existing "no" lock still applies: guests whose previous status is "no" are skipped and receive no email.

**Setup complete** — all 4 env vars added to `.env.local` and Vercel dashboard:
- `RESEND_API_KEY`
- `FROM_EMAIL` = `Julia & Jonathan <wedding@juliajon.com>`
- `ADMIN_EMAIL_JULIA` = `jmsakalus@gmail.com`
- `ADMIN_EMAIL_JON` = `sagejonathan.tesol@gmail.com`

### SMS (Twilio) ← NOT STARTED
- [ ] RSVP reminder texts
- [ ] "Maybe" follow-up reminder closer to RSVP deadline

---

## Nice-to-Have Features (Phase 4+)

- [ ] Travel page rental car coordination — allow guests to enter their arrival date/time so they can find others to split a rental car with
- [ ] RSVP reminder automation (email + SMS) — send reminders to guests who have not responded as the March 1, 2027 deadline approaches
- [ ] RSVP dashboard: count of yes/no/pending
- [ ] Admin page built into the website (`/admin`)
- [ ] If a guest RSVPs "maybe" for the wedding, automatically send them a reminder text closer to the deadline
- [ ] AI-powered SMS reply bot — guest texts a question to the Twilio number; a Claude API call answers it using website content (FAQ, schedule, travel, where to stay) as the knowledge base; response is sent back via SMS
  - If Claude cannot find a confident answer in the website content, it must NOT invent anything. Instead it should reply to the guest that we will follow up with them directly.
  - When Claude cannot answer, send Julia and Jon an email notification with: the guest's name (from the Twilio "from" number matched against the guests table), the question they asked, and a prompt to update the FAQ so it can be answered automatically in the future.

---

## Open Questions

- [ ] Last names needed for all single-name guests (for RSVP name search)
- [ ] Finalize welcome dinner invite list
- [ ] Any inspiration sites or mood board for design?
- [ ] Goal amount for Skydiving Fund (currently null)
