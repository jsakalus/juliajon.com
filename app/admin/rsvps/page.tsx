import { getSupabase } from '@/lib/supabase';
import RsvpsClient, { RsvpRow } from './RsvpsClient';

export const dynamic = 'force-dynamic';

async function getRows(): Promise<RsvpRow[]> {
  const supabase = getSupabase();

  const [partiesRes, guestsRes, rsvpsRes] = await Promise.all([
    supabase.from('parties').select('id, name, list_tier, invited_to_welcome_dinner, invite_mailed'),
    supabase.from('guests').select('id, party_id, first_name, last_name').order('first_name'),
    supabase
      .from('rsvp_responses')
      .select('guest_id, wedding_attending_status, welcome_dinner_status, travel_mode, staying_late, dietary_notes, maybe_reason, submitted_at'),
  ]);

  if (partiesRes.error) throw new Error(partiesRes.error.message);
  if (guestsRes.error) throw new Error(guestsRes.error.message);
  if (rsvpsRes.error) throw new Error(rsvpsRes.error.message);

  const partyById = new Map((partiesRes.data ?? []).map(p => [p.id, p]));
  const rsvpByGuest = new Map((rsvpsRes.data ?? []).map(r => [r.guest_id, r]));

  const rows: RsvpRow[] = (guestsRes.data ?? []).map(g => {
    const party = partyById.get(g.party_id);
    const rsvp = rsvpByGuest.get(g.id);
    return {
      guestId: g.id,
      firstName: g.first_name,
      lastName: g.last_name,
      partyId: g.party_id,
      partyName: party?.name ?? '',
      partyTier: (party?.list_tier ?? null) as RsvpRow['partyTier'],
      dinnerInvited: !!party?.invited_to_welcome_dinner,
      inviteMailed: !!party?.invite_mailed,
      weddingStatus: (rsvp?.wedding_attending_status ?? null) as RsvpRow['weddingStatus'],
      dinnerStatus: (rsvp?.welcome_dinner_status ?? null) as RsvpRow['dinnerStatus'],
      travelMode: (rsvp?.travel_mode ?? null) as RsvpRow['travelMode'],
      stayingLate: rsvp?.staying_late ?? null,
      dietaryNotes: rsvp?.dietary_notes ?? null,
      maybeReason: rsvp?.maybe_reason ?? null,
      submittedAt: rsvp?.submitted_at ?? null,
    };
  });

  return rows;
}

export default async function RsvpsPage() {
  const rows = await getRows();
  return <RsvpsClient initialRows={rows} />;
}
