import { getSupabase } from '@/lib/supabase';
import GuestsClient, { Party, Guest } from './GuestsClient';

export const dynamic = 'force-dynamic';

async function getParties(): Promise<Party[]> {
  const supabase = getSupabase();

  const [partiesRes, guestsRes] = await Promise.all([
    supabase.from('parties').select('*').order('name'),
    supabase.from('guests').select('*').order('first_name'),
  ]);

  if (partiesRes.error) throw new Error(partiesRes.error.message);
  if (guestsRes.error) throw new Error(guestsRes.error.message);

  const guestsByParty = new Map<string, Guest[]>();
  for (const g of guestsRes.data ?? []) {
    const list = guestsByParty.get(g.party_id) ?? [];
    list.push(g as Guest);
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
