import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabase();

  const [partiesRes, guestsRes] = await Promise.all([
    supabase.from('parties').select('*').order('name'),
    supabase.from('guests').select('*').order('first_name'),
  ]);

  if (partiesRes.error || guestsRes.error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  type GuestRow = NonNullable<typeof guestsRes.data>[number];

  const guestsByParty = new Map<string, GuestRow[]>();
  for (const g of guestsRes.data ?? []) {
    const list = guestsByParty.get(g.party_id) ?? [];
    list.push(g);
    guestsByParty.set(g.party_id, list);
  }

  const parties = (partiesRes.data ?? []).map(p => ({
    ...p,
    guests: guestsByParty.get(p.id) ?? [],
  }));

  return NextResponse.json({ parties });
}
