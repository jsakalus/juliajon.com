-- Rental-car coordination ("find a rental buddy") feature.
-- Run this once in the Supabase SQL editor (Database → SQL Editor → New query → paste → Run).
-- One row per guest who opts in to share their travel plans.

create table if not exists travel_plans (
  id uuid primary key default gen_random_uuid(),

  -- which guest this plan belongs to. unique so each guest has at most one plan
  -- (lets us upsert/edit). cascades so the row disappears if the guest is removed.
  guest_id uuid not null unique references guests(id) on delete cascade,

  -- arrival
  arrival_airport text not null default 'YYC',
  arrival_date date not null,
  arrival_time text,            -- free text like "2:40 PM", optional

  -- departure (optional; some guests won't know their return yet)
  departure_airport text not null default 'YYC',
  departure_date date,
  departure_time text,

  -- what they want and what they're sharing
  share_intent text not null check (share_intent in ('needs_seat', 'has_car', 'flexible')),
  share_scope  text not null check (share_scope  in ('whole_trip', 'airport_only', 'either')),

  note text,                    -- optional free text

  -- soft hide: set false to remove a plan from the board without deleting history
  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- speeds up the board's "who arrives near me" sorting/filtering
create index if not exists travel_plans_arrival_date_idx on travel_plans (arrival_date);
