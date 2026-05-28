# Wedding Website — Planning

Julia & Jonathan's wedding website. Wedding: **May 29, 2027 in Canmore, Alberta**. Domain: juliajon.com.

Built on Next.js (App Router) + Supabase + Tailwind CSS, hosted on Vercel.

## Status snapshot

| Phase | Status |
|---|---|
| 1. Database setup | ✅ Complete |
| 2. Landing page + site structure | ✅ Complete |
| 3. Page content | 🟡 Mostly complete (FAQ pending) |
| 4. Email (Resend) | ✅ Complete |
| 4. SMS (Twilio) | ⬜ Not started |
| 5. Admin dashboard | 🟡 In progress |

## Planning docs

This file is the index. Detail lives under `planning/`. Read the docs relevant to your task.

| Doc | What's in it |
|---|---|
| [Context & decisions](planning/context.md) | Project context, non-negotiable requirements, key decisions, master dates reference |
| [Schema & tech](planning/schema.md) | Database tables, env vars, tech stack, localStorage keys, SQL patterns |
| [Admin dashboard](planning/admin.md) | Admin auth, dashboard, guest/RSVP/registry management plan + current status |
| [Features](planning/features.md) | Gamification (Peanut reactions), authentication, email (Resend) |
| [Roadmap](planning/roadmap.md) | Phase status, active TODOs, nice-to-haves, open questions |

### Pages

| Page | Doc |
|---|---|
| Home | [planning/pages/home.md](planning/pages/home.md) |
| RSVP | [planning/pages/rsvp.md](planning/pages/rsvp.md) |
| Registry | [planning/pages/registry.md](planning/pages/registry.md) |
| Schedule | [planning/pages/schedule.md](planning/pages/schedule.md) |
| Travel | [planning/pages/travel.md](planning/pages/travel.md) |
| Where to Stay | [planning/pages/where-to-stay.md](planning/pages/where-to-stay.md) |
| FAQ | [planning/pages/faq.md](planning/pages/faq.md) |

## Critical reminders

- **Mobile-first**: every change must work on mobile. If a change risks mobile layout, flag it before proceeding.
- **No em dashes** anywhere in site copy. Use period, comma, or semicolon.
- **Venue name** is "A Bear and Bison Inn", not "The Bear and Bison Inn".
- **Update the relevant doc under `planning/`** after meaningful changes.
