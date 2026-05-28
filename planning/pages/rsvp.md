# RSVP Page (`/rsvp`)

**Status**: 🟡 Mostly complete

## What's built
- ✅ Name search → party lookup → per-guest form → submit
- ✅ API routes: `POST /api/rsvp/search`, `POST /api/rsvp/submit`
- ✅ "No" is final: existing "no" response shows a polite locked message, no re-edit allowed
- ✅ "Maybe" option: third button alongside Yes/No; shows a venue-size blurb asking for ample notice, plus "Anything you'd like us to know?" textarea; all other fields hide AND are cleared when maybe is selected
- ✅ Contact fields (email + cell) pre-filled from `guests` table; submit patches `guests.email` and `guests.phone` if changed
- ✅ Travel mode question: "Have you booked your flights?" → `travel_mode`
- ✅ "Party hard?" question saves to `staying_late` boolean
- ✅ Flower garden visualization of responded/maybe counts shown after submit; hover (desktop) or tap (mobile) a flower to reveal guest initials. Full names computed server-side only.
- ✅ On successful submit, saves `rsvp_guest_id` AND `rsvp_guest_name` to localStorage (used by registry page for attribution)
- ✅ Email + cell fields stack vertically on mobile (previously got cut off)

## Still to do
- [ ] Test RSVP end-to-end on live site
- [ ] Add last names for single-name guests (needed for name search to work)
- [ ] Finalize welcome dinner invite list (`invited_to_welcome_dinner` in Supabase)
- [ ] Minor UX tweaks
- [ ] Tier gate (see [admin.md](../admin.md) Phase 6)

## Data Flow

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

## RSVP Flow

1. Guest visits `/rsvp`
2. Types their first and last name
3. System searches `guests` table → finds their record → loads their party
4. Shows all party members → guest fills out attending + dietary notes for each
5. If party has `invited_to_welcome_dinner = true`, that section appears
6. Submit → saves one row per guest to `rsvp_responses`; saves `rsvp_guest_id` and `rsvp_guest_name` to localStorage
