# Travel Page: Rental Car Coordination ("Find a rental buddy")

**Status**: 🔵 Planned (design agreed, not built)

Lets flying guests coordinate sharing a rental car. Lives on the `/travel`
page, delivering the promise already made by the sage ✿ teaser chip and the
roadmap nice-to-have ([roadmap.md](../roadmap.md)).

## Decisions locked

- **Connection model: double opt-in email.** The board shows a guest's first
  name + travel window only, never contact info. A "Connect" button emails the
  other guest (via the existing Resend setup) and shares the requester's name +
  email so they can reply. Contact is revealed only when someone chooses to
  reach out. No manual work for Julia & Jon; no new paid APIs.
- **Sharing scope: guests choose.** Support both whole-trip car splitting and
  airport-transfer-only sharing via a `share_scope` field; guests sort out the
  details themselves.

## User flow

1. Guest opens `/travel`, identifies themselves (name search, same pattern as
   RSVP/registry; reuses `rsvp_guest_id` / `rsvp_guest_name` localStorage).
2. Guest fills a short form: arrival airport + date/time, departure airport +
   date/time, what they want (need a seat / have a car / flexible), sharing
   scope (whole trip / airport only / either), optional note.
3. The board shows other flying guests whose travel windows overlap (matched by
   airport + arrival date within ~1 day), first name + window + intent only.
4. Guest taps "Connect" on a match → the other guest gets an email with the
   requester's name, email, and note → they reply directly off-site.

## Data model

New **`travel_plans`** table (one row per opted-in guest):

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| guest_id | uuid | FK → guests.id, unique (enables upsert/edit) |
| arrival_airport | text | default 'YYC' |
| arrival_at | timestamptz | when they land |
| departure_airport | text | default 'YYC' |
| departure_at | timestamptz | when they leave |
| share_intent | text | 'needs_seat' / 'has_car' / 'flexible' |
| share_scope | text | 'whole_trip' / 'airport_only' / 'either' |
| note | text | optional free text |
| is_visible | boolean | default true; soft hide/remove without deleting |
| created_at / updated_at | timestamptz | bookkeeping |

"Matching" is just a query: rows where `arrival_airport` matches and `arrival_at`
is within ~1 day of mine, excluding self, `is_visible = true`, sorted by
closeness. No AI, no algorithm — same shape as the RSVP name-search lookup.

## Connect flow (double opt-in)

- `POST /api/travel/connect` with `{ from_guest_id, to_guest_id }` → server
  looks up both guests, emails the target with the requester's name + email +
  note + travel window. Target replies directly.
- Before sending, requester sees a consent line: "We'll share your name and
  email with {name} so they can reply."
- **Dependency:** `guests.email` is optional today. If the requester has no
  email on file, prompt for one at connect time (and save it).

## Build order

1. `travel_plans` table + migration SQL.
2. Form UI on `/travel`, gated behind identity (reuse name-search component).
3. Board listing + matching query (read API).
4. Connect email route via Resend.
5. "Edit / remove my plan" view.
6. Later: admin dashboard view of who's coordinating; filters by airport/date.

## Notes & open items

- Only useful once RSVPs are flowing; board is empty until guests submit flights.
- Gate to identified guests; guests who RSVP'd `driving` won't fill it but the
  board need not hard-block them.
- Per the no-real-data-writes rule, build/test with throwaway rows only.
- Confirm match window (±1 day default) with Julia & Jon.
