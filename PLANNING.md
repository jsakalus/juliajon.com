# Wedding Website — Planning Document

## Project Context

- **Couple**: Julia & Jon (juliajon.com — domain already owned)
- **Wedding date**: May 29, 2027
- **Venue**: Riverside Park & The Bear and Bison Inn, Canmore, AB
- **Timeline**: 6+ months out, no immediate rush
- **Goal**: Build a real wedding website while learning databases for the first time
- **Design vibe**: Warm / romantic — soft colors, nature-inspired, not too formal

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
- ✓ Supabase connected via `lib/supabase.ts` using service role key
- ✓ Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- ✓ Hero section: names, countdown, date, venue
- ✓ Navigation: sage green bar, right-aligned links, RSVP pill button
- ✓ Footer: dark brown with names and date
- ✓ Color palette: sage, beige, brown + wildflower accents (mauve, lavender, gold, terracotta)
- ✓ Font: Playfair Display (serif, italic for headings)
- ✓ Favicon: add `app/icon.png` (dog photo — Peanut)
- ✓ All page skeletons created with consistent styling
- **Still needed**: deploy to Vercel, connect domain via Squarespace DNS

### Phase 3 — RSVP + Page Content ← UP NEXT
- ✓ RSVP: name search → party lookup → per-guest form (wedding + welcome dinner + dietary notes) → submit
- ✓ RSVP API routes: `POST /api/rsvp/search`, `POST /api/rsvp/submit` (upsert on guest_id)
- Fill in real content: FAQ answers, schedule times, hotel recommendations, registry links
- Deploy to Vercel + connect domain via Squarespace DNS settings
- *Nice to have*: Photo gallery, Our Story

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

---

## Open Questions

- [ ] Last names needed for all single-name guests (for RSVP name search)
- [ ] Finalize welcome dinner invite list
- [ ] Any inspiration sites or mood board for design?
