import { getSupabase } from '@/lib/supabase';
import GuestsClient, { Party, Guest } from './GuestsClient';

export const dynamic = 'force-dynamic';

async function getParties(): Promise<Party[]> {
  const supabase = getSupabase();

  const [partiesRes, guestsRes, rsvpsRes] = await Promise.all([
    supabase.from('parties').select('*').order('name'),
    supabase.from('guests').select('*').order('first_name'),
    supabase.from('rsvp_responses').select('guest_id, wedding_attending_status'),
  ]);

  if (partiesRes.error) throw new Error(partiesRes.error.message);
  if (guestsRes.error) throw new Error(guestsRes.error.message);
  if (rsvpsRes.error) throw new Error(rsvpsRes.error.message);

  const statusByGuest = new Map<string, string | null>();
  for (const r of rsvpsRes.data ?? []) {
    statusByGuest.set(r.guest_id, r.wedding_attending_status);
  }

  const guestsByParty = new Map<string, Guest[]>();
  for (const g of guestsRes.data ?? []) {
    const enriched: Guest = {
      ...(g as Guest),
      rsvp_status: statusByGuest.get(g.id) ?? null,
    };
    const list = guestsByParty.get(g.party_id) ?? [];
    list.push(enriched);
    guestsByParty.set(g.party_id, list);
  }

  return (partiesRes.data ?? []).map(p => ({
    ...p,
    guests: guestsByParty.get(p.id) ?? [],
  })) as Party[];
}

export default async function GuestsPage() {
  const parties = await getParties();
  return <GuestsClient initialParties={parties} />;
}
