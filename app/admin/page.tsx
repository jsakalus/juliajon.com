import { getSupabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/session';
import DashboardClient, {
  DashboardParty,
  DashboardGuest,
  DashboardRsvp,
} from './DashboardClient';

export const dynamic = 'force-dynamic';

async function getData() {
  const supabase = getSupabase();

  const [partiesRes, guestsRes, rsvpsRes] = await Promise.all([
    supabase.from('parties').select('id, list_tier, invite_mailed, invited_to_welcome_dinner'),
    supabase.from('guests').select('id, party_id'),
    supabase
      .from('rsvp_responses')
      .select('guest_id, wedding_attending_status, welcome_dinner_status, staying_late'),
  ]);

  return {
    parties: (partiesRes.data ?? []) as DashboardParty[],
    guests: (guestsRes.data ?? []) as DashboardGuest[],
    rsvps: (rsvpsRes.data ?? []) as DashboardRsvp[],
  };
}

export default async function AdminDashboard() {
  const [session, data] = await Promise.all([getAdminSession(), getData()]);
  return (
    <DashboardClient
      email={session?.email ?? null}
      parties={data.parties}
      guests={data.guests}
      rsvps={data.rsvps}
    />
  );
}
