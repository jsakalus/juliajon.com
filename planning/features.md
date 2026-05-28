# Features

Cross-cutting features that span multiple pages or aren't tied to a single route.

## Gamification — Peanut Reactions

**Philosophy**: Playful Peanut (the dog) reactions scattered throughout the site, no libraries, all Web Audio API (synthesized sounds, no files) and CSS keyframe animations.

### Home page

`app/page.tsx`, `app/components/PeanutRain.tsx`

On first visit, 35 Peanut face images rain from the top of the screen with varying sizes, speeds, and gentle diagonal drift. Plays once per browser session (guarded by `sessionStorage`).

### RSVP page

Peanut assets live in `public/peanut/`. All sounds synthesized via Web Audio API.

| Button | Trigger | Animation | Sound |
|---|---|---|---|
| Yes, I'll be there | Click | 70-particle canvas confetti burst from button center; site palette colors; fades over ~2s | None |
| Maybe | Click | `Maybe.png` boings out from center of screen (springy scale keyframe) | Deep wompey boing, triangle wave 310Hz → 68Hz with 150ms delay |
| Regretfully, no | Hover | `Regretfully no.png` appears small to the right of the button | None |
| Yes (welcome dinner) | Click | `Yes dinner.png` slides in from right, holds, slides back, pinned to bottom of screen | None |
| Obviously 🎉 (party) | Click | `Party.png` slides in from left, holds, slides back, pinned to mid-left | Beatbox: kick + snare + hi-hat pattern at 130 BPM |
| I'll slip out early | Hover | `Slip out early.png` appears to the right of the button | Continuous snore, looped noise through 160Hz low-pass + 0.6Hz LFO breathing rhythm; stops on mouse leave |
| Yep, booked! (flights) | Click | ✈️ emoji flies bottom-left → top-right diagonally | Rising bandpass whoosh, noise sweep 600Hz → 3500Hz |
| I'm driving | Hover | 🚐 emoji drives right → left across the bottom of the screen | None |

### CSS keyframes (in `app/globals.css`)
- `yes-run`, `maybe-boing`, `yes-dinner-slide`, `party-slide`, `airplane-fly`, `van-drive`, plus `please-bounce`, `flower-pop`, `flower-bloom-big`, `fade-out`

### Nav

| Trigger | Animation |
|---|---|
| Hover "FAQ" nav link (desktop) | `FAQ.png` slides in diagonally from top-right, overlaps nav bottom edge slightly |

### RSVP hero

| Element | Trigger | Animation |
|---|---|---|
| "Please" bouncing text | Hover | `Please.png` drops down onto the text (spring scale-in) |

## Authentication

| Page set | Access |
|---|---|
| Landing, FAQ, Registry, Where to Stay, Schedule, Travel | Public |
| RSVP | Public but soft-gated by name search; tier-gated via `site_settings.rsvp_allowed_tiers` (see [admin.md](admin.md)) |
| Registry shipping address & per-guest contribution totals | Soft identity gate (name lookup) |
| `/admin/*` | Email + password against `admins` table; signed session cookie |

## Email (Resend) — Phase 4 complete

### What's built
- `resend` npm package installed
- `lib/resend.ts` — lazy Resend client singleton
- `lib/emails.ts` — two email functions: `sendGuestConfirmation` and `sendAdminNotification`
- `app/api/rsvp/submit/route.ts` — sends emails after every successful RSVP upsert
- **Guest confirmation email**: sent to each guest with an email on file. Subject searchable by "Julia & Jonathan's Wedding"; contains ceremony/reception details (with Google Maps links), welcome dinner status if invited, dietary notes, travel mode, link to juliajon.com. Status bar color: sage (yes), terracotta (no), gold (maybe). "Maybe" variant has a streamlined header and closes with "Julia & Jonathan" on its own line.
- **Admin notification email**: sent to Julia and Jon on every RSVP submission. Subject is "New RSVP: First Last & First Last" or "RSVP Changed: First Last (yes -> maybe)". Header shows guest first names joined with `&`; shows all guest response fields; flags status changes in terracotta; 5-column tally (yes wedding/dinner/party, maybe, no) filtered to `invite_mailed=true` parties; responds/pending count at bottom. When no invites have been mailed yet, falls back to current submission data for the tally.
- Email errors are caught and logged but never fail the RSVP submission
- Existing "no" lock still applies: guests whose previous status is "no" are skipped and receive no email

### Setup
All 4 env vars added to `.env.local` and Vercel dashboard:
- `RESEND_API_KEY`
- `FROM_EMAIL` = `Julia & Jonathan <wedding@juliajon.com>`
- `ADMIN_EMAIL_JULIA`
- `ADMIN_EMAIL_JON`

### Email templates not yet built
- "Maybe" nudge — sent to guests whose `wedding_attending_status = 'maybe'` as the RSVP deadline approaches; prompt them to confirm yes or no
- Transportation nudge — sent to guests who have not confirmed travel (`travel_mode` is null or not set); prompt them to update their RSVP with flight/driving status

## SMS (Twilio) — not started

- RSVP reminder texts
- "Maybe" follow-up reminder closer to RSVP deadline
- AI-powered SMS reply bot (see [roadmap.md](roadmap.md))
