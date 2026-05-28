# Admin Dashboard

Phase 5 of the project. Built at `/admin/*` (protected by a session cookie). Lets Julia and Jon manage guests, RSVPs, the registry, and addresses from a single admin interface.

## Status

| Sub-phase | Status |
|---|---|
| 1. Foundation + auth | ✅ Complete |
| 2. Admin layout + dashboard | ✅ Complete |
| 3. Guest management | ✅ Complete |
| 4. RSVP management | ⬜ Not started |
| 5. Registry management | ⬜ Not started |
| 6. RSVP tier gate (public site) | ⬜ Not started |

## Architecture

### Authentication
- Custom session cookie (not Supabase Auth)
- `admins` table stores email + bcrypt password hash
- `POST /api/admin/login` verifies credentials and sets a signed JWT cookie (`admin_session`, 7-day expiry)
- `POST /api/admin/logout` clears the cookie
- Middleware intercepts every `/admin/*` and `/api/admin/*` request; redirects to `/admin/login` if no valid token
- Login page (`/admin/login`) and login API are excluded from the auth check
- Middleware also sets `x-pathname` header on all requests so the root layout can hide the public nav on admin pages
- Tokens signed and verified with `jose`; passwords hashed with `bcryptjs`; both edge- and node-compatible respectively

### Designating admins
- Run `node scripts/setup-admin.js <email> <password>` from project root
- Inserts (or updates) a row in the `admins` table with a bcrypt hash
- No GUI for adding admins yet — script is the supported path

### RLS
- Disabled. All admin operations run server-side using `SUPABASE_SERVICE_ROLE_KEY` (same as the public API routes), which bypasses RLS. Security is enforced by the middleware session check.

### Layout
- `app/admin/layout.tsx` wraps all admin pages. If pathname is `/admin/login` it renders children only (no chrome); otherwise it shows the admin nav header.
- Root layout (`app/layout.tsx`) hides `NavBar`, `FlowerBorders`, and the public footer when pathname starts with `/admin` (reads `x-pathname` header set by middleware).
- `app/admin/components/AdminNav.tsx` — sticky top nav with brand, links, and sign-out button.

## Files in this phase

| File | Purpose |
|---|---|
| `middleware.ts` | Auth check + `x-pathname` header |
| `lib/session.ts` | JWT sign/verify, `getAdminSession()`, cookie name constant |
| `app/admin/layout.tsx` | Admin layout wrapper (hides chrome on login) |
| `app/admin/login/page.tsx` | Email + password sign-in form |
| `app/admin/page.tsx` | Dashboard overview |
| `app/admin/components/AdminNav.tsx` | Admin nav header (client component) |
| `app/admin/guests/page.tsx` | Stub for Phase 3 |
| `app/admin/rsvps/page.tsx` | Stub for Phase 4 |
| `app/admin/registry/page.tsx` | Stub for Phase 5 |
| `app/api/admin/login/route.ts` | Login API |
| `app/api/admin/logout/route.ts` | Logout API |
| `scripts/setup-admin.js` | One-time CLI to create/update admin accounts |

## Pages

| Route | Status | Notes |
|---|---|---|
| `/admin/login` | ✅ | Email + password form, redirects to `/admin` on success |
| `/admin` | ✅ | Dashboard overview, metrics + RSVP/dinner tallies + quick links |
| `/admin/guests` | ✅ | Party + guest management, address modal, CSV export |
| `/admin/rsvps` | ⬜ | Stub. RSVP table with filters; optional manual override |
| `/admin/registry` | ⬜ | Stub. Add/edit/hide registry items; URL auto-fill on add |

## API Routes

| Route | Status | Method | Purpose |
|---|---|---|---|
| `/api/admin/login` | ✅ | POST | Verify credentials, set session cookie |
| `/api/admin/logout` | ✅ | POST | Clear session cookie |
| `/api/admin/guests` | ✅ | GET | All parties + guests |
| `/api/admin/guests/[partyId]` | ✅ | PATCH | Edit party name, address, dinner invite, mailed status, tier |
| `/api/admin/guests/export` | ✅ | GET | CSV download for invite software |
| `/api/admin/guest/[guestId]` | ✅ | PATCH | Rename a guest (also email/phone) |
| `/api/admin/rsvps` | ⬜ | GET | All RSVP data with filters |
| `/api/admin/rsvps/[guestId]` | ⬜ | PATCH | Manual override of a guest's RSVP |
| `/api/admin/registry` | ⬜ | GET/POST | List or add registry items |
| `/api/admin/registry/[id]` | ⬜ | PATCH/DELETE | Edit or delete an item |
| `/api/admin/registry/fetch-url` | ⬜ | POST | Scrape product details from URL (Open Graph / JSON-LD) |
| `/api/admin/settings` | ⬜ | PATCH | Update `site_settings` (e.g. RSVP tier gate) |

## Dashboard (`/admin`)

Server-rendered page that fetches parties, guests, and rsvp_responses in parallel and computes:

- Total parties
- Total guests with breakdown: invited (in mailed parties) vs not yet
- Invites mailed (count / total parties)
- Wedding RSVPs: yes / no / maybe / pending (with %s)
- Welcome dinner RSVPs: yes / no / maybe / pending — only counts guests in parties with `invited_to_welcome_dinner = true`

Plus quick links to the three management pages.

## Guest Management Plan (Phase 3, upcoming)

Page at `/admin/guests`. Table of parties with:
- Party name (inline edit)
- Guest names (inline edit, first + last)
- Address (modal with structured fields: Address 1/2/3, City, State, Postal, Country)
- Welcome dinner toggle per party (`invited_to_welcome_dinner`)
- Invite mailed toggle per party (`invite_mailed`)
- List tier (A/B/C) selector
- CSV export button

**Address entry**: structured fields only (no parsing). Country selector at top of modal. Postal code field auto-formats based on selected country (Canadian uppercase, Polish hyphen, etc.).

**CSV export**: matches `Contacts_Template.v2.xlsx` columns from invite software:
`Full Name, Country, Company, Address 1, Address 2 (e.g. Unit #), Address 3, City, State, Zip Code, Phone Number, Email`
- Full Name = party name
- Country = `address_country`
- Company = blank
- Address 1/2/3 = `address_line1/2/3`
- City = `address_city`
- State = `address_state`
- Zip Code = `address_postal`
- Phone Number = first guest's phone (if any)
- Email = first guest's email (if any)

## RSVP Management Plan (Phase 4, upcoming)

Page at `/admin/rsvps`. Full table with filters:
- Wedding status (yes/no/maybe/pending)
- Dinner status
- List tier
- Search by name

**Manual override** (nice-to-have): admin can click a row and edit any field (status, dietary notes, travel mode). Useful for guests who RSVP by phone/text or for correcting mistakes. Writes to `rsvp_responses`.

## Registry Management Plan (Phase 5, upcoming)

Page at `/admin/registry`. Table of items + funds with:
- Name, description, price, image URL inline edit
- Toggle visible/hidden (`is_active`)
- Delete button
- Display order

**Add new item by URL**:
1. Paste URL → "Fetch Details" button
2. Server-side fetch + parse Open Graph (`og:title`, `og:description`, `og:image`) and JSON-LD `Product` data
3. Auto-fills name, description, price, image
4. User edits any incorrect fields, then saves
5. Caveat: works for most major e-commerce sites; sites that require JS rendering may have missing price — fillable manually

## RSVP Tier Gate (Phase 6, upcoming)

Touches existing public RSVP page (not admin).

- `site_settings.rsvp_allowed_tiers` stores comma-separated list (e.g., `'A'`, `'A,B'`, `'A,B,C'`)
- `POST /api/rsvp/search` checks the party's `list_tier` against this setting after lookup
- If tier isn't allowed: returns a polite error ("RSVPs aren't open to your group yet")
- Admin dashboard has checkboxes to toggle allowed tiers (writes to `site_settings`)

## One-time setup completed

- `ADMIN_SESSION_SECRET` env var added to `.env.local` and Vercel
- SQL run in Supabase: `admins`, structured address columns on `parties`, `site_settings` table
- `node scripts/setup-admin.js <email> <password>` run for each admin
