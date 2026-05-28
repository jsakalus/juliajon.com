# Schema & Tech

## Tech Stack

```
Next.js (App Router)     ← the website framework
  └── Supabase           ← database (PostgreSQL)
  └── Tailwind CSS       ← styling
Vercel                   ← hosting (connected to this GitHub repo)
```

## Environment Variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel | Supabase service role key (never expose client-side) |
| `SHIPPING_ADDRESS` | `.env.local` + Vercel | Julia & Jon's mailing address (not in source code) |
| `RESEND_API_KEY` | `.env.local` + Vercel | Resend API key from resend.com after domain verification |
| `FROM_EMAIL` | `.env.local` + Vercel | Sending address: `Julia & Jonathan <wedding@juliajon.com>` — requires juliajon.com verified in Resend |
| `ADMIN_EMAIL_JULIA` | `.env.local` + Vercel | Julia's email for RSVP admin notifications |
| `ADMIN_EMAIL_JON` | `.env.local` + Vercel | Jon's email for RSVP admin notifications |
| `ADMIN_SESSION_SECRET` | `.env.local` + Vercel | Signs admin session JWTs. Random 32+ char string |

## Database Schema

### `parties` table

One row per household / invitation unit.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, auto-generated |
| name | text | e.g. "Iwona & Waldemar" |
| list_tier | text | 'A', 'B', or 'C' (check constraint) |
| invited_to_welcome_dinner | boolean | default false; true for A-list |
| invite_mailed | boolean | default false; mark true when physical invite is sent |
| address | text | legacy single-line address (kept for now, prefer structured columns below) |
| address_line1 | text | street / line 1 |
| address_line2 | text | unit / suite (optional) |
| address_line3 | text | additional line (optional) |
| address_city | text | city |
| address_state | text | state / province |
| address_postal | text | postal / ZIP code |
| address_country | text | country (free text) |
| created_at | timestamp | auto-set |

### `guests` table

One row per individual person. Multiple guests can belong to one party.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| party_id | uuid | FK → parties.id |
| first_name | text | required |
| last_name | text | optional; needed for name-search RSVP |
| email | text | optional |
| phone | text | optional |
| created_at | timestamp | auto-set |

### `registry_items` table

One row per item or fund shown on the registry page.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | e.g. "KitchenAid Mixer", "Honeymoon Fund" |
| type | text | `'item'` or `'fund'` (check constraint) |
| description | text | optional tagline shown on the card |
| price | numeric | for items: full price; for funds: goal amount (null = unlimited) |
| external_url | text | link to purchase site, Venmo, or e-transfer |
| image_url | text | optional product photo URL |
| display_order | int | controls sort order on the page |
| max_quantity | int | items only; null = unlimited, 1 = one buyer, N = N buyers |
| is_active | boolean | default true; false to hide without deleting |
| created_at | timestamp | auto-set |

### `registry_contributions` table

One row per guest action (item purchased or fund contribution).

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| registry_item_id | uuid | FK → registry_items.id |
| guest_id | uuid | FK → guests.id, nullable if guest not in DB |
| guest_name | text | always required; API rejects if missing |
| contribution_type | text | `'purchased'` or `'contributed'` |
| amount | numeric | null for items; dollar amount for funds |
| created_at | timestamp | auto-set |

### `rsvp_responses` table

One row per guest, created when they submit their RSVP. Unique on `guest_id` (enables upsert).

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| guest_id | uuid | FK → guests.id |
| wedding_attending | boolean | legacy boolean, still set in parallel with status |
| welcome_dinner_attending | boolean | legacy boolean, still set in parallel with status |
| wedding_attending_status | text | 'yes' / 'no' / 'maybe' |
| welcome_dinner_status | text | 'yes' / 'no' / 'maybe' |
| maybe_reason | text | free text; only collected when wedding_attending_status = 'maybe' |
| travel_mode | text | 'flying_booked' / 'flying_not_booked' / 'driving' |
| staying_late | boolean | whether guest plans to stay for the late-night party |
| dietary_notes | text | free text: allergies, vegan, GF, etc. |
| submitted_at | timestamp | when they submitted |

### `admins` table

One row per admin user authorized to access the admin dashboard.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| email | text | unique; matches the login email |
| password_hash | text | bcrypt hash; create via `node scripts/setup-admin.js <email> <password>` |
| created_at | timestamp | auto-set |

### `site_settings` table

Key-value site settings editable from the admin dashboard.

| Column | Type | Notes |
|---|---|---|
| key | text | primary key |
| value | text | string-encoded value |
| updated_at | timestamp | auto-set |

Current rows:
- `rsvp_allowed_tiers` (default `'A'`) — controls which list tiers can submit an RSVP. Set to `'A,B,C'` to open RSVPs to everyone.

## localStorage Keys

| Key | Set by | Used by | Value |
|---|---|---|---|
| `rsvp_guest_id` | RSVP page (on submit) | Registry page (contribution attribution) | guest UUID |
| `rsvp_guest_name` | RSVP page (on submit); Registry page (after name search) | Registry page (display + required for contributions) | guest's full name |
| `registry_pending_click` | Registry page (on "View →" click) | Registry page (on next load, triggers return popup) | `{ item_id, item_name, item_type, timestamp }` |

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
