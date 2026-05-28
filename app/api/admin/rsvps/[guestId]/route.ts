import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

type Status = 'yes' | 'no' | 'maybe' | null;

function toBool(status: Status): boolean | null {
  if (status === 'yes') return true;
  if (status === 'no') return false;
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  const { guestId } = await params;
  const body = await req.json();

  const status = (body.wedding_attending_status ?? null) as Status;
  if (status !== null && !['yes', 'no', 'maybe'].includes(status)) {
    return NextResponse.json({ error: 'Invalid wedding status' }, { status: 400 });
  }

  const clearFollowUps = status === 'maybe' || status === 'no';
  const rawDinner = (body.welcome_dinner_status ?? null) as Status;
  const dinnerStatus = clearFollowUps ? null : rawDinner;

  if (dinnerStatus !== null && !['yes', 'no', 'maybe'].includes(dinnerStatus)) {
    return NextResponse.json({ error: 'Invalid dinner status' }, { status: 400 });
  }

  const update = {
    guest_id: guestId,
    wedding_attending_status: status,
    wedding_attending: toBool(status),
    welcome_dinner_status: dinnerStatus,
    welcome_dinner_attending: toBool(dinnerStatus),
    maybe_reason: status === 'maybe' ? (body.maybe_reason ?? null) : null,
    dietary_notes: status === 'no' ? '' : (body.dietary_notes ?? ''),
    travel_mode: clearFollowUps ? null : (body.travel_mode ?? null),
    staying_late: clearFollowUps ? null : (body.staying_late ?? null),
    submitted_at: new Date().toISOString(),
  };

  const { error } = await getSupabase()
    .from('rsvp_responses')
    .upsert(update, { onConflict: 'guest_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE resets a guest to "pending" by removing the rsvp_responses row.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  const { guestId } = await params;
  const { error } = await getSupabase()
    .from('rsvp_responses')
    .delete()
    .eq('guest_id', guestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
