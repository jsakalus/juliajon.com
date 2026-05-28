# Context & Decisions

## Project Context

- **Couple**: Julia & Jon (juliajon.com — domain already owned)
- **Wedding date**: May 29, 2027
- **Venue**: Riverside Park & A Bear and Bison Inn, Canmore, AB
- **Timeline**: 6+ months out, no immediate rush
- **Goal**: Build a real wedding website while learning databases for the first time
- **Design vibe**: Warm / romantic, soft colors, nature-inspired, not too formal

## Non-Negotiable Requirements

- **Mobile-first**: Every page and every new feature must work well on mobile screens. Before any change is implemented, it must be assessed for mobile impact. If a change poses a risk to mobile layout or usability, flag it explicitly before proceeding.
- **No em dashes**: Never use em dashes anywhere in site copy. Use a period, comma, or semicolon to break up sentences instead.
- **Venue name**: The reception venue is "A Bear and Bison Inn" (not "The Bear and Bison Inn"). Always use "A Bear and Bison Inn".
- **Update planning docs**: After every meaningful change to the site, update the relevant doc under `planning/` to reflect what was built, what changed, and the current status.

## Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Database | Supabase | PostgreSQL + visual table editor, great for learning |
| Auth strategy (RSVP) | Name search (first + last) | No codes to remember or print; system finds the party by name |
| RSVP privacy | RSVP page only is gated | Other pages (FAQ, Registry, etc.) are public |
| Admin auth | Custom session cookie + `admins` table | Simpler than Supabase Auth for 2-3 admins; adding admin = insert one DB row |
| Admin address parsing | Manual structured fields | User declined paid AI APIs; address entry uses labeled form fields with country-aware formatting |
| RLS | Disabled | All admin/API operations use service role key server-side; middleware handles access control |
| Frontend framework | Next.js | Handles frontend + backend in one project |
| Styling | Tailwind CSS | Utility-first, fast to iterate |
| Hosting | Vercel | Free tier, one-click deploy from GitHub |
| Meal options | Dietary notes only | Free-text field, no fixed entree choices |
| Guest list tier | A / B / C | A = Immediate Family + Family + Close Friend; B = Friend; C = everything else |
| Welcome dinner | A-list only (for now) | `invited_to_welcome_dinner = true` for all A-list parties by default |
| Family friend category | C list | Per Julia's instruction |
| Plus-one guests | Placeholder "Guest" rows | Named when confirmed; party size drives the count |
| Registry attribution | Session carry-over from RSVP | If they RSVPed in the same browser, skip name entry; otherwise prompt name search |
| Fund progress visibility | Public | Everyone can see total contributed vs. goal |
| RSVP "maybe" behavior | Hides + clears all other fields | When a guest selects "maybe" for the wedding, all follow-up questions hide and their existing responses for those fields are cleared |
| Registry guest name | Required, never null | `guest_name` must be present in `registry_contributions` (client- and server-validated) |
| Shipping address privacy | Env var + identity gate | Address stored in `SHIPPING_ADDRESS` env var; only shown on page after guest identifies themselves |
| Registry layout | Funds first, then items | Funds displayed above items; purchased items greyed out and moved to "Already taken" |
| Payment methods | Constants in page file | Venmo, PayPal, e-transfer details stored in `PAYMENT_METHODS` const at top of `app/registry/page.tsx` |

## Dates & Times — Master Reference

If any of these change, update **all** locations listed.

| Date / Time | What it is | Files to update |
|---|---|---|
| May 29, 2027 | Wedding date | `app/layout.tsx` (lines 27-28, 30-31, 57), `app/page.tsx` (line 24), `app/schedule/page.tsx` (line 24), `app/faq/page.tsx` (basics Q1), `app/rsvp/page.tsx` (line ~854), `app/components/Countdown.tsx` (line 5) |
| May 28, 2027 | Welcome dinner date | `app/schedule/page.tsx` (line 7), `app/rsvp/page.tsx` (line ~929) |
| 4:00 PM | Ceremony start time | `app/schedule/page.tsx` (line 32), `app/faq/page.tsx` (basics Q3) |
| March 1, 2027 | RSVP deadline | `app/rsvp/page.tsx` (line ~759), `app/faq/page.tsx` (basics Q4) |
