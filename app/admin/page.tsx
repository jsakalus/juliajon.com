import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type StatusTally = { yes: number; no: number; maybe: number; pending: number };

async function getStats() {
  const supabase = getSupabase();

  const [partiesRes, guestsRes, rsvpsRes] = await Promise.all([
    supabase.from('parties').select('id, invite_mailed, invited_to_welcome_dinner'),
    supabase.from('guests').select('id, party_id'),
    supabase.from('rsvp_responses').select('guest_id, wedding_attending_status, welcome_dinner_status, staying_late'),
  ]);

  const parties = partiesRes.data ?? [];
  const guests = guestsRes.data ?? [];
  const rsvps = rsvpsRes.data ?? [];

  const dinnerInvitedPartyIds = new Set(
    parties.filter(p => p.invited_to_welcome_dinner).map(p => p.id)
  );
  const dinnerInvitedGuestIds = new Set(
    guests.filter(g => dinnerInvitedPartyIds.has(g.party_id)).map(g => g.id)
  );
  const respondedGuestIds = new Set(rsvps.map(r => r.guest_id));

  const wedding: StatusTally = { yes: 0, no: 0, maybe: 0, pending: 0 };
  const dinner: StatusTally = { yes: 0, no: 0, maybe: 0, pending: 0 };

  for (const r of rsvps) {
    const w = r.wedding_attending_status as 'yes' | 'no' | 'maybe' | null;
    if (w === 'yes' || w === 'no' || w === 'maybe') wedding[w]++;

    if (dinnerInvitedGuestIds.has(r.guest_id)) {
      const d = r.welcome_dinner_status as 'yes' | 'no' | 'maybe' | null;
      if (d === 'yes' || d === 'no' || d === 'maybe') dinner[d]++;
    }
  }

  wedding.pending = guests.length - respondedGuestIds.size;
  const dinnerResponded = [...dinnerInvitedGuestIds].filter(id => respondedGuestIds.has(id)).length;
  dinner.pending = dinnerInvitedGuestIds.size - dinnerResponded;

  const mailedPartyIds = new Set(parties.filter(p => p.invite_mailed).map(p => p.id));
  const guestsInvited = guests.filter(g => mailedPartyIds.has(g.party_id)).length;
  const dinnerInvitedMailed = guests.filter(
    g => dinnerInvitedPartyIds.has(g.party_id) && mailedPartyIds.has(g.party_id)
  ).length;
  const yesParty = rsvps.filter(
    r => r.wedding_attending_status === 'yes' && r.staying_late === true
  ).length;

  return {
    totalParties: parties.length,
    totalGuests: guests.length,
    guestsInvited,
    guestsNotInvited: guests.length - guestsInvited,
    invitesMailed: parties.filter(p => p.invite_mailed).length,
    dinnerInvitedGuests: dinnerInvitedGuestIds.size,
    dinnerInvitedMailed,
    yesParty,
    wedding,
    dinner,
  };
}

function MetricCard({ label, value, subtitle }: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl shadow-sm px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-brown-light">{label}</p>
      <p className="font-serif text-3xl text-brown mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-brown-light mt-1">{subtitle}</p>
      )}
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

export default async function AdminDashboard() {
  const [session, stats] = await Promise.all([getAdminSession(), getStats()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl text-brown">Dashboard</h1>
        {session && (
          <p className="text-sm text-brown-light mt-1">Signed in as {session.email}</p>
        )}
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
