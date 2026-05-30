import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const ALLOWED_FIELDS = new Set(['invited_to_welcome_dinner', 'invite_mailed']);

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const partyIds: unknown = body.partyIds;
  const updates: Record<string, unknown> = body.updates ?? {};

  if (!Array.isArray(partyIds) || partyIds.length === 0) {
    return NextResponse.json({ error: 'partyIds must be a non-empty array' }, { status: 400 });
  }

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (ALLOWED_FIELDS.has(key)) filtered[key] = value;
  }

  if (Object.keys(filtered).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('parties')
    .update(filtered)
    .in('id', partyIds as string[]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
