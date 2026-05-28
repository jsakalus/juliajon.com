import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const ALLOWED_FIELDS = new Set(['first_name', 'last_name', 'email', 'phone']);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  const { guestId } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key)) updates[key] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('guests').update(updates).eq('id', guestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
