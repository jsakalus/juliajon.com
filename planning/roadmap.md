# Roadmap

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| 1. Database setup | ✅ Complete | Schema + initial guest load done |
| 2. Landing page + site structure | ✅ Complete | Hero, nav, footer, DNS, Vercel |
| 3. Page content | 🟡 Mostly complete | FAQ content still needed; see `planning/pages/` |
| 4. Email (Resend) | ✅ Complete | Guest confirmation + admin notification working |
| 4. SMS (Twilio) | ⬜ Not started | RSVP reminders, AI reply bot |
| 5. Admin dashboard | 🟡 In progress | Foundation + dashboard done; guests/RSVPs/registry mgmt pending. See `planning/admin.md` |

## Active TODOs

- [ ] **404 page** at `app/not-found.tsx` — should include the nav, and a photo of Peanut in the middle (the same one used for Maybe = `Maybe.png`)
- [x] **Save the Date / address collection page** at `/save-the-date` — `app/save-the-date/page.tsx`. Name search → pre-filled address form → confirmation. Own search API at `POST /api/save-the-date/search` (same normalization as RSVP); save via `PATCH /api/save-the-date/[partyId]`. Country selector (5 countries + Other), postal auto-format on blur, polite confirmation screen. Public, no admin auth. UUID validation on the save route.
- [ ] Provide last names for guests who only have a first name (needed for RSVP name search)
- [ ] Confirm welcome dinner list and update `invited_to_welcome_dinner` as needed
- [ ] Write FAQ answers (dress code, kids, gifts, etc.)
- [ ] Test RSVP end-to-end on live site
- [ ] Content review with Julia & Jon to finalize registry items + descriptions
- [ ] Update room block note on Where to Stay when block is confirmed at Mountain View Inn / Georgetown Inn
- [ ] Add cocktail hour to schedule page if applicable
- [ ] Fill in Welcome Dinner time once confirmed

## Nice-to-Have Features

- [ ] **Digital seating chart creator**: each guest is a small circle. Guests in the same party are connected by a line. If a guest RSVPed yes, their circle is draggable around tables on the canvas so we can arrange seating. If they RSVPed maybe, their circle is orange, off to the side, and not draggable. RSVP no = hidden (or also pinned off-canvas).
- [ ] **Text history with Jonathan, fun analysis**: import full text message history with Jon and run an agent over it to surface silly stats: how many times we said "I love you", how many "goodnights", most common emojis, total texts sent, distribution of texts by time of day, phone call count, etc. Could live as a private page or a one-time generated report.
- [ ] Travel page rental car coordination: let guests enter their arrival date/time so they can find others to split a rental car with
- [ ] Let guests plant their flower wherever they want on the screen (free placement) or in a dedicated garden patch on the page
- [ ] RSVP reminder automation (email + SMS) as the March 1, 2027 deadline approaches
- [ ] If a guest RSVPs "maybe" for the wedding, automatically send them a reminder text closer to the deadline
- [ ] AI-powered SMS reply bot: guest texts a question to the Twilio number; a Claude API call answers it using website content (FAQ, schedule, travel, where to stay) as the knowledge base; response sent back via SMS
  - If Claude cannot find a confident answer in the website content, it must NOT invent anything. Reply that we will follow up directly.
  - When Claude cannot answer, send Julia and Jon an email with the guest's name (matched from Twilio "from" number), the question, and a prompt to update the FAQ.

## Open Questions

- [ ] Last names needed for all single-name guests (for RSVP name search)
- [ ] Finalize welcome dinner invite list
- [ ] Any inspiration sites or mood board for design?
- [ ] Goal amount for Skydiving Fund (currently null)
