# Wedding Website — Planning Document

## Project Context

- **Couple**: Julia & Jon (juliajon.com — domain already owned)
- **Wedding date**: May 29, 2027
- **Venue**: Riverside Park & The Bear and Bison Inn, Canmore, AB
- **Timeline**: 6+ months out, no immediate rush
- **Goal**: Build a real wedding website while learning databases for the first time
- **Design vibe**: Warm / romantic — soft colors, nature-inspired, not too formal

---

## Non-Negotiable Requirements

- **Mobile-first**: Every page and every new feature must work well on mobile screens. Before any change is implemented, it must be assessed for mobile impact. If a change poses a risk to mobile layout or usability, this must be flagged explicitly before proceeding.
- **Known issue**: The top navigation is not mobile-friendly — it needs a hamburger menu or equivalent for small screens. This must be fixed before Phase 3 pages are considered complete.

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
- **DNS still propagating**: `www.juliajon.com` may take a few more hours to resolve; `juliajon-com.vercel.app` is the public Vercel URL in the meantime

### Phase 3 — Page Content ← UP NEXT

#### Mobile Nav (global — must be done first)
- [ ] Replace the current nav with a responsive version: full nav on desktop, hamburger menu on mobile

#### Home (`/`)
- [ ] Finalize hero copy (names, tagline, date, venue)
- [ ] Add "Our Story" section or short intro blurb
- [ ] Add any photos (engagement photos, venue, etc.)

#### Schedule (`/schedule`)
- [ ] Add ceremony time and location details
- [ ] Add cocktail hour, reception, and any other events
- [ ] Add welcome dinner details (visible to invited guests or all?)

#### Travel (`/travel`)
- [ ] Add nearest airports and driving directions to Canmore
- [ ] Add tips for getting around (rental car, shuttle, etc.)

#### Where to Stay (`/where-to-stay`)
- [ ] Add hotel/inn recommendations near Canmore
- [ ] Include room block info if applicable
- [ ] Add price range and booking links

#### FAQ (`/faq`)
- [ ] Write answers to common questions (dress code, kids, gifts, etc.)

#### Registry (`/registry`)
- [ ] Create `registry_items` and `registry_contributions` tables in Supabase (see schema below)
- [ ] Add all items and funds to `registry_items` via Supabase dashboard
- [ ] Build registry page UI: cards for items (with purchased status), cards for funds (with progress bar)
- [ ] Implement click tracking: save `item_id` + timestamp to localStorage when a link is clicked
- [ ] Implement return popup: on page load, check localStorage → if a recent click exists, show "Did you purchase this?" / "How much did you contribute?" modal
- [ ] Popup attribution: use stored RSVP session (guest_id in localStorage) if available; otherwise prompt name search
- [ ] Add API routes: `POST /api/registry/contribute` to save to `registry_contributions`
- [ ] Display live totals: items show "Purchased" badge once claimed; funds show progress bar (sum of contributions / goal)

#### RSVP (`/rsvp`)
- ✓ Name search → party lookup → per-guest form → submit
- ✓ API routes: `POST /api/rsvp/search`, `POST /api/rsvp/submit`
- [ ] Test RSVP end-to-end on live site
- [ ] Add last names for single-name guests (needed for name search to work)
- [ ] Finalize welcome dinner invite list (`invited_to_welcome_dinner` in Supabase)

##### RSVP Page Redesign — Planned Changes

**Database changes (run in Supabase SQL editor before deploying):**
```sql
-- Replace boolean wedding_attending with text status ('yes', 'no', 'maybe')
alter table rsvp_responses
  add column wedding_attending_status text check (wedding_attending_status in ('yes', 'no', 'maybe')),
  add column welcome_dinner_status    text check (welcome_dinner_status    in ('yes', 'no', 'maybe')),
  add column maybe_reason             text,
  add column flights_purchased        boolean,
  add column staying_late             boolean;
-- Note: keep the old wedding_attending / welcome_dinner_attending boolean columns for now
-- (set them in parallel during submit so nothing breaks if you roll back)
```

**Logic changes:**
1. **"No" is final** — on search, if an existing response has `wedding_attending_status = 'no'`, skip the form entirely and show a polite but direct message: "You've already declined — your response has been recorded. If that's changed, please get in touch with us directly." No edit allowed.
2. **"Maybe" option** — add a third button alongside Yes / No. If selected, show an optional free-text field: "Anything you'd like us to know?" Submit saves `wedding_attending_status = 'maybe'` and `maybe_reason`. Welcome dinner also gets a Maybe option.
3. **Contact fields (cell + email)** — search route fetches `email` and `phone` from the `guests` table and returns them. RSVP form shows them pre-filled if present, with an "Update" label. Submit route patches the `guests` row if values changed.
4. **Flights purchased?** — yes/no toggle per guest: "Have you booked your flights yet?" Saves to `flights_purchased` boolean.
5. **"Party hard?" question** — playful question per guest. Label: "Are you ready to party hard? 🎉 We're figuring out how late to keep the bar open (max 1am) — there's hot tub, karaoke, and we're not getting kicked out of the inn." Yes/No buttons. Saves to `staying_late` boolean.

**UI / copy changes:**
6. **Remove party name display** — don't show `{result.party.name}` to guests (it's your internal label).
7. **Remove "You're invited"** — delete the small `<p>You're invited</p>` eyebrow above the RSVP heading.
8. **"Found your invitation" — bigger and more fun** — currently tiny uppercase tracking text. Make it a large serif line with a 🎉 emoji, celebratory tone.
9. **Welcome dinner buttons** — Yes = green (sage), Maybe = yellow (gold), No = mauve. Currently Yes=gold; swap to sage for Yes and gold for Maybe.
10. **Add date to wedding attendance question** — label reads: "Attending the wedding? *(Saturday, May 29, 2027)*"
11. **Input field backgrounds** — change `bg-beige` on inputs/textareas to `bg-white` so they don't look disabled.
12. **Rounded corners everywhere** — cards: `rounded-2xl`, buttons: `rounded-full`, inputs: `rounded-lg`. Lean into whimsical / organic feel.

**API route changes:**
- `search` route: also select `email, phone` from `guests`; return on each member object
- `submit` route: accept and save `wedding_attending_status`, `welcome_dinner_status`, `maybe_reason`, `flights_purchased`, `staying_late`; also upsert `email`/`phone` back to `guests` table if changed

---

## Tech Stack

```
Next.js (App Router)     ← the website framework
  └── Supabase           ← database (PostgreSQL)
  └── Tailwind CSS       ← styling
Vercel                   ← hosting (connected to this GitHub repo)
```

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
| price | numeric | for items: full price; for funds: goal amount (optional) |
| external_url | text | link to purchase site, Venmo, or e-transfer |
| image_url | text | optional product photo |
| display_order | int | controls sort order on the page |
| is_active | boolean | default true; set false to hide without deleting |
| created_at | timestamp | auto-set |

### `registry_contributions` table
One row per guest action (item purchased or fund contribution).

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| registry_item_id | uuid | FK → registry_items.id |
| guest_id | uuid | FK → guests.id — nullable (fallback to guest_name) |
| guest_name | text | fallback if guest_id not available |
| contribution_type | text | `'purchased'` or `'contributed'` |
| amount | numeric | null for items; dollar amount for funds |
| created_at | timestamp | auto-set |

### `rsvp_responses` table
One row per guest, created when they submit their RSVP.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| guest_id | uuid | FK → guests.id |
| wedding_attending | boolean | yes/no for wedding |
| welcome_dinner_attending | boolean | null if not invited |
| dietary_notes | text | free text: allergies, vegan, GF, etc. |
| submitted_at | timestamp | when they submitted |

---

## RSVP Flow

1. Guest visits `/rsvp`
2. Types their first and last name
3. System searches `guests` table → finds their record → loads their party
4. Shows all party members — guest fills out attending + dietary notes for each
5. If party has `invited_to_welcome_dinner = true`, that section appears
6. Submit → saves one row per guest to `rsvp_responses`

---

## Registry Flow

1. Guest visits `/registry` — sees item cards and fund cards
2. Clicks a link → we save `{ item_id, timestamp }` to localStorage, then open the external URL in a new tab
3. Guest returns to the registry page
4. On load, the page checks localStorage for any click within the last 2 hours
5. If found, a popup appears:
   - **Item**: "Did you purchase [name]?" → Yes / No
   - **Fund**: "How much did you contribute to [name]?" → dollar input + confirm
6. Attribution:
   - If `guest_id` is stored in localStorage from a prior RSVP session → use it silently
   - Otherwise → prompt name search (same as RSVP) to identify the guest
7. On confirm → `POST /api/registry/contribute` → saves row to `registry_contributions`, clears localStorage entry
8. Page updates live: item shows "Purchased" badge; fund progress bar increments

---

## Authentication

- **Public pages**: Landing page, FAQ, Registry, Where to Stay, Schedule, Travel
- **Private (name search required)**: RSVP page only
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

## Nice-to-Have Features (Phase 4+)

- [ ] Email guests via Resend or SendGrid
- [ ] Text guests via Twilio (SMS)
- [ ] RSVP reminder automation
- [ ] RSVP dashboard: count of yes/no/pending
- [ ] Admin page built into the website (`/admin`)
- [ ] Email Julia every time someone RSVPs — include count of how many guests still haven't responded
- [ ] If a guest RSVPs "maybe" for the wedding, automatically send them a reminder text closer to the deadline

---

## Open Questions

- [ ] Last names needed for all single-name guests (for RSVP name search)
- [ ] Finalize welcome dinner invite list
- [ ] Any inspiration sites or mood board for design?
