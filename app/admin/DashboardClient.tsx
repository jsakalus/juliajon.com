'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTierFilter } from '@/lib/adminTier';
import TierBar from './components/TierBar';

export type DashboardParty = {
  id: string;
  list_tier: string | null;
  invite_mailed: boolean;
  invited_to_welcome_dinner: boolean;
};

export type DashboardGuest = {
  id: string;
  party_id: string;
};

export type DashboardRsvp = {
  guest_id: string;
  wedding_attending_status: string | null;
  welcome_dinner_status: string | null;
  staying_late: boolean | null;
};

type StatusTally = { yes: number; no: number; maybe: number; pending: number };

function MetricCard({ label, value, subtitle }: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl shadow-sm px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-brown-light">{label}</p>
      <p className="font-serif text-3xl text-brown mt-1">{value}</p>
      {subtitle && <p className="text-xs text-brown-light mt-1">{subtitle}</p>}
    </div>
  );
}

function StatusRow({ label, count, dotColor }: {
  label: string;
  count: number;
  dotColor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <span className="text-sm text-brown truncate">{label}</span>
      </div>
      <span className="font-serif text-lg text-brown tabular-nums shrink-0">{count}</span>
    </div>
  );
}

function StatusCard({ title, subtitle, stats, total, subRow }: {
  title: string;
  subtitle?: string;
  stats: StatusTally;
  total: number;
  subRow?: { label: string; count: number; ofCount: number };
}) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl shadow-sm p-5">
      <div className="mb-3">
        <h3 className="font-serif text-lg text-brown">{title}</h3>
        {subtitle && <p className="text-xs text-brown-light mt-0.5">{subtitle}</p>}
      </div>
      <div className="divide-y divide-beige">
        <div>
          <StatusRow label="Yes" count={stats.yes} dotColor="bg-sage" />
          {subRow && (
            <div className="flex items-center justify-between gap-4 pl-4 pb-2 -mt-1">
              <span className="text-xs text-brown-light">↳ {subRow.label}</span>
              <span className="text-xs text-brown-light tabular-nums">
                {subRow.count}
                {subRow.ofCount > 0 && (
                  <span className="text-brown-light/60 ml-1">
                    ({Math.round((subRow.count / subRow.ofCount) * 100)}%)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        <StatusRow label="Maybe"   count={stats.maybe}   dotColor="bg-gold" />
        <StatusRow label="No"      count={stats.no}      dotColor="bg-terracotta" />
        <StatusRow label="Pending" count={stats.pending} dotColor="bg-brown-light/40" />
      </div>
      <div className="mt-3 pt-3 border-t border-beige text-xs text-brown-light flex justify-between">
        <span>Total</span>
        <span className="tabular-nums">{total}</span>
      </div>
    </div>
  );
}

export default function DashboardClient({
  email,
  parties,
  guests,
  rsvps,
}: {
  email: string | null;
  parties: DashboardParty[];
  guests: DashboardGuest[];
  rsvps: DashboardRsvp[];
}) {
  const [tier] = useTierFilter();

  const stats = useMemo(() => {
    const partiesScoped = tier === 'All' ? parties : parties.filter(p => p.list_tier === tier);
    const partyIdsScoped = new Set(partiesScoped.map(p => p.id));
    const guestsScoped = guests.filter(g => partyIdsScoped.has(g.party_id));
    const guestIdsScoped = new Set(guestsScoped.map(g => g.id));
    const rsvpsScoped = rsvps.filter(r => guestIdsScoped.has(r.guest_id));

    const dinnerInvitedPartyIds = new Set(
      partiesScoped.filter(p => p.invited_to_welcome_dinner).map(p => p.id)
    );
    const dinnerInvitedGuestIds = new Set(
      guestsScoped.filter(g => dinnerInvitedPartyIds.has(g.party_id)).map(g => g.id)
    );
    const respondedGuestIds = new Set(rsvpsScoped.map(r => r.guest_id));

    const wedding: StatusTally = { yes: 0, no: 0, maybe: 0, pending: 0 };
    const dinner: StatusTally = { yes: 0, no: 0, maybe: 0, pending: 0 };

    for (const r of rsvpsScoped) {
      const w = r.wedding_attending_status as 'yes' | 'no' | 'maybe' | null;
      if (w === 'yes' || w === 'no' || w === 'maybe') wedding[w]++;

      if (dinnerInvitedGuestIds.has(r.guest_id)) {
        const d = r.welcome_dinner_status as 'yes' | 'no' | 'maybe' | null;
        if (d === 'yes' || d === 'no' || d === 'maybe') dinner[d]++;
      }
    }

    wedding.pending = guestsScoped.length - respondedGuestIds.size;
    const dinnerResponded = [...dinnerInvitedGuestIds].filter(id => respondedGuestIds.has(id)).length;
    dinner.pending = dinnerInvitedGuestIds.size - dinnerResponded;

    const mailedPartyIds = new Set(partiesScoped.filter(p => p.invite_mailed).map(p => p.id));
    const guestsInvited = guestsScoped.filter(g => mailedPartyIds.has(g.party_id)).length;
    const dinnerInvitedMailed = guestsScoped.filter(
      g => dinnerInvitedPartyIds.has(g.party_id) && mailedPartyIds.has(g.party_id)
    ).length;
    const yesParty = rsvpsScoped.filter(
      r => r.wedding_attending_status === 'yes' && r.staying_late === true
    ).length;

    return {
      totalParties: partiesScoped.length,
      totalGuests: guestsScoped.length,
      guestsInvited,
      guestsNotInvited: guestsScoped.length - guestsInvited,
      invitesMailed: partiesScoped.filter(p => p.invite_mailed).length,
      dinnerInvitedGuests: dinnerInvitedGuestIds.size,
      dinnerInvitedMailed,
      yesParty,
      wedding,
      dinner,
    };
  }, [tier, parties, guests, rsvps]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl text-brown">
          Dashboard
          {tier !== 'All' && <span className="text-base sm:text-lg text-brown-light"> · Tier {tier}</span>}
        </h1>
        {email && <p className="text-sm text-brown-light mt-1">Signed in as {email}</p>}
        <TierBar className="mt-3" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <MetricCard label="Parties"        value={stats.totalParties} />
        <MetricCard
          label="Guests"
          value={stats.totalGuests}
          subtitle={`${stats.guestsInvited} invited · ${stats.guestsNotInvited} not yet`}
        />
        <MetricCard label="Invites mailed" value={`${stats.invitesMailed} / ${stats.totalParties}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <StatusCard
          title="Wedding RSVPs"
          subtitle={`${stats.guestsInvited} invited · ${stats.guestsNotInvited} not yet`}
          stats={stats.wedding}
          total={stats.totalGuests}
          subRow={{
            label: 'staying for the party',
            count: stats.yesParty,
            ofCount: stats.wedding.yes,
          }}
        />
        <StatusCard
          title="Welcome dinner"
          subtitle={`${stats.dinnerInvitedMailed} invited · ${stats.dinnerInvitedGuests - stats.dinnerInvitedMailed} not yet`}
          stats={stats.dinner}
          total={stats.dinnerInvitedGuests}
        />
      </div>

      <div className="bg-white border border-beige-dark rounded-2xl shadow-sm p-5">
        <h3 className="font-serif text-lg text-brown mb-3">Quick links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            href="/admin/guests"
            className="text-sm text-brown hover:text-sage-dark border border-beige-dark rounded-lg px-4 py-3 hover:bg-beige transition-colors"
          >
            Manage guests &amp; addresses →
          </Link>
          <Link
            href="/admin/rsvps"
            className="text-sm text-brown hover:text-sage-dark border border-beige-dark rounded-lg px-4 py-3 hover:bg-beige transition-colors"
          >
            View RSVP responses →
          </Link>
          <Link
            href="/admin/registry"
            className="text-sm text-brown hover:text-sage-dark border border-beige-dark rounded-lg px-4 py-3 hover:bg-beige transition-colors"
          >
            Manage registry →
          </Link>
        </div>
      </div>
    </div>
  );
}
